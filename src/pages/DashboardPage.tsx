import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  History,
  Sparkles,
  Wind,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AiOrb3D } from '../components/AiOrb3D';
import { MusicPlayerPanel } from '../components/MusicPlayerPanel';
import { QuickActionsPanel } from '../components/QuickActionsPanel';
import { WellnessExerciseModal } from '../components/WellnessExerciseModal';
import { useApp } from '../context/AppContext';
import type { TherapyActivityType } from '../types';

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardPage: React.FC = () => {
  const { user, wellnessReport, therapySchedule, sessionHistory } = useApp();
  const navigate = useNavigate();
  const [activeExercise, setActiveExercise] = useState<TherapyActivityType | null>(null);

  const nextSession =
    therapySchedule.activities.find((a) => !a.completed) ?? therapySchedule.activities[0];
  const recommendedRec = wellnessReport.recommendations[0];
  const recentSession = sessionHistory[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6 pb-10"
    >
      {/* Hero Greeting & Continue Session */}
      <div className="glass-panel glow-border rounded-[28px] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SOVIA Personal Wellness Hub · Demo</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold text-white">
            {getTimeGreeting()}, {user?.name?.split(' ')[0] ?? 'Friend'}.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your current wellness balance is{' '}
            <span className="text-cyan-300 font-semibold">
              {wellnessReport.metrics.emotionalBalance}%
            </span>
            . {wellnessReport.moodSummary}.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/session')}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.28)] hover:brightness-110 transition cursor-pointer"
            >
              <span>Continue Session</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/assessment')}
              className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
            >
              New Emotional Check-In
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <AiOrb3D state="idle" size="md" />
        </div>
      </div>

      {/* Overview Metrics + Next Session + Recommended Activity */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Wellness Overview Card */}
        <div
          onClick={() => navigate('/report')}
          className="glass-panel rounded-3xl p-5 hover:border-cyan-400/35 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Wellness
            </span>
            <Activity className="h-4 w-4 text-cyan-300" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xl font-semibold text-white">
                {wellnessReport.metrics.emotionalBalance}%
              </p>
              <p className="text-[11px] text-slate-400">Balance</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-violet-300">
                {wellnessReport.metrics.stressLevel}%
              </p>
              <p className="text-[11px] text-slate-400">Stress</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-sky-300">
                {wellnessReport.metrics.sleepQuality}%
              </p>
              <p className="text-[11px] text-slate-400">Sleep</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-cyan-300 flex items-center gap-1">
            <span>View full wellness report</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>

        {/* Next Therapy Session Card */}
        <div
          onClick={() => navigate('/schedule')}
          className="glass-panel rounded-3xl p-5 hover:border-cyan-400/35 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Next Therapy Session
            </span>
            <CalendarDays className="h-4 w-4 text-indigo-300" />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {nextSession?.title ?? 'Mindfulness Meditation'}
          </h3>
          <p className="mt-1 text-xs text-slate-300">
            {nextSession?.day} at {nextSession?.time} · {nextSession?.durationMinutes} min
          </p>
          <p className="mt-4 text-xs text-indigo-300 flex items-center gap-1">
            <span>Customize therapy plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>

        {/* Recommended Activity */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recommended Now
              </span>
              <Wind className="h-4 w-4 text-cyan-300" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">
              {recommendedRec?.title ?? '4-7-8 Nervous System Reset'}
            </h3>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {recommendedRec?.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveExercise('guided_breathing')}
            className="mt-4 self-start rounded-full border border-cyan-400/35 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-400/20 transition cursor-pointer"
          >
            Start {recommendedRec?.durationMin ?? 5}-min Reset
          </button>
        </div>
      </div>

      {/* Weekly Mood Trend + Recent Sessions */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="glass-panel rounded-3xl p-5 sm:p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Weekly Mood Trend</h3>
              <p className="text-xs text-slate-400">
                Calm vs. stress trajectory across the week (Demo Data)
              </p>
            </div>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wellnessReport.weeklyTrend}>
                <defs>
                  <linearGradient id="calmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(148,163,184,0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calm"
                  name="Calm"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#calmGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  name="Stress"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="url(#stressGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Session Summary */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Recent Session Summary</h3>
              <History className="h-4 w-4 text-indigo-300" />
            </div>

            {recentSession ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{recentSession.dateLabel}</span>
                  <span>{recentSession.durationMinutes} min</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{recentSession.theme}</h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  {recentSession.aiSummary}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300">
                    Before: {recentSession.moodBefore}
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-cyan-200">
                    After: {recentSession.moodAfter}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-400">
                No sessions recorded yet. Start your first live session to capture reflections.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/history')}
            className="mt-4 self-start text-xs font-medium text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
          >
            <span>Open all session history</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Actions & Music Player */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <QuickActionsPanel onStartExercise={(type) => setActiveExercise(type)} />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <MusicPlayerPanel />
        </div>
      </div>

      <WellnessExerciseModal
        activity={activeExercise}
        onClose={() => setActiveExercise(null)}
      />
    </motion.div>
  );
};

