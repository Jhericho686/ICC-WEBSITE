import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Handshake,
  Users,
  Video,
  Image,
  Calendar,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { useAuth, useSiteSettings } from '../../lib/contexts';
import { signOut } from '../../lib/supabase';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/applications', label: 'Applications', icon: UserPlus },
  { path: '/admin/collaborations', label: 'Collaborations', icon: Handshake },
  { path: '/admin/members', label: 'Clan Members', icon: Users },
  { path: '/admin/montages', label: 'Montages / Videos', icon: Video },
  { path: '/admin/gallery', label: 'Photo Gallery', icon: Image },
  { path: '/admin/events', label: 'Events & Meets', icon: Calendar },
  { path: '/admin/settings', label: 'Site Settings', icon: Settings },
  { path: '/admin/logs', label: 'Activity Logs', icon: FileText },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { settings } = useSiteSettings();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Sign out:', e);
    }
    navigate('/admin/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Extra Wide, Bold & High-Impact Command Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[380px] lg:w-[420px] max-w-[90vw] flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #120c06 0%, #0c0804 100%)',
          borderRight: '1.5px solid rgba(217, 119, 6, 0.25)',
          boxShadow: '10px 0 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Brand Header — Extra Large Logo + Huge ADMIN HQ */}
          <div
            className="px-8 pt-9 pb-8 flex items-center justify-between"
            style={{ borderBottom: '1.5px solid rgba(255,255,255,0.08)' }}
          >
            <Link to="/admin" className="flex items-center gap-5 no-underline group">
              {/* Extra Large ICC Clan Emblem */}
              <div
                className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center shrink-0 rounded-2xl p-1.5 transition-transform group-hover:scale-105"
                style={{
                  background: 'rgba(217, 119, 6, 0.15)',
                  border: '2px solid rgba(217, 119, 6, 0.4)',
                  boxShadow: '0 6px 25px rgba(217, 119, 6, 0.25)',
                }}
              >
                <img
                  src="/icc-logo-transparent.png"
                  alt="ICC Clan Logo"
                  className="w-full h-full object-contain filter drop-shadow(0 4px 10px rgba(0,0,0,0.6))"
                />
              </div>
              <div>
                <h1
                  className="font-heading font-black text-white text-3xl lg:text-4xl leading-none"
                  style={{ letterSpacing: '0.05em' }}
                >
                  ADMIN HQ
                </h1>
                <span
                  className="text-sm lg:text-base font-black uppercase block mt-2 tracking-widest"
                  style={{
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  Command Center
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {/* Navigation Links — Massive, bold, highly legible with guaranteed spacing */}
          <nav className="flex flex-col gap-4 px-6 py-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-5 px-6 py-5 rounded-2xl text-[19px] lg:text-[21px] font-black tracking-wide transition-all no-underline ${
                    active
                      ? 'text-white shadow-2xl'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                  style={
                    active
                      ? {
                          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                          boxShadow: '0 10px 32px rgba(217, 119, 6, 0.45)',
                          border: '1.5px solid rgba(251, 191, 36, 0.5)',
                        }
                      : {
                          border: '1.5px solid transparent',
                        }
                  }
                >
                  <Icon className="w-7 h-7 lg:w-8 lg:h-8 shrink-0" strokeWidth={2.4} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Public Site & Logout) — large buttons */}
        <div
          className="px-6 py-7 space-y-3.5 shrink-0"
          style={{ borderTop: '1.5px solid rgba(255,255,255,0.08)' }}
        >
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-6 py-4.5 rounded-2xl text-[17px] font-extrabold text-white transition-all no-underline hover:bg-white/10"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="flex items-center gap-4">
              <ExternalLink className="w-6 h-6 text-[var(--color-accent)]" strokeWidth={2.2} /> View Public Site
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl hover:bg-red-500/15 text-[17px] font-extrabold text-red-400 transition-colors border-none bg-transparent cursor-pointer"
          >
            <LogOut className="w-6 h-6" strokeWidth={2.2} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden bg-[#0a0a0a]">
        {/* Top Navbar */}
        <header
          className="sticky top-0 z-30 h-22 backdrop-blur-md px-10 sm:px-14 flex items-center justify-between"
          style={{
            background: 'rgba(12, 9, 5, 0.96)',
            borderBottom: '1.5px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 rounded-xl bg-white/5 text-white hover:bg-white/10"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm sm:text-base font-extrabold text-white/80 uppercase tracking-widest">
                ICC System Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div
              className="flex items-center gap-3.5 px-6 py-3 rounded-2xl text-sm sm:text-base"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.1)',
              }}
            >
              <Shield className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-white font-extrabold tracking-wide">
                {profile?.role || 'Head Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content with generous breathing room */}
        <main className="flex-1 p-8 sm:p-12 lg:p-16 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
