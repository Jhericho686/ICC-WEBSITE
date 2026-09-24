import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getSession, getAdminProfile, fetchAll } from './supabase';

/* ═══════════════════════════════════════════════════════
   Auth Context
   ═══════════════════════════════════════════════════════ */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(session => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getAdminProfile(session.user.id).then(setProfile).catch(() => setProfile(null));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getAdminProfile(session.user.id).then(setProfile).catch(() => setProfile(null));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, profile: null, loading: false };
  return ctx;
}

/* ═══════════════════════════════════════════════════════
   Site Settings Context
   ═══════════════════════════════════════════════════════ */
const SiteSettingsContext = createContext(null);

export const defaultSettings = {
  clan_name: 'IDLE COUNTRY CLUB',
  short_name: 'ICC',
  motto: 'WHERE THE ROAD MEETS THE COMMUNITY.',
  description: 'Welcome to IDLE COUNTRY CLUB — a Car Parking Multiplayer community built around cars, competition, creativity, friendship, and unforgettable moments.',
  logo_url: '/icc-logo-transparent.png',
  hero_image_url: '/gallery/icc-meet-grand-gathering.png',
  accent_color: '#ff6b00',
  facebook_url: 'https://www.facebook.com/profile.php?id=61573345143647',
  tiktok_url: 'https://www.tiktok.com/@cpm..idle.country',
  discord_url: '',
  youtube_url: '',
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await fetchAll('site_settings', { limit: 1 });
      if (data && data.length > 0) {
        setSettings({ ...defaultSettings, ...data[0] });
        if (data[0].accent_color) {
          document.documentElement.style.setProperty('--color-accent', data[0].accent_color);
        }
      }
    } catch (err) {
      console.warn('Using default site settings:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) return { settings: defaultSettings, loading: false, refetch: () => {} };
  return ctx;
}

/* ═══════════════════════════════════════════════════════
   Toast Context
   ═══════════════════════════════════════════════════════ */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toasts: [], addToast: () => {}, removeToast: () => {} };
  return ctx;
}
