import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Shield, User, Car, Calendar, ExternalLink } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import SectionHeader from '../components/SectionHeader';

import { fallbackMembers } from './admin/AdminMembers';

const roles = ['All', 'Owner', 'Co-Leader', 'President', 'Vice President', 'Admin', 'Member', 'New Member'];

export default function MembersPage() {
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dbMembers } = useSupabaseQuery('members', {
    order: { column: 'hierarchy_order', ascending: true },
  });

  const memberList = dbMembers && dbMembers.length > 0 ? dbMembers : fallbackMembers;

  const filteredMembers = useMemo(() => {
    return memberList.filter((m) => {
      const matchesRole =
        selectedRole === 'All' || m.role?.toLowerCase() === selectedRole.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        m.name?.toLowerCase().includes(query) ||
        m.in_game_name?.toLowerCase().includes(query) ||
        m.car?.toLowerCase().includes(query) ||
        m.bio?.toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [memberList, selectedRole, searchQuery]);

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="OFFICIAL ROSTER"
          title="CLAN MEMBERS & DRIVERS"
          description="Meet the drivers behind IDLE COUNTRY CLUB. Verified pilots representing the ICC banner on the streets of Car Parking Multiplayer."
        />

        {/* Search & Filter Toolbar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search driver, IGN, or car..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          {/* Role pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRole === r
                    ? 'bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent-glow)]'
                    : 'bg-white/5 hover:bg-white/10 text-[var(--color-text-secondary)] border border-white/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-6 text-xs text-[var(--color-muted)] font-medium">
          Showing <span className="text-white font-bold">{filteredMembers.length}</span> verified drivers
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="group rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] p-6 transition-all duration-300 flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Member Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    <img
                      src={member.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'}
                      alt={member.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:border-[var(--color-accent)] transition-colors"
                    />
                    {member.featured && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-surface)] flex items-center justify-center text-[9px] text-white font-bold">
                        ★
                      </span>
                    )}
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                    {member.role || 'Member'}
                  </span>
                </div>

                {/* Member Info */}
                <div className="mt-4">
                  <h3 className="text-lg font-bold font-heading text-white group-hover:text-[var(--color-accent)] transition-colors">
                    {member.name}
                  </h3>
                  {member.real_name && (
                    <div className="text-xs text-white/70 font-medium">
                      ({member.real_name})
                    </div>
                  )}
                  <div className="text-xs text-[var(--color-muted)] font-mono mt-1 truncate">
                    {member.in_game_name}
                  </div>
                </div>

                {/* CPM ID Badge */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">CPM ID</span>
                  <span className="text-xs text-[var(--color-accent)] font-mono font-bold">
                    {member.cpm_id || 'REGISTERED'}
                  </span>
                </div>

                {/* Bio */}
                <p className="mt-3 text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                  {member.bio || 'Official registered driver in IDLE COUNTRY CLUB.'}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
                  Since {member.joined_date ? new Date(member.joined_date).getFullYear() : '2023'}
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
