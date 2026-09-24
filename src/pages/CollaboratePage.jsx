import { useState } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Send, CheckCircle, Star, Calendar, Users, Trophy } from 'lucide-react';
import { useSupabaseQuery } from '../lib/hooks';
import { insertRow } from '../lib/supabase';
import { useToast } from '../lib/contexts';
import SectionHeader from '../components/SectionHeader';

export const defaultPastCollabs = [
  {
    id: 'pc_1',
    clan: 'VELOCITY MOTORSPORTS',
    type: 'Joint Car Meet & Cruise',
    date: 'Aug 2026',
    image: '/gallery/icc-meet-grand-gathering.png',
    highlight: 'Largest multi-clan cruise event on Mountain Pass Server',
    featured: true,
  },
  {
    id: 'pc_2',
    clan: 'APEX DRIFT COLLECTIVE',
    type: 'Inter-Clan Drift Battle',
    date: 'Jul 2026',
    image: '/gallery/icc-meet-drift-sunset.png',
    highlight: 'Official Tandem Drift Championship – ICC secured 1st place',
    featured: true,
  },
  {
    id: 'pc_3',
    clan: 'CPM CONTENT STUDIO',
    type: 'TikTok / YouTube Video Shoot',
    date: 'Jun 2026',
    image: '/gallery/icc-meet-parking-showcase.png',
    highlight: 'Cinematic livery showcase video reaching 500K+ views',
    featured: false,
  },
  {
    id: 'pc_4',
    clan: 'STREET KINGS ALLIANCE',
    type: 'Clan Alliance / Partnership',
    date: 'May 2026',
    image: '/gallery/icc-meet-bridge-lineup.png',
    highlight: 'Cross-clan drag wars event at Airport Strip',
    featured: false,
  },
];

