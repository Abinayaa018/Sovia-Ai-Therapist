import type { SessionHistoryItem, TherapyActivityType } from '../types';

export interface WellnessExerciseConfig {
  id: TherapyActivityType;
  title: string;
  subtitle: string;
  durationLabel: string;
  steps: string[];
  accentColor: string;
}

export const WELLNESS_EXERCISES: WellnessExerciseConfig[] = [
  {
    id: 'guided_breathing',
    title: 'Guided Breathing',
    subtitle: '4-4-6 Nervous System Cadence',
    durationLabel: '3–5 min',
    accentColor: 'cyan',
    steps: [
      'Inhale softly through your nose for 4 seconds.',
      'Hold gently at the top for 4 seconds—relax your jaw.',
      'Exhale slowly through your mouth for 6 seconds.',
    ],
  },
  {
    id: 'grounding',
    title: 'Grounding Exercise',
    subtitle: '5-4-3-2-1 Sensory Anchor',
    durationLabel: '4 min',
    accentColor: 'indigo',
    steps: [
      'Notice 5 subtle details in the room around you.',
      'Feel 4 physical sensations—your chair, your feet, the air on your skin.',
      'Listen for 3 quiet background sounds near or far.',
      'Identify 2 calming scents or neutral textures.',
      'Take 1 slow, grounding breath right where you are.',
    ],
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness Presence',
    subtitle: 'Open Awareness Check-In',
    durationLabel: '5 min',
    accentColor: 'violet',
    steps: [
      'Allow thoughts to pass like clouds across a midnight sky.',
      'Observe any tightness without needing to judge or fix it.',
      'Return gently to the steady rhythm of your chest rising and falling.',
    ],
  },
  {
    id: 'journaling',
    title: 'Journaling Prompts',
    subtitle: 'Guided Reflective Writing',
    durationLabel: '6 min',
    accentColor: 'sky',
    steps: [
      'What feels heaviest in my mind right now, and does it belong to today?',
      'What is one small kindness I can offer myself before tonight?',
      'What would I tell a close friend carrying this exact same week?',
    ],
  },
  {
    id: 'relaxation',
    title: 'Relaxation Exercise',
    subtitle: 'Progressive Muscle Release',
    durationLabel: '7 min',
    accentColor: 'purple',
    steps: [
      'Gently lift your shoulders toward your ears for 4 seconds, then let them drop.',
      'Unclench your hands and let your fingers rest open.',
      'Soften the space between your eyebrows and breathe into the release.',
    ],
  },
];

export const INITIAL_SESSION_HISTORY: SessionHistoryItem[] = [
  {
    id: 'hist-1',
    dateLabel: 'Nov 23, 2026',
    timeLabel: '08:15 PM',
    durationMinutes: 14,
    theme: 'Academic Deadline Decompression',
    moodBefore: 'Overwhelmed',
    moodAfter: 'Calmer & Clearer',
    moodScoreBefore: 42,
    moodScoreAfter: 74,
    personalReflection:
      'Realized I was trying to solve the entire semester in one evening instead of focusing on the next 90 minutes.',
    aiSummary:
      'DEMO SUMMARY: Explored exam-related cognitive overload, practiced 4-4-6 paced breathing, and broke tomorrow’s study block into low-pressure milestones.',
    isDemo: true,
    highlights: [
      'Completed 4-minute guided breathing reset',
      'Identified late-night screen scrolling as a sleep blocker',
      'Committed to a 10:30 PM digital sunset',
    ],
  },
  {
    id: 'hist-2',
    dateLabel: 'Nov 20, 2026',
    timeLabel: '07:40 PM',
    durationMinutes: 11,
    theme: 'Evening Grounding & Sleep Preparation',
    moodBefore: 'Restless',
    moodAfter: 'Grounded',
    moodScoreBefore: 48,
    moodScoreAfter: 78,
    personalReflection:
      'The 5-4-3-2-1 sensory check helped pull my attention out of repetitive thoughts.',
    aiSummary:
      'DEMO SUMMARY: Focused on quieting anticipatory worry before sleep using sensory grounding and Moonlit Drift ambient soundscape.',
    isDemo: true,
    highlights: [
      'Practiced 5-4-3-2-1 sensory grounding',
      'Noticed shoulder tension soften after progressive release',
    ],
  },
  {
    id: 'hist-3',
    dateLabel: 'Nov 17, 2026',
    timeLabel: '09:05 AM',
    durationMinutes: 9,
    theme: 'Morning Clarity & Intention Setting',
    moodBefore: 'Tired',
    moodAfter: 'Steady & Hopeful',
    moodScoreBefore: 51,
    moodScoreAfter: 76,
    personalReflection:
      'Starting the morning without immediately checking notifications made a noticeable difference.',
    aiSummary:
      'DEMO SUMMARY: Established a calmer morning pacing strategy and identified three achievable priorities to avoid midday burnout.',
    isDemo: true,
    highlights: [
      'Designed a realistic 3-priority daily plan',
      'Reinforced positive habit of morning hydration and quiet breathing',
    ],
  },
];

