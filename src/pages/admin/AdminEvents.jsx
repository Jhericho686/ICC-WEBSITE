import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Clock, Users, Image as ImageIcon, Video, Upload } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { insertRow, updateRow, deleteRow } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';
import { safeArrayParse } from '../../lib/storage';
import { fallbackEvents } from '../EventsPage';

export default function AdminEvents() {
  const [search, setSearch] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [isCleared, setIsCleared] = useState(() => {
    return localStorage.getItem('icc_events_cleared') === 'true';
  });

  const [deletedIds, setDeletedIds] = useState(() => safeArrayParse('icc_deleted_events'));
  const [localEvents, setLocalEvents] = useState(() => safeArrayParse('icc_custom_events'));

  const { data: dbEvents, refetch } = useSupabaseQuery('events', {
    order: { column: 'event_date', ascending: false },
  });

  const baseList = isCleared
    ? []
    : (dbEvents && dbEvents.length > 0 ? dbEvents : fallbackEvents);

  const rawList = [...localEvents, ...baseList.filter((b) => !localEvents.some((l) => l.id === b.id))];
  const eventList = rawList.filter((e) =>
    !deletedIds.includes(String(e.id)) &&
    !deletedIds.includes(e.id) &&
    !deletedIds.includes(e.title)
  );

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

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setEditingEvent((prev) => ({ ...prev, image_url: evt.target.result }));
      addToast('📸 Event photo loaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setEditingEvent((prev) => ({ ...prev, video_url: evt.target.result }));
      addToast('🎬 Event recap video loaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingEvent.title?.trim()) {
      addToast('Please enter an event title.', 'warning');
      return;
    }

    const isEdit = !!editingEvent.id;
    const savedItem = {
      ...editingEvent,
      id: editingEvent.id || 'e_user_' + Date.now(),
      category: editingEvent.category || 'CAR MEET',
      event_date: editingEvent.event_date || new Date().toISOString(),
    };

    setIsCleared(false);
    localStorage.removeItem('icc_events_cleared');

    setLocalEvents((prev) => {
      const idx = prev.findIndex((ev) => ev.id === savedItem.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = savedItem;
      } else {
        updated = [savedItem, ...prev];
      }
      try {
        localStorage.setItem('icc_custom_events', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setIsModalOpen(false);
    addToast(isEdit ? '📅 Event updated successfully!' : '📅 New event added to calendar!', 'success');

    if (isEdit) {
      updateRow('events', editingEvent.id, savedItem).catch(() => {});
    } else {
      insertRow('events', savedItem).catch(() => {});
    }
  };

  const handleDelete = (item) => {
    const targetId = typeof item === 'object' ? item.id : item;
    const targetTitle = typeof item === 'object' ? item.title : '';

    setDeletedIds((prev) => {
      const updated = Array.from(new Set([...prev, String(targetId), targetId, targetTitle])).filter(Boolean);
      try {
        localStorage.setItem('icc_deleted_events', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setLocalEvents((prev) => {
      const updated = prev.filter((e) => String(e.id) !== String(targetId) && e.title !== targetTitle);
      try {
        localStorage.setItem('icc_custom_events', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    addToast('Event deleted.', 'info');
    deleteRow('events', targetId).catch(() => {});
  };

  const handleClearAllEvents = () => {
    setIsCleared(true);
    setLocalEvents([]);
    localStorage.setItem('icc_events_cleared', 'true');
    localStorage.setItem('icc_custom_events', '[]');
    addToast('All events cleared! You can now add your past events.', 'info');
    if (dbEvents && dbEvents.length > 0) {
      for (const evt of dbEvents) {
        deleteRow('events', evt.id).catch(() => {});
      }
    }
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
            onClick={handleClearAllEvents}
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
                      <span
                        className={`inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                          item.status === 'upcoming'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {item.status || 'past'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors"
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
    </div>
  );
}
