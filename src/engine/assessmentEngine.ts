import { ASSESSMENT_QUESTION_BANK } from '../data/assessmentBank';
import type { AssessmentAnswer, AssessmentQuestion } from '../types';

export const MAX_ASSESSMENT_QUESTIONS = 10;

export function inferTagsFromCustomText(text: string): {
  tags: string[];
  empathyBridge: string;
} {
  const lower = text.toLowerCase();
  const tags: string[] = ['custom_reflection'];

  if (/(stress|overwhelm|deadline|pressure|too much)/.test(lower)) {
    tags.push('stress', 'overwhelmed');
  }
  if (/(exam|study|studies|college|school|grade|assignment)/.test(lower)) {
    tags.push('academic', 'pressure');
  }
  if (/(work|job|boss|career|office|meeting)/.test(lower)) {
    tags.push('work', 'pressure');
  }
  if (/(anxious|anxiety|worry|worried|panic|nervous|overthink)/.test(lower)) {
    tags.push('anxiety', 'anxiety_moderate');
  }
  if (/(sad|down|low|cry|empty|hopeless|depress)/.test(lower)) {
    tags.push('sadness');
  }
  if (/(lonely|alone|isolated|nobody|no one)/.test(lower)) {
    tags.push('loneliness');
  }
  if (/(tired|exhaust|burnout|fatigue|drained|sleep|insomnia)/.test(lower)) {
    tags.push('exhaustion', 'sleep_disrupted');
  }
  if (/(good|great|happy|calm|peace|fine|okay|grateful)/.test(lower)) {
    tags.push('positive', 'balanced');
  }

  let empathyBridge =
    'Thank you for putting that into your own words—listening closely to what feels true for you is where clarity starts.';
  if (tags.includes('anxiety')) {
    empathyBridge =
      'Thank you for sharing that openly. When anxious thoughts keep looping, it takes real effort just to stay present.';
  } else if (tags.includes('sadness') || tags.includes('loneliness')) {
    empathyBridge =
      "I appreciate you trusting me with that. Carrying heavy or lonely moments quietly is hard, and you're not alone here.";
  } else if (tags.includes('stress') || tags.includes('exhaustion')) {
    empathyBridge =
      'That sounds like a genuine weight on your shoulders. Let us explore how it has been touching the rest of your week.';
  } else if (tags.includes('positive')) {
    empathyBridge =
      "It's encouraging to hear that steadiness in your voice. Let's look at what keeps that balance resilient.";
  }

  return { tags, empathyBridge };
}

/**
 * Dynamic branching engine: selects the next most empathetic, relevant question
 * based on prior answers, stops once enough insight is gathered, and never exceeds 10 questions.
 */