export const LIVE_THERAPY_QUICK_PROMPTS = [
  "I've been carrying a lot of stress today",
  'My mind feels noisy and hard to quiet down',
  "I'm feeling exhausted and behind on everything",
  'I want to pause and breathe for a moment',
];

export function generateDemoTherapistReply(userText: string, turnCount: number): {
  reply: string;
  detectedTone: string;
  suggestedExercise?: TherapyActivityType;
} {
  const lower = userText.toLowerCase();

  if (/(breath|breathe|panic|tight|heart|anxious|anxiety|overwhelm)/.test(lower)) {
    return {
      reply:
        "I'm right here with you. When things feel tight or overwhelming, we don't have to solve the whole problem in your head first—let's help your body feel safe. Try letting your shoulders drop just half an inch, and if you'd like, we can run a quick 4-4-6 breathing reset together.",
      detectedTone: 'Anxious / Tense (Demo)',
      suggestedExercise: 'guided_breathing',
    };
  }

  if (/(sleep|tired|exhaust|burnout|drained|fatigue|rest)/.test(lower)) {
    return {
      reply:
        "It sounds like you've been running on low reserves while still expecting yourself to perform at full capacity. That kind of exhaustion isn't a personal flaw—it's your mind asking for genuine recovery. What is one non-essential thing you could set down tonight?",
      detectedTone: 'Fatigued (Demo)',
      suggestedExercise: 'relaxation',
    };
  }

  if (/(study|exam|work|deadline|behind|focus|noisy|scatter)/.test(lower)) {
    return {
      reply:
        'When everything feels urgent at once, your mind tries to track ten futures at the same time. Let us bring the horizon closer—just the next small, steady step. Would a 3-minute grounding exercise or breaking down your next hour gently feel more helpful right now?',
      detectedTone: 'Cognitive Overload (Demo)',
      suggestedExercise: 'grounding',
    };
  }

  if (/(sad|lonely|alone|empty|heavy|cry|hurt)/.test(lower)) {
    return {
      reply:
        "Thank you for letting yourself say that out loud here. Carrying sadness quietly can make a room feel much larger and emptier than it is. You don't have to rush into feeling cheerful—we can just sit with what's heavy and unpack it at your pace.",
      detectedTone: 'Low / Reflective (Demo)',
      suggestedExercise: 'journaling',
    };
  }

  if (/(better|good|calm|relieved|thank|helped|lighter)/.test(lower)) {
    return {
      reply:
        "I can feel that shift in softness too. Notice what helped create even a small pocket of space just now—that's something you can return to anytime your week speeds back up.",
      detectedTone: 'Grounded / Calm (Demo)',
      suggestedExercise: 'mindfulness',
    };
  }

  const fallbacks = [
    "I hear how much thought you've been putting into this. Take one unhurried breath—what part of what you just shared feels like it's asking for the most care right now?",
    "That makes a lot of sense given everything you've been navigating lately. If you could give yourself permission to move 20% slower today, what would change first?",
    "Thank you for sharing that honestly. Sometimes simply naming what's happening underneath the surface takes away half its sharp edge. How does your body feel right now as we talk?",
  ];

  return {
    reply: fallbacks[turnCount % fallbacks.length],
    detectedTone: 'Reflective (Demo)',
  };
}

