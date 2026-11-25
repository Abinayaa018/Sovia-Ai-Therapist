import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  CalendarClock,
  Check,
  Clock,
  Play,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PreferredTimeSlot, Weekday } from '../types';

const ALL_DAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS: PreferredTimeSlot[] = ['Morning', 'Afternoon', 'Evening', 'Night'];
const DURATIONS = [5, 10, 15, 20, 30];

export const SchedulePage: React.FC = () => {
  const {
    therapySchedule,
    wellnessReport,
    updateSchedulePreferences,
    toggleScheduledActivity,
  } = useApp();
  const navigate = useNavigate();
  const [savedNotice, setSavedNotice] = useState(false);

  const completedCount = therapySchedule.activities.filter((a) => a.completed).length;
  const totalCount = Math.max(1, therapySchedule.activities.length);
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const nextUpcoming =
    therapySchedule.activities.find((a) => !a.completed) ?? therapySchedule.activities[0];

  const toggleDay = (day: Weekday) => {
    const exists = therapySchedule.preferredDays.includes(day);
    const nextDays = exists
      ? therapySchedule.preferredDays.length > 1
        ? therapySchedule.preferredDays.filter((d) => d !== day)
        : therapySchedule.preferredDays
      : ALL_DAYS.filter((d) => d === day || therapySchedule.preferredDays.includes(d));

    updateSchedulePreferences({ preferredDays: nextDays, planAccepted: false });
  };

  const handleAcceptPlan = () => {
    updateSchedulePreferences({ planAccepted: true });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  };

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
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            <span>Tailored to {wellnessReport.primaryTheme}</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
            Personalized Therapy Schedule
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            A calm weekly rhythm designed around your energy, sleep, and preferred hours.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAcceptPlan}
          className="flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition cursor-pointer"
        >
          <CalendarCheck className="h-4 w-4" />
          <span>
            {therapySchedule.planAccepted ? 'Plan Active & Saved' : 'Accept Recommended Plan'}
          </span>
        </button>
      </div>

      {savedNotice && (
        <div className="rounded-2xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-3 text-xs font-medium text-cyan-200">
          Your personalized therapy schedule has been saved and synced to your Home dashboard.
        </div>
      )}

      {/* Next Scheduled Session Spotlight + Weekly Progress */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="glass-panel glow-border rounded-3xl p-6 lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-300">
                Next Scheduled Session
              </span>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {nextUpcoming?.title ?? 'Mindfulness Meditation'}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {nextUpcoming?.day} at {nextUpcoming?.time} · {nextUpcoming?.durationMinutes} min
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-300">
              <CalendarClock className="h-6 w-6" />
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            {nextUpcoming?.aiReason}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/session')}
              className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-5 py-2.5 text-xs font-semibold text-white hover:border-cyan-400/45 hover:bg-cyan-400/15 transition cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current text-cyan-300" />
              <span>Start This Session Early</span>
            </button>
            <span className="text-xs text-slate-400">
              Frequency: {therapySchedule.recommendedFrequencyPerWeek}× / week
            </span>
          </div>
        </div>

        {/* Weekly Progress Card */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Weekly Progress</h3>
              <span className="text-sm font-semibold text-cyan-300">{progressPct}%</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {completedCount} of {totalCount} mindful sessions completed this week
            </p>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-lg font-semibold text-white">
                {therapySchedule.recommendedFrequencyPerWeek}d
              </p>
              <p className="text-[11px] text-slate-400">Per Week</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-lg font-semibold text-white">
                {therapySchedule.defaultDurationMinutes}m
              </p>
              <p className="text-[11px] text-slate-400">Duration</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-lg font-semibold text-white">
                {therapySchedule.preferredTimeSlot}
              </p>
              <p className="text-[11px] text-slate-400">Window</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Preferences */}
      <div className="glass-panel rounded-3xl p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-white">Customize Your Rhythm</h3>
          <p className="text-xs text-slate-400">
            Adjust preferred days, time of day, and session length anytime
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Preferred Days */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2.5">
              Preferred Days
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => {
                const active = therapySchedule.preferredDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-100'
                        : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Time */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2.5">
              Preferred Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => {
                const active = therapySchedule.preferredTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() =>
                      updateSchedulePreferences({
                        preferredTimeSlot: slot,
                        planAccepted: false,
                      })
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'bg-indigo-500/25 border border-indigo-400/50 text-white'
                        : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Duration */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2.5">
              Session Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((mins) => {
                const active = therapySchedule.defaultDurationMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      updateSchedulePreferences({
                        defaultDurationMinutes: mins,
                        planAccepted: false,
                      })
                    }
                    className={`rounded-xl px-3.5 py-2 text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-100'
                        : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins} min
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Session Cards */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-base font-semibold text-white">Your Weekly Sessions</h3>
        <p className="text-xs text-slate-400 mb-4">
          Click a session card to mark it complete or open a live practice
        </p>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {therapySchedule.activities.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 transition flex flex-col justify-between ${
                item.completed
                  ? 'border-cyan-400/35 bg-cyan-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-indigo-400/35'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    {item.day}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleScheduledActivity(item.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition cursor-pointer ${
                      item.completed
                        ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                        : 'border-slate-600 text-transparent hover:border-cyan-400'
                    }`}
                    aria-label={`Mark ${item.day} ${item.title} completed`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h4 className="mt-3 text-sm font-semibold text-white">{item.title}</h4>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {item.time} · {item.durationMinutes} min
                  </span>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400">
                  {item.aiReason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

