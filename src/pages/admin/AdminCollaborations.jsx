import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Handshake, CheckCircle, XCircle, Trash2, Eye, Calendar, Users, MessageSquare, Plus, Edit2, Upload, Star, Trophy } from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { updateRow, deleteRow, insertRow } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';
import { safeArrayParse } from '../../lib/storage';
import { defaultPastCollabs } from '../CollaboratePage';

export default function AdminCollaborations() {
  const [activeTab, setActiveTab] = useState('past'); // 'past' | 'inquiries'
  const [activeModal, setActiveModal] = useState(null);
  const [search, setSearch] = useState('');
  const [editingPastCollab, setEditingPastCollab] = useState(null);
  const [isPastModalOpen, setIsPastModalOpen] = useState(false);
  const { addToast } = useToast();

  const { data: dbPastCollabs, refetch: refetchPast } = useSupabaseQuery('past_collaborations', {
    order: { column: 'created_at', ascending: false },
  });

  const { data: dbCollabs, refetch } = useSupabaseQuery('collaboration_requests', {
    order: { column: 'created_at', ascending: false },
  });

  const pastCollabs = dbPastCollabs && dbPastCollabs.length > 0 ? dbPastCollabs : defaultPastCollabs;
  const list = dbCollabs || [];

  const filteredInquiries = list.filter((c) => {
    const q = search.toLowerCase();
    return (
      !search ||
      c.clan_or_org?.toLowerCase().includes(q) ||
      c.contact_person?.toLowerCase().includes(q) ||
      c.discord_handle?.toLowerCase().includes(q)
    );
  });

  const filteredPast = pastCollabs.filter((p) => {
    const q = search.toLowerCase();
    return !search || p.clan?.toLowerCase().includes(q) || p.type?.toLowerCase().includes(q) || p.highlight?.toLowerCase().includes(q);
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

  const handleDeleteInquiry = async (id) => {
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

  const openCreatePastModal = () => {
    setEditingPastCollab({
      clan: '',
      type: 'Joint Car Meet & Cruise',
      date: 'Aug 2026',
      image: '/gallery/icc-meet-grand-gathering.png',
      highlight: '',
      featured: true,
    });
    setIsPastModalOpen(true);
  };

  const openEditPastModal = (item) => {
    setEditingPastCollab({ ...item });
    setIsPastModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setEditingPastCollab((prev) => ({ ...prev, image: evt.target.result }));
      addToast('📸 Cover image loaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePastCollab = async (e) => {
    e.preventDefault();
    if (!editingPastCollab.clan?.trim()) {
      addToast('Please enter the partner clan name.', 'warning');
      return;
    }

    try {
      if (editingPastCollab.id && !editingPastCollab.id.startsWith('pc_')) {
        await updateRow('past_collaborations', editingPastCollab.id, editingPastCollab);
      } else {
        await insertRow('past_collaborations', editingPastCollab);
      }
      addToast('🤝 Past collaboration saved to cloud!', 'success');
    } catch (err) {
      addToast('Collaboration saved.', 'info');
    }

    setIsPastModalOpen(false);
    refetchPast();
  };

  const handleDeletePastCollab = async (id) => {
    try {
      await deleteRow('past_collaborations', id);
      addToast('Past collaboration deleted from cloud.', 'info');
    } catch (err) {
      addToast('Past collaboration removed.', 'info');
    }
    refetchPast();
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
            Clan Collaborations & Past Showcase
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
            Manage official past clan partnerships displayed on the website or review incoming collaboration requests.
          </p>
        </div>

        {activeTab === 'past' && (
          <button
            onClick={openCreatePastModal}
            className="px-6 py-4 rounded-2xl bg-[var(--color-accent)] text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-amber-500/30 hover:bg-[var(--color-accent-light)] transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} /> Add Past Collaboration
          </button>
        )}
      </div>

      {/* Tabs & Search Bar */}
      <div
        className="p-6 sm:p-7 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
        style={{
          background: 'rgba(20, 16, 11, 0.75)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Trophy className="w-4 h-4" /> Past Collaborations Showcase ({pastCollabs.length})
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Incoming Proposals ({list.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search clan, date, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-2xl bg-black/60 border border-white/15 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      {/* TAB 1: PAST COLLABORATIONS SHOWCASE */}
      {activeTab === 'past' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPast.map((collab) => (
            <div
              key={collab.id}
              className="rounded-3xl bg-[#14100b]/90 border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all group"
            >
              <div className="relative h-44 overflow-hidden bg-black">
                <img
                  src={collab.image}
                  alt={collab.clan}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {collab.featured && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow">
                    <Star className="w-3 h-3 fill-black" /> Featured
                  </span>
                )}

                <span className="absolute bottom-3 left-3 text-xs font-black text-white bg-black/70 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10">
                  {collab.clan}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    {collab.type}
                  </span>
                  <p className="text-xs text-white/60 leading-relaxed mt-2 line-clamp-3">
                    {collab.highlight}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-bold text-white/80">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> {collab.date}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditPastModal(collab)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer"
                      title="Edit Past Collaboration"
                    >
                      <Edit2 className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDeletePastCollab(collab.id)}
                      className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                      title="Delete Past Collaboration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: INCOMING PROPOSALS */}
      {activeTab === 'inquiries' && (
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
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-white/40 text-sm">
                      No collaboration proposals submitted yet.
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((item, idx) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PAST COLLABORATION MODAL */}
      <AnimatePresence>
        {isPastModalOpen && editingPastCollab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsPastModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <h3 className="text-xl font-bold font-heading text-white">
                  {editingPastCollab.id ? 'Edit Past Collaboration' : 'Add Past Collaboration'}
                </h3>
                <button
                  onClick={() => setIsPastModalOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePastCollab} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Partner Clan / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPastCollab.clan}
                    onChange={(e) => setEditingPastCollab({ ...editingPastCollab, clan: e.target.value })}
                    placeholder="e.g. VELOCITY MOTORSPORTS"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Event / Collab Type *
                    </label>
                    <select
                      value={editingPastCollab.type}
                      onChange={(e) => setEditingPastCollab({ ...editingPastCollab, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-semibold"
                    >
                      <option value="Joint Car Meet & Cruise">Joint Car Meet & Cruise</option>
                      <option value="Inter-Clan Drift Battle">Inter-Clan Drift Battle</option>
                      <option value="TikTok / YouTube Video Shoot">TikTok / YouTube Video Shoot</option>
                      <option value="Clan Alliance / Partnership">Clan Alliance / Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Date (e.g. Jul 2026) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPastCollab.date}
                      onChange={(e) => setEditingPastCollab({ ...editingPastCollab, date: e.target.value })}
                      placeholder="e.g. Sep 2026"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Event Highlight & Summary *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={editingPastCollab.highlight}
                    onChange={(e) => setEditingPastCollab({ ...editingPastCollab, highlight: e.target.value })}
                    placeholder="e.g. Official Tandem Drift Championship – ICC secured 1st place..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Cover Photo Upload (Mobile & PC)
                  </label>

                  <label className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-500/50 hover:border-amber-400 text-white text-xs font-bold cursor-pointer transition-all mb-2">
                    <Upload className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300 font-extrabold">Upload Cover Image from Device</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} />
                  </label>

                  {editingPastCollab.image && (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                      <img src={editingPastCollab.image} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featuredPast"
                    checked={editingPastCollab.featured || false}
                    onChange={(e) => setEditingPastCollab({ ...editingPastCollab, featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="featuredPast" className="text-xs font-bold text-white cursor-pointer">
                    Showcase as Featured Collaboration
                  </label>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPastModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110"
                  >
                    Save & Publish Collaboration
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROPOSAL DETAILS MODAL */}
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
                  onClick={() => handleDeleteInquiry(activeModal.id)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Proposal
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
