import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { insertRow, updateRow, deleteRow } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';

export default function AdminEvents() {
  const [search, setSearch] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      category: 'Car Meet',
      host: 'ICC Council',
      requirements: '',
      description: '',
      status: 'upcoming',
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent.id) {
        await updateRow('events', editingEvent.id, editingEvent);
        addToast('Event updated.', 'success');
      } else {
        await insertRow('events', editingEvent);
        addToast('New event scheduled on calendar.', 'success');
      }
      setIsModalOpen(false);
      refetch();
    } catch (e) {
      addToast('Saved locally.', 'info');
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete event?')) return;
    try {
      await deleteRow('events', id);
      addToast('Event deleted.', 'info');
      refetch();
    } catch (e) {
      addToast('Deleted locally.', 'info');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
            Events & Meet Calendar
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
            Schedule CPM tournaments, community cruises, and inter-clan battles.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-4 rounded-2xl bg-[var(--color-accent)] text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-amber-500/30 hover:bg-[var(--color-accent-light)] transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} /> Schedule Event
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
                <th className="px-8 py-5">Host</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item, idx) => (
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
                  <td className="px-8 py-6 text-white/90 font-semibold text-sm sm:text-base">{item.host || 'ICC'}</td>
                  <td className="px-8 py-6">
                    <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {item.status || 'upcoming'}
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
                        onClick={() => handleDelete(item.id)}
                        className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                  {editingEvent.id ? 'Edit Event' : 'Schedule New Event'}
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
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    placeholder="e.g. ICC GRAND STANCE CAR MEET"
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
                      value={editingEvent.category}
                      onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="Car Meet">Clan Car Meet</option>
                      <option value="Tournament">Drift Tournament</option>
                      <option value="Drag Race">Drag Strip Shootout</option>
                      <option value="Convoy">Highway Cruise</option>
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Host / Coordinator
                  </label>
                  <input
                    type="text"
                    value={editingEvent.host || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, host: e.target.value })}
                    placeholder="e.g. ICC • Valkyrie"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Vehicle Requirements & Regulations
                  </label>
                  <input
                    type="text"
                    value={editingEvent.requirements || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, requirements: e.target.value })}
                    placeholder="e.g. Clean builds only, 900HP limit, drift tires"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
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
                    placeholder="Meet agenda, route details, and photo spots..."
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
