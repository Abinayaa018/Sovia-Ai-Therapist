import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Clock,
  History,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SessionHistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const { sessionHistory } = useApp();
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState<SessionHistoryItem | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium text-indigo-200">
            <History className="h-3.5 w-3.5 text-cyan-300" />
            <span>Reflective Archive · Demo Data</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
            Session History
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Revisit your past conversations, emotional shifts, and AI summaries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/session')}
          className="flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 hover:brightness-110 transition cursor-pointer"
        >
          <span>Start New Session</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {sessionHistory.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-cyan-300" />
          <h3 className="mt-4 text-lg font-semibold text-white">No saved sessions yet</h3>
          <p className="mt-1 text-sm text-slate-400">
            Start a live session with SOVIA to record your first reflection.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessionHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedSession(item)}
              className="glass-panel rounded-3xl p-5 hover:border-cyan-400/40 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-cyan-300" />
                    {item.dateLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {item.durationMinutes} min
                  </span>
                </div>

                <h3 className="mt-3 text-base font-semibold text-white">{item.theme}</h3>
                <p className="mt-1 text-xs text-slate-400">{item.timeLabel}</p>

                <p className="mt-3 text-xs leading-relaxed text-slate-300 line-clamp-3">
                  {item.aiSummary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">{item.moodBefore}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-cyan-300 font-medium">{item.moodAfter}</span>
                </div>
                <span className="text-[11px] text-indigo-300">Open →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="glass-panel glow-border relative w-full max-w-xl rounded-3xl p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                aria-label="Close session summary"
              >
                <X className="h-5 w-5" />
              </button>

              <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-300">
                {selectedSession.dateLabel} · {selectedSession.timeLabel} ·{' '}
                {selectedSession.durationMinutes} min
              </span>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedSession.theme}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                  Mood Before: {selectedSession.moodBefore} ({selectedSession.moodScoreBefore}%)
                </span>
                <span className="text-slate-500">→</span>
                <span className="rounded-full border border-cyan-400/35 bg-cyan-400/15 px-3 py-1 text-cyan-200">
                  Mood After: {selectedSession.moodAfter} ({selectedSession.moodScoreAfter}%)
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                    AI Summary (Demo)
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                    {selectedSession.aiSummary}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                    Personal Reflection
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-200 italic font-serif">
                    "{selectedSession.personalReflection}"
                  </p>
                </div>

                {selectedSession.highlights.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-300 mb-2">Key Takeaways</p>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedSession.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

