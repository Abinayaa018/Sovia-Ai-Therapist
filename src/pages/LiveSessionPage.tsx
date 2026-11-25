import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Captions,
  CaptionsOff,
  CheckCircle2,
  Feather,
  Leaf,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Sparkles,
  Wind,
} from 'lucide-react';
import { AiOrb3D } from '../components/AiOrb3D';
import { VoiceWaveform } from '../components/VoiceWaveform';
import { WellnessExerciseModal } from '../components/WellnessExerciseModal';
import { useApp } from '../context/AppContext';
import {
  LIVE_THERAPY_QUICK_PROMPTS,
  generateDemoTherapistReply,
} from '../data/demoTherapy';
import type { ConversationTurn, OrbState, TherapyActivityType } from '../types';

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const LiveSessionPage: React.FC = () => {
  const {
    user,
    wellnessReport,
    settings,
    updateSettings,
    addSessionToHistory,
  } = useApp();
  const navigate = useNavigate();

  const [orbState, setOrbState] = useState<OrbState>('speaking');
  const [micMuted, setMicMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [inputText, setInputText] = useState('');
  const [activeExercise, setActiveExercise] = useState<TherapyActivityType | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  const [turns, setTurns] = useState<ConversationTurn[]>([
    {
      id: 't-1',
      sender: 'ai',
      text: `Hey ${user?.name?.split(' ')[0] ?? 'there'}, I'm glad you made space for this moment. Looking at your ${wellnessReport.primaryTheme.toLowerCase()}, how is your mind feeling right now?`,
      timestamp: 'Just now',
      emotionLabel: 'Warm & Attentive',
    },
  ]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const settle = window.setTimeout(() => setOrbState('idle'), 2000);
    return () => window.clearTimeout(settle);
  }, []);

  useEffect(() => {
    if (sessionEnded) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sessionEnded]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  const sendUtterance = (text: string) => {
    const clean = text.trim();
    if (!clean || sessionEnded) return;

    const userTurn: ConversationTurn = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: formatTimer(elapsedSeconds),
    };

    setTurns((prev) => [...prev, userTurn]);
    setInputText('');
    setOrbState('thinking');

    const { reply, detectedTone } = generateDemoTherapistReply(clean, turns.length);

    window.setTimeout(() => {
      setOrbState('speaking');
      setTurns((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: formatTimer(elapsedSeconds + 1),
          emotionLabel: detectedTone,
        },
      ]);

      window.setTimeout(() => {
        setOrbState(micMuted ? 'idle' : 'listening');
      }, 2400);
    }, 950);
  };

  const handleVoiceSimulate = () => {
    if (micMuted) {
      setMicMuted(false);
      setOrbState('listening');
      return;
    }
    setOrbState('listening');
    if (!inputText.trim()) {
      setInputText("I've had a lot on my mind today and I want to slow down.");
    }
  };

  const handleEndSession = () => {
    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    const userMessages = turns.filter((t) => t.sender === 'user');
    addSessionToHistory({
      dateLabel: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      timeLabel: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationMinutes: durationMins,
      theme: wellnessReport.primaryTheme,
      moodBefore: wellnessReport.moodSummary.split(' ')[0] || 'Reflective',
      moodAfter: 'Calmer & Grounded',
      moodScoreBefore: Math.max(35, 100 - wellnessReport.metrics.stressLevel),
      moodScoreAfter: Math.min(92, Math.max(68, 100 - wellnessReport.metrics.stressLevel + 24)),
      personalReflection:
        userMessages[userMessages.length - 1]?.text ??
        'Took quiet time to pause, breathe, and check in emotionally.',
      aiSummary:
        'DEMO SESSION SUMMARY: Conversational check-in with SOVIA focusing on emotional decompression and gentle grounding.',
      highlights: [
        `Spoke through ${userMessages.length} reflection(s) with SOVIA`,
        `Session duration: ${formatTimer(elapsedSeconds)}`,
      ],
    });
    setSessionEnded(true);
    setOrbState('idle');
  };

  const latestAiTurn = [...turns].reverse().find((t) => t.sender === 'ai');

  const exerciseButtons: { id: TherapyActivityType; label: string; icon: React.ElementType }[] = [
    { id: 'guided_breathing', label: 'Breathing', icon: Wind },
    { id: 'grounding', label: 'Grounding', icon: Leaf },
    { id: 'mindfulness', label: 'Mindfulness', icon: Sparkles },
    { id: 'journaling', label: 'Journaling', icon: BookOpen },
    { id: 'relaxation', label: 'Relaxation', icon: Feather },
  ];

  const sessionProgressPct = Math.min(100, Math.round((elapsedSeconds / 600) * 100));

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-between pb-6">
      {/* Top Session Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel-soft rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              orbState === 'speaking'
                ? 'bg-sky-400 animate-ping'
                : orbState === 'listening'
                  ? 'bg-cyan-400 animate-pulse'
                  : orbState === 'thinking'
                    ? 'bg-violet-400 animate-pulse'
                    : 'bg-indigo-400'
            }`}
          />
          <div>
            <p className="text-xs font-semibold text-white">
              Live AI Therapy Session ·{' '}
              <span className="text-cyan-300 capitalize">{orbState}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Simulated voice companion · {wellnessReport.primaryTheme}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>Progress</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                style={{ width: `${Math.max(8, sessionProgressPct)}%` }}
              />
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-cyan-200">
            {formatTimer(elapsedSeconds)}
          </span>
          <button
            type="button"
            onClick={() => updateSettings({ showTranscript: !settings.showTranscript })}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white transition cursor-pointer"
            title="Toggle live transcript"
            aria-label="Toggle live transcript"
          >
            {settings.showTranscript ? (
              <Captions className="h-4 w-4 text-cyan-300" />
            ) : (
              <CaptionsOff className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Session Stage */}
      {sessionEnded ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="my-auto mx-auto max-w-lg glass-panel glow-border rounded-3xl p-8 text-center"
        >
          <CheckCircle2 className="mx-auto h-10 w-10 text-cyan-400" />
          <h2 className="mt-4 text-2xl font-semibold text-white">Session Complete</h2>
          <p className="mt-2 text-sm text-slate-300">
            You spent <span className="text-cyan-300 font-medium">{formatTimer(elapsedSeconds)}</span>{' '}
            caring for your emotional wellbeing. Your reflection has been added to Session History.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-white hover:border-cyan-400/40 transition cursor-pointer"
            >
              View Session History
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-2.5 text-xs font-semibold text-slate-950 hover:brightness-110 transition cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="my-auto grid gap-6 py-4 lg:grid-cols-12 items-center">
          {/* Central 3D Orb & Spoken Focus */}
          <div
            className={`flex flex-col items-center text-center ${
              settings.showTranscript ? 'lg:col-span-7' : 'lg:col-span-12'
            }`}
          >
            <AiOrb3D state={orbState} size="hero" />
            <VoiceWaveform state={orbState} bars={30} className="mt-1" />

            <AnimatePresence mode="wait">
              {latestAiTurn && (
                <motion.div
                  key={latestAiTurn.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 max-w-xl glass-panel-soft rounded-3xl px-6 py-5"
                >
                  <p className="text-sm sm:text-base leading-relaxed text-slate-100">
                    "{latestAiTurn.text}"
                  </p>
                  {latestAiTurn.emotionLabel && (
                    <span className="mt-2 inline-block text-[10px] uppercase tracking-widest text-cyan-300/80">
                      Tone: {latestAiTurn.emotionLabel}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Sample Prompts */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-xl">
              {LIVE_THERAPY_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendUtterance(prompt)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-300 hover:border-cyan-400/40 hover:text-white transition cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Live Transcript Drawer */}
          {settings.showTranscript && (
            <div className="lg:col-span-5 glass-panel rounded-3xl p-4 sm:p-5 flex flex-col h-[340px] lg:h-[430px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Live Transcript
                </span>
                <span className="text-[10px] text-slate-500">Demo Conversation</span>
              </div>

              <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
                {turns.map((turn) => (
                  <div
                    key={turn.id}
                    className={`flex flex-col ${
                      turn.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        turn.sender === 'user'
                          ? 'bg-indigo-500/25 border border-indigo-400/30 text-white'
                          : 'bg-white/[0.05] border border-white/10 text-slate-200'
                      }`}
                    >
                      {turn.text}
                    </div>
                    <span className="mt-1 text-[10px] text-slate-500">
                      {turn.sender === 'ai' ? 'SOVIA' : 'You'} · {turn.timestamp}
                    </span>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Controls: Activities + Input + Mic + End Session */}
      {!sessionEnded && (
        <div className="space-y-3">
          {/* In-session Wellness Activities */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {exerciseButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setActiveExercise(btn.id)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400/40 hover:bg-indigo-500/15 transition cursor-pointer"
                >
                  <Icon className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Primary Interaction Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendUtterance(inputText);
            }}
            className="mx-auto flex max-w-3xl items-center gap-2.5 rounded-full border border-white/12 bg-slate-950/75 p-2 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setMicMuted((m) => !m)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
                micMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/35'
              }`}
              title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
              aria-label={micMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={handleVoiceSimulate}
              placeholder={
                micMuted
                  ? 'Microphone muted — type to speak with SOVIA...'
                  : 'Share what is on your mind, or tap a prompt above...'
              }
              className="flex-1 bg-transparent px-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 text-xs font-semibold text-slate-950 disabled:opacity-40 hover:brightness-110 transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>

            <button
              type="button"
              onClick={handleEndSession}
              className="flex h-10 items-center gap-1.5 rounded-full border border-rose-400/35 bg-rose-500/15 px-4 text-xs font-medium text-rose-200 hover:bg-rose-500/25 transition cursor-pointer"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">End Session</span>
            </button>
          </form>
        </div>
      )}

      <WellnessExerciseModal
        activity={activeExercise}
        onClose={() => setActiveExercise(null)}
        onCompleteReflection={(note) => sendUtterance(note)}
      />
    </div>
  );
};

