import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Camera, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import SectionHeader from '../components/SectionHeader';

// Helper to determine role label from category or explicit role field
const getRoleLabel = (item) => item.creator_role || (item.category === 'Builds' ? 'Photographer' : 'ICC Photography');

const fallbackGallery = [
  {
    id: 'g1',
    title: 'Mountain Touge Clan Assembly',
    image_url: '/gallery/icc-meet-touge-pass.png',
    category: 'Meets',
    author: 'ICC Photography',
    creator_role: 'Photographer',
    car: 'Subaru WRX STI / BRZ Squad',
  },
  {
    id: 'g2',
    title: 'Grand Clan Gathering Full Roster',
    image_url: '/gallery/icc-meet-grand-gathering.png',
    category: 'Meets',
    author: 'ICC Photography',
    creator_role: 'Photographer',
    car: 'Full ICC Lineup',
  },
  {
    id: 'g3',
    title: 'Airport Strip Stance Showcase',
    image_url: '/gallery/icc-meet-parking-showcase.png',
    category: 'Meets',
    author: 'ICC Photography',
    creator_role: 'Photographer',
    car: 'Multi-Chassis Meet',
  },
  {
    id: 'g4',
    title: 'Civic Custom Stance Spec [DY 696]',
    image_url: '/gallery/icc-build-honda-dy696.png',
    category: 'Builds',
    author: 'ICC_TITAN',
    car: 'Honda Civic Custom',
  },
  {
    id: 'g5',
    title: 'Lexus LFA & Spoon Pit Hangout',
    image_url: '/gallery/icc-meet-lexus-lfa-honda.png',
    category: 'Builds',
    author: 'ICC_GHOST',
    car: 'Lexus LFA V10',
  },
  {
    id: 'g6',
    title: 'BMW E36 Stance Clean Fitment',
    image_url: '/gallery/icc-build-bmw-e36-stance.png',
    category: 'Builds',
    author: 'ICC_VIPER',
    car: 'BMW M3 E36 Coupe',
  },
  {
    id: 'g7',
    title: 'Porsche GT Stance Track Livery',
    image_url: '/gallery/icc-build-porsche-stance.png',
    category: 'Builds',
    author: 'ICC_KAI',
    car: 'Porsche 911 GT',
  },
  {
    id: 'g8',
    title: 'Midnight Multi-Level Garage Meet',
    image_url: '/gallery/icc-meet-night-garage.png',
    category: 'Meets',
    author: 'ICC Photography',
    car: 'Midnight Fleet',
  },
  {
    id: 'g9',
    title: 'Mitsubishi Lancer Evolution IX Midnight Blue',
    image_url: '/gallery/icc-build-evo-blue.png',
    category: 'Builds',
    author: 'ICC_DRIFT',
    car: 'Lancer Evo IX',
  },
  {
    id: 'g10',
    title: 'Subaru Impreza WRX STI Track Yellow',
    image_url: '/gallery/icc-build-wrx-yellow.png',
    category: 'Builds',
    author: 'ICC_RACE',
    car: 'Subaru WRX STI',
  },
  {
    id: 'g11',
    title: 'McLaren 720S Hyper Build',
    image_url: '/gallery/icc-build-mclaren-white.png',
    category: 'Builds',
    author: 'ICC_APEX',
    car: 'McLaren 720S',
  },
  {
    id: 'g12',
    title: 'Kia Stinger GT Red Edition',
    image_url: '/gallery/icc-build-stinger-red.png',
    category: 'Builds',
    author: 'ICC_STORM',
    car: 'Kia Stinger GT',
  },
  {
    id: 'g13',
    title: 'BMW M4 Competition Dark Livery',
    image_url: '/gallery/icc-build-bmw-m4-black.png',
    category: 'Builds',
    author: 'ICC_SHADOW',
    car: 'BMW M4 Competition',
  },
  {
    id: 'g14',
    title: 'BMW M5 F90 Marina Blue',
    image_url: '/gallery/icc-build-bmw-m5-blue.png',
    category: 'Builds',
    author: 'ICC_TURBO',
    car: 'BMW M5 F90',
  },
  {
    id: 'g15',
    title: 'Mazda RX-7 FD3S Spirit R Twin Turbo',
    image_url: '/gallery/icc-build-rx7-grey.png',
    category: 'Builds',
    author: 'ICC_ROTARY',
    car: 'Mazda RX-7 FD3S',
  },
  {
    id: 'g16',
    title: 'Toyota Supra MK4 1000HP Midnight Build',
    image_url: '/gallery/icc-build-supra-mk4.png',
    category: 'Builds',
    author: 'ICC_BOOST',
    car: 'Toyota Supra MK4',
  },
  {
    id: 'g17',
    title: 'Highway Bridge Squad Showcase',
    image_url: '/gallery/icc-meet-bridge-lineup.png',
    category: 'Meets',
    author: 'ICC Photography',
    car: 'Highway Lineup',
  },
  {
    id: 'g18',
    title: 'Golden Hour Drift Tandem Lineup',
    image_url: '/gallery/icc-meet-drift-sunset.png',
    category: 'Meets',
    author: 'ICC Photography',
    car: 'Drift Tandem Squad',
  },
];

export default function GalleryPage() {
  const [activePhoto, setActivePhoto] = useState(null);

  const { data: dbGallery } = useSupabaseQuery('gallery', {
    order: { column: 'created_at', ascending: false },
  });

  const galleryList = dbGallery && dbGallery.length > 0 ? dbGallery : fallbackGallery;

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="MEDIA HUB"
          title="CLAN PICTURES & BUILDS"
          description="High-resolution captures of custom CPM liveries, stance photography, clan meets, and track battles."
        />

        {/* 2 Primary Media Options: Pictures & Montages */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl gap-2">
            <div
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/25 transition-all"
            >
              <ImageIcon className="w-4 h-4 text-white" />
              Pictures
            </div>
            <Link
              to="/montages"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all no-underline"
            >
              <VideoIcon className="w-4 h-4 text-[var(--color-accent)]" />
              Montages
            </Link>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {galleryList.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              onClick={() => setActivePhoto(item)}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer bg-black/40 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white/90 border border-white/10">
                  {item.category || 'Build'}
                </span>
              </div>

              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100">
                <Maximize2 className="w-4 h-4" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-base font-bold font-heading text-white line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
                  {item.title}
                </h3>
                {/* Creator credit with role label */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-3 h-3 text-[var(--color-accent)]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white/90 leading-tight">{item.author || 'ICC Photography'}</span>
                    <span className="text-[9px] text-[var(--color-accent)] font-semibold uppercase tracking-widest leading-tight">{getRoleLabel(item)}</span>
                  </div>
                  {item.car && (
                    <span className="ml-auto text-[10px] text-white/50 font-mono truncate max-w-[90px]">{item.car}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8"
            onClick={() => setActivePhoto(null)}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl max-h-[90vh] flex flex-col items-center"
            >
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl border border-white/10 shadow-2xl"
              />
              <div className="mt-5 text-center">
                <h4 className="text-xl font-bold font-heading text-white">{activePhoto.title}</h4>
                {/* Credit block */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Camera className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-tight">{activePhoto.author || 'ICC Photography'}</p>
                      <p className="text-[10px] text-[var(--color-accent)] font-semibold uppercase tracking-widest leading-tight">{getRoleLabel(activePhoto)}</p>
                    </div>
                  </div>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[var(--color-accent)] font-semibold uppercase tracking-wider">
                    {activePhoto.category}
                  </span>
                  {activePhoto.car && (
                    <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 font-mono">
                      {activePhoto.car}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
