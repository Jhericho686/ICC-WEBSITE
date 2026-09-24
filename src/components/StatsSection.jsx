import { motion } from 'framer-motion';
import { Users, Video, Calendar, Clock } from 'lucide-react';
import { useInView, useCounter, useSupabaseQuery } from '../lib/hooks';

function StatItem({ icon: Icon, label, value, suffix = '+', delay = 0 }) {
  const [ref, inView] = useInView();
  const count = useCounter(value, 2000, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center p-6"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-accent-glow)] mb-4">
        <Icon size={24} className="text-[var(--color-accent)]" />
      </div>
      <div className="text-4xl sm:text-5xl font-heading font-black text-white mb-2">
        {count}{suffix}
      </div>
      <div className="text-[var(--color-muted)] text-sm uppercase tracking-[0.15em] font-medium">
        {label}
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  const { data: dbMembers } = useSupabaseQuery('members');
  const { data: dbVideos } = useSupabaseQuery('videos');
  const { data: dbEvents } = useSupabaseQuery('events');

  const memberCount = dbMembers && dbMembers.length > 0 ? dbMembers.length : 22;
  const videoCount = dbVideos && dbVideos.length > 0 ? dbVideos.length : 2;
  const eventCount = dbEvents && dbEvents.length > 0 ? dbEvents.length : 5;

  const stats = [
    { icon: Users, label: 'Members', value: memberCount, suffix: '+' },
    { icon: Video, label: 'Montages', value: videoCount, suffix: '+' },
    { icon: Calendar, label: 'Events', value: eventCount, suffix: '+' },
    { icon: Clock, label: 'Years Active', value: 2, suffix: '+' },
  ];

  return (
    <section className="relative py-16 sm:py-20 border-y border-[var(--color-border)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-glow)] via-transparent to-[var(--color-accent-glow)] opacity-30" />
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} {...stat} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
}
