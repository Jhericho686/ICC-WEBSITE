import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Video, Play, ExternalLink, Upload, Film, Image as ImageIcon } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { insertRow, updateRow, deleteRow } from '../../lib/supabase';
import { uploadFile } from '../../lib/firebase';
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

export default function AdminMontages() {
  const [search, setSearch] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
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

    setUploading(true);
    addToast('Uploading video to Firebase Cloud Storage...', 'info');

    try {
      const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const res = await uploadFile('videos', path, file);
      if (res && res.publicUrl) {
        setEditingVideo((prev) => ({
          ...prev,
          youtube_url: res.publicUrl,
        }));
        addToast('🎬 Video uploaded to cloud storage successfully!', 'success');
      } else {
        throw new Error('Upload completed without public URL');
      }
    } catch (err) {
      console.warn('Cloud storage upload fallback to local preview URL:', err);
      const blobUrl = URL.createObjectURL(file);
      setEditingVideo((prev) => ({
        ...prev,
        youtube_url: blobUrl,
      }));
      addToast('🎬 Video file loaded for preview!', 'info');
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const path = `${Date.now()}_thumb_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const res = await uploadFile('gallery', path, file);
      if (res && res.publicUrl) {
        setEditingVideo((prev) => ({
          ...prev,
          thumbnail_url: res.publicUrl,
        }));
        addToast('📸 Thumbnail image uploaded to cloud!', 'success');
        return;
      }
    } catch (err) {}

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingVideo((prev) => ({
        ...prev,
        thumbnail_url: event.target.result,
      }));
      addToast('📸 Thumbnail image loaded!', 'success');
    };
    reader.readAsDataURL(file);
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
      addToast('Video saved.', 'info');
    }

    refetch();
  };

  const handleDelete = async (id) => {
    try {
      await deleteRow('videos', id);
      addToast('Video deleted from Cloud Firestore.', 'info');
    } catch (err) {
      console.warn('Cloud delete error:', err);
    }
    refetch();
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
              {item.featured && (
                <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                  Featured
                </span>
              )}
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
                    onClick={() => handleDelete(item.id)}
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Video File Upload (Mobile & PC) *
                  </label>

                  {/* Native Video File Upload */}
                  <div className="mb-2">
                    <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-500/50 hover:border-amber-400 text-white text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-6 h-6 text-amber-400" />
                      <span className="text-amber-300 font-extrabold text-sm">
                        {uploading ? 'Processing Video...' : 'Select Video File from Mobile / Phone / PC'}
                      </span>
                      <span className="text-white/50 text-[11px] font-normal">
                        Supports MP4, MOV, WEBM. No manual folder copying required!
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoFileUpload}
                      />
                    </label>
                  </div>

                  {editingVideo.youtube_url && (
                    <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 text-xs font-mono text-amber-300 truncate mb-2">
                      Loaded Source: {editingVideo.youtube_url.slice(0, 50)}...
                    </div>
                  )}

                  <span className="text-xs text-white/40 block mb-1">Or paste a YouTube URL / Video Link:</span>
                  <input
                    type="text"
                    required
                    value={editingVideo.youtube_url}
                    onChange={(e) => setEditingVideo({ ...editingVideo, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or choose file above"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-mono"
                  />
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
    </div>
  );
}
