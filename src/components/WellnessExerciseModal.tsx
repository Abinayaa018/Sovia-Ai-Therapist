import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, Wind, X } from 'lucide-react';
import { WELLNESS_EXERCISES } from '../data/demoTherapy';
import type { TherapyActivityType } from '../types';

interface WellnessExerciseModalProps {
  activity: TherapyActivityType | null;
  onClose: () => void;
  onCompleteReflection?: (note: string) => void;
}

export const WellnessExerciseModal: React.FC<WellnessExerciseModalProps> = ({
  activity,
  onClose,
  onCompleteReflection,
}) => {
  const config = WELLNESS_EXERCISES.find((e) => e.id === activity) ?? null;
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [journalText, setJournalText] = useState('');

  useEffect(() => {
    if (activity !== 'guided_breathing') return;
    let phase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';
    let counter = 4;
    setBreathPhase(phase);
    setBreathCount(counter);

    const timer = window.setInterval(() => {
      counter -= 1;
      if (counter <= 0) {
        if (phase === 'Inhale') {
          phase = 'Hold';
          counter = 4;
        } else if (phase === 'Hold') {
          phase = 'Exhale';
          counter = 6;
        } else {
          phase = 'Inhale';
          counter = 4;
        }
      }
      setBreathPhase(phase);
      setBreathCount(counter);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activity]);

  useEffect(() => {
    setCheckedSteps([]);
    setJournalText('');
  }, [activity]);

  if (!config) return null;

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="glass-panel glow-border relative w-full max-w-lg rounded-3xl p-6 sm:p-8"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Close activity"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{config.durationLabel}</span>
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">{config.title}</h3>
          <p className="mt-1 text-sm text-slate-400">{config.subtitle}</p>

          {activity === 'guided_breathing' ? (
            <div className="my-7 flex flex-col items-center">
              <div className="relative flex h-44 w-44 items-center justify-center">
                <motion.div
                  animate={{
                    scale:
                      breathPhase === 'Inhale'
                        ? 1.25
                        : breathPhase === 'Hold'
                          ? 1.25
                          : 0.85,
                  }}
                  transition={{ duration: breathPhase === 'Exhale' ? 5.5 : 3.6, ease: 'easeInOut' }}
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400/30 via-indigo-500/35 to-violet-500/30 blur-md"
                />
                <motion.div
                  animate={{
                    scale:
                      breathPhase === 'Inhale'
                        ? 1.15
                        : breathPhase === 'Hold'
                          ? 1.15
                          : 0.82,
                  }}
                  transition={{ duration: breathPhase === 'Exhale' ? 5.5 : 3.6, ease: 'easeInOut' }}
                  className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full border border-cyan-300/40 bg-slate-900/70 shadow-[0_0_40px_rgba(56,189,248,0.25)]"
                >
                  <Wind className="h-5 w-5 text-cyan-300 mb-1" />
                  <span className="text-sm font-semibold text-white">{breathPhase}</span>
                  <span className="text-xs text-cyan-200/80">{breathCount}s</span>
                </motion.div>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400 max-w-xs">
                Follow the glowing circle: inhale for 4s, hold softly for 4s, exhale slowly for 6s.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {config.steps.map((step, idx) => {
                const done = checkedSteps.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                      done
                        ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100'
                        : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-indigo-400/30'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        done
                          ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                          : 'border-slate-500 text-transparent'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm leading-relaxed">{step}</span>
                  </button>
                );
              })}

              {activity === 'journaling' && (
                <div className="pt-2">
                  <textarea
                    rows={3}
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write a quick reflection if you'd like..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (onCompleteReflection) {
                  onCompleteReflection(
                    journalText.trim()
                      ? `Completed ${config.title}: "${journalText.trim()}"`
                      : `Completed ${config.title} exercise.`
                  );
                }
                onClose();
              }}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition cursor-pointer"
            >
              Finish Exercise
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

