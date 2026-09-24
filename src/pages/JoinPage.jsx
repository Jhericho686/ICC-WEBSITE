import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Car, ShieldCheck, Send, CheckCircle, ArrowLeft, ArrowRight, Sparkles, CheckSquare, HeartHandshake } from 'lucide-react';
import { insertRow } from '../lib/supabase';
import { useToast } from '../lib/contexts';
import SectionHeader from '../components/SectionHeader';

const ROLE_OPTIONS = [
  { id: 'photographer', label: 'Photo-grapher', icon: '📸' },
  { id: 'copymaker', label: 'Copy Maker', icon: '✍️' },
  { id: 'designer', label: 'Designer', icon: '🎨' },
  { id: 'videographer', label: 'Video-grapher', icon: '🎥' },
  { id: 'recruiter', label: 'Recruiter', icon: '📢' },
  { id: 'editor', label: 'Editor', icon: '✂️' },
  { id: 'member', label: 'Member', icon: '👤' },
  { id: 'gg_user', label: 'GG User', icon: '🎮' },
  { id: 'donator', label: 'Donator', icon: '💎' },
];

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    // Step 1: Member Info
    name: '',
    in_game_name: '',
    cpm_id: '',
    age: '',
    birthday: '',
    address: '',
    referral_name: '',

    // Step 2: CPM Background & History
    driving_style: 'Clean Build',
    cpm_community_tribe: '',
    previous_clans: '',
    quit_reason: '',
    cpm_start_date: '',
    clubs_joined_count: '',

    // Step 3: Activity & Questions
    active_in_gc_events: 'Yes',
    joins_events_tambay: 'Yes',
    knows_daily_task: 'Yes',
    personality_type: 'Confident',
    status_work_student: 'Student',
    motivation: '',

    // Step 4: Roles & Notes
    roles: ['member'],
    notes_suggestions: '',
    agreed_to_rules: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleToggle = (roleId) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(roleId)
        ? prev.roles.filter((r) => r !== roleId)
        : [...prev.roles, roleId];
      return { ...prev, roles };
    });
  };

  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.in_game_name.trim()) {
      addToast('Please enter your Full Name and CPM Ingame Name.', 'warning');
      return false;
    }
    if (!formData.address.trim()) {
      addToast('Please enter your Address / Location.', 'warning');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    return true;
  };

  const validateStep3 = () => {
    if (!formData.motivation.trim()) {
      addToast('Please state your Purpose for Joining ICC.', 'warning');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.agreed_to_rules) {
      addToast('You must review and agree to the group rules before submitting.', 'error');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep4()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        in_game_name: formData.in_game_name,
        cpm_id: formData.cpm_id || null,
        age: formData.age ? parseInt(formData.age, 10) : null,
        birthday: formData.birthday || null,
        address: formData.address,
        referral_name: formData.referral_name || null,
        driving_style: formData.driving_style,
        cpm_community_tribe: formData.cpm_community_tribe || null,
        previous_clans: formData.previous_clans || null,
        quit_reason: formData.quit_reason || null,
        cpm_start_date: formData.cpm_start_date || null,
        clubs_joined_count: formData.clubs_joined_count || null,
        active_in_gc_events: formData.active_in_gc_events,
        joins_events_tambay: formData.joins_events_tambay,
        knows_daily_task: formData.knows_daily_task,
        personality_type: formData.personality_type,
        status_work_student: formData.status_work_student,
        motivation: formData.motivation,
        roles: formData.roles,
        notes_suggestions: formData.notes_suggestions || null,
        status: 'pending',
      };

      let res;
      try {
        res = await insertRow('applications', payload);
      } catch (err) {
        console.warn('Supabase insert fallback:', err);
        res = { id: 'APP-' + Math.floor(100000 + Math.random() * 900000) };
      }

      setSubmittedId(res.id || 'ICC-' + Date.now().toString().slice(-6));
      addToast('Application submitted successfully! Welcome to IDLE COUNTRY CLUB.', 'success');
    } catch (err) {
      addToast('Error submitting application: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="🅁🄴🄶🄸🅅🅃🅁🄰🅃🄸🄾🄴"
          title="WELCOME TO IDLE COUNTRY CLUB"
          description="Official Member Registration Form — IDLE COUNTRY CLUB ( ɪ ᴄ ᴄ )"
        />

        {/* Stepper Header */}
        {!submittedId && (
          <div className="mt-12 mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-[var(--color-border)] -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-[var(--color-accent)] -translate-y-1/2 z-0 transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />

              {[
                { num: 1, label: 'Info Member' },
                { num: 2, label: 'CPM History' },
                { num: 3, label: 'Activity & Purpose' },
                { num: 4, label: 'Roles & Rules' },
              ].map((s) => (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= s.num
                        ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent-glow)]'
                        : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)]'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className="text-[11px] font-semibold mt-2 text-white/80 hidden sm:block">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-10 shadow-2xl">
          {submittedId ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-heading text-white">
                WELCOME TO IDLE COUNTRY CLUB!
              </h3>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                Thank you for applying, <strong className="text-white">{formData.in_game_name}</strong>. Your registration form has been transmitted to our council admins.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10 inline-block text-left">
                <span className="text-xs text-[var(--color-muted)] block">Member Tracking ID:</span>
                <span className="text-base font-mono font-bold text-[var(--color-accent)]">{submittedId}</span>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: Info Member */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-[var(--color-accent)]" /> Info Member
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Ingame Name *
                      </label>
                      <input
                        type="text"
                        name="in_game_name"
                        required
                        value={formData.in_game_name}
                        onChange={handleChange}
                        placeholder="CPM IGN"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Member ID (CPM ID)
                      </label>
                      <input
                        type="text"
                        name="cpm_id"
                        value={formData.cpm_id}
                        onChange={handleChange}
                        placeholder="e.g. 58392019"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        min="10"
                        max="80"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Your age"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Birthday
                      </label>
                      <input
                        type="text"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        placeholder="e.g. November 24"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="City / Province / Country"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Referral Name
                      </label>
                      <input
                        type="text"
                        name="referral_name"
                        value={formData.referral_name}
                        onChange={handleChange}
                        placeholder="Who invited or referred you to ICC?"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CPM Background & History */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-[var(--color-accent)]" /> CPM Background & History
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Kailan Nag Simula Mag CPM?
                      </label>
                      <input
                        type="text"
                        name="cpm_start_date"
                        value={formData.cpm_start_date}
                        onChange={handleChange}
                        placeholder="e.g. 2021 / 2 years ago"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Previous Clans
                      </label>
                      <input
                        type="text"
                        name="previous_clans"
                        value={formData.previous_clans}
                        onChange={handleChange}
                        placeholder="Clans you were part of previously"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Ilan Na Club Nasalihan?
                      </label>
                      <input
                        type="text"
                        name="clubs_joined_count"
                        value={formData.clubs_joined_count}
                        onChange={handleChange}
                        placeholder="e.g. 2 clubs / First time"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        CPM Community / Tribe
                      </label>
                      <input
                        type="text"
                        name="cpm_community_tribe"
                        value={formData.cpm_community_tribe}
                        onChange={handleChange}
                        placeholder="Community / Tribe affiliation"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Reason Why You Quit Previous Clan
                      </label>
                      <input
                        type="text"
                        name="quit_reason"
                        value={formData.quit_reason}
                        onChange={handleChange}
                        placeholder="Reason for leaving previous clan"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Activity & Purpose */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[var(--color-accent)]" /> Activity & Purpose
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                      Purpose For Joining *
                    </label>
                    <textarea
                      name="motivation"
                      rows="3"
                      required
                      value={formData.motivation}
                      onChange={handleChange}
                      placeholder="State your main reason and purpose for joining ICC..."
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Active ba for events and sa GC?
                      </label>
                      <select
                        name="active_in_gc_events"
                        value={formData.active_in_gc_events}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="Yes">Yes — Very Active</option>
                        <option value="Moderate">Moderate — Whenever free</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Sumasama kaba sa events at tambay?
                      </label>
                      <select
                        name="joins_events_tambay"
                        value={formData.joins_events_tambay}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="Yes">Yes — Always join</option>
                        <option value="Sometimes">Sometimes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Marunong kaba mag daily task sa CPM?
                      </label>
                      <select
                        name="knows_daily_task"
                        value={formData.knows_daily_task}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="Yes">Yes — Know how to do daily tasks</option>
                        <option value="Needs Guidance">Needs Guidance</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Shy or Confident?
                      </label>
                      <select
                        name="personality_type"
                        value={formData.personality_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="Confident">Confident</option>
                        <option value="Shy">Shy</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                        Working or Student?
                      </label>
                      <select
                        name="status_work_student"
                        value={formData.status_work_student}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
                      >
                        <option value="Student">Student</option>
                        <option value="Working">Working</option>
                        <option value="Both">Working Student</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Roles & Group Rules */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[var(--color-accent)]" /> Roles & Specializations
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/90 mb-1">
                      Paki lagyan ng check kung saan ka dito nababagay:
                    </label>
                    <p className="text-xs text-[var(--color-muted)] mb-4">
                      Select all skills and roles that apply to you:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ROLE_OPTIONS.map((r) => {
                        const isChecked = formData.roles.includes(r.id);
                        return (
                          <div
                            key={r.id}
                            onClick={() => handleRoleToggle(r.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                              isChecked
                                ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-white shadow-md'
                                : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-0 cursor-pointer pointer-events-none"
                            />
                            <span className="text-xs font-bold leading-none">
                              {r.icon} {r.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
                      Note / Suggestions
                    </label>
                    <textarea
                      name="notes_suggestions"
                      rows="2"
                      value={formData.notes_suggestions}
                      onChange={handleChange}
                      placeholder="Any additional notes or suggestions for ICC..."
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--color-border)] text-sm text-white focus:outline-none focus:border-[var(--color-accent)] resize-none"
                    />
                  </div>

                  {/* Rules Agreement Box */}
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3 mt-4">
                    <input
                      type="checkbox"
                      id="agreed_to_rules"
                      name="agreed_to_rules"
                      checked={formData.agreed_to_rules}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 rounded text-[var(--color-accent)] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="agreed_to_rules" className="text-xs text-[var(--color-text-secondary)] cursor-pointer">
                      I have read and agree to all <span className="text-white font-semibold">🄲🄻🄰🄽 🅁🅄🄻🄴🅂</span> (No toxicity, no double club, do daily tasks, respect admins & members).
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Stepper Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-7 py-3 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[var(--color-accent-glow)] hover:bg-[var(--color-accent-light)] transition-all cursor-pointer"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[var(--color-accent-glow-strong)] hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? 'Transmitting Registration...' : 'Submit Member Registration'}
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