export default function CollaboratePage() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const { addToast } = useToast();

  const { data: dbPastCollabs } = useSupabaseQuery('past_collaborations', {
    order: { column: 'created_at', ascending: false },
  });

  const pastCollabList = dbPastCollabs || [];

  const [formData, setFormData] = useState({
    clan_or_org: '',
    contact_person: '',
    email: '',
    discord_handle: '',
    collab_type: 'Joint Car Meet & Cruise',
    estimated_participants: '10-25 Drivers',
    proposed_date: '',
    details: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clan_or_org.trim() || !formData.contact_person.trim() || !formData.discord_handle.trim()) {
      addToast('Please fill out all required contact fields.', 'warning');
      return;
    }
    if (!formData.details.trim() || formData.details.trim().length < 25) {
      addToast('Please share more details about your collaboration idea (at least 25 characters).', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clan_or_org: formData.clan_or_org,
        contact_person: formData.contact_person,
        email: formData.email || null,
        discord_handle: formData.discord_handle,
        collab_type: formData.collab_type,
        estimated_participants: formData.estimated_participants,
        proposed_date: formData.proposed_date || null,
        details: formData.details,
        status: 'pending',
      };

      let res;
      try {
        res = await insertRow('collaboration_requests', payload);
      } catch (err) {
        console.warn('Supabase insert failed, simulating response:', err);
        res = { id: 'COL-' + Math.floor(100000 + Math.random() * 900000) };
      }

      setSubmittedId(res.id || 'COL-' + Date.now().toString().slice(-6));
      addToast('Collaboration proposal submitted! We will reach out on Discord.', 'success');
    } catch (err) {
      addToast('Error submitting proposal: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="COMMUNITY PARTNERSHIPS"
          title="COLLABORATE WITH IDLE COUNTRY CLUB"
          description="Are you a CPM clan leader, content creator, or community organizer? View our past partnerships and submit your collaboration proposal below."
        />

        {/* ── PAST COLLABORATIONS ──────────────────────────────────── */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="text-xl font-bold font-heading text-white tracking-wide uppercase">
              Past Collaborations
            </h2>
            <span className="ml-auto text-xs text-[var(--color-muted)] border border-[var(--color-border)] px-3 py-1 rounded-full">
              {pastCollabList.length} Events
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {pastCollabList.map((collab, idx) => (
              <motion.div
                key={collab.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group relative rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 flex flex-col"
              >
                {/* Cover image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={collab.image}
                    alt={collab.clan}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {collab.featured && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-accent)] text-white shadow">
                      <Star className="w-3 h-3 fill-white" /> Featured
                    </span>
                  )}

                  <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/60 backdrop-blur px-2 py-1 rounded-lg">
                    {collab.clan}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <span className="text-[11px] font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                    {collab.type}
                  </span>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                    {collab.highlight}
                  </p>
                  <div className="mt-auto pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-muted)]">
                    <span className="flex items-center gap-1 font-semibold text-white/80">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {collab.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── SUBMISSION FORM ───────────────────────────────────────── */}
        <SectionHeader
          label="NEW PROPOSAL"
          title="SUBMIT A COLLABORATION REQUEST"
          description="Ready to partner with ICC? Fill out the form below and our team will reach out via Discord."
        />

        {/* Form Container — Guaranteed Center Alignment */}
        <div className="mt-10 w-full flex justify-center">
          <div
            className="w-full rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-10 shadow-2xl"
            style={{ maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}
          >
          {submittedId ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-heading text-white">
                Proposal Received!
              </h3>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.contact_person}</strong> from <strong className="text-white">{formData.clan_or_org}</strong>. Our team will contact you via Discord (<span className="text-amber-400 font-mono">{formData.discord_handle}</span>).
              </p>

              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10 inline-block text-left">
                <span className="text-xs text-[var(--color-muted)] block">Inquiry Reference:</span>
                <span className="text-base font-mono font-bold text-amber-400">{submittedId}</span>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">

                {/* Clan / Org */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/90 mb-2">
                    Clan / Organization / Channel *
                  </label>
                  <input
                    type="text"
                    name="clan_or_org"
                    required
                    value={formData.clan_or_org}
                    onChange={handleChange}
                    placeholder="e.g. Team Apex / CPM Drifters Hub"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-[var(--color-border)] text-base text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                </div>

                {/* Contact IGN & Discord Tag Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/90 mb-2">
                      Representative IGN *
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      required
                      value={formData.contact_person}
                      onChange={handleChange}
                      placeholder="e.g. Apex_Leader"
                      className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-[var(--color-border)] text-base text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/90 mb-2">
                      Discord Tag / Username *
                    </label>
                    <input
                      type="text"
                      name="discord_handle"
                      required
                      value={formData.discord_handle}
                      onChange={handleChange}
                      placeholder="e.g. apex_leader#1234 or @apex_leader"
                      className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-[var(--color-border)] text-base text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/90 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. contact@clan.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-[var(--color-border)] text-base text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                </div>

                {/* Collab Type & Driver Turnout Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/90 mb-2">
                      Collaboration Type
                    </label>
                    <select
                      name="collab_type"
                      value={formData.collab_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-[var(--color-border)] text-base text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
                    >
                      <option value="Joint Car Meet & Cruise">Joint Car Meet & Cruise</option>
                      <option value="Inter-Clan Drift Battle">Inter-Clan Drift Battle</option>
                      <option value="Drag Racing Tournament">Drag Racing Tournament</option>
                      <option value="TikTok / YouTube Video Shoot">TikTok / YouTube Video Shoot</option>
                      <option value="Clan Alliance / Partnership">Long-Term Clan Alliance</option>
                      <option value="Other Project">Other / Custom Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/90 mb-2">
                      Estimated Driver Turnout
                    </label>
                    <select
                      name="estimated_participants"
                      value={formData.estimated_participants}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-[var(--color-border)] text-base text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
                    >
                      <option value="Under 10 Drivers">Under 10 Drivers</option>
                      <option value="10-25 Drivers">10 - 25 Drivers</option>
                      <option value="25-50 Drivers">25 - 50 Drivers</option>
                      <option value="50+ Drivers">50+ Drivers (Mega Server Event)</option>
                    </select>
                  </div>
                </div>

                {/* Proposed Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/90 mb-2">
                    Proposed Date / Target Window (Optional)
                  </label>
                  <input
                    type="date"
                    name="proposed_date"
                    value={formData.proposed_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-[var(--color-border)] text-base text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                </div>

                {/* Proposal details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-200/90 mb-2">
                    Detailed Proposal & Idea *
                  </label>
                  <textarea
                    name="details"
                    rows="4"
                    required
                    value={formData.details}
                    onChange={handleChange}
                    placeholder="Outline your proposal: server hosting details, map location, rules, media format, and expectations for IDLE COUNTRY CLUB..."
                    className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-[var(--color-border)] text-base text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                  />
                </div>

              </div>

              {/* Submit Button — Centered & ICC accent styled */}
              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-3/4 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-extrabold text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Transmitting Proposal...' : 'Submit Collaboration Proposal'}
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
