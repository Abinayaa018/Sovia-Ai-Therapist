export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type AssessmentDimension =
  | 'emotional_state'
  | 'stress_level'
  | 'anxiety_worry'
  | 'sleep_quality'
  | 'energy_motivation'
  | 'concentration'
  | 'social_connection'
  | 'pressure_source'
  | 'coping_mechanisms'
  | 'wellness_goals';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  joinedAt: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  tone?: 'positive' | 'neutral' | 'elevated' | 'heavy';
  tags: string[];
  empathyBridge: string;
}

export interface AssessmentQuestion {
  id: string;
  dimension: AssessmentDimension;
  prompt: string;
  subtext?: string;
  options: QuestionOption[];
  allowCustomInput?: boolean;
}

export interface AssessmentAnswer {
  questionId: string;
  dimension: AssessmentDimension;
  selectedOptionId?: string;
  answerText: string;
  tags: string[];
  isCustomText: boolean;
  empathyResponse: string;
}

export interface MoodDistributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface RadarDimensionPoint {
  axis: string;
  score: number;
  baseline: number;
}

export interface WeeklyTrendPoint {
  day: string;
  calm: number;
  stress: number;
  energy: number;
}

export interface WellnessReport {
  id: string;
  generatedAt: string;
  isDemoData: true;
  disclaimer: string;
  moodSummary: string;
  moodTone: 'balanced' | 'elevated_stress' | 'low_energy' | 'anxious';
  metrics: {
    stressLevel: number;
    anxietyIndicator: number;
    energyLevel: number;
    sleepQuality: number;
    motivation: number;
    emotionalBalance: number;
  };
  moodDistribution: MoodDistributionPoint[];
  radarDimensions: RadarDimensionPoint[];
  weeklyTrend: WeeklyTrendPoint[];
  aiInsight: string;
  strengths: string[];
  focusAreas: string[];
  recommendations: {
    title: string;
    description: string;
    category: 'breathing' | 'sleep' | 'mindfulness' | 'routine' | 'connection';
    durationMin: number;
  }[];
  primaryTheme: string;
}

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type PreferredTimeSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface ScheduledActivity {
  id: string;
  day: Weekday;
  time: string;
  title: string;
  category: 'breathing' | 'stress' | 'mindfulness' | 'reflection' | 'sleep' | 'habits';
  durationMinutes: number;
  completed: boolean;
  aiReason: string;
}

export interface TherapySchedule {
  recommendedFrequencyPerWeek: number;
  defaultDurationMinutes: number;
  preferredDays: Weekday[];
  preferredTimeSlot: PreferredTimeSlot;
  preferredTimeExact: string;
  planAccepted: boolean;
  activities: ScheduledActivity[];
}

export type TherapyActivityType =
  | 'guided_breathing'
  | 'grounding'
  | 'mindfulness'
  | 'journaling'
  | 'relaxation';

export interface ConversationTurn {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  emotionLabel?: string;
}

export interface SessionHistoryItem {
  id: string;
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number;
  theme: string;
  moodBefore: string;
  moodAfter: string;
  moodScoreBefore: number;
  moodScoreAfter: number;
  personalReflection: string;
  aiSummary: string;
  isDemo: boolean;
  highlights: string[];
}

export type MusicCategory = 'calming' | 'focus' | 'sleep' | 'meditation';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: MusicCategory;
  durationSeconds: number;
  bpm: number;
  baseFreq: number;
  chordFreqs: number[];
  gradientFrom: string;
  gradientTo: string;
  description: string;
}

export interface AssistantItem {
  id: string;
  type: 'reminder' | 'day_plan' | 'study_routine';
  title: string;
  timeLabel: string;
  details: string;
  completed: boolean;
}

export interface UserSettings {
  voiceId: 'sovia_warm' | 'sovia_calm' | 'sovia_clarity';
  voiceSpeed: number;
  soundEnabled: boolean;
  showTranscript: boolean;
  microphoneGranted: boolean;
  cameraEnabled: boolean; // Must stay false unless explicitly enabled by user
  ambientParticles: boolean;
  saveLocalHistory: boolean;
}

