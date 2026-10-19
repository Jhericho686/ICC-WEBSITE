import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Star, Award, Users, ChevronDown, Sparkles } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import SectionHeader from '../components/SectionHeader';

const roleDefinitions = [
  {
    role: 'Owner',
    title: 'Clan Founder & Executive',
    badgeColor: 'from-amber-500 to-yellow-400 text-black',
    borderColor: 'border-amber-500/40',
    icon: Crown,
    desc: 'Ultimate governance, strategic leadership, brand vision, and community oversight.',
  },
  {
    role: 'Co-Owner',
    title: 'Executive Co-Owners',
    badgeColor: 'from-orange-500 to-amber-500 text-black',
    borderColor: 'border-orange-500/40',
    icon: Crown,
    desc: 'Co-leads operations, partnership management, clan strategy, and community decisions.',
  },
  {
    role: 'President',
    title: 'Clan Presidents',
    badgeColor: 'from-red-600 to-rose-500 text-white',
    borderColor: 'border-red-500/40',
    icon: Shield,
    desc: 'Supervises administrative operations, tournament hosting, and member discipline.',
  },
  {
    role: 'Vice President',
    title: 'Vice Presidents',
    badgeColor: 'from-purple-600 to-indigo-500 text-white',
    borderColor: 'border-purple-500/40',
    icon: Shield,
    desc: 'Assists presidents in daily management, event organization, and community welfare.',
  },
  {
    role: 'Admin',
    title: 'Staff Administrators',
    badgeColor: 'from-blue-600 to-cyan-500 text-white',
    borderColor: 'border-blue-500/40',
    icon: Star,
    desc: 'Reviews join applications, enforces rules across official servers, coordinates meets.',
  },
  {
    role: 'Member',
    title: 'Official Clan Members',
    badgeColor: 'from-zinc-600 to-zinc-700 text-white',
    borderColor: 'border-white/15',
    icon: Users,
    desc: 'Full verified members wearing the official ICC clan tag in Car Parking Multiplayer.',
  },
  {
    role: 'New Member',
    title: 'Cadet / Probationary Members',
    badgeColor: 'from-zinc-700 to-zinc-800 text-zinc-300',
    borderColor: 'border-white/10',
    icon: Sparkles,
    desc: 'Newly accepted members undergoing initial probation and trial drive evaluation.',
  }
];

export default function HierarchyPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  // Fetch real-time hierarchy data from database
  const { data: dbMembers, loading } = useSupabaseQuery('members', {
    order: { column: 'hierarchy_order', ascending: true },
  });

  const validMembers = (dbMembers || []).filter(m => m && m.name && m.name.trim());

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="CLAN STRUCTURE"
          title="IDLE COUNTRY CLUB HIERARCHY"
          description="Clear leadership, structured progression, and organized management that keeps ICC running at the highest level."
        />

        {/* Hierarchy Overview Infographic */}
        <div className="mt-12 space-y-6">
          {roleDefinitions.map((tier, idx) => {
            const Icon = tier.icon;
            // Filter real verified clan members for this rank
            const currentMembers = validMembers.filter((m) => {
              const r = (m.role || '').toLowerCase().trim();
              const tr = tier.role.toLowerCase().trim();
              if (tr.includes('new') || r.includes('new')) {
                return tr.includes('new') && r.includes('new');
              }
              return r === tr;
            });

            return (
              <motion.div
                key={tier.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`rounded-2xl bg-[var(--color-surface)] border ${tier.borderColor} p-6 sm:p-8 transition-all hover:shadow-xl`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.badgeColor} flex items-center justify-center shadow-md shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold font-heading text-white">{tier.role}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[var(--color-muted)] font-medium">
                          Tier {idx + 1}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-accent)] font-medium mt-0.5">
                        {tier.title}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] md:max-w-md">
                    {tier.desc}
                  </p>
                </div>

                {/* Member Roster in this rank */}
                <div className="mt-6">
                  <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                    Assigned Roster ({currentMembers.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                    {currentMembers.length > 0 ? (
                      currentMembers.map((m, mIdx) => (
                        <div
                          key={m.id || mIdx}
                          className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-[var(--color-accent)]/50 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center font-bold text-xs text-[var(--color-accent)] font-heading shrink-0">
                              {m.name?.substring(0, 2).toUpperCase() || 'IC'}
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-sm font-bold text-white leading-tight flex items-center gap-1.5 flex-wrap">
                                <span>{m.name}</span>
                                {m.real_name && <span className="text-xs font-normal text-white/60">({m.real_name})</span>}
                              </div>
                              <div className="text-[11px] text-white/50 font-mono mt-0.5 truncate">
                                {m.in_game_name || m.ign}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] text-[var(--color-accent)] font-bold px-2 py-0.5 rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 uppercase tracking-wider">
                              {tier.role}
                            </span>
                            {m.car && m.car.startsWith('ID:') && (
                              <span className="text-[9px] font-mono text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-400/10">
                                {m.car}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[var(--color-muted)] italic py-2">
                        Currently vacant or evaluating candidates.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
