import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  isSpeechRecognitionSupported,
  speechRecognitionManager,
} from '../services/speechRecognitionService';
import {
  isSpeechSynthesisSupported,
  speechService,
} from '../services/speechService';

export interface UseSoviaVoiceOptions {
  autoListenAfterSpeak?: boolean;
  onUserSpeech?: (transcript: string) => void;
  onSentenceStart?: (index: number, sentence: string) => void;
}

export function useSoviaVoice(options: UseSoviaVoiceOptions = {}) {
  const { settings, updateSettings } = useApp();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyBands, setFrequencyBands] = useState<number[]>([]);
  const [micError, setMicError] = useState<string | null>(null);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const isMuted = !settings.soundEnabled;
  const speechSupported = isSpeechSynthesisSupported();
  const recognitionSupported = isSpeechRecognitionSupported();

  // Keep refs of live settings for async callbacks
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const stopSpeaking = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
    setAudioLevel(0);
    setFrequencyBands([]);
  }, []);

  const stopListening = useCallback(() => {
    speechRecognitionManager.stop();
    setIsListening(false);
    setInterimTranscript('');
    setAudioLevel(0);
    setFrequencyBands([]);
  }, []);

  const startListening = useCallback(async () => {
    // Interrupt Sovia immediately when user begins speaking / activates mic
    if (speechService.isSpeaking()) {
      speechService.stop();
      setIsSpeaking(false);
    }

    setMicError(null);
    setInterimTranscript('');

    const started = await speechRecognitionManager.start({
      onStart: () => {
        setIsListening(true);
        updateSettings({ microphoneGranted: true });
      },
      onSpeechDetected: () => {
        if (speechService.isSpeaking()) {
          speechService.stop();
          setIsSpeaking(false);
        }
      },
      onInterim: (text) => {
        setInterimTranscript(text);
      },
      onFinal: (transcript) => {
        setIsListening(false);
        setInterimTranscript('');
        setAudioLevel(0);
        setFrequencyBands([]);
        optionsRef.current.onUserSpeech?.(transcript);
      },
      onAudioMetrics: (level, bands) => {
        setAudioLevel(level);
        setFrequencyBands(bands);
      },
      onError: (msg, code) => {
        setIsListening(false);
        setInterimTranscript('');
        setAudioLevel(0);
        setFrequencyBands([]);
        if (code === 'permission-denied' || code === 'not-allowed') {
          updateSettings({ microphoneGranted: false });
        }
        setMicError(msg);
      },
      onEnd: () => {
        setIsListening(false);
        setInterimTranscript('');
        setAudioLevel(0);
        setFrequencyBands([]);
      },
    });

    if (!started) {
      setIsListening(false);
    }
    return started;
  }, [updateSettings]);

  const speak = useCallback(
    (
      text: string,
      speakOpts?: {
        force?: boolean;
        onEnd?: () => void;
        onSentenceStart?: (index: number, sentence: string) => void;
      }
    ) => {
      const clean = text.trim();
      if (!clean) return;

      setLastSpokenText(clean);

      // Pause active microphone listening while Sovia speaks to prevent echo
      if (speechRecognitionManager.isActive()) {
        speechRecognitionManager.stop();
        setIsListening(false);
      }

      if (!settingsRef.current.soundEnabled && !speakOpts?.force) {
        setIsSpeaking(false);
        speakOpts?.onEnd?.();
        return;
      }

      if (!speechSupported) {
        setIsSpeaking(false);
        speakOpts?.onEnd?.();
        return;
      }

      setNeedsAudioUnlock(false);

      speechService.speak(clean, {
        voiceId: settingsRef.current.voiceId,
        speed: settingsRef.current.voiceSpeed,
        onStart: () => {
          setIsSpeaking(true);
        },
        onSentenceStart: (idx, sentence) => {
          optionsRef.current.onSentenceStart?.(idx, sentence);
          speakOpts?.onSentenceStart?.(idx, sentence);
        },
        onAudioLevel: (lvl) => {
          setAudioLevel(lvl);
          if (lvl > 0) {
            // Derive subtle speech spectrum envelope from real boundary cadence
            const bands = Array.from({ length: 24 }, (_, i) => {
              const wave = 0.5 + 0.5 * Math.sin(performance.now() * 0.012 + i * 0.65);
              return Math.min(1, lvl * (0.45 + 0.55 * wave));
            });
            setFrequencyBands(bands);
          } else {
            setFrequencyBands([]);
          }
        },
        onEnd: () => {
          setIsSpeaking(false);
          setAudioLevel(0);
          setFrequencyBands([]);
          speakOpts?.onEnd?.();

          if (
            optionsRef.current.autoListenAfterSpeak &&
            settingsRef.current.microphoneGranted &&
            isSpeechRecognitionSupported()
          ) {
            void startListening();
          }
        },
        onBlocked: () => {
          setIsSpeaking(false);
          setAudioLevel(0);
          setFrequencyBands([]);
          setNeedsAudioUnlock(true);
        },
      });
    },
    [speechSupported, startListening]
  );

  const replayLast = useCallback(() => {
    if (!lastSpokenText) return;
    if (!settingsRef.current.soundEnabled) {
      updateSettings({ soundEnabled: true });
    }
    speak(lastSpokenText, { force: true });
  }, [lastSpokenText, speak, updateSettings]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      void startListening();
    }
  }, [isListening, startListening, stopListening]);

  const toggleMute = useCallback(() => {
    const nextEnabled = !settingsRef.current.soundEnabled;
    updateSettings({ soundEnabled: nextEnabled });
    if (!nextEnabled) {
      stopSpeaking();
    }
  }, [stopSpeaking, updateSettings]);

  useEffect(() => {
    return () => {
      speechService.stop();
      speechRecognitionManager.stop();
    };
  }, []);

  return {
    isSpeaking,
    isListening,
    isMuted,
    speechSupported,
    recognitionSupported,
    interimTranscript,
    audioLevel,
    frequencyBands,
    micError,
    needsAudioUnlock,
    lastSpokenText,
    voiceName: speechService.getSelectedVoiceName(),
    speak,
    stopSpeaking,
    replayLast,
    startListening,
    stopListening,
    toggleListening,
    toggleMute,
    clearMicError: () => setMicError(null),
  };
}
