import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Captions,
  CaptionsOff,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AiOrb3D } from '../components/AiOrb3D';
import { AmbientBackdrop } from '../components/AmbientBackdrop';
import { VoiceWaveform } from '../components/VoiceWaveform';
import { useApp } from '../context/AppContext';
import { useSoviaVoice } from '../hooks/useSoviaVoice';
import type { OrbState } from '../types';

const WELCOME_LINES = [
  "Hey, I'm glad you're here. Welcome to your safe space.",
  "Sometimes life gets overwhelming, and you don't have to figure everything out on your own.",
  "I'm here to listen, understand how you're feeling, and help you find a little more balance.",
  "You deserve to feel better. And we're going to take this one step at a time.",
];

const WELCOME_SPEECH = WELCOME_LINES.join(' ');
const SPEED_OPTIONS = [0.9, 1.0, 1.1];

export const WelcomePage: React.FC = () => {
  const { user, settings, updateSettings, markWelcomeSeen } = useApp();
  const navigate = useNavigate();

  const [visibleLines, setVisibleLines] = useState(1);
  const startedRef = useRef(false);

  const {
    isSpeaking,
    isMuted,
    audioLevel,
    frequencyBands,
    needsAudioUnlock,
    speak,
    stopSpeaking,
    replayLast,
    toggleMute,
  } = useSoviaVoice({
    onSentenceStart: (idx) => {
      setVisibleLines((prev) => Math.max(prev, Math.min(WELCOME_LINES.length, idx + 1)));
    },
  });

  // Trigger audible welcome speech on mount (StrictMode-safe)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    speak(WELCOME_SPEECH);
    return () => {
      startedRef.current = false;
      stopSpeaking();
    };
  }, [speak, stopSpeaking]);

  // If muted or browser blocked autoplay before gesture, reveal lines smoothly
  useEffect(() => {
    if (!isMuted && !needsAudioUnlock) return;
    const timers: number[] = [];
    WELCOME_LINES.forEach((_, idx) => {
      if (idx === 0) return;
      timers.push(
        window.setTimeout(() => {
          setVisibleLines((prev) => Math.max(prev, idx + 1));
        }, idx * 1800)
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [isMuted, needsAudioUnlock]);

  const orbState: OrbState = isMuted
    ? 'muted'
    : isSpeaking
      ? 'speaking'
      : 'idle';

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(Number(settings.voiceSpeed.toFixed(1)));
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    updateSettings({ voiceSpeed: next });
  };

  const handleStartSession = () => {
    stopSpeaking();
    markWelcomeSeen();
    navigate('/assessment');
  };

  const handleSkipToDashboard = () => {
    stopSpeaking();
    markWelcomeSeen();
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-8 overflow-hidden">
      <AmbientBackdrop intensity="cinematic" />

      {/* Top Controls */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isMuted
                ? 'bg-rose-400'
                : isSpeaking
                  ? 'bg-cyan-400 animate-pulse shadow-[0_0_12px_#38bdf8]'
                  : 'bg-indigo-400'
            }`}
          />
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
            SOVIA · {isMuted ? 'Muted' : isSpeaking ? 'Speaking' : 'Ready'}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-400/20 transition cursor-pointer"
              title="Stop speaking"
            >
              <Square className="h-3 w-3 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setVisibleLines(1);
              replayLast();
            }}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
            title="Replay welcome"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          <button
            type="button"
            onClick={cycleSpeed}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
            title="Voice speed"
          >
            {settings.voiceSpeed.toFixed(1)}x
          </button>

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
              {settings.showTranscript ? 'Subtitles On' : 'Subtitles Off'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition cursor-pointer ${
              isMuted
                ? 'border-rose-400/35 bg-rose-500/15 text-rose-200'
                : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-400/40'
            }`}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-300" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-cyan-300" />
            )}
            <span className="hidden sm:inline">{isMuted ? 'Voice Muted' : 'Voice On'}</span>
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

        <AiOrb3D state={orbState} audioLevel={audioLevel} size="hero" />

        <div className="mt-1">
          <VoiceWaveform
            state={orbState}
            audioLevel={audioLevel}
            frequencyBands={frequencyBands}
            bars={28}
          />
        </div>

        {needsAudioUnlock && (
          <button
            type="button"
            onClick={() => {
              setVisibleLines(1);
              speak(WELCOME_SPEECH, { force: true });
            }}
            className="mt-3 flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-4 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-400/25 transition cursor-pointer"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Tap to hear Sovia speak</span>
          </button>
        )}

        {/* Progressive Spoken Subtitles */}
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
                  transition={{ duration: 0.55 }}
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
          transition={{ delay: 0.6 }}
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
        Live browser voice synthesis · Take your time—everything moves at your pace.
      </footer>
    </div>
  );
};
