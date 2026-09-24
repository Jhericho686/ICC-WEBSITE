import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Award, ShieldAlert, CheckCircle2, Image as ImageIcon, Video, ExternalLink } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import SectionHeader from '../components/SectionHeader';

export const fallbackEvents = [
  {
    id: 'e1',
    title: 'ICC GRAND STANCE CAR MEET & SHOWCASE',
    event_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: 'City 1 - Marina Docks (Server ICC-MAIN)',
    category: 'Car Meet',
    host: 'ICC Council',
    requirements: 'Clean build, static/air stance, no rice mods',
    description: 'Our weekly signature clan gathering. Clean builds only, livery contest, and night cruise around the loop.',
    status: 'upcoming',
    image_url: '/gallery/icc-meet-grand-gathering.png',
    video_url: '/videos/icc-montage-1.mp4',
    recap_notes: 'Grand turnout with over 35+ clan members and partner pilots.',
  },
  {
    id: 'e2',
    title: 'MIDNIGHT TOUGE DRIFT BATTLE // CUP 4',
    event_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    location: 'Mountain Pass Section 3 (Tandem Server)',
    category: 'Tournament',
    host: 'MELLY & PATPAT',
    requirements: 'RWD Drift Spec, Street Tires, Helmet',
    description: 'Bracket drift battle tournament with judge scoring on angle, clipping points, and proximity.',
    status: 'upcoming',
    image_url: '/gallery/icc-meet-touge-pass.png',
    video_url: '',
    recap_notes: 'High speed mountain tandem tandem battles.',
  },
  {
    id: 'e3',
    title: 'HIGH SPEED AIRPORT STRIP DRAG WARS',
    event_date: new Date(Date.now() - 86400000 * 5).toISOString(),
    location: 'Desert Airport Runway (Speed Server)',
    category: 'Drag Race',
    host: 'BLUEWORKS & AJ ADU',
    requirements: 'Open Class / Tuned Engines',
    description: 'AWD vs RWD classes. 400m standing quarter-mile shootout. Exclusive winner roles awarded in Discord.',
    status: 'past',
    image_url: '/gallery/icc-meet-bridge-lineup.png',
    video_url: '/videos/icc-montage-2.mp4',
    recap_notes: 'Record quarter-mile passes and clean championship finish.',
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
  const [activeTab, setActiveTab] = useState('past');

  const { data: dbEvents } = useSupabaseQuery('events', {
    order: { column: 'event_date', ascending: activeTab === 'upcoming' },
  });

  const eventList = dbEvents && dbEvents.length > 0 ? dbEvents : fallbackEvents;

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();
    return eventList.filter((e) => {
      const isPastStatus = e.status?.toLowerCase() === 'past';
      const isUpcomingStatus = e.status?.toLowerCase() === 'upcoming';
      const evtTime = new Date(e.event_date).getTime();

      if (activeTab === 'upcoming') {
        return isUpcomingStatus || (evtTime >= now - 86400000 && !isPastStatus);
      } else {
        return isPastStatus || (evtTime < now - 86400000 && !isUpcomingStatus);
      }
    });
  }, [eventList, activeTab]);

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="SCHEDULE & ARCHIVE"
          title="CLAN EVENTS, MEETS & RECAPS"
          description="Browse past gathering recaps with photos and videos, or view upcoming official IDLE COUNTRY CLUB sessions."
        />

        {/* Tab Switcher */}
        <div className="mt-12 flex justify-center">
          <div className="p-1.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] inline-flex gap-2">
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'past'
                  ? 'bg-[var(--color-accent)] text-white shadow-md'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              Past Events Archive (Photos & Videos)
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-[var(--color-accent)] text-white shadow-md'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              Upcoming Schedule
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
                className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] overflow-hidden transition-all flex flex-col justify-between shadow-xl"
              >
                {/* Media Attachment (Photo or Video) */}
                {evt.image_url && (
                  <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl text-[11px] font-bold bg-black/80 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" /> Photo Attached
                    </span>
                  </div>
                )}

                {evt.video_url && !evt.image_url && (
                  <div className="relative aspect-video w-full bg-black/80 overflow-hidden">
                    {evt.video_url.startsWith('data:video') ? (
                      <video src={evt.video_url} controls className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <Video className="w-10 h-10 text-amber-400 mb-2" />
                        <a
                          href={evt.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-1.5 no-underline hover:bg-amber-500/30"
                        >
                          Watch Event Recap Reel <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
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
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-sm text-[var(--color-muted)]">
              No events found in this category. Use the Admin Events panel to add previous events with photos and videos!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
