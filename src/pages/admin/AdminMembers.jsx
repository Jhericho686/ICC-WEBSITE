import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  Car,
  Check,
  X,
  Award,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Crown,
  ShieldCheck,
  TrendingUp,
  Medal,
  Camera,
  Upload,
} from 'lucide-react';
import { useSupabaseQuery } from '../../lib/hooks';
import { insertRow, updateRow, deleteRow, logActivity, uploadMediaFile } from '../../lib/supabase';
import { useToast } from '../../lib/contexts';

const defaultRoles = [
  'Owner',
  'Co-Owner',
  'President',
  'Vice President',
  'Admin',
  'Member',
  'New Member',
];

// Ordered from lowest to highest rank hierarchy
const roleHierarchy = [
  'New Member',
  'Member',
  'Admin',
  'Vice President',
  'President',
  'Co-Owner',
  'Owner',
];

export const fallbackMembers = [
  // Owner & Co-Owners
  {
    id: 'm_1',
    name: 'MELLY',
    real_name: 'Mark Joseph Tandang',
    in_game_name: 'Owner- ICC MELLY',
    role: 'Owner',
    cpm_id: 'Founder',
    car: 'Nissan Skyline GT-R (Founder)',
    hierarchy_order: 1,
    featured: true,
  },
  {
    id: 'm_2',
    name: 'PATPAT',
    real_name: 'Patrick Carreon',
    in_game_name: '[Co-Owner] ICC-PATPAT (2912492)',
    role: 'Co-Owner',
    cpm_id: '2912492',
    car: 'ID: 2912492',
    hierarchy_order: 2,
    featured: true,
  },
  {
    id: 'm_3',
    name: 'BLUEWORKS',
    real_name: 'Christian Torrecampo Tario',
    in_game_name: '[CO-OWNER]ICC - BLUEWORKS',
    role: 'Co-Owner',
    cpm_id: 'Co-Owner',
    car: 'BMW M4 Competition',
    hierarchy_order: 3,
    featured: true,
  },

  // Presidents
  {
    id: 'm_4',
    name: 'AJ ADU',
    real_name: 'Jayson Ramos',
    in_game_name: '[ President]ICC AJ ADU',
    role: 'President',
    cpm_id: 'President',
    car: 'Subaru WRX STI',
    hierarchy_order: 4,
    featured: true,
  },
  {
    id: 'm_5',
    name: 'JEHEYSI',
    real_name: 'JC Marasigan',
    in_game_name: 'PRESIDENT ICC jeheysi (YX606679)',
    role: 'President',
    cpm_id: 'YX606679',
    car: 'Mazda RX-7 FD3S (YX606679)',
    hierarchy_order: 5,
    featured: true,
  },
  {
    id: 'm_6',
    name: 'RAP',
    real_name: 'Ralph Mariño',
    in_game_name: 'ICC [PRESIDENT] (Rap) [QN224264]',
    role: 'President',
    cpm_id: 'QN224264',
    car: 'Mitsubishi Lancer Evo IX (QN224264)',
    hierarchy_order: 6,
    featured: true,
  },

  // Vice Presidents
  {
    id: 'm_7',
    name: 'HIJUME',
    real_name: 'Prince Casaway',
    in_game_name: '[VP] (ICC-Hijume)(09252008)',
    role: 'Vice President',
    cpm_id: '09252008',
    car: 'Nissan Silvia S15 (09252008)',
    hierarchy_order: 7,
    featured: true,
  },
  {
    id: 'm_8',
    name: 'SIR DOM',
    real_name: 'Dominic Denuevo II',
    in_game_name: 'VICE PRESEDENT- I SIR DOM I (BM120909)',
    role: 'Vice President',
    cpm_id: 'BM120909',
    car: 'Honda Civic Type-R (BM120909)',
    hierarchy_order: 8,
    featured: true,
  },
  {
    id: 'm_9',
    name: 'CHACHA',
    real_name: 'Jhon Carl Bautista',
    in_game_name: '[VP] ICC CHACHA',
    role: 'Vice President',
    cpm_id: 'VP',
    car: 'CPM Spec',
    hierarchy_order: 9,
    featured: true,
  },

  // Admins
  {
    id: 'm_10',
    name: 'YELICH',
    real_name: 'Ken Heindrich Narzoles',
    in_game_name: 'ICC-(ADMIN)-(N3KN3K)-QK168210',
    role: 'Admin',
    cpm_id: 'QK168210',
    car: 'CPM Spec (QK168210)',
    hierarchy_order: 10,
    featured: false,
  },
  {
    id: 'm_11',
    name: 'NIO',
    real_name: 'Jhericho Rapiz',
    in_game_name: 'ICC | Nio | (EC446438) ADMIN',
    role: 'Admin',
    cpm_id: 'EC446438',
    car: 'Admin Spec (EC446438)',
    hierarchy_order: 11,
    featured: false,
  },
  {
    id: 'm_12',
    name: 'NHOGZ',
    real_name: 'Nhogzkie Madera',
    in_game_name: 'ICC-ADMIN-東NHOGZ東',
    role: 'Admin',
    cpm_id: 'Admin',
    car: 'CPM Spec',
    hierarchy_order: 12,
    featured: false,
  },
  {
    id: 'm_13',
    name: 'AZZY',
    real_name: 'Azy Siermento',
    in_game_name: '[ADMIN] ICC (Azzy✿) (AZZYYXX)',
    role: 'Admin',
    cpm_id: 'AZZYYXX',
    car: 'CPM Spec (AZZYYXX)',
    hierarchy_order: 13,
    featured: false,
  },

  // Members
  {
    id: 'm_14',
    name: 'Missche',
    real_name: 'Karla Mantos',
    in_game_name: 'Missche',
    role: 'Member',
    cpm_id: 'Member',
    car: 'CPM Spec',
    hierarchy_order: 14,
    featured: false,
  },
  {
    id: 'm_15',
    name: 'bwisetor',
    real_name: 'Jhon Aerol Gonzaga',
    in_game_name: 'bwisetor',
    role: 'Member',
    cpm_id: 'Member',
    car: 'CPM Spec',
    hierarchy_order: 15,
    featured: false,
  },
  {
    id: 'm_16',
    name: 'PRITS',
    real_name: 'Pret Zel',
    in_game_name: 'ICC (PRITS) (PRITSSS) MEMBER',
    role: 'Member',
    cpm_id: 'PRITSSS',
    car: 'CPM Spec (PRITSSS)',
    hierarchy_order: 16,
    featured: false,
  },
  {
    id: 'm_17',
    name: 'kambal ni Joshua Garcia',
    real_name: 'Michael Viray Bondoc',
    in_game_name: 'kambal ni Joshua Garcia',
    role: 'Member',
    cpm_id: 'Member',
    car: 'CPM Spec',
    hierarchy_order: 17,
    featured: false,
  },

  // New Members
  {
    id: 'm_18',
    name: 'Kapitan',
    real_name: 'Joey Lutap',
    in_game_name: 'Kapitan(NF093187)NEW MEMBER',
    role: 'New Member',
    cpm_id: 'NF093187',
    car: 'CPM Spec (NF093187)',
    hierarchy_order: 18,
    featured: false,
  },
  {
    id: 'm_19',
    name: 'ICC (MANOK)',
    real_name: 'Alfon Jedric Romblon',
    in_game_name: 'ICC (MANOK) (AP634449) NEW MEMBER',
    role: 'New Member',
    cpm_id: 'AP634449',
    car: 'CPM Spec (AP634449)',
    hierarchy_order: 19,
    featured: false,
  },
  {
    id: 'm_20',
    name: 'Jape',
    real_name: 'Jaf Justin Petacio',
    in_game_name: 'ICC (Jape) (YR237424) NEW MEMBER',
    role: 'New Member',
    cpm_id: 'YR237424',
    car: 'CPM Spec (YR237424)',
    hierarchy_order: 20,
    featured: false,
  },
  {
    id: 'm_21',
    name: 'Zekee',
    real_name: 'Ezekiel Tanaleon',
    in_game_name: 'ICC (Zekee) (ZP660188) NEW MEMBER',
    role: 'New Member',
    cpm_id: 'ZP660188',
    car: 'CPM Spec (ZP660188)',
    hierarchy_order: 21,
    featured: false,
  },
  {
    id: 'm_22',
    name: 'ICC-CUTE',
    real_name: 'Dwayne Rimando',
    in_game_name: 'ICC-CUTE (CA186858) NEW MEMBER',
    role: 'New Member',
    cpm_id: 'CA186858',
    car: 'CPM Spec (CA186858)',
    hierarchy_order: 22,
    featured: false,
  },
];

