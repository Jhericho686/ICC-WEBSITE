import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Settings, Save, Sparkles, Palette, Share2, Globe, Shield } from 'lucide-react';
import { useSiteSettings, useToast } from '../../lib/contexts';
import { updateRow, insertRow, fetchAll, uploadMediaFile } from '../../lib/supabase';

const colorPresets = [
  { name: 'ICC Flame (Default)', color: '#ff6b00' },
  { name: 'Tokyo Crimson', color: '#e11d48' },
  { name: 'Neon Amber', color: '#f59e0b' },
  { name: 'Cyber Emerald', color: '#10b981' },
  { name: 'Electric Cyan', color: '#06b6d4' },
  { name: 'Midnight Violet', color: '#8b5cf6' },
];

export default function AdminSettings() {
  const { settings, refetch } = useSiteSettings();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    clan_name: settings.clan_name || 'IDLE COUNTRY CLUB',
    short_name: settings.short_name || 'ICC',
    motto: settings.motto || 'WHERE THE ROAD MEETS THE COMMUNITY.',
    description: settings.description || '',
    accent_color: settings.accent_color || '#ff6b00',
    logo_url: settings.logo_url || '',
    hero_image_url: settings.hero_image_url || '',
    facebook_url: settings.facebook_url || '',
    tiktok_url: settings.tiktok_url || '',
    discord_url: settings.discord_url || '',
    youtube_url: settings.youtube_url || '',
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        clan_name: settings.clan_name || 'IDLE COUNTRY CLUB',
        short_name: settings.short_name || 'ICC',
        motto: settings.motto || 'WHERE THE ROAD MEETS THE COMMUNITY.',
        description: settings.description || '',
        accent_color: settings.accent_color || '#ff6b00',
        logo_url: settings.logo_url || '',
        hero_image_url: settings.hero_image_url || '',
        facebook_url: settings.facebook_url || '',
        tiktok_url: settings.tiktok_url || '',
        discord_url: settings.discord_url || '',
        youtube_url: settings.youtube_url || '',
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'accent_color') {
      document.documentElement.style.setProperty('--color-accent', value);
    }
  };

  const handleColorPreset = (color) => {
    setForm((prev) => ({ ...prev, accent_color: color }));
    document.documentElement.style.setProperty('--color-accent', color);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    addToast('📸 Uploading clan logo...', 'info');
    try {
      const url = await uploadMediaFile('branding', file);
      if (url) {
        setForm((prev) => ({ ...prev, logo_url: url }));
        addToast('📸 Clan emblem uploaded & updated!', 'success');
      }
    } catch (err) {
      console.warn('Logo upload error:', err);
      addToast('Error uploading logo: ' + err.message, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    addToast('📸 Uploading hero banner...', 'info');
    try {
      const url = await uploadMediaFile('branding', file);
      if (url) {
        setForm((prev) => ({ ...prev, hero_image_url: url }));
        addToast('📸 Hero banner uploaded & updated!', 'success');
      }
    } catch (err) {
      console.warn('Hero upload error:', err);
      addToast('Error uploading banner: ' + err.message, 'error');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (settings?.id) {
        await updateRow('site_settings', settings.id, form);
      } else {
        const existing = await fetchAll('site_settings', { limit: 1 });
        if (existing && existing.length > 0) {
          await updateRow('site_settings', existing[0].id, form);
        } else {
          await insertRow('site_settings', form);
        }
      }
      document.documentElement.style.setProperty('--color-accent', form.accent_color);
      addToast('Site settings updated successfully!', 'success');
      refetch();
    } catch (err) {
      document.documentElement.style.setProperty('--color-accent', form.accent_color);
      addToast('Settings saved in session.', 'info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
          Platform Customization & Branding
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
          Configure official clan identity, live accent themes, and social channel integration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Brand Core Card */}
        <div
          className="p-8 sm:p-10 rounded-3xl space-y-8 shadow-2xl"
          style={{
            background: 'rgba(16, 12, 8, 0.85)',
            border: '1.5px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <h2 className="text-xl sm:text-2xl font-black font-heading text-white flex items-center gap-3">
            <Globe className="w-6 h-6 text-[var(--color-accent)]" /> Brand Identity & Motto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/80 mb-3">
                Clan Full Name
              </label>
              <input
                type="text"
                name="clan_name"
                value={form.clan_name}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/80 mb-3">
                Clan Short Abbreviation
              </label>
              <input
                type="text"
                name="short_name"
                value={form.short_name}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/80 mb-3">
                Official Clan Motto
              </label>
              <input
                type="text"
                name="motto"
                value={form.motto}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/80 mb-3">
                Clan Description (Hero / About)
              </label>
              <textarea
                rows="4"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-black/60 border border-white/15 text-sm sm:text-base text-white focus:outline-none focus:border-[var(--color-accent)] resize-none transition-colors"
              />
            </div>

            {/* Official Clan Emblem / Logo */}
            <div>
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/80 mb-2">
                Official Clan Emblem / Logo
              </label>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-black/60 border border-white/15 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={form.logo_url || '/icc-logo-transparent.png'}
                    alt="Logo Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <label className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-dashed border-amber-500/40 hover:border-amber-400 text-white text-xs font-bold cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>{uploadingLogo ? 'Uploading Logo...' : 'Upload Logo from Device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingLogo}
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
              <input
                type="text"
                name="logo_url"
                value={form.logo_url}
                onChange={handleChange}
                placeholder="https://... or upload above"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none font-mono"
              />
            </div>

            {/* Homepage Hero Cover Banner */}
            <div>
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/80 mb-2">
                Homepage Hero Cover Banner
              </label>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-24 h-16 rounded-2xl bg-black/60 border border-white/15 overflow-hidden shrink-0">
                  <img
                    src={form.hero_image_url || '/gallery/icc-meet-grand-gathering.png'}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-dashed border-amber-500/40 hover:border-amber-400 text-white text-xs font-bold cursor-pointer transition-colors">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>{uploadingHero ? 'Uploading Banner...' : 'Upload Banner from Device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingHero}
                    className="hidden"
                    onChange={handleHeroUpload}
                  />
                </label>
              </div>
              <input
                type="text"
                name="hero_image_url"
                value={form.hero_image_url}
                onChange={handleChange}
                placeholder="https://... or upload above"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Color Theme Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5 shadow-xl">
          <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--color-accent)]" /> Clan Accent Color
          </h2>
          <p className="text-xs text-[var(--color-muted)]">
            Changes the accent glow, buttons, badges, and highlights across the entire website in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {colorPresets.map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => handleColorPreset(p.color)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  form.accent_color.toLowerCase() === p.color.toLowerCase()
                    ? 'border-white bg-white/10 text-white'
                    : 'border-white/10 text-[var(--color-muted)] hover:text-white'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shadow"
                  style={{ backgroundColor: p.color }}
                />
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <input
              type="color"
              name="accent_color"
              value={form.accent_color}
              onChange={handleChange}
              className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-0"
            />
            <span className="text-xs font-mono font-bold text-white uppercase">
              {form.accent_color}
            </span>
          </div>
        </div>

        {/* Social Media Links Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-5 shadow-xl">
          <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[var(--color-accent)]" /> Official Social Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                TikTok Handle / URL
              </label>
              <input
                type="text"
                name="tiktok_url"
                value={form.tiktok_url}
                onChange={handleChange}
                placeholder="https://www.tiktok.com/@cpm..idle.country"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                Facebook Page URL
              </label>
              <input
                type="text"
                name="facebook_url"
                value={form.facebook_url}
                onChange={handleChange}
                placeholder="https://www.facebook.com/profile.php?id=61573345143647"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                Discord Invite Link
              </label>
              <input
                type="text"
                name="discord_url"
                value={form.discord_url}
                onChange={handleChange}
                placeholder="https://discord.gg/..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                YouTube Channel URL
              </label>
              <input
                type="text"
                name="youtube_url"
                value={form.youtube_url}
                onChange={handleChange}
                placeholder="https://youtube.com/@..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--color-border)] text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[var(--color-accent-glow)] hover:bg-[var(--color-accent-light)] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Applying Changes...' : 'Save Site Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
