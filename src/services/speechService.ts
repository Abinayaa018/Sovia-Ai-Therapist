import type { UserSettings } from '../types';

export interface SpeakOptions {
  voiceId?: UserSettings['voiceId'];
  speed?: number;
  onStart?: () => void;
  onSentenceStart?: (sentenceIndex: number, sentence: string) => void;
  onAudioLevel?: (level: number) => void;
  onEnd?: () => void;
  onBlocked?: () => void;
}

const PREFERRED_FEMALE_VOICE_PATTERNS: RegExp[] = [
  /microsoft\s+(ava|aria|jenny|emma|sonia|libby|clara).*natural/i,
  /natural.*(ava|aria|jenny|emma|sonia|female)/i,
  /google\s+uk\s+english\s+female/i,
  /google\s+us\s+english/i,
  /\b(ava|aria|jenny|samantha|allison|victoria|serena|sonia|karen|moira|tessa|emma)\b/i,
  /microsoft\s+(zira|hazel|susan|catherine)/i,
  /female|woman/i,
];

const AVOID_VOICE_PATTERNS = /\b(david|mark|george|daniel|alex|fred|thomas|richard|male)\b/i;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function splitIntoSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const matches = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return (matches ?? [cleaned]).map((s) => s.trim()).filter(Boolean);
}

class SpeechService {
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private activeToken = 0;
  private speaking = false;
  private keepAliveTimer: number | null = null;
  private decayFrame: number | null = null;
  private pauseTimer: number | null = null;
  private currentLevel = 0;
  private levelCallback: ((level: number) => void) | null = null;

  constructor() {
    if (isSpeechSynthesisSupported()) {
      this.refreshVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        this.refreshVoices();
      });
    }
  }

  public refreshVoices(): SpeechSynthesisVoice | null {
    if (!isSpeechSynthesisSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const englishVoices = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    for (const pattern of PREFERRED_FEMALE_VOICE_PATTERNS) {
      const match = pool.find((v) => pattern.test(v.name) && !AVOID_VOICE_PATTERNS.test(v.name));
      if (match) {
        this.selectedVoice = match;
        return match;
      }
    }

    const nonMale = pool.find((v) => !AVOID_VOICE_PATTERNS.test(v.name));
    this.selectedVoice = nonMale ?? pool[0] ?? null;
    return this.selectedVoice;
  }

  public getSelectedVoiceName(): string {
    if (!this.selectedVoice) this.refreshVoices();
    return this.selectedVoice?.name ?? 'Browser Default Voice';
  }

  public isSpeaking(): boolean {
    return this.speaking;
  }

  public stop(): void {
    this.activeToken += 1;
    this.speaking = false;
    this.currentLevel = 0;
    this.clearTimers();

    if (this.levelCallback) {
      this.levelCallback(0);
      this.levelCallback = null;
    }

    if (isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancellation errors
      }
    }
  }

  public speak(text: string, options: SpeakOptions = {}): void {
    if (!isSpeechSynthesisSupported()) {
      options.onStart?.();
      options.onEnd?.();
      return;
    }

    const sentences = splitIntoSentences(text);
    if (sentences.length === 0) {
      options.onEnd?.();
      return;
    }

    // Cancel any active speech so multiple responses never overlap
    this.stop();

    const token = ++this.activeToken;
    this.levelCallback = options.onAudioLevel ?? null;

    const voice = this.selectedVoice ?? this.refreshVoices();
    const baseRate = options.speed ?? 1.0;
    const personaRate =
      options.voiceId === 'sovia_calm'
        ? baseRate * 0.91
        : options.voiceId === 'sovia_clarity'
          ? baseRate * 0.99
          : baseRate * 0.95;

    const personaPitch =
      options.voiceId === 'sovia_calm'
        ? 0.99
        : options.voiceId === 'sovia_clarity'
          ? 1.02
          : 1.05;

    const startLevelLoop = () => {
      if (this.decayFrame !== null) cancelAnimationFrame(this.decayFrame);
      const tick = () => {
        if (this.activeToken !== token || !this.speaking) {
          this.currentLevel = 0;
          this.levelCallback?.(0);
          return;
        }
        // Maintain gentle natural vocal floor + boundary spikes while actively speaking
        const floor = 0.24 + 0.14 * Math.abs(Math.sin(performance.now() * 0.009));
        this.currentLevel = Math.max(floor, this.currentLevel * 0.88);
        this.levelCallback?.(Math.min(1, this.currentLevel));
        this.decayFrame = requestAnimationFrame(tick);
      };
      this.decayFrame = requestAnimationFrame(tick);
    };

    // Chrome bug safeguard: prevents SpeechSynthesis from stalling on longer responses
    this.keepAliveTimer = window.setInterval(() => {
      if (this.activeToken === token && window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 8000);

    let notifiedStart = false;

    const speakSentenceAt = (index: number) => {
      if (this.activeToken !== token) return;

      if (index >= sentences.length) {
        this.speaking = false;
        this.currentLevel = 0;
        this.clearTimers();
        this.levelCallback?.(0);
        options.onEnd?.();
        return;
      }

      const sentence = sentences[index];
      const utterance = new SpeechSynthesisUtterance(sentence);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }
      utterance.rate = Math.max(0.75, Math.min(1.35, personaRate));
      utterance.pitch = personaPitch;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        if (this.activeToken !== token) return;
        this.speaking = true;
        if (!notifiedStart) {
          notifiedStart = true;
          options.onStart?.();
          startLevelLoop();
        }
        this.currentLevel = 0.65;
        options.onSentenceStart?.(index, sentence);
      };

      utterance.onboundary = (event) => {
        if (this.activeToken !== token) return;
        // Pulse speech intensity on actual word/sentence boundaries
        this.currentLevel = event.name === 'sentence' ? 0.85 : 0.72 + Math.random() * 0.25;
      };

      utterance.onend = () => {
        if (this.activeToken !== token) return;
        this.currentLevel = 0.12;
        // Natural conversational breath pause between sentences
        const pauseMs = index < sentences.length - 1 ? 190 : 40;
        this.pauseTimer = window.setTimeout(() => {
          speakSentenceAt(index + 1);
        }, pauseMs);
      };

      utterance.onerror = (event) => {
        if (this.activeToken !== token) return;
        if (event.error === 'interrupted' || event.error === 'canceled') {
          return;
        }
        this.speaking = false;
        this.currentLevel = 0;
        this.clearTimers();
        this.levelCallback?.(0);
        if (event.error === 'not-allowed') {
          options.onBlocked?.();
        } else {
          options.onEnd?.();
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        this.speaking = false;
        this.clearTimers();
        options.onBlocked?.();
      }
    };

    speakSentenceAt(0);
  }

  private clearTimers(): void {
    if (this.keepAliveTimer !== null) {
      window.clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (this.pauseTimer !== null) {
      window.clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    if (this.decayFrame !== null) {
      cancelAnimationFrame(this.decayFrame);
      this.decayFrame = null;
    }
  }
}

export const speechService = new SpeechService();