export function selectNextQuestion(
  answers: AssessmentAnswer[]
): AssessmentQuestion | null {
  if (answers.length >= MAX_ASSESSMENT_QUESTIONS) {
    return null;
  }

  if (answers.length === 0) {
    return ASSESSMENT_QUESTION_BANK['q-mood'];
  }

  const askedIds = new Set(answers.map((a) => a.questionId));
  const allTags = new Set(answers.flatMap((a) => a.tags));
  const answerById = new Map(answers.map((a) => [a.questionId, a]));

  const moodAnswer = answerById.get('q-mood');
  const pressureAnswer = answerById.get('q-pressure-source');

  // 1. Immediate tailored follow-ups from Q1 (Current emotional state)
  if (moodAnswer) {
    const moodTags = new Set(moodAnswer.tags);

    // Pretty good path: concise, strength-focused (stops around 6 questions)
    if (moodTags.has('positive') && !moodTags.has('stress') && !moodTags.has('anxiety')) {
      if (!askedIds.has('q-positivity-drivers')) {
        return ASSESSMENT_QUESTION_BANK['q-positivity-drivers'];
      }
      if (!askedIds.has('q-stress-level')) {
        return ASSESSMENT_QUESTION_BANK['q-stress-level'];
      }
      if (!askedIds.has('q-sleep-quality')) {
        return ASSESSMENT_QUESTION_BANK['q-sleep-quality'];
      }
      if (!askedIds.has('q-coping')) {
        return ASSESSMENT_QUESTION_BANK['q-coping'];
      }
      if (!askedIds.has('q-wellness-goals')) {
        return ASSESSMENT_QUESTION_BANK['q-wellness-goals'];
      }
      return null;
    }

    // Stress / Overwhelmed / Unclear -> explore pressure source
    if (
      (moodTags.has('stress') || moodTags.has('overwhelmed') || moodTags.has('unclear')) &&
      !askedIds.has('q-pressure-source')
    ) {
      return ASSESSMENT_QUESTION_BANK['q-pressure-source'];
    }

    // Pressure-specific follow-up
    if (pressureAnswer) {
      if (pressureAnswer.tags.includes('academic') && !askedIds.has('q-academic-impact')) {
        return ASSESSMENT_QUESTION_BANK['q-academic-impact'];
      }
      if (pressureAnswer.tags.includes('work') && !askedIds.has('q-work-impact')) {
        return ASSESSMENT_QUESTION_BANK['q-work-impact'];
      }
      if (
        (pressureAnswer.tags.includes('relationships') ||
          pressureAnswer.tags.includes('loneliness')) &&
        !askedIds.has('q-social-support')
      ) {
        return ASSESSMENT_QUESTION_BANK['q-social-support'];
      }
    }

    // Sadness -> duration + social support
    if (moodTags.has('sadness') && !askedIds.has('q-sadness-duration')) {
      return ASSESSMENT_QUESTION_BANK['q-sadness-duration'];
    }

    // Anxiety -> physical/sleep/focus manifestation
    if (moodTags.has('anxiety') && !askedIds.has('q-anxiety-impact')) {
      return ASSESSMENT_QUESTION_BANK['q-anxiety-impact'];
    }

    // Exhaustion -> energy, rest and workload
    if (moodTags.has('exhaustion') && !askedIds.has('q-energy-rest')) {
      return ASSESSMENT_QUESTION_BANK['q-energy-rest'];
    }
  }

  // 2. Conditional deep-dives triggered by intermediate tags
  if (allTags.has('loneliness') && !askedIds.has('q-social-support')) {
    return ASSESSMENT_QUESTION_BANK['q-social-support'];
  }

  if (
    (allTags.has('stress') || allTags.has('pressure')) &&
    !askedIds.has('q-stress-level')
  ) {
    return ASSESSMENT_QUESTION_BANK['q-stress-level'];
  }

  if (
    !allTags.has('sleep_disrupted') &&
    !allTags.has('sleep_okay') &&
    !allTags.has('sleep_moderate') &&
    !askedIds.has('q-sleep-quality')
  ) {
    return ASSESSMENT_QUESTION_BANK['q-sleep-quality'];
  }

  if (
    !allTags.has('energy_low') &&
    !allTags.has('energy_good') &&
    !allTags.has('energy_moderate') &&
    !askedIds.has('q-energy-rest') &&
    answers.length < 7
  ) {
    return ASSESSMENT_QUESTION_BANK['q-energy-rest'];
  }

  if (
    !allTags.has('focus_low') &&
    !allTags.has('focus_good') &&
    !askedIds.has('q-concentration') &&
    answers.length < 7
  ) {
    return ASSESSMENT_QUESTION_BANK['q-concentration'];
  }

  if (!askedIds.has('q-social-support') && answers.length < 8) {
    return ASSESSMENT_QUESTION_BANK['q-social-support'];
  }

  if (!askedIds.has('q-coping') && answers.length < MAX_ASSESSMENT_QUESTIONS - 1) {
    return ASSESSMENT_QUESTION_BANK['q-coping'];
  }

  if (!askedIds.has('q-wellness-goals') && answers.length < MAX_ASSESSMENT_QUESTIONS) {
    return ASSESSMENT_QUESTION_BANK['q-wellness-goals'];
  }

  return null;
}

export function estimateRemainingQuestions(answers: AssessmentAnswer[]): number {
  let sim = [...answers];
  let extra = 0;
  while (sim.length < MAX_ASSESSMENT_QUESTIONS) {
    const next = selectNextQuestion(sim);
    if (!next) break;
    extra += 1;
    // Simulate default neutral first option to estimate branch length
    const fallbackOpt = next.options[0];
    sim.push({
      questionId: next.id,
      dimension: next.dimension,
      selectedOptionId: fallbackOpt?.id,
      answerText: fallbackOpt?.label ?? '',
      tags: fallbackOpt?.tags ?? [],
      isCustomText: false,
      empathyResponse: fallbackOpt?.empathyBridge ?? '',
    });
  }
  return Math.min(MAX_ASSESSMENT_QUESTIONS, answers.length + extra);
}

