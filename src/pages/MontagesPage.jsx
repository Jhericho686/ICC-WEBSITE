import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Film, Video as VideoIcon, Image as ImageIcon, Clapperboard } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import SectionHeader from '../components/SectionHeader';

const fallbackVideos = [
  {
    id: 'local-v1',
    title: 'ICC OFFICIAL MONTAGE // VOL. 1',
    youtube_url: '/videos/icc-montage-1.mp4',
    thumbnail_url: '/gallery/icc-meet-touge-pass.png',
    category: 'Touge & Drift',
    duration: '01:30',
    description: 'Official ICC clan video footage – mountain pass touge drift runs, convoy lines, and high-speed captures.',
    creator: 'ICC Production',
    creator_role: 'Videographer',
    featured: true,
  },
  {
    id: 'local-v2',
    title: 'ICC OFFICIAL CAR MEET // VOL. 2',
    youtube_url: '/videos/icc-montage-2.mp4',
    thumbnail_url: '/gallery/icc-meet-parking-showcase.png',
    category: 'Car Meet & Cruise',
    duration: '01:45',
    description: 'ICC airport strip car meet, stance camber builds, and cruise highlights from IDLE COUNTRY CLUB.',
    creator: 'ICC Production',
    creator_role: 'Videographer',
    featured: true,
  },
];

function extractYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function MontagesPage() {
  const [activeVideo, setActiveVideo] = useState(null);

  const [localVideos] = useState(() => {
    try {
      const saved = localStorage.getItem('icc_custom_videos');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  const { data: dbVideos } = useSupabaseQuery('videos', {
    order: { column: 'created_at', ascending: false },
  });

  const baseList = dbVideos && dbVideos.length > 0 ? dbVideos : fallbackVideos;
  const videoList = [...localVideos, ...baseList.filter((b) => !localVideos.some((l) => l.id === b.id))];

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="MEDIA HUB"
          title="CLAN MONTAGES & VIDEOS"
          description="Official Car Parking Multiplayer high-definition cinematic edits and clan meet reels."
        />

        {/* 2 Primary Media Options: Pictures & Montages */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl gap-2">
            <Link
              to="/gallery"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all no-underline"
            >
              <ImageIcon className="w-4 h-4 text-[var(--color-accent)]" />
              Pictures
            </Link>
            <div className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/25 transition-all">
              <VideoIcon className="w-4 h-4 text-white" />
              Montages
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-14 max-w-5xl mx-auto">
          {videoList.map((video, idx) => {
            const ytId = extractYoutubeId(video.youtube_url);
            const thumb = video.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '');
            const creatorName = video.creator || video.author || 'ICC Production';
            const creatorRole = video.creator_role || 'Videographer';

            return (
              <motion.div
                key={video.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                  <img
                    src={thumb}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Play Button */}
                  <button
                    onClick={() => setActiveVideo(video)}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-2xl shadow-[var(--color-accent)]/40 group-hover:scale-110 transition-transform cursor-pointer"
                    aria-label={`Play ${video.title}`}
                  >
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </button>

                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-400 border border-white/10">
                    {video.category || 'Video'}
                  </span>

                  {/* Duration */}
                  {video.duration && (
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[11px] font-mono bg-black/80 text-white">
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed flex-1">
                    {video.description || 'Watch official community highlights and competitive driving showcase.'}
                  </p>

                  {/* Creator Credit Row */}
                  <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center flex-shrink-0">
                        <Clapperboard className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-tight">{creatorName}</span>
                        <span className="text-[10px] text-[var(--color-accent)] font-semibold uppercase tracking-widest leading-tight">{creatorRole}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveVideo(video)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:bg-[var(--color-accent)]/80 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" /> Watch
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
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
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center flex-shrink-0">
                    <Clapperboard className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-heading font-bold text-white text-sm truncate leading-tight">{activeVideo.title}</h4>
                    <span className="text-[10px] text-[var(--color-accent)] font-semibold uppercase tracking-widest leading-tight">
                      {activeVideo.creator || activeVideo.author || 'ICC Production'} • {activeVideo.creator_role || 'Videographer'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer flex-shrink-0"
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

              {/* Modal Footer Credit */}
              <div className="px-4 py-3 bg-black/30 flex items-center gap-2 border-t border-[var(--color-border)]">
                <Film className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span className="text-xs text-[var(--color-muted)]">
                  Produced by <span className="text-white font-semibold">{activeVideo.creator || activeVideo.author || 'ICC Production'}</span>
                  <span className="text-[var(--color-accent)]"> · {activeVideo.creator_role || 'Videographer'}</span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
