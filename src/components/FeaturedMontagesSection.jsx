import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ExternalLink, Film, ArrowRight } from 'lucide-react';
import { useInView, useSupabaseQuery } from '../lib/hooks';
import { safeArrayParse } from '../lib/storage';
import SectionHeader from './SectionHeader';

const fallbackMontages = [
  {
    id: 'm1',
    title: 'ICC CLAN MEETS & TOUGE DRIFT // VOL. 1',
    youtube_url: '/videos/icc-montage-1.mp4',
    thumbnail_url: '/gallery/icc-meet-touge-pass.png',
    category: 'Touge & Drift',
    description: 'Cinematic Car Parking Multiplayer clan assembly, convoy lines, and mountain pass high speed runs.',
    featured: true,
  },
  {
    id: 'm2',
    title: 'STANCE & PERFORMANCE SHOWCASE // VOL. 2',
    youtube_url: '/videos/icc-montage-2.mp4',
    thumbnail_url: '/gallery/icc-meet-grand-gathering.png',
    category: 'Car Meet & Cruise',
    description: 'Custom liveries, stance camber builds, and tandem drift runs from the official ICC community roster.',
    featured: true,
  },
];

function extractYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function FeaturedMontagesSection() {
  const [ref, inView] = useInView();
  const [activeVideo, setActiveVideo] = useState(null);

  const [localVideos] = useState(() => safeArrayParse('icc_custom_videos'));

  const { data: montages } = useSupabaseQuery('videos', {
    filter: { featured: true },
    order: { column: 'created_at', ascending: false },
    limit: 2,
  });

  const baseList = montages && montages.length > 0 ? montages : fallbackMontages;
  const displayMontages = [...localVideos.filter((v) => v.featured), ...baseList.filter((b) => !localVideos.some((l) => l.id === b.id))];

  return (
    <section id="montages" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="MEDIA SHOWCASE"
          title="CLAN MONTAGES & EDITS"
          description="High-octane edits, drift tandems, and cinematic car meets brought to life by ICC creators."
        />

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14 max-w-5xl mx-auto">
          {displayMontages.map((item, idx) => {
            const ytId = extractYoutubeId(item.youtube_url);
            const thumb = item.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '');

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="group relative rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                  <img
                    src={thumb}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-black/30" />

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => setActiveVideo(item)}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-accent-glow-strong)] group-hover:scale-110 transition-transform duration-300"
                    aria-label={`Play ${item.title}`}
                  >
                    <Play className="w-6 h-6 fill-white translate-x-0.5" />
                  </button>

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-400 border border-white/10">
                    {item.category || 'Montage'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)] line-clamp-2">
                      {item.description || 'Watch official community highlights and competitive driving showcase.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-muted)]">
                    <span className="flex items-center gap-1.5 text-white/80">
                      <Film className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      CPM Official Edit
                    </span>
                    <button
                      onClick={() => setActiveVideo(item)}
                      className="text-[var(--color-accent)] hover:underline flex items-center gap-1 font-medium"
                    >
                      Watch Now <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Montages CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/montages"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium hover:border-[var(--color-accent)] transition-all group"
          >
            Explore All Montages & Videos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--color-accent)]" />
          </Link>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <h4 className="font-heading font-bold text-white text-base truncate pr-4">
                  {activeVideo.title}
                </h4>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                {extractYoutubeId(activeVideo.youtube_url || activeVideo.video_url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYoutubeId(activeVideo.youtube_url || activeVideo.video_url)}?autoplay=1`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    key={activeVideo.youtube_url || activeVideo.video_url}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="w-full h-full object-contain"
                  >
                    <source src={activeVideo.youtube_url || activeVideo.video_url} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
