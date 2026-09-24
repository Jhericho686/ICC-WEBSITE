import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Camera } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { insertRow, updateRow, deleteRow, uploadMediaFile } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';

const fallbackPhotos = [
  {
    id: 'g_1',
    title: 'Mountain Touge Clan Assembly',
    image_url: '/gallery/icc-meet-touge-pass.png',
    category: 'Meets',
    author: 'ICC Photography',
    car: 'Subaru WRX STI / BRZ Squad',
    featured: true,
  },
  {
    id: 'g_2',
    title: 'Grand Clan Gathering Full Roster',
    image_url: '/gallery/icc-meet-grand-gathering.png',
    category: 'Meets',
    author: 'ICC Photography',
    car: 'Full ICC Lineup',
    featured: true,
  },
  {
    id: 'g_3',
    title: 'Airport Strip Stance Showcase',
    image_url: '/gallery/icc-meet-parking-showcase.png',
    category: 'Meets',
    author: 'ICC Photography',
    car: 'Multi-Chassis Meet',
    featured: true,
  },
  {
    id: 'g_4',
    title: 'Civic Custom Stance Spec [DY 696]',
    image_url: '/gallery/icc-build-honda-dy696.png',
    category: 'Builds',
    author: 'ICC_TITAN',
    car: 'Honda Civic Custom',
    featured: true,
  },
  {
    id: 'g_5',
    title: 'Lexus LFA & Spoon Pit Hangout',
    image_url: '/gallery/icc-meet-lexus-lfa-honda.png',
    category: 'Builds',
    author: 'ICC_GHOST',
    car: 'Lexus LFA V10',
    featured: false,
  },
  {
    id: 'g_6',
    title: 'BMW E36 Stance Clean Fitment',
    image_url: '/gallery/icc-build-bmw-e36-stance.png',
    category: 'Builds',
    author: 'ICC_VIPER',
    car: 'BMW M3 E36 Coupe',
    featured: false,
  },
  {
    id: 'g_7',
    title: 'Porsche GT Stance Track Livery',
    image_url: '/gallery/icc-build-porsche-stance.png',
    category: 'Builds',
    author: 'ICC_VALKYRIE',
    car: 'Porsche 911 GT',
    featured: true,
  },
  {
    id: 'g_8',
    title: 'Mitsubishi Lancer Evo IX Widebody',
    image_url: '/gallery/icc-build-evo-blue.png',
    category: 'Builds',
    author: 'ICC_BLAZE',
    car: 'Lancer Evolution IX',
    featured: true,
  },
];

