import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { INITIAL_SESSION_HISTORY } from '../data/demoTherapy';
import { MUSIC_LIBRARY } from '../data/musicLibrary';
import { ambientAudio } from '../engine/ambientAudio';
import { generatePersonalizedSchedule } from '../engine/schedulerEngine';
import { generateWellnessReport } from '../engine/wellnessCalculator';
import type {
  AssessmentAnswer,
  AssistantItem,
  MusicCategory,
  MusicTrack,
  PreferredTimeSlot,
  SessionHistoryItem,
  TherapySchedule,
  UserProfile,
  UserSettings,
  Weekday,
  WellnessReport,
} from '../types';

const STORAGE_KEY = 'sovia_wellness_demo_state_v1';

const DEFAULT_SETTINGS: UserSettings = {
  voiceId: 'sovia_warm',
  voiceSpeed: 1.0,
  soundEnabled: true,
  showTranscript: true,
  microphoneGranted: false,
  cameraEnabled: false, // Strictly disabled until user explicitly opts in
  ambientParticles: true,
  saveLocalHistory: true,
};

const DEFAULT_ASSISTANT_ITEMS: AssistantItem[] = [
  {
    id: 'ast-1',
    type: 'reminder',
    title: 'Evening Digital Sunset',
    timeLabel: '09:30 PM',
    details: 'Dim bright screens and switch to calming soundscape.',
    completed: false,
  },
  {
    id: 'ast-2',
    type: 'day_plan',
    title: 'Single-Focus Morning Block',
    timeLabel: '10:00 AM',
    details: '45 min deep work followed by 10 min away from desk.',
    completed: true,
  },
  {
    id: 'ast-3',
    type: 'study_routine',
    title: 'Pomodoro Recovery Rhythm',
    timeLabel: '03:00 PM',
    details: '2 × 35 min study intervals with 5 min guided breathing between.',
    completed: false,
  },
];

interface PersistedState {
  user: UserProfile | null;
  hasSeenWelcome: boolean;
  hasCompletedAssessment: boolean;
  assessmentAnswers: AssessmentAnswer[];
  wellnessReport: WellnessReport | null;
  therapySchedule: TherapySchedule | null;
  sessionHistory: SessionHistoryItem[];
  assistantItems: AssistantItem[];
  settings: UserSettings;
}

interface AppContextValue {
  user: UserProfile | null;
  hasSeenWelcome: boolean;
  hasCompletedAssessment: boolean;
  assessmentAnswers: AssessmentAnswer[];
  wellnessReport: WellnessReport;
  hasCustomReport: boolean;
  therapySchedule: TherapySchedule;
  sessionHistory: SessionHistoryItem[];
  assistantItems: AssistantItem[];
  settings: UserSettings;

  // Music player state
  tracks: MusicTrack[];
  currentTrack: MusicTrack;
  selectedMusicCategory: MusicCategory | 'all';
  isMusicPlaying: boolean;
  musicProgressSeconds: number;
  musicVolume: number;

  // Actions
  loginUser: (profile: UserProfile) => void;
  logoutUser: () => void;
  markWelcomeSeen: () => void;
  completeAssessment: (answers: AssessmentAnswer[]) => WellnessReport;
  resetAssessment: () => void;
  updateSchedulePreferences: (prefs: {
    preferredDays?: Weekday[];
    preferredTimeSlot?: PreferredTimeSlot;
    defaultDurationMinutes?: number;
    planAccepted?: boolean;
  }) => void;
  toggleScheduledActivity: (activityId: string) => void;
  addSessionToHistory: (session: Omit<SessionHistoryItem, 'id' | 'isDemo'>) => void;
  deleteAllHistory: () => void;
  addAssistantItem: (item: Omit<AssistantItem, 'id' | 'completed'>) => void;
  toggleAssistantItem: (id: string) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;

  // Music actions
  playTrack: (trackId?: string) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTrack: (seconds: number) => void;
  setMusicVolume: (vol: number) => void;
  setMusicCategory: (cat: MusicCategory | 'all') => void;
  playCalmingPreset: () => void;
}

const FALLBACK_DEMO_ANSWERS: AssessmentAnswer[] = [
  {
    questionId: 'q-mood',
    dimension: 'emotional_state',
    selectedOptionId: 'mood-stressed',
    answerText: 'Stressed',
    tags: ['stress'],
    isCustomText: false,
    empathyResponse:
      "I hear you. Sometimes stress can build up without us realizing how much we're carrying.",
  },
  {
    questionId: 'q-pressure-source',
    dimension: 'pressure_source',
    selectedOptionId: 'src-studies',
    answerText: 'Studies or exams',
    tags: ['academic', 'pressure'],
    isCustomText: false,
    empathyResponse: 'That sounds like a lot to manage.',
  },
  {
    questionId: 'q-academic-impact',
    dimension: 'sleep_quality',
    selectedOptionId: 'acad-sometimes',
    answerText: 'Sometimes',
    tags: ['sleep_moderate', 'focus_moderate'],
    isCustomText: false,
    empathyResponse: 'It sounds like there are waves—manageable moments followed by sudden mental fatigue.',
  },
  {
    questionId: 'q-coping',
    dimension: 'coping_mechanisms',
    selectedOptionId: 'cope-music-walk',
    answerText: 'Music, walking, or quiet solo time',
    tags: ['coping_healthy', 'music_affinity'],
    isCustomText: false,
    empathyResponse: 'Sensory calm like music and movement is wonderfully grounding.',
  },
];

