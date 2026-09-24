import { motion } from 'framer-motion';
import { Shield, Target, Compass, Flame, Users, Sparkles, Award, ArrowRight, Wrench, Gauge, Fuel, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';

const divisions = [
  {
    title: 'Clean Build',
    desc: 'Pristine stock-look builds with flawless paint, OEM-style liveries, and showroom presentation. Less is more — perfection in every detail.',
    icon: Sparkles,
    badge: '✨ CLEAN',
    color: 'from-sky-500/20 to-blue-500/20',
  },
  {
    title: 'Stance Build',
    desc: 'Aggressive camber, slammed suspension, custom wide-body fitment, and track-edge liveries. Stance culture at its finest.',
    icon: Wrench,
    badge: '🔩 STANCE',
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    title: 'Drag Diesel Build',
    desc: 'High-horsepower torque monsters and low-rpm bruisers. Quarter-mile sprinters, gear ratio tuning, dark smoke, and raw CPM acceleration.',
    icon: Gauge,
    badge: '⚡ DRAG DIESEL',
    color: 'from-orange-500/20 to-red-500/20',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)]">
            OUR HERITAGE & MISSION
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white mt-3">
            ABOUT IDLE COUNTRY CLUB
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
            More than just a clan in Car Parking Multiplayer — we are a brotherhood of car culture enthusiasts, tuners, and competitive drivers.
          </p>
        </div>

        {/* Core Story Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-24">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Where Asphalt Passion Meets Gaming Brotherhood
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              IDLE COUNTRY CLUB was established with a singular vision: to create a disciplined, stylish, and respected community within Car Parking Multiplayer (CPM). In a gaming space crowded with chaotic lobbies and disorganized groups, ICC stands apart through organization, mutual respect, and automotive artistry.
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Every meet we host, every drift tandem we execute, and every livery our artists produce reflects our deep love for real-world car culture — from Japanese touge drifting and German stance engineering to American muscle drag racing.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="text-2xl font-black text-[var(--color-accent)] font-heading">100%</div>
                <div className="text-xs text-[var(--color-muted)] mt-1">Car Culture Driven</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="text-2xl font-black text-white font-heading">Active</div>
                <div className="text-xs text-[var(--color-muted)] mt-1">Weekly Clan Events</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <div className="text-2xl font-black text-emerald-400 font-heading">Global</div>
                <div className="text-xs text-[var(--color-muted)] mt-1">International Roster</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl">
              <img
                src="/gallery/icc-meet-grand-gathering.png"
                alt="ICC Car Lineup"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                  The ICC Philosophy
                </span>
                <p className="text-sm text-white font-medium mt-1">
                  "Respect the track, respect your fellow drivers, and always bring your best build."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Divisions */}
        <div className="mb-24">
          <SectionHeader
            label="SPECIALIZATIONS"
            title="OUR COMMUNITY DIVISIONS"
            description="Members at ICC can find their niche across specialized disciplines and squads."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {divisions.map((div, idx) => {
              const Icon = div.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10 transition-all duration-300 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    {div.badge && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] tracking-widest uppercase">
                        {div.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-lg">{div.title}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                      {div.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>



        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[var(--color-surface-light)] to-[var(--color-surface)] border border-[var(--color-accent)]/30 text-center max-w-4xl mx-auto shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Ready to be part of the legacy?
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xl mx-auto">
            Applications are reviewed weekly by our moderation council. Prove your skills and represent IDLE COUNTRY CLUB on the asphalt.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/join"
              className="px-8 py-3.5 rounded-xl bg-[var(--color-accent)] text-white font-bold hover:bg-[var(--color-accent-light)] transition-all inline-flex items-center gap-2"
            >
              Apply to Join <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/rules"
              className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
            >
              Review Clan Rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
