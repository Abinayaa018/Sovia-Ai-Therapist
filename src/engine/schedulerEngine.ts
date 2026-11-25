import type {
  PreferredTimeSlot,
  ScheduledActivity,
  TherapySchedule,
  Weekday,
  WellnessReport,
} from '../types';

const DEFAULT_TIME_MAP: Record<PreferredTimeSlot, string> = {
  Morning: '08:30 AM',
  Afternoon: '02:00 PM',
  Evening: '07:30 PM',
  Night: '09:45 PM',
};

export function generatePersonalizedSchedule(
  report: WellnessReport,
  overrides?: {
    preferredDays?: Weekday[];
    preferredTimeSlot?: PreferredTimeSlot;
    defaultDurationMinutes?: number;
  }
): TherapySchedule {
  const preferredDays: Weekday[] = overrides?.preferredDays ?? ['Mon', 'Wed', 'Fri', 'Sun'];
  const preferredTimeSlot: PreferredTimeSlot =
    overrides?.preferredTimeSlot ?? (report.metrics.sleepQuality < 60 ? 'Evening' : 'Morning');
  const defaultDurationMinutes = overrides?.defaultDurationMinutes ?? 10;
  const preferredTimeExact = DEFAULT_TIME_MAP[preferredTimeSlot];

  const pool: Omit<ScheduledActivity, 'id' | 'day' | 'time' | 'completed'>[] = [
    {
      title: 'Guided Breathing',
      category: 'breathing',
      durationMinutes: 5,
      aiReason: 'Recommended to gently lower baseline cortisol and anchor your attention.',
    },
    {
      title:
        report.metrics.stressLevel >= 58 ? 'Stress Management' : 'Positive Habit Building',
      category: report.metrics.stressLevel >= 58 ? 'stress' : 'habits',
      durationMinutes: Math.max(10, defaultDurationMinutes),
      aiReason:
        report.metrics.stressLevel >= 58
          ? 'Targets the mental load highlighted in your recent emotional check-in.'
          : 'Reinforces the grounded daily routines already working for you.',
    },
    {
      title: 'Mindfulness Meditation',
      category: 'mindfulness',
      durationMinutes: defaultDurationMinutes,
      aiReason: 'Builds calm space between demanding thoughts and your emotional response.',
    },
    {
      title:
        report.metrics.sleepQuality < 64 ? 'Sleep Relaxation' : 'Emotional Reflection',
      category: report.metrics.sleepQuality < 64 ? 'sleep' : 'reflection',
      durationMinutes: Math.max(10, defaultDurationMinutes),
      aiReason:
        report.metrics.sleepQuality < 64
          ? 'Designed to quiet late-night mental chatter before sleep.'
          : 'Supports ongoing clarity and emotional awareness.',
    },
  ];

  const activities: ScheduledActivity[] = preferredDays.map((day, idx) => {
    const template = pool[idx % pool.length];
    return {
      id: `sched-${day}-${idx}`,
      day,
      time: preferredTimeExact,
      title: template.title,
      category: template.category,
      durationMinutes: template.durationMinutes,
      completed: idx === 0, // First demo slot shown as completed for weekly progress feel
      aiReason: template.aiReason,
    };
  });

  return {
    recommendedFrequencyPerWeek: preferredDays.length,
    defaultDurationMinutes,
    preferredDays,
    preferredTimeSlot,
    preferredTimeExact,
    planAccepted: false,
    activities,
  };
}

