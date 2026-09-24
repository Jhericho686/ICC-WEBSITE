import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import AboutSection from '../components/AboutSection';
import ValuesSection from '../components/ValuesSection';
import HierarchySection from '../components/HierarchySection';
import FeaturedMontagesSection from '../components/FeaturedMontagesSection';
import FeaturedGallerySection from '../components/FeaturedGallerySection';
import UpcomingEventsSection from '../components/UpcomingEventsSection';
import CtaSection from '../components/CtaSection';
import SocialSection from '../components/SocialSection';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* 1. Cinematic Hero */}
      <Hero />

      {/* 2. Live Stats Counter */}
      <StatsSection />

      {/* 3. About ICC Overview */}
      <AboutSection />

      {/* 4. Community Core Values */}
      <ValuesSection />

      {/* 5. Clan Hierarchy Interactive Preview */}
      <HierarchySection />

      {/* 6. Video & Montage Media Showcase */}
      <FeaturedMontagesSection />

      {/* 7. Clan Car Builds & Gallery */}
      <FeaturedGallerySection />

      {/* 8. Scheduled Events & Meets */}
      <UpcomingEventsSection />

      {/* 9. High-impact Dual CTA (Join / Collaborate) */}
      <CtaSection />

      {/* 10. Official Social Channels Banner */}
      <SocialSection />
    </div>
  );
}
