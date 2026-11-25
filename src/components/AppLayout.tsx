import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  History,
  Home,
  LogOut,
  Menu,
  Music2,
  Pause,
  Play,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AmbientBackdrop } from './AmbientBackdrop';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/session', label: 'AI Therapist', icon: Sparkles },
  { to: '/report', label: 'My Wellness', icon: Activity },
  { to: '/schedule', label: 'Therapy Schedule', icon: CalendarDays },
  { to: '/music', label: 'Music & Relaxation', icon: Music2 },
  { to: '/history', label: 'Session History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logoutUser, currentTrack, isMusicPlaying, togglePlayPause } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-[#040712] text-slate-100 flex flex-col lg:flex-row">
      <AmbientBackdrop intensity="calm" />

      {/* Desktop Left Navigation Rail */}
      <aside className="relative z-20 hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-white/10 bg-[#060a18]/75 backdrop-blur-2xl px-4 py-6">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 px-2 cursor-pointer"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 shadow-[0_0_24px_rgba(56,189,248,0.4)]">
            <span className="h-3 w-3 rounded-full bg-white/90 animate-pulse" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-wider text-white">SOVIA</span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
              AI Sanctuary
            </p>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/25 to-cyan-500/15 text-white border border-cyan-400/30 shadow-[0_0_20px_rgba(56,189,248,0.12)]'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100 border border-transparent'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Mini active music status */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-cyan-300">
                {isMusicPlaying ? 'Now Playing' : 'Soundscape'}
              </p>
              <p className="truncate text-xs font-medium text-white">{currentTrack.title}</p>
            </div>
            <button
              type="button"
              onClick={togglePlayPause}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-cyan-300 hover:bg-cyan-400/20 transition cursor-pointer"
              aria-label={isMusicPlaying ? 'Pause soundscape' : 'Play soundscape'}
            >
              {isMusicPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* User Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-4 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/25 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
              {user?.avatarInitials ?? 'SV'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">
                {user?.name ?? 'Guest Explorer'}
              </p>
              <p className="truncate text-[10px] text-slate-400">Demo Space</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/10 bg-[#060a18]/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
          </div>
          <span className="text-sm font-semibold tracking-wider text-white">SOVIA</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlayPause}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-300"
            aria-label="Toggle music"
          >
            {isMusicPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-xl pt-16 px-5 pb-6 lg:hidden overflow-y-auto">
          <nav className="space-y-2 mt-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-500/20 text-white border border-cyan-400/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-slate-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </main>
    </div>
  );
};

