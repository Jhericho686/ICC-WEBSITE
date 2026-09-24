import { Link } from 'react-router-dom';
import { Music2, MessageCircle, MapPin, Mail, ArrowUp } from 'lucide-react';
import { FacebookIcon as Facebook, YoutubeIcon as Youtube } from './Icons';
import { useSiteSettings } from '../lib/contexts';

const footerLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/hierarchy', label: 'Hierarchy' },
  { path: '/gallery', label: 'Pictures' },
  { path: '/montages', label: 'Montages' },
  { path: '/events', label: 'Events' },
  { path: '/collaborate', label: 'Collaborate' },
  { path: '/join', label: 'Join' },
];

export default function Footer() {
  const { settings } = useSiteSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={settings.logo_url || '/icc-logo-transparent.png'} alt={settings.clan_name || 'ICC'} className="h-10 w-10 object-contain" />
              <span className="text-white font-heading font-bold text-lg tracking-wide">
                {settings.short_name || 'ICC'}
              </span>
            </div>
            <p className="text-[var(--color-accent)] text-sm font-medium italic mb-4">
              "{settings.motto || 'DRIVEN BY STYLE. UNITED BY THE ROAD.'}"
            </p>
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              A Car Parking Multiplayer community built around cars, competition, creativity, and unforgettable moments.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-[0.1em] uppercase mb-4">Navigation</h4>
            <ul className="space-y-2 list-none">
              {footerLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] text-sm transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-[0.1em] uppercase mb-4">Community</h4>
            <ul className="space-y-3 list-none">
              <li>
                <a href={settings.facebook_url || 'https://www.facebook.com/profile.php?id=61573345143647'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] text-sm transition-colors no-underline">
                  <Facebook size={16} /> Facebook
                </a>
              </li>
              <li>
                <a href={settings.tiktok_url || 'https://www.tiktok.com/@cpm..idle.country'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] text-sm transition-colors no-underline">
                  <Music2 size={16} /> TikTok
                </a>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-[0.1em] uppercase mb-4">Get Involved</h4>
            <div className="space-y-3">
              <Link to="/join" className="block btn-accent text-center text-sm py-2.5 no-underline">
                Join the Club
              </Link>
              <Link to="/collaborate" className="block btn-outline text-center text-sm py-2.5 no-underline">
                Collaborate With Us
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-muted)] text-xs text-center sm:text-left">
            © {new Date().getFullYear()} {settings.clan_name || 'IDLE COUNTRY CLUB'}. Car Parking Multiplayer community website.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-accent)] text-xs transition-colors bg-transparent border-none cursor-pointer"
          >
            Back to top <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
