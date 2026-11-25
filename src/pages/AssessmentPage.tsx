import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  SkipForward,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AiOrb3D } from '../components/AiOrb3D';
import { AmbientBackdrop } from '../components/AmbientBackdrop';
import { VoiceWaveform } from '../components/VoiceWaveform';
import { useApp } from '../context/AppContext';
import {
  MAX_ASSESSMENT_QUESTIONS,
  estimateRemainingQuestions,
  inferTagsFromCustomText,
  selectNextQuestion,
} from '../engine/assessmentEngine';
import { useSoviaVoice } from '../hooks/useSoviaVoice';
import type { AssessmentAnswer, OrbState, QuestionOption } from '../types';

const SPEED_OPTIONS = [0.9, 1.0, 1.1];

export const AssessmentPage: React.FC = () => {
  const { completeAssessment, markWelcomeSeen, settings, updateSettings } = useApp();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [customText, setCustomText] = useState('');
  const [lastHeardText, setLastHeardText] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [autoListenEnabled, setAutoListenEnabled] = useState(true);

  const currentQuestion = useMemo(() => selectNextQuestion(answers), [answers]);
  const estimatedTotal = useMemo(
    () =>
      Math.min(
        MAX_ASSESSMENT_QUESTIONS,
        Math.max(answers.length + 1, estimateRemainingQuestions(answers))
      ),
    [answers]
  );

  const lastAnswer = answers[answers.length - 1];
  const currentQuestionRef = useRef(currentQuestion);
  currentQuestionRef.current = currentQuestion;
  const thinkTimerRef = useRef<number | null>(null);
  const lastSpokenQuestionKeyRef = useRef<string>('');

  const submitAnswer = useCallback((nextAnswer: AssessmentAnswer) => {
    setIsThinking(true);
    setCustomText('');

    if (thinkTimerRef.current !== null) {
      window.clearTimeout(thinkTimerRef.current);
    }
    thinkTimerRef.current = window.setTimeout(() => {
      setIsThinking(false);
      setAnswers((prev) => [...prev, nextAnswer]);
    }, 360);
  }, []);

  const processSpokenOrTypedText = useCallback(
    (rawText: string, fromVoice: boolean) => {
      const q = currentQuestionRef.current;
      const clean = rawText.trim();
      if (!q || !clean) return;

      if (fromVoice) {
        setLastHeardText(clean);
      }

      const lower = clean.toLowerCase();
      const matchedOption = q.options.find((opt) => {
        const optLower = opt.label.toLowerCase();
        return lower === optLower || (lower.length > 4 && optLower.includes(lower));
      });

      if (matchedOption) {
        submitAnswer({
          questionId: q.id,
          dimension: q.dimension,
          selectedOptionId: matchedOption.id,
          answerText: fromVoice ? clean : matchedOption.label,
          tags: matchedOption.tags,
          isCustomText: fromVoice,
          empathyResponse: matchedOption.empathyBridge,
        });
        return;
      }

      const { tags, empathyBridge } = inferTagsFromCustomText(clean);
      submitAnswer({
        questionId: q.id,
        dimension: q.dimension,
        answerText: clean,
        tags,
        isCustomText: true,
        empathyResponse: empathyBridge,
      });
    },
    [submitAnswer]
  );

  const {
    isSpeaking,
    isListening,
    isMuted,
    recognitionSupported,
    interimTranscript,
    audioLevel,
    frequencyBands,
    micError,
    needsAudioUnlock,
    speak,
    stopSpeaking,
    replayLast,
    startListening,
    stopListening,
    toggleMute,
    clearMicError,
  } = useSoviaVoice({
    autoListenAfterSpeak: autoListenEnabled,
    onUserSpeech: (transcript) => {
      processSpokenOrTypedText(transcript, true);
    },
  });

  useEffect(() => {
    markWelcomeSeen();
    return () => {
      if (thinkTimerRef.current !== null) window.clearTimeout(thinkTimerRef.current);
    };
  }, [markWelcomeSeen]);

  // Speak each adaptive question aloud automatically when it appears (StrictMode-safe)
  useEffect(() => {
    if (!currentQuestion || isCompleting || isThinking) return;
    const key = `${currentQuestion.id}:${answers.length}`;
    if (lastSpokenQuestionKeyRef.current === key) return;
    lastSpokenQuestionKeyRef.current = key;

    const fullSpeech = lastAnswer?.empathyResponse
      ? `${lastAnswer.empathyResponse} ${currentQuestion.prompt}`
      : currentQuestion.prompt;

    speak(fullSpeech);
    return () => {
      lastSpokenQuestionKeyRef.current = '';
    };
  }, [currentQuestion, answers.length, lastAnswer?.empathyResponse, isCompleting, isThinking, speak]);

  const completingTriggeredRef = useRef(false);

  // Complete assessment automatically when branching engine finishes
  useEffect(() => {
    if (currentQuestion === null && answers.length > 0 && !completingTriggeredRef.current) {
      completingTriggeredRef.current = true;
      setIsCompleting(true);
      stopListening();
      let navigated = false;
      const finish = () => {
        if (navigated) return;
        navigated = true;
        completeAssessment(answers);
        navigate('/report');
      };

      speak(
        "Thank you for sharing openly with me. I'm weaving your reflections into a personalized wellness report now.",
        { onEnd: finish }
      );

      // Safety navigation fallback if speech synthesis is muted or disabled
      const fallbackNav = window.setTimeout(finish, 6500);
      return () => {
        completingTriggeredRef.current = false;
        window.clearTimeout(fallbackNav);
      };
    }
  }, [currentQuestion, answers, completeAssessment, navigate, speak, stopListening]);

  const handleSelectOption = (option: QuestionOption) => {
    if (!currentQuestion) return;
    stopSpeaking();
    stopListening();
    setLastHeardText(null);
    submitAnswer({
      questionId: currentQuestion.id,
      dimension: currentQuestion.dimension,
      selectedOptionId: option.id,
      answerText: option.label,
      tags: option.tags,
      isCustomText: false,
      empathyResponse: option.empathyBridge,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !customText.trim()) return;
    stopSpeaking();
    stopListening();
    setLastHeardText(null);
    processSpokenOrTypedText(customText, false);
  };

  const handleBack = () => {
    stopSpeaking();
    stopListening();
    lastSpokenQuestionKeyRef.current = '';
    setLastHeardText(null);
    if (answers.length === 0) {
      navigate('/welcome');
      return;
    }
    setAnswers((prev) => prev.slice(0, -1));
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    stopSpeaking();
    stopListening();
    setLastHeardText(null);
    submitAnswer({
      questionId: currentQuestion.id,
      dimension: currentQuestion.dimension,
      answerText: 'Skipped for now',
      tags: ['skipped'],
      isCustomText: false,
      empathyResponse: "That's completely okay—we can move softly to the next reflection.",
    });
  };

  const handleMicToggle = () => {
    clearMicError();
    if (isListening) {
      setAutoListenEnabled(false);
      stopListening();
    } else {
      setAutoListenEnabled(true);
      // Interrupts Sovia immediately if she is speaking
      void startListening();
    }
  };

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(Number(settings.voiceSpeed.toFixed(1)));
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    updateSettings({ voiceSpeed: next });
  };

  const orbState: OrbState =
    isCompleting || isThinking
      ? 'thinking'
      : isListening
        ? 'listening'
        : isSpeaking
          ? 'speaking'
          : isMuted
            ? 'muted'
            : 'idle';

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-8 overflow-hidden">
      <AmbientBackdrop intensity="cinematic" />

      {/* Top Bar with Back, Progress & Skip */}
      <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:border-white/25 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-cyan-200">
            {isCompleting
              ? 'Synthesizing reflections...'
              : `Question ${Math.min(answers.length + 1, MAX_ASSESSMENT_QUESTIONS)} of ${estimatedTotal}`}
          </span>
          <div className="mt-1.5 flex items-center gap-1.5">
            {Array.from({ length: estimatedTotal }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < answers.length
                    ? 'w-4 bg-cyan-400'
                    : i === answers.length
                      ? 'w-6 bg-indigo-400'
                      : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          disabled={!currentQuestion || isCompleting}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:border-white/25 hover:text-white transition cursor-pointer disabled:opacity-40"
        >
          <span>Skip</span>
          <SkipForward className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Conversational Centerpiece */}
      <main className="relative z-10 mx-auto my-auto flex w-full max-w-4xl flex-col items-center py-4">
        <div className="flex flex-col items-center">
          <AiOrb3D state={orbState} audioLevel={audioLevel} size="md" />
          <VoiceWaveform
            state={orbState}
            audioLevel={audioLevel}
            frequencyBands={frequencyBands}
            bars={24}
            className="mt-1"
          />
          <span className="mt-1 text-[11px] uppercase tracking-[0.22em] text-indigo-300/80">
            {isCompleting
              ? 'SOVIA is creating your wellness insights'
              : orbState === 'listening'
                ? 'Listening to your voice'
                : orbState === 'speaking'
                  ? 'SOVIA is speaking'
                  : orbState === 'thinking'
                    ? 'Reflecting'
                    : orbState === 'muted'
                      ? 'Voice muted'
                      : 'Tap mic or speak to respond'}
          </span>

          {/* Voice Controls Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition cursor-pointer ${
                isMuted
                  ? 'border-rose-400/35 bg-rose-500/15 text-rose-200'
                  : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/40'
              }`}
            >
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3 text-cyan-300" />}
              <span>{isMuted ? 'Muted' : 'Voice On'}</span>
            </button>

            <button
              type="button"
              onClick={replayLast}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-slate-300 hover:border-cyan-400/40 transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3 text-cyan-300" />
              <span>Replay</span>
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-1 text-[11px] text-amber-200 hover:bg-amber-400/20 transition cursor-pointer"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
                <span>Interrupt</span>
              </button>
            )}

            <button
              type="button"
              onClick={cycleSpeed}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-400/40 transition cursor-pointer"
              title="Adjust voice speed"
            >
              {settings.voiceSpeed.toFixed(1)}x
            </button>
          </div>

          {needsAudioUnlock && currentQuestion && (
            <button
              type="button"
              onClick={replayLast}
              className="mt-2.5 flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3.5 py-1 text-xs text-cyan-200 cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Tap to hear Sovia</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isCompleting ? (
            <motion.div
              key="completing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 glass-panel glow-border rounded-3xl p-8 text-center max-w-xl"
            >
              <Sparkles className="mx-auto h-7 w-7 text-cyan-300 animate-pulse" />
              <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-white">
                Thank you for sharing openly with me.
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                I'm weaving your reflections into a personalized emotional wellness report and a
                gentle weekly rhythm.
              </p>
            </motion.div>
          ) : (
            currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.38 }}
                className="mt-5 w-full max-w-2xl"
              >
                {/* AI Empathetic Bridge + Spoken Subtitles */}
                <div className="glass-panel glow-border rounded-3xl p-6 sm:p-7 text-center">
                  {lastAnswer?.empathyResponse && (
                    <p className="mb-3 text-sm text-cyan-200/90 italic font-serif sm:text-base">
                      "{lastAnswer.empathyResponse}"
                    </p>
                  )}
                  <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug">
                    {currentQuestion.prompt}
                  </h2>
                  {currentQuestion.subtext && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-400">
                      {currentQuestion.subtext}
                    </p>
                  )}
                </div>

                {/* Live Recognized Speech Feedback */}
                {(interimTranscript || lastHeardText) && (
                  <div className="mt-3 text-center">
                    <span className="inline-block rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-xs text-cyan-100">
                      {interimTranscript
                        ? `Hearing: "${interimTranscript}..."`
                        : `You said: "${lastHeardText}"`}
                    </span>
                  </div>
                )}

                {micError && (
                  <p className="mt-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">
                    {micError}
                  </p>
                )}

                {!recognitionSupported && !micError && (
                  <p className="mt-3 text-center text-[11px] text-slate-400">
                    Live speech recognition is unavailable in this browser—Sovia still speaks aloud,
                    and you can tap an option or type below.
                  </p>
                )}

                {/* Voice-first Primary Microphone Callout + Accessible Chips */}
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  {currentQuestion.options.map((opt, idx) => (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.045 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-100 hover:border-cyan-400/50 hover:bg-indigo-500/15 hover:text-white transition cursor-pointer shadow-sm"
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>

                {/* Real Microphone Button + Optional Text Input */}
                <form
                  onSubmit={handleCustomSubmit}
                  className="mt-5 flex items-center gap-2.5 rounded-full border border-white/12 bg-slate-950/65 p-1.5 pl-2.5 backdrop-blur-xl focus-within:border-cyan-400/50"
                >
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
                      isListening
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.65)] animate-pulse'
                        : 'bg-indigo-500/25 border border-indigo-400/35 text-cyan-200 hover:bg-cyan-400/25'
                    }`}
                    aria-label={isListening ? 'Stop listening' : 'Speak your answer'}
                    title={
                      isListening
                        ? 'Listening... click to stop'
                        : isSpeaking
                          ? 'Interrupt Sovia and speak'
                          : 'Speak your answer'
                    }
                  >
                    {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>

                  <input
                    type="text"
                    value={interimTranscript || customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={
                      isListening
                        ? 'Listening... speak naturally into your microphone'
                        : 'Speak with the mic, tap an option, or type here...'
                    }
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none px-2"
                  />

                  <button
                    type="submit"
                    disabled={!customText.trim()}
                    className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 text-xs font-semibold text-slate-950 disabled:opacity-35 hover:brightness-110 transition cursor-pointer"
                  >
                    <span className="hidden sm:inline">Send</span>
                    {customText.trim() ? (
                      <Send className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                </form>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 text-center text-[11px] text-slate-500">
        Voice-first adaptive check-in · Non-clinical reflection · Maximum 10 questions
      </footer>
    </div>
  );
};
