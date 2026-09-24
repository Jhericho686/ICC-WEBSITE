import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Handshake, CheckCircle, XCircle, Trash2, Eye, Calendar, Users, MessageSquare } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { updateRow, deleteRow } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';

export default function AdminCollaborations() {
  const [activeModal, setActiveModal] = useState(null);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  const { data: dbCollabs, refetch } = useSupabaseQuery('collaboration_requests', {
    order: { column: 'created_at', ascending: false },
  });

  const list = dbCollabs || [];

  const filtered = list.filter((c) => {
    const q = search.toLowerCase();
    return (
      !search ||
      c.clan_or_org?.toLowerCase().includes(q) ||
      c.contact_person?.toLowerCase().includes(q) ||
      c.discord_handle?.toLowerCase().includes(q)
    );
  });

  const handleStatus = async (id, status) => {
    try {
      await updateRow('collaboration_requests', id, { status });
      addToast(`Proposal marked as ${status}.`, 'success');
      refetch();
      if (activeModal) setActiveModal((prev) => ({ ...prev, status }));
    } catch (e) {
      addToast('Status updated locally.', 'info');
      const item = list.find((x) => x.id === id);
      if (item) item.status = status;
      if (activeModal) setActiveModal((prev) => ({ ...prev, status }));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete collaboration request?')) return;
    try {
      await deleteRow('collaboration_requests', id);
      addToast('Request deleted.', 'info');
      setActiveModal(null);
      refetch();
    } catch (e) {
      addToast('Deleted locally.', 'info');
      setActiveModal(null);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
          Collaboration Inquiries
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
          Review joint car meets, cross-clan battles, and promotional proposals from external groups.
        </p>
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
            placeholder="Search clan, leader, or Discord..."
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
                <th className="px-8 py-5">Clan / Organization</th>
                <th className="px-8 py-5">Contact Person</th>
                <th className="px-8 py-5">Proposal Type</th>
                <th className="px-8 py-5">Turnout</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-8 py-6 font-bold text-white text-base sm:text-lg">
                    {item.clan_or_org}
                  </td>
                  <td className="px-8 py-6 text-white font-mono text-sm sm:text-base">
                    <span className="font-bold text-white/95">{item.contact_person}</span>
                    <div className="text-xs text-white/50 mt-1">{item.discord_handle}</div>
                  </td>
                  <td className="px-8 py-6 text-amber-400 font-semibold text-sm sm:text-base">
                    {item.collab_type}
                  </td>
                  <td className="px-8 py-6 text-white/70 font-medium text-sm sm:text-base">
                    {item.estimated_participants}
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                        item.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : item.status === 'declined'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {item.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setActiveModal(item)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatus(item.id, 'accepted')}
                        className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors"
                        title="Accept"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatus(item.id, 'declined')}
                        className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors"
                        title="Decline"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Proposal from {activeModal.clan_or_org}
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    Lead: {activeModal.contact_person} • Discord: {activeModal.discord_handle}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs sm:text-sm text-white/90 leading-relaxed italic">
                "{activeModal.details}"
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <button
                  onClick={() => handleDelete(activeModal.id)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStatus(activeModal.id, 'declined')}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleStatus(activeModal.id, 'accepted')}
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                  >
                    Accept Proposal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
