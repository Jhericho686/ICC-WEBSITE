import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { useInView, useSupabaseQuery } from '../lib/hooks';
import { safeArrayParse } from '../lib/storage';
import SectionHeader from './SectionHeader';

const fallbackEvents = [
  {
    id: 'e1',
    title: 'ICC GRAND STANCE CAR MEET & SHOWCASE',
    event_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: 'City 1 - Marina Docks (Server ICC-MAIN)',
    category: 'Car Meet',
    description: 'Our weekly signature clan gathering. Clean builds only, livery contest, and night cruise around the loop.',
    status: 'upcoming',
  },
  {
    id: 'e2',
    title: 'MIDNIGHT TOUGE DRIFT BATTLE // CUP 4',
    event_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    location: 'Mountain Pass Section 3 (Tandem Server)',
    category: 'Tournament',
    description: 'Bracket drift battle tournament with judge scoring on angle, clipping points, and proximity.',
    status: 'upcoming',
  },
  {
    id: 'e3',
    title: 'HIGH SPEED AIRPORT STRIP DRAG WARS',
    event_date: new Date(Date.now() + 86400000 * 12).toISOString(),
    location: 'Desert Airport Runway (Speed Server)',
    category: 'Drag Race',
    description: 'AWD vs RWD classes. 400m standing quarter-mile shootout. Exclusive winner roles awarded in Discord.',
    status: 'upcoming',
  },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UpcomingEventsSection() {
  const [ref, inView] = useInView();

  const [isCleared] = useState(() => {
    return localStorage.getItem('icc_events_cleared') === 'true';
  });

  const [localEvents] = useState(() => safeArrayParse('icc_custom_events'));
  const [deletedIds] = useState(() => safeArrayParse('icc_deleted_events'));

  const { data: events } = useSupabaseQuery('events', {
    order: { column: 'event_date', ascending: true },
    limit: 3,
  });

  const baseList = isCleared
    ? []
    : (events && events.length > 0 ? events : fallbackEvents);

  const rawList = [...localEvents, ...baseList.filter((b) => !localEvents.some((l) => l.id === b.id))];
  const displayEvents = rawList.filter((e) =>
    !deletedIds.includes(String(e.id)) &&
    !deletedIds.includes(e.id) &&
    !deletedIds.includes(e.title)
  );

  return (
    <section id="events" className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="SCHEDULED GATHERINGS"
          title="UPCOMING EVENTS & MEETS"
          description="Join official IDLE COUNTRY CLUB sessions, competitive tournaments, and weekend community cruises."
        />

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14">
          {displayEvents.map((evt, idx) => (
            <motion.div
              key={evt.id || idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="group relative rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] p-8 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Event Category & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                    {evt.category || 'Clan Meet'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Open for Members
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold font-heading text-white mt-5 group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                  {evt.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm text-[var(--color-text-secondary)] line-clamp-3">
                  {evt.description}
                </p>
              </div>

              {/* Event Details Footer */}
              <div className="mt-8 pt-6 border-t border-[var(--color-border)] space-y-2.5 text-xs text-[var(--color-muted)]">
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>{formatDate(evt.event_date)}</span>
                  <span className="text-white/40">•</span>
                  <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>{formatTime(evt.event_date) || '8:00 PM UTC'}</span>
                </div>

                <div className="flex items-center gap-2 text-white/70 truncate">
                  <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Events CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium hover:border-[var(--color-accent)] transition-all group"
          >
            Check Calendar & Past Events
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--color-accent)]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
