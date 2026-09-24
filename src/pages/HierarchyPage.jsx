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
    members: [
      { name: 'MELLY', ign: 'Owner- ICC MELLY', real_name: 'Mark Joseph Tandang', car: 'Founder' }
    ]
  },
  {
    role: 'Co-Owner',
    title: 'Executive Co-Owners',
    badgeColor: 'from-orange-500 to-amber-500 text-black',
    borderColor: 'border-orange-500/40',
    icon: Crown,
    desc: 'Co-leads operations, partnership management, clan strategy, and community decisions.',
    members: [
      { name: 'PATPAT', ign: '[Co-Owner] ICC-PATPAT', real_name: 'Patrick Carreon', car: 'ID: 2912492' },
      { name: 'BLUEWORKS', ign: '[CO-OWNER]ICC - BLUEWORKS', real_name: 'Christian Torrecampo Tario', car: 'Co-Owner' },
      { name: 'BERT23', ign: "[ C'o Owner ] BERT23", real_name: 'Herbert Malandac', car: 'Co-Owner' }
    ]
  },
  {
    role: 'President',
    title: 'Clan Presidents',
    badgeColor: 'from-red-600 to-rose-500 text-white',
    borderColor: 'border-red-500/40',
    icon: Shield,
    desc: 'Supervises administrative operations, tournament hosting, and member discipline.',
    members: [
      { name: 'AJ ADU', ign: '[ President]ICC AJ ADU', real_name: 'Jayson Ramos', car: 'President' },
      { name: 'RAP', ign: 'ICC [PRESIDENT] (Rap)', real_name: 'Ralph Mariño', car: 'ID: QN224264' }
    ]
  },
  {
    role: 'Vice President',
    title: 'Vice Presidents',
    badgeColor: 'from-purple-600 to-indigo-500 text-white',
    borderColor: 'border-purple-500/40',
    icon: Shield,
    desc: 'Assists presidents in daily management, event organization, and community welfare.',
    members: [
      { name: 'JAS / CLAIRE', ign: 'VICE- PRESIDENT ICC CLAIRE', real_name: 'Jasmine / JC Marasigan', car: 'ID: YX606679' },
      { name: 'BOSS TIN', ign: 'V P -BOSS TIN', real_name: 'Rolly Nacino Garcia', car: 'ID: TU606062' }
    ]
  },
  {
    role: 'Admin',
    title: 'Staff Administrators',
    badgeColor: 'from-blue-600 to-cyan-500 text-white',
    borderColor: 'border-blue-500/40',
    icon: Star,
    desc: 'Reviews join applications, enforces rules across official servers, coordinates meets.',
    members: [
      { name: 'HIJUME', ign: 'ICC ( ADMIN )(Hijume)', real_name: 'Prince Casaway', car: 'ID: 09252008' },
      { name: 'SIR DOM', ign: 'ICC - I SIR DOM I - ADMIN', real_name: 'Dominic Denuevo II', car: 'ID: BM120909' },
      { name: 'ROXAS', ign: '🖤𝕮𝕴𝕸𝕻𝕮.𝕻𝕳_ADMIN_ROXAS', real_name: 'Roxas Jomy', car: 'Admin' },
      { name: 'AQUAWRKZ', ign: '🖤𝕮𝕴𝕸𝕻𝕮.𝕻𝕳_ADMIN_AQUAWRKZ', real_name: 'Justine Bryan de Guzman', car: 'Admin' }
    ]
  },
  {
    role: 'Member',
    title: 'Official Clan Members',
    badgeColor: 'from-zinc-600 to-zinc-700 text-white',
    borderColor: 'border-white/15',
    icon: Users,
    desc: 'Full verified members wearing the official ICC clan tag in Car Parking Multiplayer.',
    members: [
      { name: 'YELICH', ign: 'ICC - (YELICH)', real_name: 'Ken Heindrich Narzoles', car: 'ID: QK168210' },
      { name: 'Missche', ign: 'Missche', real_name: 'Karla Mantos', car: 'Member' },
      { name: 'XED', ign: 'ICC - XED MEMBER', real_name: 'Dexter', car: 'ID: TK668735' },
      { name: 'AZZY', ign: 'ICC (AZZY)✿', real_name: 'Azy Siermento', car: 'ID: LY914190' },
      { name: 'bwisetor', ign: 'bwisetor', real_name: 'Jhon Aerol Gonzaga', car: 'Member' },
      { name: 'CHACHA', ign: '[MEMBER] CHACHA', real_name: 'Jhon Carl Bautista', car: 'Member' },
      { name: 'Nhogzkie', ign: 'Nhogzkie Madera', real_name: 'Nhogzkie Madera', car: 'Member' }
    ]
  },
  {
    role: 'New Member / Recruit',
    title: 'Cadet / Probationary Members',
    badgeColor: 'from-zinc-700 to-zinc-800 text-zinc-300',
    borderColor: 'border-white/10',
    icon: Sparkles,
    desc: 'Newly accepted members undergoing initial probation and trial drive evaluation.',
    members: [
      { name: 'MANOK', ign: 'ICC (MANOK) NEW MEMBER', real_name: 'Alfon Jedric Udalve', car: 'ID: AP634449' },
      { name: 'maw', ign: '(maw) NEW MEMBER', real_name: 'John Mark Condes', car: 'ID: IY234858' },
      { name: 'PRITS', ign: 'ICC (PRITS) NEW MEMBER', real_name: 'Pret Zel', car: 'ID: PRTZ3106' }
    ]
  }
];

export default function HierarchyPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  // Attempt to fetch custom hierarchy data from Supabase members if populated
  const { data: dbMembers } = useSupabaseQuery('members', {
    order: { column: 'hierarchy_order', ascending: true },
  });

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
            // Filter real members if available, or use defaults
            const currentMembers = dbMembers && dbMembers.length > 0
              ? dbMembers.filter(m => m.role?.toLowerCase() === tier.role.toLowerCase())
              : tier.members;

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
                                {m.ign}
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
