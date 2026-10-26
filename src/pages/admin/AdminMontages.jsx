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

import { parseVideoSource, extractYoutubeId, extractGoogleDriveId, extractStreamableId } from '../../lib/videoUtils';

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

    // Warn if uploading very large mobile video
    if (sizeMb > 100) {
      const confirmUpload = window.confirm(
        `This video is ${sizeMb}MB. Large mobile video files can take several minutes to upload and may time out if your phone screen turns off. Continue upload?`
      );
      if (!confirmUpload) {
        e.target.value = '';
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    addToast(`🎬 Uploading ${file.name} (${sizeMb}MB)... Keep screen on.`, 'info');

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
          ? 'Firebase Cloud Storage is not activated yet in your Google Firebase Console. You can activate it at console.firebase.google.com, or paste a YouTube / Google Drive link below for instant playback.'
          : err.message
      );
      addToast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleVideoUrlChange = (val) => {
    const ytId = extractYoutubeId(val);
    setEditingVideo((prev) => {
      const next = { ...prev, youtube_url: val };
      if (ytId && (!prev.thumbnail_url || prev.thumbnail_url.includes('drive.google.com') || prev.thumbnail_url.includes('unsplash'))) {
        next.thumbnail_url = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      } else if (!prev.thumbnail_url || prev.thumbnail_url.includes('drive.google.com/thumbnail')) {
        next.thumbnail_url = '/gallery/icc-meet-grand-gathering.png';
      }
      return next;
    });
  };

  const handleThumbnailFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addToast('📸 Loading cover photo...', 'info');
    try {
      const url = await uploadMediaFile('gallery', file);
      if (url) {
        setEditingVideo((prev) => ({
          ...prev,
          thumbnail_url: url,
        }));
        addToast('📸 Cover photo loaded successfully!', 'success');
      }
    } catch (err) {
      console.warn('Thumbnail upload error:', err);
      addToast('Error uploading thumbnail: ' + err.message, 'error');
    } finally {
      if (e.target) e.target.value = '';
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

    const isEdit = !!editingVideo.id;
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
        {filtered.map((item, idx) => {
          const ytId = extractYoutubeId(item.youtube_url);
          const rawThumb = item.thumbnail_url;
          const isBrokenDriveThumb = rawThumb && (rawThumb.includes('drive.google.com/thumbnail') || rawThumb.includes('drive.google.com/file'));
          const thumb = (!rawThumb || isBrokenDriveThumb)
            ? (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '/gallery/icc-meet-grand-gathering.png')
            : rawThumb;

          return (
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
                    src={thumb}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/gallery/icc-meet-grand-gathering.png';
                    }}
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
          );
        })}
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

                {/* Direct Video File Upload Button */}
                <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-amber-500/40 hover:border-amber-400 transition-colors space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-amber-400" />
                      Option 1: Upload Video Directly (From Phone or PC)
                    </span>
                    {uploading && (
                      <span className="text-xs font-mono font-bold text-amber-400 animate-pulse">
                        Uploading: {uploadProgress}%
                      </span>
                    )}
                  </div>

                  <label className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? `Uploading Video (${uploadProgress}%)...` : '📁 Select Video File from Mobile / PC'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      disabled={uploading}
                      className="hidden"
                      onChange={handleVideoFileUpload}
                    />
                  </label>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 space-y-1">
                      <p className="font-bold flex items-center gap-1">⚠️ {uploadError}</p>
                      <p className="text-[11px] text-white/80">
                        To activate direct video file storage: Go to{' '}
                        <a
                          href="https://console.firebase.google.com/project/iccwebsite-e3a90/storage"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-300 underline font-bold"
                        >
                          Firebase Console &rarr; Storage
                        </a>{' '}
                        and click <strong>"Get Started"</strong> (100% Free). Or use Option 2 below!
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    Option 2: Or Paste a Free Cloud Video Link
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div>
                  <div className="mb-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                      <span className="px-2 py-0.5 rounded-lg bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-extrabold text-[11px] border border-[var(--color-accent)]/40">
                        FREE CLOUD VIDEO
                      </span>
                      Video Source Link *
                    </label>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      value={editingVideo.youtube_url}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder="Paste YouTube (Unlisted), Streamable, Catbox, or Google Drive link..."
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/20 text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-accent)] font-mono placeholder:text-white/30"
                    />

                    {/* Provider Recommendation Guide */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-2">
                      <p className="font-bold text-amber-300 flex items-center gap-1.5">
                        <span>💡</span> Recommended Free Video Options (No storage limits):
                      </p>
                      <ul className="space-y-1.5 text-[11px] text-white/70 pl-1 leading-relaxed">
                        <li>
                          <strong className="text-red-400">1. YouTube (Unlisted) [BEST]:</strong> Upload to YouTube & set visibility to <em>"Unlisted"</em>. Plays in crystal-clear 1080p/4K 60fps with zero buffering and auto-fetches video thumbnails.
                        </li>
                        <li>
                          <strong className="text-blue-400">2. Streamable.com:</strong> Upload free on Streamable.com & paste the link. Super clean, minimal modern player with zero ads.
                        </li>
                        <li>
                          <strong className="text-purple-400">3. Catbox.moe:</strong> Direct video file hosting (up to 200MB per clip). Gives a direct <code className="text-purple-300">.mp4</code> link that plays seamlessly in native HTML5 player.
                        </li>
                        <li>
                          <strong className="text-emerald-400">4. Google Drive:</strong> Set share access to <em>"Anyone with the link can view"</em>.
                        </li>
                      </ul>
                    </div>

                    {/* Live interactive video preview */}
                    {(() => {
                      if (!editingVideo.youtube_url?.trim()) return null;

                      if (editingVideo.youtube_url.includes('/folders/')) {
                        return (
                          <div className="p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 text-xs text-amber-200 space-y-2">
                            <p className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
                              <span>⚠️</span> You pasted a Google Drive FOLDER link!
                            </p>
                            <p className="text-white/90 leading-relaxed">
                              A folder contains multiple files and cannot play directly as a video. Right-click the specific video file inside Drive, click Share &rarr; Copy Link!
                            </p>
                          </div>
                        );
                      }

                      const parsed = parseVideoSource(editingVideo.youtube_url);

                      return (
                        <div className="rounded-2xl overflow-hidden border border-white/20 bg-black/90 shadow-xl">
                          <div className="px-3 py-2 bg-white/10 border-b border-white/10 flex items-center justify-between text-xs font-bold text-white">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              {parsed.label || 'Video Source Connected'}
                            </span>
                            <span className="text-[10px] font-mono text-white/50 truncate max-w-[200px]">
                              {editingVideo.youtube_url}
                            </span>
                          </div>
                          <div className="relative aspect-video w-full bg-black">
                            {parsed.type === 'youtube' || parsed.type === 'streamable' || parsed.type === 'googledrive' ? (
                              <iframe
                                src={parsed.embedUrl}
                                title="Video Preview"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                className="w-full h-full border-0"
                              />
                            ) : (
                              <video
                                key={parsed.url}
                                src={parsed.url}
                                controls
                                playsInline
                                className="w-full h-full object-contain"
                              >
                                Your browser does not support HTML5 video.
                              </video>
                            )}
                          </div>
                        </div>
                      );
                    })()}
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
                    Video Cover Photo / Thumbnail (Mobile / PC)
                  </label>

                  {/* Live Visual Preview of Selected Cover */}
                  {editingVideo.thumbnail_url && (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-amber-500/40 bg-black/60 my-2 shadow-xl">
                      <img
                        src={editingVideo.thumbnail_url}
                        alt="Cover Preview"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/gallery/icc-meet-grand-gathering.png';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Current Cover Preview
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingVideo({ ...editingVideo, thumbnail_url: '' })}
                        className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-[10px] font-bold text-white transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-dashed border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold cursor-pointer transition-all hover:bg-amber-500/20">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>📸 Pick / Upload Photo from Phone or Computer</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailFileUpload}
                      />
                    </label>
                  </div>

                  {/* Preset Clan Photography Options */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 mb-2">
                    <span className="text-[11px] text-white/60 font-semibold block">
                      Or select an official Clan Photo Cover:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Grand Meet', src: '/gallery/icc-meet-grand-gathering.png' },
                        { label: 'Touge Pass', src: '/gallery/icc-meet-touge-pass.png' },
                        { label: 'Parking Stance', src: '/gallery/icc-meet-parking-showcase.png' },
                        { label: 'Sunset Drift', src: '/gallery/icc-meet-drift-sunset.png' },
                      ].map((preset) => (
                        <button
                          key={preset.src}
                          type="button"
                          onClick={() => setEditingVideo({ ...editingVideo, thumbnail_url: preset.src })}
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all text-left truncate flex items-center gap-1.5 cursor-pointer ${editingVideo.thumbnail_url === preset.src
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                              : 'bg-white/5 border-white/10 hover:border-white/30 text-white/70'
                            }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={editingVideo.thumbnail_url || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })}
                    placeholder="Image URL or upload custom photo above"
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
