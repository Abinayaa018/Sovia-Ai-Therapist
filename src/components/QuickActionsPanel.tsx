import React, { useState } from 'react';
import {
  BellPlus,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Music,
  Sparkles,
  Wind,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AssistantItem, TherapyActivityType } from '../types';

interface QuickActionsPanelProps {
  onStartExercise?: (type: TherapyActivityType) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onStartExercise,
}) => {
  const { playCalmingPreset, addAssistantItem, assistantItems, toggleAssistantItem } =
    useApp();

  const [activeComposer, setActiveComposer] = useState<
    AssistantItem['type'] | null
  >(null);
  const [title, setTitle] = useState('');
  const [timeLabel, setTimeLabel] = useState('06:30 PM');
  const [details, setDetails] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(null), 3200);
  };

  const openComposer = (type: AssistantItem['type']) => {
    setActiveComposer(type);
    if (type === 'reminder') {
      setTitle('Evening unwind check-in');
      setTimeLabel('08:30 PM');
      setDetails('Pause notifications and take 5 deep breaths.');
    } else if (type === 'day_plan') {
      setTitle('Balanced focus & rest blocks');
      setTimeLabel('09:30 AM');
      setDetails('Top 2 priorities + 20-minute afternoon reset walk.');
    } else {
      setTitle('Calm study sprint');
      setTimeLabel('04:00 PM');
      setDetails('2 × 35 min study with 10 min music break.');
    }
  };

  const handleSaveComposer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComposer || !title.trim()) return;
    addAssistantItem({
      type: activeComposer,
      title: title.trim(),
      timeLabel: timeLabel.trim() || 'Today',
      details: details.trim() || 'Personalized assistant item',
    });
    setActiveComposer(null);
    triggerFeedback('Added to your personal wellness assistant list.');
  };

  const actions = [
    {
      id: 'music',
      label: 'Play calming music',
      icon: Music,
      onClick: () => {
        playCalmingPreset();
        triggerFeedback('Playing Midnight Stillness (Calming)');
      },
    },
    {
      id: 'breath',
      label: 'Start breathing exercise',
      icon: Wind,
      onClick: () => onStartExercise?.('guided_breathing'),
    },
    {
      id: 'reminder',
      label: 'Schedule a reminder',
      icon: BellPlus,
      onClick: () => openComposer('reminder'),
    },
    {
      id: 'day',
      label: 'Plan my day',
      icon: CalendarClock,
      onClick: () => openComposer('day_plan'),
    },
    {
      id: 'study',
      label: 'Create a study routine',
      icon: BookOpen,
      onClick: () => openComposer('study_routine'),
    },
    {
      id: 'meditation',
      label: 'Start meditation',
      icon: Sparkles,
      onClick: () => onStartExercise?.('mindfulness'),
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Personal Assistant Actions</h3>
          <p className="text-xs text-slate-400">
            Instant calm tools & daily rhythm helpers
          </p>
        </div>
        {feedback && (
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
            {feedback}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className="group flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left text-xs font-medium text-slate-200 hover:border-cyan-400/35 hover:bg-indigo-500/10 hover:text-white transition cursor-pointer"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-cyan-300 group-hover:bg-cyan-400/20 transition">
                <Icon className="h-4 w-4" />
              </span>
              <span className="leading-snug">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inline composer for Reminder / Day Plan / Study Routine */}
      {activeComposer && (
        <form
          onSubmit={handleSaveComposer}
          className="mt-4 rounded-2xl border border-indigo-400/25 bg-slate-900/75 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              {activeComposer === 'reminder'
                ? 'New Wellness Reminder'
                : activeComposer === 'day_plan'
                  ? 'Plan My Day'
                  : 'Create Study Routine'}
            </span>
            <button
              type="button"
              onClick={() => setActiveComposer(null)}
              className="text-slate-400 hover:text-white"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="sm:col-span-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
            />
            <input
              type="text"
              value={timeLabel}
              onChange={(e) => setTimeLabel(e.target.value)}
              placeholder="Time"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Notes or intention"
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:brightness-110 transition cursor-pointer"
            >
              Save to My Assistant
            </button>
          </div>
        </form>
      )}

      {/* Active Assistant Items */}
      {assistantItems.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Your Active Routines & Reminders
          </p>
          {assistantItems.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleAssistantItem(item.id)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-left hover:border-white/15 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${
                    item.completed ? 'text-cyan-400' : 'text-slate-600'
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs font-medium ${
                      item.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">{item.details}</p>
                </div>
              </div>
              <span className="shrink-0 text-[11px] text-indigo-300">{item.timeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