const AppContext = createContext<AppContextValue | null>(null);

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        user: parsed.user ?? null,
        hasSeenWelcome: parsed.hasSeenWelcome ?? false,
        hasCompletedAssessment: parsed.hasCompletedAssessment ?? false,
        assessmentAnswers: parsed.assessmentAnswers ?? [],
        wellnessReport: parsed.wellnessReport ?? null,
        therapySchedule: parsed.therapySchedule ?? null,
        sessionHistory: parsed.sessionHistory ?? INITIAL_SESSION_HISTORY,
        assistantItems: parsed.assistantItems ?? DEFAULT_ASSISTANT_ITEMS,
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}), cameraEnabled: false },
      };
    }
  } catch {
    // Ignore storage read errors
  }

  return {
    user: null,
    hasSeenWelcome: false,
    hasCompletedAssessment: false,
    assessmentAnswers: [],
    wellnessReport: null,
    therapySchedule: null,
    sessionHistory: INITIAL_SESSION_HISTORY,
    assistantItems: DEFAULT_ASSISTANT_ITEMS,
    settings: DEFAULT_SETTINGS,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initial] = useState<PersistedState>(() => loadInitialState());

  const [user, setUser] = useState<UserProfile | null>(initial.user);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(initial.hasSeenWelcome);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(
    initial.hasCompletedAssessment
  );
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>(
    initial.assessmentAnswers
  );
  const [customReport, setCustomReport] = useState<WellnessReport | null>(
    initial.wellnessReport
  );
  const [customSchedule, setCustomSchedule] = useState<TherapySchedule | null>(
    initial.therapySchedule
  );
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>(
    initial.sessionHistory
  );
  const [assistantItems, setAssistantItems] = useState<AssistantItem[]>(
    initial.assistantItems
  );
  const [settings, setSettings] = useState<UserSettings>(initial.settings);

  // Music player state
  const [selectedMusicCategory, setSelectedMusicCategory] = useState<MusicCategory | 'all'>('all');
  const [currentTrackId, setCurrentTrackId] = useState<string>(MUSIC_LIBRARY[0].id);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicProgressSeconds, setMusicProgressSeconds] = useState(0);
  const [musicVolume, setMusicVolumeState] = useState(0.55);

  const fallbackReport = useMemo(() => generateWellnessReport(FALLBACK_DEMO_ANSWERS), []);
  const wellnessReport = customReport ?? fallbackReport;

  const therapySchedule = useMemo(
    () => customSchedule ?? generatePersonalizedSchedule(wellnessReport),
    [customSchedule, wellnessReport]
  );

  const currentTrack = useMemo(
    () => MUSIC_LIBRARY.find((t) => t.id === currentTrackId) ?? MUSIC_LIBRARY[0],
    [currentTrackId]
  );

  // Persist to localStorage when allowed
  useEffect(() => {
    if (!settings.saveLocalHistory) return;
    try {
      const payload: PersistedState = {
        user,
        hasSeenWelcome,
        hasCompletedAssessment,
        assessmentAnswers,
        wellnessReport: customReport,
        therapySchedule: customSchedule,
        sessionHistory,
        assistantItems,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues
    }
  }, [
    user,
    hasSeenWelcome,
    hasCompletedAssessment,
    assessmentAnswers,
    customReport,
    customSchedule,
    sessionHistory,
    assistantItems,
    settings,
  ]);

  // Music progress ticker + Web Audio sync
  useEffect(() => {
    if (!isMusicPlaying) {
      ambientAudio.pause();
      return;
    }

    if (settings.soundEnabled) {
      ambientAudio.startTrack(currentTrack, musicVolume);
    } else {
      ambientAudio.pause();
    }

    const interval = window.setInterval(() => {
      setMusicProgressSeconds((prev) => {
        if (prev + 1 >= currentTrack.durationSeconds) {
          const idx = MUSIC_LIBRARY.findIndex((t) => t.id === currentTrack.id);
          const next = MUSIC_LIBRARY[(idx + 1) % MUSIC_LIBRARY.length];
          setCurrentTrackId(next.id);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isMusicPlaying, currentTrack, musicVolume, settings.soundEnabled]);

  useEffect(() => {
    return () => ambientAudio.dispose();
  }, []);

  const loginUser = (profile: UserProfile) => {
    setUser(profile);
  };

  const logoutUser = () => {
    setIsMusicPlaying(false);
    ambientAudio.pause();
    setUser(null);
    setHasSeenWelcome(false);
  };

  const markWelcomeSeen = () => {
    setHasSeenWelcome(true);
  };

  const completeAssessment = (answers: AssessmentAnswer[]) => {
    const safeAnswers = answers.length > 0 ? answers : FALLBACK_DEMO_ANSWERS;
    const report = generateWellnessReport(safeAnswers);
    const schedule = generatePersonalizedSchedule(report);
    setAssessmentAnswers(safeAnswers);
    setCustomReport(report);
    setCustomSchedule(schedule);
    setHasCompletedAssessment(true);
    return report;
  };

  const resetAssessment = () => {
    setAssessmentAnswers([]);
    setHasCompletedAssessment(false);
  };

  const updateSchedulePreferences = (prefs: {
    preferredDays?: Weekday[];
    preferredTimeSlot?: PreferredTimeSlot;
    defaultDurationMinutes?: number;
    planAccepted?: boolean;
  }) => {
    const base = customSchedule ?? therapySchedule;
    const regenerated = generatePersonalizedSchedule(wellnessReport, {
      preferredDays: prefs.preferredDays ?? base.preferredDays,
      preferredTimeSlot: prefs.preferredTimeSlot ?? base.preferredTimeSlot,
      defaultDurationMinutes: prefs.defaultDurationMinutes ?? base.defaultDurationMinutes,
    });
    setCustomSchedule({
      ...regenerated,
      planAccepted: prefs.planAccepted ?? base.planAccepted,
    });
  };

  const toggleScheduledActivity = (activityId: string) => {
    const base = customSchedule ?? therapySchedule;
    setCustomSchedule({
      ...base,
      activities: base.activities.map((a) =>
        a.id === activityId ? { ...a, completed: !a.completed } : a
      ),
    });
  };

  const addSessionToHistory = (session: Omit<SessionHistoryItem, 'id' | 'isDemo'>) => {
    const entry: SessionHistoryItem = {
      ...session,
      id: `hist-${Date.now()}`,
      isDemo: true,
    };
    setSessionHistory((prev) => [entry, ...prev]);
  };

  const deleteAllHistory = () => {
    setSessionHistory([]);
    setCustomReport(null);
    setCustomSchedule(null);
    setAssessmentAnswers([]);
    setHasCompletedAssessment(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const addAssistantItem = (item: Omit<AssistantItem, 'id' | 'completed'>) => {
    setAssistantItems((prev) => [
      { ...item, id: `ast-${Date.now()}`, completed: false },
      ...prev,
    ]);
  };

  const toggleAssistantItem = (id: string) => {
    setAssistantItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    );
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const playTrack = (trackId?: string) => {
    if (trackId && trackId !== currentTrackId) {
      setCurrentTrackId(trackId);
      setMusicProgressSeconds(0);
    }
    setIsMusicPlaying(true);
  };

  const togglePlayPause = () => {
    setIsMusicPlaying((prev) => !prev);
  };

  const nextTrack = () => {
    const pool =
      selectedMusicCategory === 'all'
        ? MUSIC_LIBRARY
        : MUSIC_LIBRARY.filter((t) => t.category === selectedMusicCategory);
    const list = pool.length > 0 ? pool : MUSIC_LIBRARY;
    const idx = list.findIndex((t) => t.id === currentTrackId);
    const next = list[(idx + 1 + list.length) % list.length];
    setCurrentTrackId(next.id);
    setMusicProgressSeconds(0);
  };

  const prevTrack = () => {
    const pool =
      selectedMusicCategory === 'all'
        ? MUSIC_LIBRARY
        : MUSIC_LIBRARY.filter((t) => t.category === selectedMusicCategory);
    const list = pool.length > 0 ? pool : MUSIC_LIBRARY;
    const idx = list.findIndex((t) => t.id === currentTrackId);
    const prev = list[(idx - 1 + list.length) % list.length];
    setCurrentTrackId(prev.id);
    setMusicProgressSeconds(0);
  };

  const seekTrack = (seconds: number) => {
    setMusicProgressSeconds(Math.max(0, Math.min(currentTrack.durationSeconds, seconds)));
  };

  const setMusicVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setMusicVolumeState(clamped);
    ambientAudio.setVolume(clamped);
  };

  const playCalmingPreset = () => {
    setSelectedMusicCategory('calming');
    setCurrentTrackId(MUSIC_LIBRARY[0].id);
    setMusicProgressSeconds(0);
    setIsMusicPlaying(true);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        hasSeenWelcome,
        hasCompletedAssessment,
        assessmentAnswers,
        wellnessReport,
        hasCustomReport: Boolean(customReport),
        therapySchedule,
        sessionHistory,
        assistantItems,
        settings,
        tracks: MUSIC_LIBRARY,
        currentTrack,
        selectedMusicCategory,
        isMusicPlaying,
        musicProgressSeconds,
        musicVolume,
        loginUser,
        logoutUser,
        markWelcomeSeen,
        completeAssessment,
        resetAssessment,
        updateSchedulePreferences,
        toggleScheduledActivity,
        addSessionToHistory,
        deleteAllHistory,
        addAssistantItem,
        toggleAssistantItem,
        updateSettings,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        seekTrack,
        setMusicVolume,
        setMusicCategory: setSelectedMusicCategory,
        playCalmingPreset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

