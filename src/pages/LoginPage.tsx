import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles, User } from 'lucide-react';
import { AiOrb3D } from '../components/AiOrb3D';
import { AmbientBackdrop } from '../components/AmbientBackdrop';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { loginUser } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('Ariana Vance');
  const [email, setEmail] = useState('ariana@sovia.space');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeLogin = (displayName: string, userEmail: string) => {
    const cleanName = displayName.trim() || 'Explorer';
    const initials = cleanName
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .join('');

    loginUser({
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: userEmail.trim() || 'guest@sovia.space',
      avatarInitials: initials || 'SV',
      joinedAt: new Date().toISOString(),
    });
    navigate('/welcome');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password to continue.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name so SOVIA knows how to greet you.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    window.setTimeout(() => {
      const derivedName =
        mode === 'signup' ? name : email.split('@')[0]?.replace(/[._-]/g, ' ') || 'Friend';
      const formattedName = derivedName.replace(/\b\w/g, (c) => c.toUpperCase());
      completeLogin(mode === 'signup' ? name : formattedName, email);
    }, 450);
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    window.setTimeout(() => {
      completeLogin('Maya Lin', 'maya.lin@gmail.com');
    }, 400);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <AmbientBackdrop intensity="cinematic" />

      <div className="relative z-10 w-full max-w-5xl grid gap-8 lg:grid-cols-12 items-center">
        {/* Left Presence Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1 text-xs font-medium text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Personal AI Therapist & Wellness Sanctuary</span>
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.12]">
            A calmer space to{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              be heard
            </span>
            .
          </h1>
          <p className="mt-4 max-w-md text-sm sm:text-base text-slate-300/90 leading-relaxed">
            Meet <strong className="font-semibold text-white">SOVIA</strong> — an emotionally
            attentive virtual companion designed to listen naturally, reflect gently, and shape a
            wellness rhythm around your life.
          </p>

          <div className="mt-6 flex justify-center lg:justify-start w-full">
            <AiOrb3D state={isSubmitting ? 'thinking' : 'idle'} size="lg" />
          </div>
        </motion.div>

        {/* Right Glass Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-6"
        >
          <div className="glass-panel glow-border rounded-[28px] p-6 sm:p-9">
            {/* Mode Switcher */}
            <div className="flex rounded-2xl bg-slate-950/60 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-indigo-500/30 to-cyan-500/25 text-white border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-indigo-500/30 to-cyan-500/25 text-white border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white">
                {mode === 'signin' ? 'Welcome back' : 'Create your safe space'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Frontend interactive prototype · Local demo session
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="How should SOVIA address you?"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.28)] hover:brightness-110 transition cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isSubmitting
                    ? 'Preparing your space...'
                    : mode === 'signin'
                      ? 'Enter Sanctuary'
                      : 'Create My Safe Space'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-widest text-slate-500">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] py-3 text-sm font-medium text-slate-100 hover:border-cyan-400/35 hover:bg-white/[0.08] transition cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12s4.2 9.4 9.4 9.4c5.4 0 9-3.8 9-9.1 0-.6-.1-1.1-.2-1.6H12z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="mt-5 text-center text-[11px] text-slate-500">
              Your reflections stay private in this local demo. Real authentication & cloud AI
              services connect in future phases.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

