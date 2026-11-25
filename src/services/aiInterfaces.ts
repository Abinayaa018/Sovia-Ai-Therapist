import type {
  AssessmentAnswer,
  ConversationTurn,
  MusicTrack,
  TherapySchedule,
  UserProfile,
  WellnessReport,
} from '../types';

/**
 * Clean service interfaces designed for future real-time AI, voice, emotion,
 * persistence, and external integration adapters.
 * Currently backed by local simulated demo implementations.
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceAIService {
  readonly mode: 'demo_simulated' | 'live_realtime';
  connectSession(sessionId: string): Promise<void>;
  disconnectSession(): Promise<void>;
  sendUserUtterance(text: string, context?: ConversationTurn[]): Promise<string>;
}

export interface SpeechRecognitionService {
  isSupported(): boolean;
  startListening(onResult: (result: SpeechRecognitionResult) => void): Promise<void>;
  stopListening(): Promise<void>;
}

export interface VoiceGenerationService {
  synthesizeAndPlay(text: string, voiceId: string, speed: number): Promise<void>;
  stopPlayback(): void;
}

export interface EmotionAnalysisSnapshot {
  source: 'facial' | 'vocal' | 'text';
  dominantLabel: string;
  confidence: number;
  isSimulated: boolean;
  timestamp: string;
}

export interface FacialEmotionAnalyzer {
  isOptedIn(): boolean;
  analyzeFrame(videoElement: HTMLVideoElement): Promise<EmotionAnalysisSnapshot | null>;
}

export interface VocalEmotionAnalyzer {
  analyzeAudioChunk(buffer: Float32Array): Promise<EmotionAnalysisSnapshot | null>;
}

export interface TextEmotionAnalyzer {
  analyzeText(text: string): Promise<EmotionAnalysisSnapshot>;
}

export interface WellnessRecommendationEngine {
  generateReport(answers: AssessmentAnswer[]): Promise<WellnessReport>;
  buildSchedule(report: WellnessReport): Promise<TherapySchedule>;
}

export interface AuthService {
  signInWithEmail(email: string, password: string): Promise<UserProfile>;
  signUpWithEmail(name: string, email: string, password: string): Promise<UserProfile>;
  signInWithGoogle(): Promise<UserProfile>;
  signOut(): Promise<void>;
}

export interface PersistenceService {
  saveState<T>(key: string, value: T): Promise<void>;
  loadState<T>(key: string): Promise<T | null>;
  clearAll(): Promise<void>;
}

export interface CalendarIntegrationService {
  exportScheduleToCalendar(schedule: TherapySchedule): Promise<{ exportedCount: number }>;
}

export interface MusicIntegrationService {
  listTracks(): Promise<MusicTrack[]>;
}

export const AI_INTEGRATION_STATUS = {
  voiceAI: 'Interactive Conversational Engine (Local)',
  speechRecognition: 'Browser SpeechRecognition + Web Audio Analyser',
  voiceGeneration: 'Browser SpeechSynthesis TTS (Natural Voice Selection)',
  facialEmotion: 'Disabled (Opt-In Future Adapter)',
  vocalEmotion: 'Live Mic Level + Future Affect Adapter',
  textEmotion: 'Rule-Based Empathy Classifier',
  persistence: 'Local Browser Storage',
} as const;

