import { motion } from 'framer-motion';
import { useInView } from '../lib/hooks';
import SectionHeader from './SectionHeader';

export default function AboutSection() {
  const [ref, inView] = useInView();

  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader
          label="About Us"
          title="MORE THAN A CLAN."
          description="IDLE COUNTRY CLUB is a Car Parking Multiplayer community built for players who share a passion for cars, cruising, racing, drifting, events, and creating memorable moments together."
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12"
        >
          {/* Image / Clan Crest */}
          <div className="relative group flex justify-center">
            <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface-light)] to-[var(--color-surface-lighter)] p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="relative z-10 flex flex-col items-center justify-center w-full">
                {/* Centered logo without ring or circle */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 mb-5 flex items-center justify-center">
                  <img
                    src="/icc-logo-transparent.png"
                    alt="IDLE COUNTRY CLUB Official Logo"
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  />
                </div>
                <h4 className="text-white font-heading font-black text-2xl sm:text-3xl tracking-wider uppercase text-center">
                  IDLE COUNTRY CLUB
                </h4>
                <p className="text-amber-400 font-mono text-xs sm:text-sm font-bold mt-2 tracking-widest uppercase text-center">
                  EST. 2024 • CAR PARKING MULTIPLAYER
                </p>
              </div>

              {/* Decorative subtle background pattern */}
              <div
                className="absolute inset-0 opacity-10 bg-center bg-cover pointer-events-none"
                style={{ backgroundImage: "url('/icc-banner.jfif')" }}
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-2xl border border-[var(--color-accent)]/30 -z-10" />
            <div className="absolute -top-3 -left-3 w-16 h-16 rounded-xl border border-[var(--color-accent)]/20 -z-10" />
          </div>

          {/* Content */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-6">
              Built for Car Enthusiasts,<br />
              <span className="gradient-text-accent">United by the Road.</span>
            </h3>

            <div className="space-y-4 text-[var(--color-text-secondary)] text-base leading-relaxed">
              <p>
                IDLE COUNTRY CLUB was established in 2024 as a community for Car Parking Multiplayer players who are passionate about cars, creativity, and building lasting friendships within the game.
              </p>
              <p>
                From car meets and convoys to drift nights and tournaments, our members come together to create unforgettable experiences. We believe that a great gaming community is built on respect, teamwork, and a shared love for what brings us together.
              </p>
              <p>
                Whether you're a skilled racer, a dedicated drifter, a creative tuner, or simply someone who loves cruising with friends — IDLE COUNTRY CLUB has a place for you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              {['Car Meets', 'Racing', 'Drifting', 'Convoys', 'Tournaments', 'Community'].map(tag => (
                <span
                  key={tag}
                  className="px-4 py-1.5 rounded-full text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