export default function AdminMembers() {
  const [search, setSearch] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);

  // Dedicated Member Promotion Modal State
  const [promoMember, setPromoMember] = useState(null);
  const [targetRole, setTargetRole] = useState('Admin');
  const [promoReason, setPromoReason] = useState('');
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const { addToast } = useToast();

  const { data: dbMembers, refetch } = useSupabaseQuery('members', {
    order: { column: 'hierarchy_order', ascending: true },
  });

  const memberList = Array.isArray(dbMembers) && dbMembers.length > 0 ? dbMembers : (dbMembers ? dbMembers : fallbackMembers);

  const filtered = memberList.filter((m) => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.name?.toLowerCase().includes(q) ||
      m.real_name?.toLowerCase().includes(q) ||
      m.in_game_name?.toLowerCase().includes(q) ||
      m.car?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setEditingMember({
      name: '',
      real_name: '',
      in_game_name: '',
      role: 'Member',
      cpm_id: '',
      car: '',
      bio: '',
      avatar_url: '',
      hierarchy_order: memberList.length + 1,
      featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember({ ...member });
    setIsModalOpen(true);
  };

  const openPromotionModal = (member = null) => {
    const selected = member || memberList[0];
    setPromoMember(selected);
    const currIdx = roleHierarchy.indexOf(selected.role);
    const nextRole = currIdx >= 0 && currIdx < roleHierarchy.length - 1
      ? roleHierarchy[currIdx + 1]
      : selected.role;
    setTargetRole(nextRole);
    setPromoReason('');
    setIsPromoModalOpen(true);
  };

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addToast('📸 Processing avatar photo...', 'info');
    try {
      const url = await uploadMediaFile('members', file);
      if (url) {
        setEditingMember((prev) => ({ ...prev, avatar_url: url }));
        addToast('📸 Avatar photo loaded successfully!', 'success');
      }
    } catch (err) {
      console.warn('Avatar upload fallback error:', err);
      addToast('Error loading avatar image.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingMember.id && !String(editingMember.id).startsWith('m_')) {
        await updateRow('members', editingMember.id, editingMember);
        addToast('✅ Member details updated in Cloud Firestore.', 'success');
      } else {
        await insertRow('members', editingMember);
        addToast('🎉 New clan member registered to Cloud Firestore.', 'success');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.warn('Member save error:', err);
      addToast('Error saving member: ' + err.message, 'error');
    }
  };

  const handleDelete = (member) => {
    setDeletingMember(member);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    try {
      await deleteRow('members', deletingMember.id);
      addToast(`🗑️ ${deletingMember.name} deleted from Clan Roster & Cloud Firestore.`, 'info');
      setDeletingMember(null);
      refetch();
    } catch (err) {
      addToast('Error removing member: ' + err.message, 'error');
    }
  };

  const handleToggleFeatured = async (member) => {
    try {
      const nextFeatured = !member.featured;
      await updateRow('members', member.id, { featured: nextFeatured });
      addToast(`★ ${member.name} ${nextFeatured ? 'highlighted as Featured' : 'removed from Featured'}.`, 'success');
      refetch();
    } catch (err) {
      addToast('Error updating featured status: ' + err.message, 'error');
    }
  };

  // Quick 1-Click Quick Rank Promotion
  const handleQuickPromote = async (member) => {
    const currentIdx = roleHierarchy.indexOf(member.role);
    if (currentIdx === -1 || currentIdx >= roleHierarchy.length - 1) {
      addToast(`${member.name} is already at highest rank (${member.role}).`, 'info');
      return;
    }

    const nextRole = roleHierarchy[currentIdx + 1];
    const newHierarchyOrder = Math.max(1, (member.hierarchy_order || 10) - 2);

    try {
      await updateRow('members', member.id, {
        role: nextRole,
        hierarchy_order: newHierarchyOrder,
      });
      await logActivity(
        'admin-local',
        'MEMBER_PROMOTED',
        'member',
        member.id,
        `PROMOTION: ${member.name} (${member.in_game_name}) promoted from ${member.role} ➔ ${nextRole}`
      );
      addToast(`🎉 ${member.name} promoted to ${nextRole}!`, 'success');
      refetch();
    } catch (err) {
      member.role = nextRole;
      member.hierarchy_order = newHierarchyOrder;
      addToast(`🎉 ${member.name} promoted to ${nextRole}! (Local mode)`, 'success');
    }
  };

  // Quick Demote
  const handleQuickDemote = async (member) => {
    const currentIdx = roleHierarchy.indexOf(member.role);
    if (currentIdx <= 0) {
      addToast(`${member.name} is at lowest rank (${member.role}).`, 'info');
      return;
    }

    const prevRole = roleHierarchy[currentIdx - 1];

    try {
      await updateRow('members', member.id, { role: prevRole });
      await logActivity(
        'admin-local',
        'MEMBER_DEMOTED',
        'member',
        member.id,
        `DEMOTION: ${member.name} demoted from ${member.role} to ${prevRole}`
      );
      addToast(`🔻 ${member.name} role changed to ${prevRole}.`, 'info');
      refetch();
    } catch (err) {
      member.role = prevRole;
      addToast(`🔻 ${member.name} role changed to ${prevRole}.`, 'info');
    }
  };

  // Submit Dedicated Promotion Form Modal
  const handleConfirmPromotion = async (e) => {
    e.preventDefault();
    if (!promoMember) return;

    try {
      const updates = {
        role: targetRole,
      };

      await updateRow('members', promoMember.id, updates);
      await logActivity(
        'admin-local',
        'OFFICIAL_PROMOTION',
        'member',
        promoMember.id,
        `OFFICIAL PROMOTION: Admin promoted ${promoMember.name} to ${targetRole}. Reason: ${
          promoReason || 'Roster Leadership Recognition'
        }`
      );

      addToast(
        `🏆 OFFICIAL PROMOTION CONFERRED! ${promoMember.name} is now ${targetRole}!`,
        'success'
      );
      setIsPromoModalOpen(false);
      refetch();
    } catch (err) {
      promoMember.role = targetRole;
      addToast(`Promoted ${promoMember.name} to ${targetRole}!`, 'success');
      setIsPromoModalOpen(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
              Clan Roster & Member Promotion
            </h1>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Promotion Hub Active
            </span>
          </div>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
            Promote members to Admin or Co-Owner ranks, configure driver specs, and upload photo avatars directly from phone or PC.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => openPromotionModal()}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-yellow-400 transition-all cursor-pointer"
          >
            <Crown className="w-5 h-5" strokeWidth={2.5} /> Member Promotion Center
          </button>
          <button
            onClick={openCreateModal}
            className="px-6 py-4 rounded-2xl bg-white/10 text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 border border-white/15 hover:bg-white/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} /> Add Clan Member
          </button>
        </div>
      </div>

      {/* Promotion Roster Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider block">Total Roster</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{memberList.length}</span>
          </div>
          <User className="w-8 h-8 text-white/30" />
        </div>
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400/80 font-bold uppercase tracking-wider block">Co-Owners & Owners</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">
              {memberList.filter((m) => ['Owner', 'Co-Owner'].includes(m.role)).length}
            </span>
          </div>
          <Crown className="w-8 h-8 text-amber-400/50" />
        </div>
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-400/80 font-bold uppercase tracking-wider block">Staff Admins & Officers</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 block">
              {memberList.filter((m) => ['Admin', 'President', 'Vice President'].includes(m.role)).length}
            </span>
          </div>
          <Shield className="w-8 h-8 text-blue-400/50" />
        </div>
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider block">Regular Members & Recruits</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
              {memberList.filter((m) => ['Member', 'New Member'].includes(m.role)).length}
            </span>
          </div>
          <Medal className="w-8 h-8 text-emerald-400/50" />
        </div>
      </div>

      {/* Search Bar */}
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
            placeholder="Search member, role (e.g. Co-Owner, Admin), IGN, or car..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      {/* Member Roster Table */}
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
                <th className="px-8 py-5">Rank Order</th>
                <th className="px-8 py-5">Member Details</th>
                <th className="px-8 py-5">Clan Role</th>
                <th className="px-8 py-5">CPM ID & Vehicle</th>
                <th className="px-8 py-5">Featured</th>
                <th className="px-8 py-5 text-right">Admin & Promotion Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((m, idx) => {
                const currentRoleIdx = roleHierarchy.indexOf(m.role);
                const canPromote = currentRoleIdx >= 0 && currentRoleIdx < roleHierarchy.length - 1;
                const canDemote = currentRoleIdx > 0;

                return (
                  <tr key={m.id || idx} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-8 py-6 font-mono font-black text-[var(--color-accent)] text-base sm:text-lg">
                      #{m.hierarchy_order || idx + 1}
                    </td>
                    <td className="px-8 py-6 font-bold text-white">
                      <div className="flex items-center gap-4">
                        <img
                          src={m.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'}
                          alt={m.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
                            <span>{m.name}</span>
                            {m.real_name && <span className="text-xs text-white/70 font-normal">({m.real_name})</span>}
                          </div>
                          <div className="text-xs text-amber-300 font-mono font-normal mt-0.5">
                            {m.in_game_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                          ['Owner', 'Co-Owner'].includes(m.role)
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10'
                            : ['President', 'Vice President'].includes(m.role)
                            ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                            : m.role === 'Admin'
                            ? 'bg-blue-500/25 text-blue-300 border border-blue-500/50'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {m.role || 'Member'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-white/80 font-medium text-sm sm:text-base">
                      <div className="font-mono text-xs text-amber-400 font-bold">{m.cpm_id || 'REGISTERED'}</div>
                      <div className="text-xs text-white/60">{m.car || 'CPM Spec'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(m)}
                        className="cursor-pointer transition-transform hover:scale-105"
                        title="Click to toggle featured status"
                      >
                        {m.featured ? (
                          <span className="text-amber-400 font-extrabold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30">
                            ★ Yes
                          </span>
                        ) : (
                          <span className="text-white/40 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:text-white/80">
                            No
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {/* Quick Promote Button */}
                        {canPromote && (
                          <button
                            onClick={() => handleQuickPromote(m)}
                            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1 border border-amber-500/30 transition-all cursor-pointer"
                            title={`Promote to ${roleHierarchy[currentRoleIdx + 1]}`}
                          >
                            <ArrowUp className="w-4 h-4 text-amber-400" strokeWidth={3} /> Promote
                          </button>
                        )}

                        {/* Open Dedicated Promotion Modal */}
                        <button
                          onClick={() => openPromotionModal(m)}
                          className="p-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 transition-colors cursor-pointer"
                          title="Official Promotion Details"
                        >
                          <Crown className="w-5 h-5" />
                        </button>

                        {/* Quick Demote Button */}
                        {canDemote && (
                          <button
                            onClick={() => handleQuickDemote(m)}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                            title="Demote Rank"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(m)}
                          className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED MEMBER PROMOTION FORM MODAL */}
      <AnimatePresence>
        {isPromoModalOpen && promoMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsPromoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              style={{
                boxShadow: '0 20px 60px rgba(245, 158, 11, 0.2)',
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading text-white">
                      Confer Member Promotion
                    </h3>
                    <p className="text-xs text-white/50">Admin Roster Promotion System</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPromoModalOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmPromotion} className="space-y-5">
                {/* Select Member to Promote */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                    Select Roster Pilot *
                  </label>
                  <select
                    value={promoMember.id}
                    onChange={(e) => {
                      const found = memberList.find((x) => x.id === e.target.value);
                      if (found) {
                        setPromoMember(found);
                        const cIdx = roleHierarchy.indexOf(found.role);
                        const next = cIdx >= 0 && cIdx < roleHierarchy.length - 1 ? roleHierarchy[cIdx + 1] : found.role;
                        setTargetRole(next);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/20 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  >
                    {memberList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — Current Role: [{m.role}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Role vs Target Promotion Role */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/50 block">Current Rank</span>
                    <span className="text-sm font-bold text-white">{promoMember.role}</span>
                  </div>

                  <div className="text-amber-400 font-bold text-lg">➔</div>

                  <div>
                    <span className="text-xs text-amber-400/80 block font-semibold">Promote To</span>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black border border-amber-500/50 text-amber-300 font-black text-xs uppercase focus:outline-none"
                    >
                      {defaultRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Promotion Note / Reason */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Promotion Citation / Note
                  </label>
                  <textarea
                    rows="3"
                    value={promoReason}
                    onChange={(e) => setPromoReason(e.target.value)}
                    placeholder="e.g. Promoted to Vice President for outstanding leadership and event coordination."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPromoModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 flex items-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" /> Confirm & Issue Promotion
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEMBER CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && editingMember && (
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
              className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
                <h3 className="text-xl font-bold font-heading text-white">
                  {editingMember.id ? 'Edit Clan Member Details' : 'Add New Member'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Member Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                      placeholder="e.g. JHERICHO"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Real Name
                    </label>
                    <input
                      type="text"
                      value={editingMember.real_name || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, real_name: e.target.value })}
                      placeholder="e.g. Mark Joseph Tandang"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      CPM In-Game Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.in_game_name}
                      onChange={(e) => setEditingMember({ ...editingMember, in_game_name: e.target.value })}
                      placeholder="e.g. ICC • Jhericho [OWNER]"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Clan Role / Rank
                    </label>
                    <select
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      {defaultRoles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      CPM ID Number
                    </label>
                    <input
                      type="text"
                      value={editingMember.cpm_id || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, cpm_id: e.target.value })}
                      placeholder="e.g. QK168210"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Hierarchy Rank Order
                    </label>
                    <input
                      type="number"
                      value={editingMember.hierarchy_order || 1}
                      onChange={(e) => setEditingMember({ ...editingMember, hierarchy_order: parseInt(e.target.value, 10) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Signature Vehicle Specs
                    </label>
                    <input
                      type="text"
                      value={editingMember.car || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, car: e.target.value })}
                      placeholder="e.g. Nissan Skyline GT-R R34 (1695HP)"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Avatar Image Photo (Mobile / Phone / PC Upload or URL)
                    </label>

                    <div className="mb-2">
                      <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black/40 border border-dashed border-amber-500/40 hover:border-amber-400 text-white text-xs font-bold cursor-pointer transition-colors">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>Upload Avatar Photo from Phone / Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarFileUpload}
                        />
                      </label>
                    </div>

                    <input
                      type="url"
                      value={editingMember.avatar_url || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, avatar_url: e.target.value })}
                      placeholder="https://... or upload photo above"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] font-mono"
                    />

                    {editingMember.avatar_url && (
                      <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl bg-black/60 border border-white/10">
                        <img
                          src={editingMember.avatar_url}
                          alt="Avatar Preview"
                          className="w-12 h-12 rounded-xl object-cover border border-amber-400/40"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-white block">Avatar Preview</span>
                          <span className="text-[11px] text-emerald-400 font-mono block truncate">Ready to save</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingMember({ ...editingMember, avatar_url: '' })}
                          className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-red-500/10 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Driver Bio & Notes
                    </label>
                    <textarea
                      rows="3"
                      value={editingMember.bio || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                      placeholder="Specializations, tournament wins, etc."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)] resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured_checkbox"
                      checked={editingMember.featured || false}
                      onChange={(e) => setEditingMember({ ...editingMember, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--color-accent)]"
                    />
                    <label htmlFor="featured_checkbox" className="text-xs text-white">
                      Highlight as Featured Driver on Homepage
                    </label>
                  </div>
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
                    className="px-6 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold shadow-md shadow-[var(--color-accent-glow)] hover:bg-[var(--color-accent-light)]"
                  >
                    Save Member
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEDICATED IN-APP DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setDeletingMember(null)}
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
                    Remove from Roster?
                  </h3>
                  <p className="text-xs text-red-400/80 font-medium">Permanent Cloud Deletion</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{deletingMember.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                    {deletingMember.role || 'Member'}
                  </span>
                </div>
                <div className="text-xs text-amber-400 font-mono font-semibold">
                  {deletingMember.in_game_name}
                </div>
                {deletingMember.real_name && (
                  <div className="text-xs text-white/50">
                    Pilot Name: {deletingMember.real_name}
                  </div>
                )}
                {deletingMember.car && (
                  <div className="text-xs text-white/50">
                    Assigned CPM: {deletingMember.car}
                  </div>
                )}
              </div>

              <p className="text-xs text-white/60 leading-relaxed">
                This will delete this member from Google Cloud Firestore and remove them from all public roster and hierarchy pages.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingMember(null)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Yes, Delete Member
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
