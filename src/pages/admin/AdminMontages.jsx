import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Video, Play, ExternalLink, Upload, Film, Image as ImageIcon } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { insertRow, updateRow, deleteRow, uploadMediaFile } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';

const fallbackVideos = [
  {
    id: 'v_1',
    title: 'ICC OFFICIAL MONTAGE // VOL. 1',
    youtube_url: '/videos/icc-montage-1.mp4',
    thumbnail_url: '/gallery/icc-meet-touge-pass.png',
    category: 'Touge & Drift',
    duration: '01:30',
    featured: true,
  },
  {
    id: 'v_2',
    title: 'ICC OFFICIAL CAR MEET // VOL. 2',
    youtube_url: '/videos/icc-montage-2.mp4',
    thumbnail_url: '/gallery/icc-meet-parking-showcase.png',
    category: 'Car Meet & Cruise',
    duration: '01:45',
    featured: true,
  },
];

function extractYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function AdminMontages() {
  const [search, setSearch] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const { addToast } = useToast();

  const { data: dbVideos, refetch } = useSupabaseQuery('videos', {
    order: { column: 'created_at', ascending: false },
  });

  const videoList = dbVideos && dbVideos.length > 0 ? dbVideos : fallbackVideos;

  const filtered = videoList.filter((v) => {
    const q = search.toLowerCase();
    return !search || v.title?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q);
  });

  const openCreateModal = () => {
    setEditingVideo({
      title: '',
      youtube_url: '',
      thumbnail_url: '',
      category: 'CAR MEET',
      duration: '02:15',
      description: '',
      featured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingVideo({ ...item });
    setIsModalOpen(true);
  };

  const handleVideoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = Math.round(file.size / (1024 * 1024));
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    addToast(`🎬 Uploading ${file.name} (${sizeMb}MB)...`, 'info');

    try {
      const url = await uploadMediaFile('videos', file, (pct) => {
        setUploadProgress(pct);
      });
      if (url) {
        setEditingVideo((prev) => ({
          ...prev,
          youtube_url: url,
        }));
        addToast('🎬 Video uploaded to cloud storage successfully!', 'success');
      } else {
        throw new Error('Upload completed without valid URL');
      }
    } catch (err) {
      console.warn('Video upload error:', err);
      const isStorageUnset = err.message.includes('not yet initialized') || err.message.includes('not set up') || err.message.includes('Storage');
      setUploadError(
        isStorageUnset
          ? 'Firebase Cloud Storage is not activated yet in your Google Firebase Console. You can activate it at console.firebase.google.com, or paste a YouTube / video link below for instant playback.'
          : err.message
      );
      addToast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleYoutubeUrlChange = (val) => {
    const ytId = extractYoutubeId(val);
    setEditingVideo((prev) => {
      const next = { ...prev, youtube_url: val };
      if (ytId && (!prev.thumbnail_url || prev.thumbnail_url.includes('unsplash'))) {
        next.thumbnail_url = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      }
      return next;
    });
  };

  const handleThumbnailFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadMediaFile('gallery', file);
      if (url) {
        setEditingVideo((prev) => ({
          ...prev,
          thumbnail_url: url,
        }));
        addToast('📸 Thumbnail cover loaded!', 'success');
      }
    } catch (err) {
      console.warn('Thumbnail upload error:', err);
      addToast('Error uploading thumbnail: ' + err.message, 'error');
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      const nextFeatured = !item.featured;
      await updateRow('videos', item.id, { featured: nextFeatured });
      addToast(`🎬 "${item.title}" ${nextFeatured ? 'featured on Homepage' : 'removed from Featured'}.`, 'success');
      refetch();
    } catch (err) {
      addToast('Error updating featured status: ' + err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingVideo.title?.trim()) {
      addToast('Please enter a video title.', 'warning');
      return;
    }
    if (!editingVideo.youtube_url?.trim()) {
      addToast('Please upload a video file or paste a video URL.', 'warning');
      return;
    }

    const isEdit = !!editingVideo.id && !String(editingVideo.id).startsWith('v_');
    const savedItem = {
      title: editingVideo.title,
      youtube_url: editingVideo.youtube_url,
      thumbnail_url: editingVideo.thumbnail_url || '',
      category: editingVideo.category || 'CAR MEET',
      duration: editingVideo.duration || '02:00',
      description: editingVideo.description || '',
      featured: !!editingVideo.featured,
      created_at: editingVideo.created_at || new Date().toISOString(),
    };

    setIsModalOpen(false);

    try {
      if (isEdit) {
        await updateRow('videos', editingVideo.id, savedItem);
        addToast('🎬 Video updated in Cloud Firestore!', 'success');
      } else {
        await insertRow('videos', savedItem);
        addToast('🎬 Video published to Cloud Firestore!', 'success');
      }
    } catch (err) {
      console.warn('Cloud save error:', err);
      addToast('Error saving video: ' + err.message, 'error');
    }

    refetch();
  };

  const handleDelete = (item) => {
    setDeletingVideo(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVideo) return;
    try {
      await deleteRow('videos', deletingVideo.id);
      addToast(`🗑️ "${deletingVideo.title}" removed from Cloud Firestore.`, 'info');
      setDeletingVideo(null);
      refetch();
    } catch (err) {
      console.warn('Cloud delete error:', err);
      addToast('Error deleting video: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
            Montages & Video Archive
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
            Upload official CPM clan videos directly from your mobile/device or paste YouTube URLs. No manual folder copying needed!
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-4 rounded-2xl bg-[var(--color-accent)] text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-amber-500/30 hover:bg-[var(--color-accent-light)] transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} /> Add / Upload Video
        </button>
      </div>

      <div
        className="p-6 sm:p-7 rounded-3xl flex items-center justify-between shadow-xl"
        style={{
          background: 'rgba(20, 16, 11, 0.75)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search video title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item, idx) => (
          <div
            key={item.id || idx}
            className="rounded-3xl bg-[#14100b]/90 border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all group"
          >
            <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
              {item.youtube_url && item.youtube_url.startsWith('data:video') ? (
                <video
                  src={item.youtube_url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.thumbnail_url || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <span className="absolute top-3.5 left-3.5 px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-black/85 text-amber-400 border border-amber-500/30">
                {item.category}
              </span>
              <button
                type="button"
                onClick={() => handleToggleFeatured(item)}
                className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-transform hover:scale-105 cursor-pointer shadow-lg"
                style={{
                  background: item.featured
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'rgba(0, 0, 0, 0.75)',
                  color: item.featured ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  border: item.featured ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.2)',
                }}
                title="Click to toggle featured status on homepage"
              >
                {item.featured ? '★ Featured' : '☆ Not Featured'}
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-heading text-white line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/50 mt-1 truncate font-mono">
                  {item.youtube_url?.slice(0, 40)}...
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <a
                  href={item.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors no-underline"
                >
                  Watch <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Edit Video"
                  >
                    <Edit2 className="w-4 h-4 text-amber-400" strokeWidth={2.4} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold transition-colors cursor-pointer"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
                <h3 className="text-xl font-bold font-heading text-white">
                  {editingVideo.id ? 'Edit Video / Montage' : 'Upload New Video'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVideo.title}
                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                    placeholder="e.g. ICC TOUGE DRIFT CHAMPIONSHIP VOL. 3"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                      Video Source *
                    </label>
                    <span className="text-[11px] text-amber-400 font-bold">
                      YouTube Link Recommended
                    </span>
                  </div>

                  {/* YouTube or Web Video Link Input */}
                  <div className="space-y-2 mb-3">
                    <input
                      type="text"
                      required
                      value={editingVideo.youtube_url}
                      onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                      placeholder="Paste YouTube Link (e.g. https://youtu.be/... or https://youtube.com/shorts/...)"
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-amber-500/40 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono placeholder:text-white/30"
                    />
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      💡 <strong>Pro-Tip:</strong> Pasting a YouTube link streams smoothly in 1080p/4K on mobile without buffering, takes zero upload time, and never vanishes!
                    </p>
                  </div>

                  {/* Direct Mobile & PC File Upload with live progress */}
                  <div className="pt-2 border-t border-white/10">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                      Or Upload Direct Video File (.MP4, .MOV, .WEBM):
                    </span>

                    <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-black/40 border-2 border-dashed border-white/20 hover:border-amber-400/60 text-white text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-6 h-6 text-amber-400" />
                      <span className="text-amber-300 font-extrabold text-sm">
                        {uploading ? `Uploading Video: ${uploadProgress}%` : 'Select Video File from Phone / PC'}
                      </span>
                      {uploading && (
                        <div className="w-full max-w-xs bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                      <span className="text-white/40 text-[11px] font-normal">
                        Direct cloud file upload (Requires Firebase Cloud Storage activated)
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={handleVideoFileUpload}
                      />
                    </label>

                    {/* Storage Error / Setup Notification */}
                    {uploadError && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 space-y-2">
                        <p className="font-semibold">{uploadError}</p>
                        <a
                          href="https://console.firebase.google.com/project/iccwebsite-e3a90/storage"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/25 hover:bg-red-500/40 text-white font-bold text-xs no-underline border border-red-500/40 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Firebase Storage Console to Click "Get Started"
                        </a>
                      </div>
                    )}

                    {editingVideo.youtube_url && !uploadError && (
                      <div className="mt-2.5 p-3 rounded-xl bg-black/60 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center justify-between truncate">
                        <span className="truncate">Active Source: {editingVideo.youtube_url}</span>
                        <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-2">
                          Ready
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Category
                    </label>
                    <select
                      value={editingVideo.category || 'CAR MEET'}
                      onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-semibold"
                    >
                      <option value="CAR MEET">CAR MEET</option>
                      <option value="TAMBAY">TAMBAY</option>
                      <option value="CLEAN BUILDS">CLEAN BUILDS</option>
                      <option value="CARSHOW">CARSHOW</option>
                      <option value="TRACK RACE">TRACK RACE</option>
                      <option value="DRAG RACE">DRAG RACE</option>
                      <option value="OFFROAD">OFFROAD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Duration (e.g. 02:15)
                    </label>
                    <input
                      type="text"
                      value={editingVideo.duration || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                      placeholder="02:15"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Thumbnail Photo Upload (Mobile / PC)
                  </label>

                  <div className="mb-2">
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black/40 border border-dashed border-white/20 hover:border-white text-white text-xs font-semibold cursor-pointer transition-colors">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>Upload Thumbnail Image from Mobile / Phone</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailFileUpload}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={editingVideo.thumbnail_url || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })}
                    placeholder="https://... or upload photo above"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="video_featured"
                    checked={editingVideo.featured || false}
                    onChange={(e) => setEditingVideo({ ...editingVideo, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--color-accent)]"
                  />
                  <label htmlFor="video_featured" className="text-xs text-white">
                    Showcase as Featured Video on Homepage
                  </label>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-md hover:bg-[var(--color-accent-light)]"
                  >
                    Save & Publish Video
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEDICATED IN-APP DELETE VIDEO CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setDeletingVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#16120e] border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              style={{
                boxShadow: '0 20px 60px rgba(239, 68, 68, 0.25)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Delete Video?
                  </h3>
                  <p className="text-xs text-red-400/80 font-medium">Permanent Cloud Deletion</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                <h4 className="text-sm font-bold text-white">{deletingVideo.title}</h4>
                <p className="text-xs text-amber-400 font-medium">{deletingVideo.category} • {deletingVideo.duration}</p>
                <p className="text-[11px] text-white/50 font-mono truncate">{deletingVideo.youtube_url}</p>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                This montage will be permanently removed from Google Cloud Firestore and will no longer show on the public media player.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingVideo(null)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Yes, Delete Video
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
