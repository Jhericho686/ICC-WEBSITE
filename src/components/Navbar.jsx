import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Music2, MessageCircle, Shield, Home, Users, Trophy, Image, Video, Calendar, Award, BookOpen, Handshake, UserPlus, Info } from 'lucide-react';
import { FacebookIcon as Facebook, YoutubeIcon as Youtube } from './Icons';
import { useScrollPosition, useMediaQuery } from '../lib/hooks';
import { useSiteSettings } from '../lib/contexts';

const publicLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/about', label: 'About', icon: Info },
  { path: '/hierarchy', label: 'Hierarchy', icon: Users },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/gallery', label: 'Pictures', icon: Image },
  { path: '/montages', label: 'Montages', icon: Video },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/achievements', label: 'Achievements', icon: Award },
  { path: '/rules', label: 'Rules', icon: BookOpen },
  { path: '/join', label: 'Join the Club', icon: UserPlus },
  { path: '/collaborate', label: 'Collaborate', icon: Handshake },
];

const desktopNavLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/hierarchy', label: 'Hierarchy' },
  { path: '/members', label: 'Members' },
  { path: '/gallery', label: 'Pictures' },
  { path: '/montages', label: 'Montages' },
  { path: '/events', label: 'Events' },
  { path: '/collaborate', label: 'Collaborate' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const location = useLocation();
  const { settings } = useSiteSettings();

  const scrolled = scrollY > 50;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(10,10,10,0.85)] backdrop-blur-xl border-b border-[var(--color-border)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 no-underline">
              <img src={settings.logo_url || '/icc-logo-transparent.png'} alt={settings.clan_name || 'ICC'} className="h-10 w-10 object-contain" />
              <span className="text-white font-heading font-bold text-lg tracking-wide hidden sm:block">
                {settings.short_name || 'ICC'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-1">
                {desktopNavLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline ${
                      location.pathname === link.path
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent-glow)]'
                        : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {!isMobile && (
                <Link to="/join" className="btn-accent text-sm py-2 px-5 no-underline">
                  Join the Club
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors border-none bg-transparent cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hamburger Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] max-w-[85vw] bg-[var(--color-surface)] border-l border-[var(--color-border)] z-[200] overflow-y-auto"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <img src={settings.logo_url || '/icc-logo-transparent.png'} alt="ICC Logo" className="h-9 w-9 object-contain" />
                  <span className="text-white font-heading font-bold tracking-wide">MENU</span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg text-[var(--color-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors border-none bg-transparent cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Public Links */}
              <div className="p-4">
                <p className="text-[var(--color-accent)] text-xs font-bold tracking-[0.15em] uppercase mb-3 px-3">Public</p>
                {publicLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm no-underline transition-all duration-200 mb-0.5 ${
                        location.pathname === link.path
                          ? 'text-[var(--color-accent)] bg-[var(--color-accent-glow)]'
                          : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                      }`}
                    >
                      <Icon size={18} />
                      {link.label}
                      <ChevronRight size={14} className="ml-auto opacity-30" />
                    </Link>
                  );
                })}
              </div>

              {/* Community Links */}
              <div className="p-4 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-accent)] text-xs font-bold tracking-[0.15em] uppercase mb-3 px-3">Community</p>
                <a href={settings.facebook_url || 'https://www.facebook.com/profile.php?id=61573345143647'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all no-underline mb-0.5">
                  <Facebook size={18} /> Facebook <ChevronRight size={14} className="ml-auto opacity-30" />
                </a>
                <a href={settings.tiktok_url || 'https://www.tiktok.com/@cpm..idle.country'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all no-underline mb-0.5">
                  <Music2 size={18} /> TikTok <ChevronRight size={14} className="ml-auto opacity-30" />
                </a>
              </div>

              {/* Administration */}
              <div className="p-4 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-muted)] text-xs font-bold tracking-[0.15em] uppercase mb-3 px-3">Administration</p>
                <Link
                  to="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.03)] transition-all no-underline"
                >
                  <Shield size={18} /> Admin Login <ChevronRight size={14} className="ml-auto opacity-30" />
                </Link>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--color-border)] text-center">
                <p className="text-[var(--color-muted)] text-xs">
                  © {new Date().getFullYear()} {settings.clan_name}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
