interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onspeechstart: ((ev: Event) => void) | null;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((ev: Event) => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export interface RecognitionCallbacks {
  onStart?: () => void;
  onSpeechDetected?: () => void;
  onInterim?: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onAudioMetrics?: (level: number, bands: number[]) => void;
  onError?: (message: string, code?: string) => void;
  onEnd?: () => void;
}

class SpeechRecognitionManager {
  private recognition: SpeechRecognitionLike | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private meterFrame: number | null = null;
  private active = false;
  private silenceStopTimer: number | null = null;
  private latestInterim = '';

  public isActive(): boolean {
    return this.active;
  }

  public async start(callbacks: RecognitionCallbacks): Promise<boolean> {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      callbacks.onError?.(
        'Voice recognition is not supported in this browser. You can type or tap a response below.',
        'not-supported'
      );
      return false;
    }

    this.stop();
    this.active = true;
    this.latestInterim = '';

    // 1. Acquire live microphone stream for real waveform/orb audio levels & explicit permission check
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.startAudioMeter(this.mediaStream, callbacks.onAudioMetrics);
      } catch (err) {
        this.active = false;
        const name = err instanceof Error ? err.name : '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          callbacks.onError?.(
            'Microphone permission was denied. Please allow microphone access in your browser to talk with SOVIA.',
            'permission-denied'
          );
          return false;
        }
        // Continue with SpeechRecognition even if AudioContext analyser wasn't available
      }
    }

    if (!this.active) return false;

    // 2. Start Web Speech Recognition
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    this.recognition = recognition;

    let finalEmitted = false;

    recognition.onstart = () => {
      if (!this.active) return;
      callbacks.onStart?.();
    };

    recognition.onspeechstart = () => {
      if (!this.active) return;
      callbacks.onSpeechDetected?.();
    };

    recognition.onresult = (event) => {
      if (!this.active) return;
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const piece = res[0]?.transcript ?? '';
        if (res.isFinal) {
          finalText += piece;
        } else {
          interimText += piece;
        }
      }

      if (interimText.trim()) {
        this.latestInterim = interimText.trim();
        callbacks.onInterim?.(this.latestInterim);
        callbacks.onSpeechDetected?.();

        // Safety flush if user stops speaking and browser waits before finalizing
        if (this.silenceStopTimer !== null) window.clearTimeout(this.silenceStopTimer);
        this.silenceStopTimer = window.setTimeout(() => {
          if (this.active && !finalEmitted && this.latestInterim) {
            try {
              recognition.stop();
            } catch {
              // Ignore
            }
          }
        }, 1800);
      }

      if (finalText.trim() && !finalEmitted) {
        finalEmitted = true;
        this.latestInterim = '';
        if (this.silenceStopTimer !== null) {
          window.clearTimeout(this.silenceStopTimer);
          this.silenceStopTimer = null;
        }
        this.cleanup();
        callbacks.onFinal(finalText.trim());
      }
    };

    recognition.onerror = (event) => {
      if (!this.active) return;
      const errCode = event.error;
      if (errCode === 'aborted') return;

      if (errCode === 'no-speech') {
        this.cleanup();
        callbacks.onEnd?.();
        return;
      }

      this.cleanup();
      if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
        callbacks.onError?.(
          'Microphone access is blocked. Enable microphone permissions to speak with SOVIA.',
          errCode
        );
      } else {
        callbacks.onError?.(
          'Could not capture speech clearly—please try speaking again or use text input.',
          errCode
        );
      }
    };

    recognition.onend = () => {
      if (this.silenceStopTimer !== null) {
        window.clearTimeout(this.silenceStopTimer);
        this.silenceStopTimer = null;
      }
      if (this.active && !finalEmitted && this.latestInterim) {
        finalEmitted = true;
        const text = this.latestInterim;
        this.latestInterim = '';
        this.cleanup();
        callbacks.onFinal(text);
        return;
      }
      if (this.active) {
        this.cleanup();
        callbacks.onEnd?.();
      }
    };

    try {
      recognition.start();
      return true;
    } catch {
      this.cleanup();
      callbacks.onError?.('Unable to start microphone recognition.', 'start-failed');
      return false;
    }
  }

  public stop(): void {
    this.active = false;
    this.latestInterim = '';
    if (this.silenceStopTimer !== null) {
      window.clearTimeout(this.silenceStopTimer);
      this.silenceStopTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore
      }
      this.recognition = null;
    }
    this.cleanupAudio();
  }

  private cleanup(): void {
    this.active = false;
    this.recognition = null;
    this.cleanupAudio();
  }

  private startAudioMeter(
    stream: MediaStream,
    onMetrics?: (level: number, bands: number[]) => void
  ): void {
    if (!onMetrics) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);

      this.audioContext = ctx;
      this.analyser = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);

      const sample = () => {
        if (!this.active || !this.analyser) {
          onMetrics(0, []);
          return;
        }
        this.analyser.getByteFrequencyData(data);

        let sum = 0;
        const bandCount = 24;
        const bands: number[] = [];
        for (let i = 0; i < bandCount; i++) {
          const bin = data[i % data.length] ?? 0;
          const norm = Math.min(1, bin / 185);
          bands.push(norm);
          sum += norm;
        }
        const avgLevel = Math.min(1, (sum / bandCount) * 1.45);
        onMetrics(avgLevel, bands);
        this.meterFrame = requestAnimationFrame(sample);
      };

      this.meterFrame = requestAnimationFrame(sample);
    } catch {
      // Fail silently if Web Audio analyser cannot attach
    }
  }

  private cleanupAudio(): void {
    if (this.meterFrame !== null) {
      cancelAnimationFrame(this.meterFrame);
      this.meterFrame = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      void this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
  }
}

export const speechRecognitionManager = new SpeechRecognitionManager();
