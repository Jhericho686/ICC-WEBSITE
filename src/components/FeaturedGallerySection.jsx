import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ArrowRight, Camera } from 'lucide-react';
import { useInView, useSupabaseQuery } from '../lib/hooks';
import SectionHeader from './SectionHeader';

const fallbackGallery = [
  {
    id: 'g1',
    title: 'Touge Pass High-Speed Run',
    image_url: '/gallery/icc-meet-touge-pass.png',
    category: 'Meets',
    author: 'ICC_KEN',
  },
  {
    id: 'g2',
    title: 'Clan Grand Gathering at Sunset',
    image_url: '/gallery/icc-meet-grand-gathering.png',
    category: 'Meets',
    author: 'ICC_GHOST',
  },
  {
    id: 'g3',
    title: 'Custom DY-696 Livery Showcase',
    image_url: '/gallery/icc-build-honda-dy696.png',
    category: 'Builds',
    author: 'ICC_VIPER',
  },
  {
    id: 'g4',
    title: 'Lexus LFA & Honda Stance Duo',
    image_url: '/gallery/icc-meet-lexus-lfa-honda.png',
    category: 'Meets',
    author: 'ICC_BLAZE',
  },
  {
    id: 'g5',
    title: 'BMW E36 Stance Track Beast',
    image_url: '/gallery/icc-build-bmw-e36-stance.png',
    category: 'Builds',
    author: 'ICC_NEXUS',
  },
  {
    id: 'g6',
    title: 'Custom Porsche Stance Build',
    image_url: '/gallery/icc-build-porsche-stance.png',
    category: 'Builds',
    author: 'ICC_SHADOW',
  },
];

export default function FeaturedGallerySection() {
  const [ref, inView] = useInView();
  const [activePhoto, setActivePhoto] = useState(null);

  const { data: galleryItems } = useSupabaseQuery('gallery', {
    filter: { featured: true },
    order: { column: 'created_at', ascending: false },
    limit: 6,
  });

  const displayPhotos = galleryItems && galleryItems.length > 0 ? galleryItems : fallbackGallery;

  return (
    <section id="gallery" className="py-24 relative bg-[var(--color-surface)]/40 border-y border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="COMMUNITY GALLERY"
          title="CUSTOM BUILDS & CLAN MEETS"
          description="Browse curated screenshots, custom liveries, and stance culture captured inside Car Parking Multiplayer."
        />

        {/* Gallery Grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {displayPhotos.map((photo, idx) => (
            <motion.div
              key={photo.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => setActivePhoto(photo)}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer bg-black/40 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300"
            >
              <img
                src={photo.image_url}
                alt={photo.title || 'ICC Photo'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white/90 border border-white/10">
                  {photo.category || 'CPM Build'}
                </span>
              </div>

              {/* Expand Icon */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-base font-bold font-heading text-white line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
                  {photo.title || 'Exclusive ICC CPM Build'}
                </h3>
                {photo.author && (
                  <p className="text-xs text-[var(--color-muted)] mt-1 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-[var(--color-accent)]" />
                    By <span className="text-white/80 font-medium">{photo.author}</span>
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium hover:border-[var(--color-accent)] transition-all group"
          >
            View Complete Pictures Archive
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[var(--color-accent)]" />
          </Link>
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
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close image lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl border border-white/10 shadow-2xl"
              />
              <div className="mt-4 text-center">
                <h4 className="text-lg font-bold font-heading text-white">{activePhoto.title}</h4>
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  Category: <span className="text-[var(--color-accent)]">{activePhoto.category}</span>
                  {activePhoto.author ? ` • Photographer: ${activePhoto.author}` : ''}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
