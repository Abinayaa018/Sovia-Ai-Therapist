import type { AssessmentAnswer, WellnessReport } from '../types';

function clamp(val: number, min = 15, max = 95): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function generateWellnessReport(answers: AssessmentAnswer[]): WellnessReport {
  const tags = new Set(answers.flatMap((a) => a.tags));

  let stressLevel = 46;
  let anxietyIndicator = 40;
  let energyLevel = 62;
  let sleepQuality = 65;
  let motivation = 64;

  if (tags.has('positive') || tags.has('balanced')) {
    stressLevel -= 18;
    anxietyIndicator -= 15;
    energyLevel += 16;
    sleepQuality += 14;
    motivation += 16;
  }

  if (tags.has('stress') || tags.has('overwhelmed')) {
    stressLevel += 22;
    anxietyIndicator += 14;
    energyLevel -= 10;
  }
  if (tags.has('stress_high') || tags.has('overwork') || tags.has('burnout')) {
    stressLevel += 18;
    energyLevel -= 18;
    motivation -= 12;
  }
  if (tags.has('stress_moderate')) stressLevel += 10;
  if (tags.has('stress_low')) stressLevel -= 14;

  if (tags.has('anxiety') || tags.has('anxiety_moderate')) {
    anxietyIndicator += 22;
    sleepQuality -= 10;
  }
  if (tags.has('anxiety_high') || tags.has('somatic')) {
    anxietyIndicator += 28;
    stressLevel += 10;
  }
  if (tags.has('anxiety_low')) anxietyIndicator -= 10;

  if (tags.has('sadness') || tags.has('persistent_low') || tags.has('long_term_low')) {
    energyLevel -= 18;
    motivation -= 20;
    anxietyIndicator += 10;
  }

  if (tags.has('exhaustion') || tags.has('energy_low')) {
    energyLevel -= 26;
    motivation -= 16;
    stressLevel += 10;
  }
  if (tags.has('energy_good')) {
    energyLevel += 14;
    motivation += 10;
  }

  if (tags.has('sleep_disrupted')) {
    sleepQuality -= 28;
    energyLevel -= 12;
  } else if (tags.has('sleep_moderate')) {
    sleepQuality -= 14;
  } else if (tags.has('sleep_okay')) {
    sleepQuality += 15;
  }

  if (tags.has('focus_low')) {
    motivation -= 10;
    stressLevel += 8;
  }

  stressLevel = clamp(stressLevel);
  anxietyIndicator = clamp(anxietyIndicator);
  energyLevel = clamp(energyLevel);
  sleepQuality = clamp(sleepQuality);
  motivation = clamp(motivation);

  const emotionalBalance = clamp(
    Math.round(
      (100 - stressLevel) * 0.3 +
        (100 - anxietyIndicator) * 0.25 +
        sleepQuality * 0.2 +
        energyLevel * 0.25
    )
  );

  // Mood tone & summary
  let moodTone: WellnessReport['moodTone'] = 'balanced';
  let moodSummary = 'Grounded with mild everyday tension';
  let primaryTheme = 'Mindful Equilibrium & Daily Clarity';

  if (stressLevel >= 65) {
    moodTone = 'elevated_stress';
    moodSummary = 'Elevated cognitive load & nervous system tension';
    primaryTheme = tags.has('academic')
      ? 'Academic Pressure & Mental Recovery'
      : tags.has('work')
        ? 'Workload Boundaries & Stress Decompression'
        : 'Stress Regulation & Gentle Unwinding';
  } else if (anxietyIndicator >= 64) {
    moodTone = 'anxious';
    moodSummary = 'Heightened worry & anticipatory alertness';
    primaryTheme = 'Nervous System Grounding & Calm';
  } else if (energyLevel <= 44 || tags.has('sadness')) {
    moodTone = 'low_energy';
    moodSummary = 'Emotionally stretched with lower restorative energy';
    primaryTheme = 'Gentle Restoration & Emotional Support';
  } else if (emotionalBalance >= 68) {
    moodSummary = 'Steady, resilient & open to positive momentum';
  }

  // Personalized AI insight referencing specific answers
  const pressureReason = tags.has('academic')
    ? 'increased academic pressure'
    : tags.has('work')
      ? 'sustained work and responsibility demands'
      : tags.has('relationships') || tags.has('family')
        ? 'interpersonal and family dynamics'
        : tags.has('financial')
          ? 'ongoing financial pressure'
          : 'accumulated daily mental load';

  let aiInsight = `Based on your responses, you have a strong foundation of self-awareness and steady habits that support your emotional resilience. Keeping gentle mindfulness and consistent evening wind-down routines will help preserve this balance.`;

  if (moodTone === 'elevated_stress') {
    aiInsight = `Based on your responses, you've been experiencing ${pressureReason}, and it may be affecting your ability to fully relax and maintain consistent ${
      sleepQuality < 58 ? 'sleep' : 'mental focus'
    }. Short, structured decompression rituals during the week can help signal safety to your nervous system.`;
  } else if (moodTone === 'anxious') {
    aiInsight = `Your check-in reflects an active, watchful mind navigating ${pressureReason}. When worry lingers in the background, somatic grounding and paced breathing can help quiet racing thoughts before they carry into bedtime.`;
  } else if (moodTone === 'low_energy') {
    aiInsight = `Your responses suggest you've been carrying emotional heaviness alongside low restorative rest. Rather than forcing productivity, your next best step is low-friction recovery—gentle emotional expression, unhurried rest, and supportive connection.`;
  }

  // Strengths
  const strengths: string[] = [];
  if (tags.has('coping_healthy') || tags.has('music_affinity')) {
    strengths.push('Already using healthy sensory coping tools like music, movement, or reflection');
  }
  if (tags.has('supported') || tags.has('social_strong')) {
    strengths.push('Strong trusted social connection you feel comfortable leaning on');
  }
  if (tags.has('sleep_okay')) {
    strengths.push('Consistent sleep rhythm supporting emotional recovery');
  }
  if (tags.has('positive_habits') || tags.has('mindful')) {
    strengths.push('Self-compassionate mindset and grounding daily habits');
  }
  if (strengths.length < 3) {
    strengths.push('Honest emotional self-awareness during today’s check-in');
    strengths.push('Willingness to pause and invest intentionally in your wellbeing');
  }

  // Focus areas
  const focusAreas: string[] = [];
  if (stressLevel >= 55) focusAreas.push('Daily stress decompression & boundary setting');
  if (sleepQuality <= 60) focusAreas.push('Evening wind-down & sleep routine');
  if (anxietyIndicator >= 55) focusAreas.push('Somatic grounding & mindfulness');
  if (tags.has('coping_bottled') || tags.has('loneliness') || tags.has('guarded')) {
    focusAreas.push('Safe emotional expression & social connection');
  }
  if (tags.has('academic') || tags.has('work') || tags.has('focus_low')) {
    focusAreas.push('Sustainable workload pacing & focus recovery');
  }
  if (focusAreas.length === 0) {
    focusAreas.push('Maintaining mindfulness & positive habit consistency');
    focusAreas.push('Preventative rest before busy weeks');
  }

  // Mood distribution for charts
  const calmShare = clamp(Math.round(emotionalBalance * 0.45), 15, 55);
  const stressedShare = clamp(Math.round(stressLevel * 0.35), 10, 40);
  const reflectiveShare = clamp(Math.round((100 - calmShare - stressedShare) * 0.55), 12, 35);
  const wearyShare = Math.max(8, 100 - calmShare - stressedShare - reflectiveShare);

  const moodDistribution = [
    { name: 'Calm & Grounded', value: calmShare, color: '#38bdf8' },
    { name: 'Reflective', value: reflectiveShare, color: '#818cf8' },
    { name: 'Tense / Pressured', value: stressedShare, color: '#a855f7' },
    { name: 'Fatigued', value: wearyShare, color: '#64748b' },
  ];

  const radarDimensions = [
    { axis: 'Calm', score: clamp(100 - anxietyIndicator), baseline: 65 },
    { axis: 'Sleep', score: sleepQuality, baseline: 68 },
    { axis: 'Energy', score: energyLevel, baseline: 65 },
    { axis: 'Focus', score: clamp(tags.has('focus_low') ? 45 : 70), baseline: 66 },
    { axis: 'Connection', score: clamp(tags.has('loneliness') ? 38 : 74), baseline: 68 },
    { axis: 'Motivation', score: motivation, baseline: 65 },
  ];

  const weeklyTrend = [
    { day: 'Mon', calm: clamp(emotionalBalance - 6), stress: clamp(stressLevel + 5), energy: clamp(energyLevel - 4) },
    { day: 'Tue', calm: clamp(emotionalBalance - 3), stress: clamp(stressLevel + 2), energy: clamp(energyLevel) },
    { day: 'Wed', calm: clamp(emotionalBalance - 8), stress: clamp(stressLevel + 7), energy: clamp(energyLevel - 6) },
    { day: 'Thu', calm: clamp(emotionalBalance + 2), stress: clamp(stressLevel - 3), energy: clamp(energyLevel + 4) },
    { day: 'Fri', calm: clamp(emotionalBalance + 4), stress: clamp(stressLevel - 6), energy: clamp(energyLevel + 5) },
    { day: 'Sat', calm: clamp(emotionalBalance + 9), stress: clamp(stressLevel - 10), energy: clamp(energyLevel + 9) },
    { day: 'Sun', calm: emotionalBalance, stress: stressLevel, energy: energyLevel },
  ];

  const recommendations: WellnessReport['recommendations'] = [
    {
      title: '4-7-8 Nervous System Reset',
      description: 'Slow rhythmic breathing to lower acute tension and transition out of study or work mode.',
      category: 'breathing',
      durationMin: 5,
    },
    {
      title: sleepQuality < 62 ? 'Evening Digital Sunset & Sleep Audio' : 'Mindful Body Scan',
      description:
        sleepQuality < 62
          ? 'Dim screens 30 minutes before bed paired with low-frequency ambient soundscapes.'
          : 'Check in gently with physical tension from head to toe for deeper clarity.',
      category: sleepQuality < 62 ? 'sleep' : 'mindfulness',
      durationMin: 15,
    },
    {
      title: 'Guided Emotional Reflection',
      description: 'Speak or journal through what felt heaviest today without trying to fix everything at once.',
      category: 'routine',
      durationMin: 10,
    },
  ];

  return {
    id: `rep-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    isDemoData: true,
    disclaimer:
      'DEMO INSIGHTS: These indicators are estimated from your self-reported check-in responses for wellness reflection only and do not represent a clinical diagnosis or biometric emotion detection.',
    moodSummary,
    moodTone,
    metrics: {
      stressLevel,
      anxietyIndicator,
      energyLevel,
      sleepQuality,
      motivation,
      emotionalBalance,
    },
    moodDistribution,
    radarDimensions,
    weeklyTrend,
    aiInsight,
    strengths,
    focusAreas,
    recommendations,
    primaryTheme,
  };
}

