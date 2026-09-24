import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, CheckCircle, AlertTriangle, Scale, Lock, BookOpen } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import SectionHeader from '../components/SectionHeader';

const fallbackRuleSections = [
  {
    id: 'r1',
    category: 'Official Group & Server Rules',
    icon: Shield,
    rules: [
      {
        title: 'NO SENDING OF PORNS',
        detail: 'Strictly prohibited. Sending explicit, NSFW, or adult content in any official group chat or server will lead to an immediate permanent ban.',
      },
      {
        title: 'NO TOXICITY MEMBERS',
        detail: 'Maintain clean vibes. Toxicity, trashtalking, or harassing fellow members inside or outside CPM lobbies is not tolerated.',
      },
      {
        title: 'RESPECT MEMBER AND ADMINS',
        detail: 'Always treat all club members, vice presidents, presidents, co-leaders, and owners with respect.',
      },
      {
        title: 'STRICTLY NO DOUBLE CLUB',
        detail: 'Exclusive loyalty required. You cannot be a member of another CPM clan while wearing the ICC tag.',
      },
      {
        title: 'NO SELLING CARS IN OFFICIAL LOBBIES',
        detail: 'Strictly no selling of cars or soliciting trades in official club rooms without prior admin approval.',
      },
      {
        title: 'NO DUMMY ACCOUNTS',
        detail: 'All applicants and active members must use their main active CPM account. Dummy accounts will be rejected.',
      },
      {
        title: 'ALWAYS GREET EVERY JOINING ROOM WITH CLUB MEMBERS',
        detail: 'Show sportsmanship and unity — always greet clan members whenever joining a CPM room or chat.',
      },
      {
        title: 'DO TASK EVERYDAY',
        detail: 'Active participation required. Complete your assigned daily clan tasks in CPM consistently.',
      },
      {
        title: 'NO TASK WILL BE KICK',
        detail: 'Failing to perform daily tasks without valid excuse will result in immediate removal from the club.',
      },
      {
        title: 'NO 18+ CAR DESIGN',
        detail: 'Strictly clean car liveries only. NSFW or 18+ decals on vehicles are banned from all meets.',
      },
    ],
  },
];

export default function RulesPage() {
  const [openSections, setOpenSections] = useState({ r1: true, r2: true, r3: true, r4: true });

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="COMMUNITY CODE"
          title="CLAN RULES & GUIDELINES"
          description="The standards of conduct, driving discipline, and server etiquette that all IDLE COUNTRY CLUB members adhere to."
        />

        {/* Rules Accordions */}
        <div className="mt-14 space-y-6">
          {fallbackRuleSections.map((sec, idx) => {
            const Icon = sec.icon;
            const isOpen = openSections[sec.id];

            return (
              <motion.div
                key={sec.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => toggleSection(sec.id)}
                  className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-heading text-white">
                        {sec.category}
                      </h3>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">
                        {sec.rules.length} core regulations
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-white/60 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[var(--color-accent)]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-[var(--color-border)] px-6 sm:px-8 py-6 space-y-6 bg-black/20"
                    >
                      {sec.rules.map((rule, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-4">
                          <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 font-mono">
                            {rIdx + 1}
                          </span>
                          <div>
                            <h4 className="text-base font-bold text-white font-heading">
                              {rule.title}
                            </h4>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                              {rule.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Commitment Badge */}
        <div className="mt-12 p-6 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-center">
          <p className="text-xs sm:text-sm text-white font-medium">
            Applying to join IDLE COUNTRY CLUB implies full acceptance and unconditional agreement with all clan rules above.
          </p>
        </div>
      </div>
    </div>
  );
}
