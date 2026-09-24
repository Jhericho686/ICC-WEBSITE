import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Shield,
  Calendar,
  Car,
  User,
  Clock,
  AlertCircle,
  Award,
  Crown,
  UserCheck,
} from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { updateRow, deleteRow, insertRow, logActivity } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';
import { safeArrayParse } from '../../lib/storage';

const fallbackApps = [];

export default function AdminApplications() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [activeModalApp, setActiveModalApp] = useState(null);
  const { addToast } = useToast();

  const [deletedAppIds, setDeletedAppIds] = useState(() => {
    const parsed = safeArrayParse('icc_deleted_applications');
    return Array.from(new Set([...parsed, 'Jhericho Rapiz', 'NIO']));
  });

  const [localApps, setLocalApps] = useState(() => safeArrayParse('icc_custom_applications'));

  const { data: dbApps, refetch } = useSupabaseQuery('applications', {
    order: { column: 'created_at', ascending: false },
  });

  const baseList = dbApps && dbApps.length > 0 ? dbApps : fallbackApps;
  const rawList = [...localApps, ...baseList.filter((b) => !localApps.some((l) => l.id === b.id))];
  const appList = rawList.filter((a) =>
    !deletedAppIds.includes(String(a.id)) &&
    !deletedAppIds.includes(a.name) &&
    !deletedAppIds.includes(a.in_game_name) &&
    a.name?.toLowerCase() !== 'jhericho rapiz'
  );

  const filtered = appList.filter((a) => {
    const matchesStatus =
      filterStatus === 'All' || a.status?.toLowerCase() === filterStatus.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.name?.toLowerCase().includes(q) ||
      a.in_game_name?.toLowerCase().includes(q) ||
      a.discord_handle?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateRow('applications', id, { status: newStatus });
      addToast(`Application marked as ${newStatus}.`, 'success');
      if (activeModalApp) {
        setActiveModalApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      refetch();
    } catch (err) {
      addToast('Status updated locally.', 'info');
      const found = appList.find((x) => x.id === id);
      if (found) found.status = newStatus;
      if (activeModalApp) setActiveModalApp((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handlePromoteCandidateToRoster = async (app, targetRole = 'New Member') => {
    try {
      const newMemberData = {
        name: app.name,
        real_name: app.name,
        in_game_name: app.in_game_name || `ICC • ${app.name}`,
        role: targetRole,
        cpm_id: app.cpm_id || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
        car: app.primary_car || 'CPM Spec',
        bio: app.motivation || 'Accepted recruit from application portal.',
        hierarchy_order: 25,
        featured: false,
      };

      await insertRow('members', newMemberData);
      await updateRow('applications', app.id, { status: 'approved', promoted_to_roster: true });
      await logActivity(
        'admin-local',
        'CANDIDATE_PROMOTED',
        'application',
        app.id,
        `RECRUIT PROMOTION: Approved & Promoted ${app.name} (${app.in_game_name}) directly to Clan Roster as ${targetRole}`
      );

      addToast(`🏆 ${app.name} promoted to official Clan Roster as ${targetRole}!`, 'success');
      if (activeModalApp) {
        setActiveModalApp((prev) => (prev ? { ...prev, status: 'approved', promoted_to_roster: true } : null));
      }
      refetch();
    } catch (err) {
      addToast(`Promoted ${app.name} to Roster locally!`, 'success');
      if (activeModalApp) {
        setActiveModalApp((prev) => (prev ? { ...prev, status: 'approved', promoted_to_roster: true } : null));
      }
    }
  };

  const handleDelete = (id) => {
    setDeletedAppIds((prev) => {
      const updated = [...prev, id];
      try {
        localStorage.setItem('icc_deleted_applications', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setLocalApps((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem('icc_custom_applications', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    addToast('Application deleted.', 'info');
    setActiveModalApp(null);
    deleteRow('applications', id).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
            Recruitment & Member Promotion
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
            Review candidate questionnaires, inspect driving specs, approve recruits, and promote candidates directly to the Clan Roster.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-7 rounded-3xl shadow-xl"
        style={{
          background: 'rgba(20, 16, 11, 0.75)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search candidate, IGN, or Discord..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-5 py-3 rounded-2xl text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[var(--color-accent)] text-white shadow-xl shadow-amber-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
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
                className="border-b border-[var(--color-border)] text-left text-white/60 font-mono text-xs uppercase tracking-wider"
                style={{ background: 'rgba(0, 0, 0, 0.45)' }}
              >
                <th className="px-8 py-5">Full Name</th>
                <th className="px-8 py-5">Ingame Name</th>
                <th className="px-8 py-5">Address / Region</th>
                <th className="px-8 py-5">Build / Niche</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Roster Promotion & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((app, idx) => (
                <tr key={app.id || idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-bold text-sm flex items-center justify-center border border-[var(--color-accent)]/30">
                        {app.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm sm:text-base">{app.name}</span>
                        <span className="text-xs text-white/50 block font-mono">ID: {app.cpm_id || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-white font-mono text-sm sm:text-base font-bold">
                    {app.in_game_name}
                  </td>
                  <td className="px-8 py-6 text-white/70 text-sm sm:text-base">{app.address || app.region || 'N/A'}</td>
                  <td className="px-8 py-6">
                    <span className="text-amber-400 font-bold block text-sm sm:text-base">
                      {app.driving_style || 'Clean Build'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : app.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {app.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {/* Promote to Clan Roster Button */}
                      <button
                        onClick={() => handlePromoteCandidateToRoster(app, 'New Member')}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 border border-amber-500/40 transition-colors cursor-pointer"
                        title="Promote Candidate Directly to Clan Roster"
                      >
                        <Crown className="w-4 h-4 text-amber-400" /> Promote to Roster
                      </button>

                      <button
                        onClick={() => setActiveModalApp(app)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                        title="View Full Application Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'approved')}
                        className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors cursor-pointer"
                        title="Approve Candidate"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'rejected')}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        title="Reject Candidate"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/35 text-red-400 border border-red-500/40 transition-colors cursor-pointer"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Details Modal */}
      <AnimatePresence>
        {activeModalApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveModalApp(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Registration: {activeModalApp.name}
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    IGN: <span className="text-[var(--color-accent)] font-mono">{activeModalApp.in_game_name}</span> • Member ID: <span className="font-mono text-white">{activeModalApp.cpm_id || 'N/A'}</span>
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalApp(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Address</span>
                  <span className="font-semibold text-white mt-1 block">{activeModalApp.address || activeModalApp.region || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Referral Name</span>
                  <span className="font-semibold text-white mt-1 block">{activeModalApp.referral_name || 'None'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Niche / Build</span>
                  <span className="font-semibold text-[var(--color-accent)] mt-1 block">{activeModalApp.driving_style || 'Clean Build'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Kailan Nag Simula CPM</span>
                  <span className="font-semibold text-white mt-1 block">{activeModalApp.cpm_start_date || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Active in GC/Events</span>
                  <span className="font-semibold text-white mt-1 block">{activeModalApp.active_in_gc_events || 'Yes'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Daily Task Knowledge</span>
                  <span className="font-semibold text-white mt-1 block">{activeModalApp.knows_daily_task || 'Yes'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Personality</span>
                  <span className="font-semibold text-white mt-1 block">{activeModalApp.personality_type || 'Confident'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Status</span>
                  <span className="font-semibold text-white mt-1 block">{activeModalApp.status_work_student || 'Student'}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[var(--color-muted)] block">Age & Birthday</span>
                  <span className="font-semibold text-white mt-1 block">{activeModalApp.age ? `${activeModalApp.age} yrs` : ''} {activeModalApp.birthday || ''}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-1">
                  Selected Member Roles / Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(activeModalApp.roles) && activeModalApp.roles.length > 0 ? (
                    activeModalApp.roles.map((r, rIdx) => (
                      <span key={rIdx} className="px-2.5 py-1 rounded-lg bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-bold uppercase">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-white/50">Member</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-1">
                  Purpose For Joining
                </span>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs sm:text-sm text-white/90 leading-relaxed italic">
                  "{activeModalApp.motivation}"
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between flex-wrap gap-3">
                <button
                  onClick={() => handleDelete(activeModalApp.id)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePromoteCandidateToRoster(activeModalApp, 'New Member')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" /> Promote to Clan Roster
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(activeModalApp.id, 'approved')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Candidate
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
