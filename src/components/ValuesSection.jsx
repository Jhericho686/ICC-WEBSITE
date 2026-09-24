import { motion } from 'framer-motion';
import { Heart, Shield, Users, Flame, Handshake } from 'lucide-react';
import { useInView } from '../lib/hooks';
import SectionHeader from './SectionHeader';

const values = [
  {
    icon: Heart,
    title: 'RESPECT',
    description: 'Respect your fellow members and the wider CPM community.',
  },
  {
    icon: Shield,
    title: 'LOYALTY',
    description: 'Stand with the club and support your fellow members.',
  },
  {
    icon: Users,
    title: 'TEAMWORK',
    description: 'Work together during events, races, and community activities.',
  },
  {
    icon: Flame,
    title: 'PASSION',
    description: 'Bring your love for cars and Car Parking Multiplayer.',
  },
  {
    icon: Handshake,
    title: 'BROTHERHOOD',
    description: 'Build friendships beyond the game.',
  },
];

function ValueCard({ icon: Icon, title, description, index }) {
  const [ref, inView] = useInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/30 transition-all duration-300 cursor-default"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-accent-glow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-glow)] group-hover:bg-[var(--color-accent-glow-strong)] transition-colors mb-4">
          <Icon size={22} className="text-[var(--color-accent)]" />
        </div>
        <h3 className="text-white font-heading font-bold text-lg tracking-wide mb-2">{title}</h3>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export default function ValuesSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader
          label="Our Values"
          title="WHAT WE STAND FOR."
          description="The principles that define IDLE COUNTRY CLUB and guide our community."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {values.map((value, i) => (
            <ValueCard key={value.title} {...value} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
