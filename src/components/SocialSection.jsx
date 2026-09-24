import { motion } from 'framer-motion';
import { Music2, ExternalLink, ArrowRight } from 'lucide-react';
import { FacebookIcon as Facebook } from './Icons';
import { useInView } from '../lib/hooks';
import { useSiteSettings } from '../lib/contexts';

export default function SocialSection() {
  const [ref, inView] = useInView();
  const { settings } = useSiteSettings();

  const socialLinks = [
    {
      name: 'TikTok',
      badge: 'Official TikTok',
      handle: '@cpm..idle.country',
      tagline: 'Daily CPM Drift Clips & Liveries',
      description: 'Follow our official TikTok for viral tandem drift clips, build showcases, cinematic replays, and game updates.',
      url: settings.tiktok_url || 'https://www.tiktok.com/@cpm..idle.country',
      icon: Music2,
      gradient: 'from-pink-600/20 via-neutral-900 to-cyan-500/10',
      borderHover: 'hover:border-pink-500/50',
      badgeStyle: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      accentColor: 'text-pink-400',
    },
    {
      name: 'Facebook',
      badge: 'Official Community',
      handle: 'IDLE COUNTRY CLUB Official',
      tagline: 'Clan Announcements & Event Albums',
      description: 'Join our official Facebook page for clan news, meet photos, tournament brackets, and driver announcements.',
      url: settings.facebook_url || 'https://www.facebook.com/profile.php?id=61573345143647',
      icon: Facebook,
      gradient: 'from-blue-600/20 via-neutral-900 to-indigo-500/10',
      borderHover: 'hover:border-blue-500/50',
      badgeStyle: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      accentColor: 'text-blue-400',
    },
  ];

  return (
    <section className="py-28 relative border-t border-[var(--color-border)] overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)]">
            STAY CONNECTED
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white mt-3 tracking-wide">
            OFFICIAL CLAN CHANNELS
          </h2>
          <p className="text-base text-[var(--color-text-secondary)] mt-4 leading-relaxed">
            Follow IDLE COUNTRY CLUB across our official media platforms to stay informed about car meets, clips, and clan announcements.
          </p>
        </div>

        {/* Big Dual Social Cards: TikTok & Facebook Only */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {socialLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 25 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`group relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br ${item.gradient} border border-[var(--color-border)] ${item.borderHover} transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 shadow-2xl no-underline`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Large Icon Box */}
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
                    {item.tagline}
                  </span>

                  <h3 className="font-heading font-black text-white text-2xl sm:text-3xl mt-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {item.handle}
                  </h3>

                  <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-3.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-sm font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">
                  <span>Visit Official {item.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/40">Open</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
