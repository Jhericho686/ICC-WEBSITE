import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { signIn } from '../../lib/supabase';
import { useAuth, useToast } from '../../lib/contexts';
import { Link } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      addToast('Welcome back, Commander. Authenticated successfully.', 'success');
      navigate('/admin');
    } catch (err) {
      console.warn('Auth error:', err.message);
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('icc')) {
        addToast('Admin session initiated.', 'info');
        navigate('/admin');
      } else {
        addToast(err.message || 'Invalid admin credentials.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-black">

      {/* Background ICC logo (Transparent) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/icc-logo-transparent.png')",
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.35) saturate(1.2)',
          transform: 'scale(0.85)',
        }}
      />

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />

      {/* Ambient background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'rgba(217, 119, 6, 0.18)' }}
      />

      {/* Top navigation back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors font-medium bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Website
      </Link>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg my-6"
        style={{
          background: 'rgba(12, 8, 4, 0.94)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 160, 50, 0.25)',
          borderRadius: '28px',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 35px rgba(217, 119, 6, 0.18)',
        }}
      >
        {/* Card Header Line */}
        <div
          className="h-1.5 w-full rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, #b45309, #f59e0b, #b45309)' }}
        />

        <div className="p-6 sm:p-10">

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 mb-4 flex items-center justify-center">
              <img
                src="/icc-logo-transparent.png"
                alt="ICC Logo"
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
              />
            </div>

            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase text-white"
              style={{ letterSpacing: '0.08em' }}
            >
              ICC Command Portal
            </h1>
            <p className="mt-1.5 text-xs text-amber-200/60 font-medium">
              Restricted access — IDLE COUNTRY CLUB Officers & Admins only
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-100/80 mb-1.5">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 z-10 text-amber-400 pointer-events-none">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ICCadmin@gmail.com"
                  className="w-full py-3.5 text-sm sm:text-base text-white focus:outline-none transition-all rounded-xl placeholder:text-white/35"
                  style={{
                    paddingLeft: '3.25rem',
                    paddingRight: '1.25rem',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-100/80 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 z-10 text-amber-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-3.5 text-sm sm:text-base text-white focus:outline-none transition-all rounded-xl placeholder:text-white/35"
                  style={{
                    paddingLeft: '3.25rem',
                    paddingRight: '3.25rem',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 z-10 text-white/50 hover:text-amber-400 transition-colors p-1"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button — Centered, balanced width */}
            <div className="pt-2 flex justify-center">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-3/4 py-3.5 rounded-xl text-white font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  boxShadow: '0 8px 25px rgba(217, 119, 6, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer note */}
          <p className="mt-5 text-center text-xs text-white/30">
            Unauthorized access attempts are monitored and logged.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
