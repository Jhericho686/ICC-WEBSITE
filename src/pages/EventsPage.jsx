import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import SectionHeader from '../components/SectionHeader';

const fallbackEvents = [
  {
    id: 'e1',
    title: 'ICC GRAND STANCE CAR MEET & SHOWCASE',
    event_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: 'City 1 - Marina Docks (Server ICC-MAIN)',
    category: 'Car Meet',
    host: 'ICC • Valkyrie',
    requirements: 'Clean builds only, realistic fitment, no horn spamming.',
    description: 'Our weekly signature clan gathering. Clean builds only, livery contest, and night cruise around the loop.',
    status: 'upcoming',
  },
  {
    id: 'e2',
    title: 'MIDNIGHT TOUGE DRIFT BATTLE // CUP 4',
    event_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    location: 'Mountain Pass Section 3 (Tandem Server)',
    host: 'ICC • Drifter',
    requirements: 'RWD only, drift tire compound, max 900HP limit.',
    description: 'Bracket drift battle tournament with judge scoring on angle, clipping points, and proximity.',
    status: 'upcoming',
  },
  {
    id: 'e3',
    title: 'HIGH SPEED AIRPORT STRIP DRAG WARS',
    event_date: new Date(Date.now() + 86400000 * 12).toISOString(),
    location: 'Desert Airport Runway (Speed Server)',
    host: 'ICC • Titan',
    requirements: 'Standing 400m start, electronic launch control permitted.',
    description: 'AWD vs RWD classes. 400m standing quarter-mile shootout. Exclusive winner roles awarded in Discord.',
    status: 'upcoming',
  },
  {
    id: 'e4',
    title: 'ANNUAL SUMMER CONVOY & COASTAL CRUISE',
    event_date: new Date(Date.now() - 86400000 * 10).toISOString(),
    location: 'Highway Loop to Desert Oasis',
    host: 'ICC • Jhericho',
    requirements: 'Open to all clan members and registered trial pilots.',
    description: 'Massive 50-car convoy stretching across the entire highway network. Concluded with group photos at sunset.',
    status: 'past',
  },
  {
    id: 'e5',
    title: 'INTER-CLAN DRIFT SHOWDOWN VS TEAM APEX',
    event_date: new Date(Date.now() - 86400000 * 25).toISOString(),
    location: 'City 2 Multi-level Parking Garage',
    host: 'ICC Council',
    requirements: 'Representative squad vs representative squad.',
    description: 'ICC took 1st place in the 5-round tandem showdown against Team Apex with a final score of 4-1.',
    status: 'past',
  },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
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

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: dbEvents } = useSupabaseQuery('events', {
    order: { column: 'event_date', ascending: activeTab === 'upcoming' },
  });

  const eventList = dbEvents && dbEvents.length > 0 ? dbEvents : fallbackEvents;

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();
    return eventList.filter((e) => {
      const evtTime = new Date(e.event_date).getTime();
      return activeTab === 'upcoming' ? evtTime >= now - 86400000 : evtTime < now - 86400000;
    });
  }, [eventList, activeTab]);

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="SCHEDULE & GATHERINGS"
          title="CLAN EVENTS & MEETS"
          description="Participate in official IDLE COUNTRY CLUB sessions, competitive championships, and organized cruises in Car Parking Multiplayer."
        />

        {/* Tab Switcher */}
        <div className="mt-12 flex justify-center">
          <div className="p-1.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] inline-flex gap-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-[var(--color-accent)] text-white shadow-md'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              Upcoming Schedule
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'past'
                  ? 'bg-[var(--color-accent)] text-white shadow-md'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              Past Events Archive
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt, idx) => (
              <motion.div
                key={evt.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] p-8 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                      {evt.category || 'Meet'}
                    </span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1.5 ${
                        activeTab === 'upcoming' ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeTab === 'upcoming' ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'
                        }`}
                      />
                      {activeTab === 'upcoming' ? 'Registration Open' : 'Concluded'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-white mt-5">
                    {evt.title}
                  </h3>

                  <p className="mt-3 text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>

                  {evt.requirements && (
                    <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[var(--color-text-secondary)]">
                      <span className="font-semibold text-white/90">Entry Notes:</span> {evt.requirements}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--color-border)] space-y-2 text-xs text-[var(--color-muted)]">
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

                  {evt.host && (
                    <div className="flex items-center gap-2 text-[var(--color-muted)]">
                      <Users className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                      <span>Hosted by: <strong className="text-white/80">{evt.host}</strong></span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-sm text-[var(--color-muted)]">
              No events found in this category. Check back soon or join our Discord for popup meets!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
