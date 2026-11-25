import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Captions,
  CaptionsOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AiOrb3D } from '../components/AiOrb3D';
import { AmbientBackdrop } from '../components/AmbientBackdrop';
import { VoiceWaveform } from '../components/VoiceWaveform';
import { useApp } from '../context/AppContext';
import { MUSIC_LIBRARY } from '../data/musicLibrary';
import { ambientAudio } from '../engine/ambientAudio';
import type { OrbState } from '../types';

const WELCOME_LINES = [
  "Hey, I'm glad you're here. Welcome to your safe space.",
  "Sometimes life gets overwhelming, and you don't have to figure everything out on your own.",
  "I'm here to listen, understand how you're feeling, and help you find a little more balance.",
  "You deserve to feel better. And we're going to take this one step at a time.",
];

export const WelcomePage: React.FC = () => {
  const { user, settings, updateSettings, markWelcomeSeen } = useApp();
  const navigate = useNavigate();

  const [visibleLines, setVisibleLines] = useState(1);
  const [orbState, setOrbState] = useState<OrbState>('speaking');

  useEffect(() => {
    const timers: number[] = [];
    WELCOME_LINES.forEach((_, idx) => {
      if (idx === 0) return;
      const t = window.setTimeout(() => {
        setVisibleLines(idx + 1);
      }, idx * 2300);
      timers.push(t);
    });

    const settleTimer = window.setTimeout(() => {
      setOrbState('listening');
    }, WELCOME_LINES.length * 2300 + 600);
    timers.push(settleTimer);

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    updateSettings({ soundEnabled: next });
    if (next) {
      ambientAudio.startTrack(MUSIC_LIBRARY[0], 0.35);
    } else {
      ambientAudio.pause();
    }
  };

  const handleStartSession = () => {
    markWelcomeSeen();
    navigate('/assessment');
  };

  const handleSkipToDashboard = () => {
    markWelcomeSeen();
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-8 overflow-hidden">
      <AmbientBackdrop intensity="cinematic" />

      {/* Top Controls */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_#38bdf8]" />
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
            SOVIA · {orbState === 'speaking' ? 'Speaking' : 'Listening'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateSettings({ showTranscript: !settings.showTranscript })}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
          >
            {settings.showTranscript ? (
              <Captions className="h-3.5 w-3.5 text-cyan-300" />
            ) : (
              <CaptionsOff className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {settings.showTranscript ? 'Transcript On' : 'Transcript Off'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-cyan-300" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {settings.soundEnabled ? 'Sound On' : 'Muted'}
            </span>
          </button>
        </div>
      </header>

      {/* Center Presence & Progressive Speech */}
      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center my-auto py-6">
        {user?.name && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.25em] text-indigo-300/80 mb-2"
          >
            Sanctuary ready for {user.name}
          </motion.p>
        )}

        <AiOrb3D state={orbState} size="hero" />

        <div className="mt-1">
          <VoiceWaveform state={orbState} bars={28} />
        </div>

        {/* Progressive Spoken Transcript */}
        <AnimatePresence>
          {settings.showTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 w-full max-w-2xl space-y-3.5 glass-panel-soft rounded-3xl p-6 sm:p-8"
            >
              {WELCOME_LINES.slice(0, visibleLines).map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className={`text-base sm:text-lg leading-relaxed ${
                    index === visibleLines - 1 ? 'text-white font-medium' : 'text-slate-300/90'
                  }`}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleStartSession}
            className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-8 py-4 text-sm sm:text-base font-semibold text-slate-950 shadow-[0_0_40px_rgba(56,189,248,0.35)] hover:brightness-110 transition cursor-pointer"
          >
            <span>Start my session</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>

          <button
            type="button"
            onClick={handleSkipToDashboard}
            className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-medium text-slate-300 hover:border-white/25 hover:text-white transition cursor-pointer"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </main>

      <footer className="relative z-10 text-center text-[11px] text-slate-500">
        Simulated voice presence · Take your time—everything moves at your pace.
      </footer>
    </div>
  );
};