export default function AdminGallery() {
  const [search, setSearch] = useState('');
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();

  const { data: dbGallery, refetch } = useSupabaseQuery('gallery', {
    order: { column: 'created_at', ascending: false },
  });

  const photoList = dbGallery && dbGallery.length > 0 ? dbGallery : fallbackPhotos;

  const filtered = photoList.filter((p) => {
    const q = search.toLowerCase();
    return !search || p.title?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q);
  });

  const openCreateModal = () => {
    setEditingPhoto({
      title: '',
      image_url: '',
      category: 'Builds',
      author: '',
      car: '',
      featured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingPhoto({ ...item });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    addToast('📸 Uploading photo to Cloud Storage...', 'info');
    try {
      const url = await uploadMediaFile('gallery', file);
      if (url) {
        setEditingPhoto((prev) => ({ ...prev, image_url: url }));
        addToast('📸 Photo uploaded & processed successfully!', 'success');
      }
    } catch (err) {
      console.warn('Gallery upload error:', err);
      addToast('Error uploading photo: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleFeatured = async (photo) => {
    try {
      const nextFeatured = !photo.featured;
      await updateRow('gallery', photo.id, { featured: nextFeatured });
      addToast(`★ "${photo.title}" ${nextFeatured ? 'featured on Homepage' : 'removed from Featured'}.`, 'success');
      refetch();
    } catch (err) {
      addToast('Error updating featured status: ' + err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingPhoto.title?.trim()) {
      addToast('Please provide a photo title.', 'warning');
      return;
    }
    if (!editingPhoto.image_url?.trim()) {
      addToast('Please upload an image or provide an image URL.', 'warning');
      return;
    }

    try {
      if (editingPhoto.id && !String(editingPhoto.id).startsWith('g_')) {
        await updateRow('gallery', editingPhoto.id, editingPhoto);
        addToast('✅ Photograph updated in Cloud Firestore.', 'success');
      } else {
        await insertRow('gallery', editingPhoto);
        addToast('🎉 New photograph published to Cloud Firestore.', 'success');
      }
      setIsModalOpen(false);
      refetch();
    } catch (e) {
      console.warn('Gallery save error:', e);
      addToast('Error saving photo: ' + e.message, 'error');
    }
  };

  const handleDelete = (item) => {
    setDeletingPhoto(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPhoto) return;
    try {
      await deleteRow('gallery', deletingPhoto.id);
      addToast(`🗑️ "${deletingPhoto.title}" removed from Cloud Firestore.`, 'info');
      setDeletingPhoto(null);
      refetch();
    } catch (e) {
      console.warn('Gallery delete error:', e);
      addToast('Error deleting photo: ' + e.message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
            Photo Gallery Archive
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
            Curate Car Parking Multiplayer custom liveries, stance showcases, and meet photography.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-4 rounded-2xl bg-[var(--color-accent)] text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-amber-500/30 hover:bg-[var(--color-accent-light)] transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} /> Add Photo
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
            placeholder="Search photo title, author, or build..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map((item, idx) => (
          <div
            key={item.id || idx}
            className="rounded-3xl bg-[#14100b]/90 border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all group"
          >
            <div className="relative h-56 w-full bg-black/60 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
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
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 mt-2 font-medium">
                  <Camera className="w-4 h-4 text-amber-400" /> {item.author || 'ICC'}
                  {item.car ? ` • ${item.car}` : ''}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  title="Edit Photo"
                >
                  <Edit2 className="w-4 h-4 text-amber-400" strokeWidth={2.4} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="py-3 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2.4} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingPhoto && (
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
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
                <h3 className="text-xl font-bold font-heading text-white">
                  {editingPhoto.id ? 'Edit Photo Entry' : 'Add Photo to Gallery'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Image Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPhoto.title}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                    placeholder="e.g. Midnight Purple R34"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Image Source (File Upload or URL) *
                  </label>
                  
                  {/* Direct Mobile / Device File Picker */}
                  <div className="mb-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black/40 border border-dashed border-[var(--color-accent)]/50 hover:border-[var(--color-accent)] text-white text-xs font-bold cursor-pointer transition-colors">
                      <Camera className="w-4 h-4 text-[var(--color-accent)]" />
                      <span>{isUploading ? 'Uploading Image...' : 'Choose Photo from Device / Camera'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    required
                    value={editingPhoto.image_url}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, image_url: e.target.value })}
                    placeholder="https://... or choose file above"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-mono"
                  />
                  {editingPhoto.image_url && (
                    <div className="mt-2 relative h-28 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                      <img src={editingPhoto.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Category
                    </label>
                    <select
                      value={editingPhoto.category || 'CAR MEET'}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
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
                      Photographer / Author
                    </label>
                    <input
                      type="text"
                      value={editingPhoto.author || ''}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, author: e.target.value })}
                      placeholder="e.g. ICC_KEN"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Car Model / Spec (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingPhoto.car || ''}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, car: e.target.value })}
                    placeholder="e.g. Nissan Skyline GT-R R34"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="photo_featured"
                    checked={editingPhoto.featured || false}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--color-accent)]"
                  />
                  <label htmlFor="photo_featured" className="text-xs text-white">
                    Display in Featured Home Page Gallery
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
                    Save Photo
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEDICATED IN-APP DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setDeletingPhoto(null)}
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
                    Remove Photo?
                  </h3>
                  <p className="text-xs text-red-400/80 font-medium">Permanent Cloud Deletion</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-3">
                <img
                  src={deletingPhoto.image_url}
                  alt={deletingPhoto.title}
                  className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{deletingPhoto.title}</h4>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">{deletingPhoto.category} • {deletingPhoto.author || 'ICC'}</p>
                </div>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                This photograph will be permanently removed from Google Cloud Firestore and will no longer appear on public gallery and homepage carousels.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPhoto(null)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Yes, Delete Photo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
