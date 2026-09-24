import { motion } from 'framer-motion';
import { Trophy, Award, Star, Flame, Flag, Calendar } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import SectionHeader from '../components/SectionHeader';

const fallbackAchievements = [
  {
    id: 'a1',
    title: 'CPM NATIONAL DRIFT INVITATIONAL — 1ST PLACE CHAMPIONS',
    date: 'December 2024',
    category: 'Tournament',
    icon: Trophy,
    description: 'ICC Tandem squad dominated all 5 rounds of the annual drift invitational, scoring highest in angle and proximity.',
  },
  {
    id: 'a2',
    title: 'MILESTONE: 50+ VERIFIED CLAN ROSTER MEMBERS',
    date: 'September 2024',
    category: 'Community',
    icon: Star,
    description: 'Expanded our official vetted driver lineup across North America, Europe, and Asia with zero tolerance for toxic conduct.',
  },
  {
    id: 'a3',
    title: 'RECORD-BREAKING 60-CAR CRUISE ACROSS HIGHWAY',
    date: 'July 2024',
    category: 'Event',
    icon: Flag,
    description: 'Organized one of the largest single-server organized car convoys in Car Parking Multiplayer history with full video coverage.',
  },
  {
    id: 'a4',
    title: 'QUARTER-MILE DRAG STRIP RECORD — 7.89 SECONDS',
    date: 'May 2024',
    category: 'Performance',
    icon: Flame,
    description: 'Member ICC_KINETIC set an official community drag benchmark with custom AWD gearing on the desert strip.',
  },
  {
    id: 'a5',
    title: 'ICC OFFICIAL DIGITAL HEADQUARTERS LAUNCH',
    date: 'January 2024',
    category: 'Platform',
    icon: Award,
    description: 'Formalized clan governance, digital member identification, public showcase, and streamlined application system.',
  },
];

export default function AchievementsPage() {
  const { data: dbAchievements } = useSupabaseQuery('achievements', {
    order: { column: 'created_at', ascending: false },
  });

  const list = dbAchievements && dbAchievements.length > 0 ? dbAchievements : fallbackAchievements;

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="HALL OF FAME"
          title="ACHIEVEMENTS & CLAN HISTORY"
          description="A chronicle of victories, competitive honors, community milestones, and speed records set by IDLE COUNTRY CLUB."
        />

        {/* Timeline Container */}
        <div className="relative mt-16 pl-6 sm:pl-8 border-l-2 border-[var(--color-border)] space-y-12">
          {list.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative group"
            >
              {/* Glowing Bullet on Timeline */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-accent)] flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:bg-[var(--color-accent)] transition-all">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] group-hover:bg-white" />
              </div>

              {/* Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                    {item.category || 'Milestone'}
                  </span>

                  <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    {item.date || '2024'}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mt-4 group-hover:text-[var(--color-accent)] transition-colors">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
