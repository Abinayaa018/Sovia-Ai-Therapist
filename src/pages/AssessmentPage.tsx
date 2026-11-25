import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Send,
  SkipForward,
  Sparkles,
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
import type { AssessmentAnswer, OrbState, QuestionOption } from '../types';

export const AssessmentPage: React.FC = () => {
  const { completeAssessment, markWelcomeSeen } = useApp();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [orbState, setOrbState] = useState<OrbState>('speaking');
  const [customText, setCustomText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentQuestion = useMemo(() => selectNextQuestion(answers), [answers]);
  const estimatedTotal = useMemo(
    () => Math.min(MAX_ASSESSMENT_QUESTIONS, Math.max(answers.length + 1, estimateRemainingQuestions(answers))),
    [answers]
  );

  const lastAnswer = answers[answers.length - 1];

  useEffect(() => {
    markWelcomeSeen();
  }, [markWelcomeSeen]);

  // Simulate natural AI speaking -> listening transition per question
  useEffect(() => {
    if (!currentQuestion) return;
    setOrbState('speaking');
    const timer = window.setTimeout(() => {
      setOrbState('listening');
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [currentQuestion?.id]);

  // Complete assessment automatically when branching engine finishes
  useEffect(() => {
    if (currentQuestion === null && answers.length > 0 && !isCompleting) {
      setIsCompleting(true);
      setOrbState('thinking');
      const timer = window.setTimeout(() => {
        completeAssessment(answers);
        navigate('/report');
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [currentQuestion, answers, isCompleting, completeAssessment, navigate]);

  const submitAnswer = (nextAnswer: AssessmentAnswer) => {
    setOrbState('thinking');
    setCustomText('');
    setIsMicActive(false);

    window.setTimeout(() => {
      setAnswers((prev) => [...prev, nextAnswer]);
    }, 420);
  };

  const handleSelectOption = (option: QuestionOption) => {
    if (!currentQuestion) return;
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
    const { tags, empathyBridge } = inferTagsFromCustomText(customText);
    submitAnswer({
      questionId: currentQuestion.id,
      dimension: currentQuestion.dimension,
      answerText: customText.trim(),
      tags,
      isCustomText: true,
      empathyResponse: empathyBridge,
    });
  };

  const handleBack = () => {
    if (answers.length === 0) {
      navigate('/welcome');
      return;
    }
    setAnswers((prev) => prev.slice(0, -1));
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    submitAnswer({
      questionId: currentQuestion.id,
      dimension: currentQuestion.dimension,
      answerText: 'Skipped for now',
      tags: ['skipped'],
      isCustomText: false,
      empathyResponse: "That's completely okay—we can move softly to the next reflection.",
    });
  };

  const toggleDemoMic = () => {
    if (!isMicActive) {
      setIsMicActive(true);
      setOrbState('listening');
      if (!customText.trim()) {
        setCustomText(
          "Honestly I've been feeling stressed about keeping up with everything lately."
        );
      }
    } else {
      setIsMicActive(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-8 overflow-hidden">
      <AmbientBackdrop intensity="cinematic" />

      {/* Top Bar with Back & Progress */}
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
      <main className="relative z-10 mx-auto my-auto flex w-full max-w-4xl flex-col items-center py-6">
        <div className="flex flex-col items-center">
          <AiOrb3D state={isMicActive ? 'listening' : orbState} size="md" />
          <VoiceWaveform
            state={isMicActive ? 'listening' : orbState}
            bars={22}
            className="mt-1"
          />
          <span className="mt-1 text-[11px] uppercase tracking-[0.22em] text-indigo-300/80">
            {isCompleting
              ? 'SOVIA is creating your wellness insights'
              : isMicActive
                ? 'Listening to your voice (Demo)'
                : orbState === 'speaking'
                  ? 'SOVIA is speaking'
                  : orbState === 'thinking'
                    ? 'Reflecting'
                    : 'Ready for your response'}
          </span>
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
                className="mt-6 w-full max-w-2xl"
              >
                {/* AI Empathetic Bridge + Prompt */}
                <div className="glass-panel glow-border rounded-3xl p-6 sm:p-8 text-center">
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

                {/* Selectable Conversational Response Chips */}
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

                {/* Microphone & Accessible Custom Text Input */}
                <form
                  onSubmit={handleCustomSubmit}
                  className="mt-6 flex items-center gap-2.5 rounded-full border border-white/12 bg-slate-950/65 p-1.5 pl-3 backdrop-blur-xl focus-within:border-cyan-400/50"
                >
                  <button
                    type="button"
                    onClick={toggleDemoMic}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
                      isMicActive
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.6)] animate-pulse'
                        : 'bg-white/10 text-slate-200 hover:bg-white/15'
                    }`}
                    aria-label={isMicActive ? 'Stop simulated microphone' : 'Speak response'}
                    title="Simulate voice input"
                  >
                    {isMicActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>

                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Or type your own thoughts here..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none px-2"
                  />

                  <button
                    type="submit"
                    disabled={!customText.trim()}
                    className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 text-xs font-semibold text-slate-950 disabled:opacity-35 hover:brightness-110 transition cursor-pointer"
                  >
                    <span className="hidden sm:inline">Respond</span>
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
        Adaptive wellness conversation · Non-clinical reflection · Maximum 10 questions
      </footer>
    </div>
  );
};

