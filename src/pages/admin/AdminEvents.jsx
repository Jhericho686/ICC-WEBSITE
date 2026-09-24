import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Clock, Users, Image as ImageIcon, Video, Upload } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { insertRow, updateRow, deleteRow, uploadMediaFile } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';
import { fallbackEvents } from '../EventsPage';

export default function AdminEvents() {
  const [search, setSearch] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();

  const { data: dbEvents, refetch } = useSupabaseQuery('events', {
    order: { column: 'event_date', ascending: false },
  });

  const eventList = dbEvents || [];

  const filtered = eventList.filter((e) => {
    const q = search.toLowerCase();
    return !search || e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q);
  });

  const openCreateModal = () => {
    setEditingEvent({
      title: '',
      event_date: new Date().toISOString().slice(0, 16),
      location: 'City 1 - Marina Docks (Server ICC-MAIN)',
      category: 'CAR MEET',
      host: 'ICC Council',
      requirements: 'Clean build, static/air stance',
      description: '',
      status: 'past',
      image_url: '',
      video_url: '',
      recap_notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingEvent({
      ...item,
      event_date: item.event_date ? new Date(item.event_date).toISOString().slice(0, 16) : '',
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    addToast('📸 Uploading event photo...', 'info');
    try {
      const url = await uploadMediaFile('events', file);
      if (url) {
        setEditingEvent((prev) => ({ ...prev, image_url: url }));
        addToast('📸 Event photo loaded & uploaded!', 'success');
      }
    } catch (err) {
      console.warn('Event image upload error:', err);
      addToast('Error uploading photo: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    addToast('🎬 Uploading event video reel...', 'info');
    try {
      const url = await uploadMediaFile('events', file);
      if (url) {
        setEditingEvent((prev) => ({ ...prev, video_url: url }));
        addToast('🎬 Event recap video attached!', 'success');
      }
    } catch (err) {
      console.warn('Event video upload error:', err);
      addToast('Error uploading video: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const nextStatus = item.status === 'upcoming' ? 'past' : 'upcoming';
      await updateRow('events', item.id, { status: nextStatus });
      addToast(`📅 Event marked as ${nextStatus.toUpperCase()}!`, 'success');
      refetch();
    } catch (err) {
      addToast('Error updating status: ' + err.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingEvent.title?.trim()) {
      addToast('Please enter an event title.', 'warning');
      return;
    }

    const isEdit = !!editingEvent.id && !String(editingEvent.id).startsWith('e_fallback_');
    const savedItem = {
      title: editingEvent.title,
      category: editingEvent.category || 'CAR MEET',
      event_date: editingEvent.event_date || new Date().toISOString(),
      location: editingEvent.location || 'Server ICC-MAIN',
      description: editingEvent.description || '',
      host: editingEvent.host || 'ICC Staff',
      requirements: editingEvent.requirements || 'Clean builds only',
      status: editingEvent.status || 'upcoming',
      image_url: editingEvent.image_url || '/gallery/icc-meet-grand-gathering.png',
      video_url: editingEvent.video_url || '',
      recap_notes: editingEvent.recap_notes || '',
    };

    setIsModalOpen(false);

    try {
      if (isEdit) {
        await updateRow('events', editingEvent.id, savedItem);
        addToast('📅 Event updated in Cloud Firestore!', 'success');
      } else {
        await insertRow('events', savedItem);
        addToast('📅 Event published to Cloud Firestore!', 'success');
      }
    } catch (err) {
      console.warn('Cloud save error:', err);
      addToast('Error saving event: ' + err.message, 'error');
    }

    refetch();
  };

  const handleDelete = (item) => {
    setDeletingEvent(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    try {
      await deleteRow('events', deletingEvent.id);
      addToast(`🗑️ "${deletingEvent.title}" removed from Cloud Firestore.`, 'info');
      setDeletingEvent(null);
      refetch();
    } catch (err) {
      console.warn('Cloud delete error:', err);
      addToast('Error deleting event: ' + err.message, 'error');
    }
  };

  const handleConfirmClearAll = async () => {
    setClearingAll(false);
    addToast('Clearing events from Cloud Firestore...', 'info');

    if (dbEvents && dbEvents.length > 0) {
      for (const evt of dbEvents) {
        await deleteRow('events', evt.id).catch(() => {});
      }
    }

    addToast('All events cleared from Cloud Firestore!', 'success');
    refetch();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
            Events & Meet Calendar (Past & Upcoming)
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
            Schedule upcoming CPM meets or archive previous events with custom recap photos and video reels.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setClearingAll(true)}
            className="px-5 py-4 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-extrabold text-sm flex items-center gap-2 border border-red-500/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-5 h-5" /> Clear All Events
          </button>

          <button
            onClick={openCreateModal}
            className="px-6 py-4 rounded-2xl bg-[var(--color-accent)] text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-amber-500/30 hover:bg-[var(--color-accent-light)] transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} /> Add Event (Past / Upcoming)
          </button>
        </div>
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
            placeholder="Search event title or server..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      <div
        className="rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(16, 12, 8, 0.85)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <thead>
              <tr
                className="text-white/60 uppercase tracking-wider text-xs sm:text-sm font-extrabold"
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  borderBottom: '1.5px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <th className="px-8 py-5">Event Title</th>
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Server & Location</th>
                <th className="px-8 py-5">Media Attachments</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-white/40 text-sm">
                    No events in archive. Click <strong>"Add Event"</strong> to add your previous events with pictures and videos!
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-8 py-6 font-bold text-white text-base sm:text-lg">
                      {item.title}
                      <div className="text-xs text-amber-400 font-bold mt-1">
                        {item.category}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-white font-mono text-sm sm:text-base">
                      {new Date(item.event_date).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-white/70 font-medium text-sm sm:text-base">{item.location}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {item.image_url ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" /> Photo Added
                          </span>
                        ) : (
                          <span className="text-xs text-white/30">No Photo</span>
                        )}
                        {item.video_url ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" /> Video Added
                          </span>
                        ) : (
                          <span className="text-xs text-white/30">No Video</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className="cursor-pointer transition-transform hover:scale-105"
                        title="Click to toggle between Upcoming and Past"
                      >
                        <span
                          className={`inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                            item.status === 'upcoming'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                          }`}
                        >
                          {item.status || 'past'}
                        </span>
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingEvent && (
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
                  {editingEvent.id ? 'Edit Event Details' : 'Add Event (Past or Upcoming)'}
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
                    Event Type / Schedule Status
                  </label>
                  <select
                    value={editingEvent.status || 'past'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/40 text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="past">Past Event (Archive with Pictures & Videos)</option>
                    <option value="upcoming">Upcoming Event (Schedule)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    placeholder="e.g. ICC GRAND TOUGE MEET & CRUISING"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Event Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editingEvent.event_date}
                      onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Category
                    </label>
                    <select
                      value={editingEvent.category || 'CAR MEET'}
                      onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
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
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Location / Server Info *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    placeholder="e.g. City 1 - Marina Docks (Server ICC-MAIN)"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                {/* Event Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Event Cover Photo (Upload from Phone / PC)
                  </label>

                  <div className="mb-2">
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black/40 border border-dashed border-amber-500/40 hover:border-amber-400 text-white text-xs font-bold cursor-pointer transition-colors">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>Choose Event Photo from Mobile / PC</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={editingEvent.image_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                    placeholder="https://... or upload photo above"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                {/* Event Video Upload */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Event Video / Recap Reel (Upload from Phone or Link)
                  </label>

                  <div className="mb-2">
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black/40 border border-dashed border-amber-500/40 hover:border-amber-400 text-white text-xs font-bold cursor-pointer transition-colors">
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>Choose Event Video File from Mobile / PC</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoFileUpload}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={editingEvent.video_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/... or upload video above"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Description & Overview
                  </label>
                  <textarea
                    rows="3"
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    placeholder="Event recap notes, winner podiums, convoy route details..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] resize-none"
                  />
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
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEDICATED IN-APP DELETE SINGLE EVENT MODAL */}
      <AnimatePresence>
        {deletingEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setDeletingEvent(null)}
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
                    Delete Event?
                  </h3>
                  <p className="text-xs text-red-400/80 font-medium">Cloud Calendar Deletion</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                <h4 className="text-sm font-bold text-white">{deletingEvent.title}</h4>
                <p className="text-xs text-amber-400 font-medium">{deletingEvent.category} • {deletingEvent.location}</p>
                <p className="text-[11px] text-white/50 font-mono">{new Date(deletingEvent.event_date).toLocaleString()}</p>
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                This event will be permanently deleted from Cloud Firestore and removed from the public event calendar.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingEvent(null)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Yes, Delete Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEDICATED IN-APP CLEAR ALL EVENTS MODAL */}
      <AnimatePresence>
        {clearingAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setClearingAll(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#16120e] border border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              style={{
                boxShadow: '0 25px 70px rgba(239, 68, 68, 0.35)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/25 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Clear All Events?
                  </h3>
                  <p className="text-xs text-red-400 font-semibold">Bulk Action Warning</p>
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                Are you sure you want to remove ALL {eventList.length} events from Google Cloud Firestore? This will completely empty the event calendar archive.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setClearingAll(false)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/40 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Yes, Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
