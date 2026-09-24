import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Handshake, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useInView } from '../lib/hooks';

export default function CtaSection() {
  const [ref, inView] = useInView();

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-transparent via-[var(--color-surface)]/40 to-transparent border-t border-[var(--color-border)]">
      {/* Background glow circles */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Join the Clan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[var(--color-surface-light)] to-[var(--color-surface)] border border-[var(--color-accent)]/40 overflow-hidden group shadow-2xl"
          >
            {/* Background accent line */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-accent)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-accent)]/20 transition-all" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 flex items-center justify-center mb-6">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[var(--color-accent)]/15 text-[var(--color-accent)] mb-3">
                  Recruitment Open
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  Want to Join IDLE COUNTRY CLUB?
                </h3>
                <p className="mt-4 text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
                  We are actively looking for disciplined drivers, skilled tuners, livery artists, and passionate CPM enthusiasts who live the car culture.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                    Structured hierarchy & member ranks
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--color-accent)]" />
                    Weekly meets, cruises, and tournaments
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                    Active international community & Discord server
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  to="/join"
                  className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white font-bold tracking-wide shadow-lg shadow-[var(--color-accent-glow-strong)] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all group/btn"
                >
                  Apply to Join Clan
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Collaborate with ICC */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[var(--color-surface-light)] to-[var(--color-surface)] border border-white/10 hover:border-white/20 overflow-hidden group shadow-2xl"
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white border border-white/15 flex items-center justify-center mb-6">
                  <Handshake className="w-7 h-7" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/10 text-white/90 mb-3">
                  Partnerships & Clans
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  Collaborate with IDLE COUNTRY CLUB
                </h3>
                <p className="mt-4 text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
                  Are you a clan leader, tournament organizer, content creator, or brand seeking a joint meet, cross-clan battle, or promotional partnership?
                </p>

                <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Joint Car Meets & Inter-Clan Battles
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Video & TikTok content collaborations
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Official community alliance & co-hosting
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  to="/collaborate"
                  className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all group/btn"
                >
                  Submit Collaboration Request
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
