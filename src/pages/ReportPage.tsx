import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BatteryCharging,
  Brain,
  CalendarDays,
  CheckCircle2,
  Download,
  HeartHandshake,
  Info,
  Moon,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const ReportPage: React.FC = () => {
  const { wellnessReport, hasCustomReport, resetAssessment } = useApp();
  const navigate = useNavigate();
  const [downloaded, setDownloaded] = useState(false);

  const { metrics } = wellnessReport;

  const stressGaugeData = [
    {
      name: 'Stress',
      value: metrics.stressLevel,
      fill: metrics.stressLevel > 65 ? '#a855f7' : '#38bdf8',
    },
  ];

  const energySleepData = [
    { name: 'Energy', score: metrics.energyLevel, fill: '#38bdf8' },
    { name: 'Sleep', score: metrics.sleepQuality, fill: '#818cf8' },
    { name: 'Motivation', score: metrics.motivation, fill: '#a78bfa' },
    { name: 'Balance', score: metrics.emotionalBalance, fill: '#22d3ee' },
  ];

  const handleDownloadReport = () => {
    const content = [
      'SOVIA — PERSONAL EMOTIONAL WELLNESS REPORT (DEMO)',
      `Generated: ${new Date(wellnessReport.generatedAt).toLocaleString()}`,
      `Mood Summary: ${wellnessReport.moodSummary}`,
      `Primary Theme: ${wellnessReport.primaryTheme}`,
      '',
      'ESTIMATED METRICS (DEMO DATA):',
      `- Emotional Balance: ${metrics.emotionalBalance}/100`,
      `- Stress Level: ${metrics.stressLevel}/100`,
      `- Anxiety Indicator: ${metrics.anxietyIndicator}/100`,
      `- Energy Level: ${metrics.energyLevel}/100`,
      `- Sleep Quality: ${metrics.sleepQuality}/100`,
      `- Motivation: ${metrics.motivation}/100`,
      '',
      'AI INSIGHT:',
      wellnessReport.aiInsight,
      '',
      'STRENGTHS:',
      ...wellnessReport.strengths.map((s) => `* ${s}`),
      '',
      'FOCUS AREAS:',
      ...wellnessReport.focusAreas.map((f) => `* ${f}`),
      '',
      'RECOMMENDATIONS:',
      ...wellnessReport.recommendations.map(
        (r) => `* ${r.title} (${r.durationMin} min): ${r.description}`
      ),
      '',
      wellnessReport.disclaimer,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sovia-wellness-report-demo.txt';
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 3000);
  };

  const overviewCards = [
    {
      label: 'Emotional Balance',
      value: `${metrics.emotionalBalance}%`,
      icon: HeartHandshake,
      accent: 'text-cyan-300',
    },
    {
      label: 'Estimated Stress',
      value: `${metrics.stressLevel}%`,
      icon: Activity,
      accent: 'text-violet-300',
    },
    {
      label: 'Anxiety Indicator',
      value: `${metrics.anxietyIndicator}%`,
      icon: Brain,
      accent: 'text-indigo-300',
    },
    {
      label: 'Energy Level',
      value: `${metrics.energyLevel}%`,
      icon: BatteryCharging,
      accent: 'text-sky-300',
    },
    {
      label: 'Sleep Quality',
      value: `${metrics.sleepQuality}%`,
      icon: Moon,
      accent: 'text-indigo-200',
    },
    {
      label: 'Motivation',
      value: `${metrics.motivation}%`,
      icon: Target,
      accent: 'text-cyan-200',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{hasCustomReport ? 'Generated from your check-in' : 'Sample Demo Report'}</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
            Your Emotional Wellness Report
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Current mood summary:{' '}
            <span className="text-slate-200 font-medium">{wellnessReport.moodSummary}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              resetAssessment();
              navigate('/assessment');
            }}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retake Check-In</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-slate-200 hover:border-cyan-400/40 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-cyan-300" />
            <span>{downloaded ? 'Report Downloaded' : 'Download my report'}</span>
          </button>
        </div>
      </div>

      {/* Non-clinical Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-xs text-slate-300">
        <Info className="h-4 w-4 shrink-0 text-cyan-300 mt-0.5" />
        <p>{wellnessReport.disclaimer}</p>
      </div>

      {/* A. Emotional Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-panel rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${card.accent}`} />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Demo</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* C. AI-Generated Insight Highlight */}
      <div className="glass-panel glow-border rounded-3xl p-6 sm:p-7">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
          <Sparkles className="h-4 w-4" />
          <span>SOVIA Personalized Insight · {wellnessReport.primaryTheme}</span>
        </div>
        <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-100">
          {wellnessReport.aiInsight}
        </p>
      </div>

      {/* B. Visualizations Grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Emotional Wellness Radar */}
        <div className="glass-panel rounded-3xl p-5">
          <h3 className="text-sm font-semibold text-white">Emotional Wellness Radar</h3>
          <p className="text-xs text-slate-400">Multi-dimensional balance snapshot (Demo)</p>
          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={wellnessReport.radarDimensions}>
                <PolarGrid stroke="rgba(148,163,184,0.18)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.28}
                />
                <Radar
                  name="Baseline"
                  dataKey="baseline"
                  stroke="#818cf8"
                  fill="#818cf8"
                  fillOpacity={0.1}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(148,163,184,0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stress Level Gauge */}
        <div className="glass-panel rounded-3xl p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-white">Stress Load Gauge</h3>
          <p className="text-xs text-slate-400">Estimated tension intensity (Demo)</p>
          <div className="relative mt-2 h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="60%"
                innerRadius="68%"
                outerRadius="98%"
                barSize={16}
                data={stressGaugeData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  background={{ fill: 'rgba(148,163,184,0.12)' }}
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-10 pointer-events-none">
              <span className="text-3xl font-bold text-white">{metrics.stressLevel}%</span>
              <span className="text-xs text-slate-400">
                {metrics.stressLevel >= 65
                  ? 'Elevated Load'
                  : metrics.stressLevel >= 45
                    ? 'Moderate Hum'
                    : 'Calm Range'}
              </span>
            </div>
          </div>
          <p className="mt-auto text-center text-xs text-slate-400">
            Lower scores indicate calmer nervous-system recovery.
          </p>
        </div>

        {/* Mood Distribution */}
        <div className="glass-panel rounded-3xl p-5">
          <h3 className="text-sm font-semibold text-white">Mood Distribution</h3>
          <p className="text-xs text-slate-400">Reflective tone breakdown (Demo)</p>
          <div className="mt-2 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wellnessReport.moodDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={4}
                >
                  {wellnessReport.moodDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(148,163,184,0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {wellnessReport.moodDistribution.map((m) => (
              <div key={m.name} className="flex items-center gap-2 text-xs text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: m.color }}
                />
                <span className="truncate">{m.name}</span>
                <span className="ml-auto text-slate-400">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Energy & Sleep Indicators Bar Chart */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Restorative Energy & Sleep Indicators
            </h3>
            <p className="text-xs text-slate-400">
              How your rest, daytime energy, and motivation align (Demo Data)
            </p>
          </div>
        </div>
        <div className="mt-4 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={energySleepData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
                width={85}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(148,163,184,0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={20}>
                {energySleepData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* D & E. Strengths and Focus Areas */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="glass-panel rounded-3xl p-6">
          <h3 className="text-base font-semibold text-white">
            Strengths & Positive Observations
          </h3>
          <p className="mt-1 text-xs text-slate-400">What is already supporting your resilience</p>
          <ul className="mt-4 space-y-3">
            {wellnessReport.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel rounded-3xl p-6">
          <h3 className="text-base font-semibold text-white">Areas to Gently Focus On</h3>
          <p className="mt-1 text-xs text-slate-400">
            High-impact habits tailored to your responses
          </p>
          <ul className="mt-4 space-y-3">
            {wellnessReport.focusAreas.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* F. Personalized Recommendations */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-base font-semibold text-white">Personalized Recommendations</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {wellnessReport.recommendations.map((rec) => (
            <div
              key={rec.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between"
            >
              <div>
                <span className="inline-block rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-200">
                  {rec.durationMin} min · {rec.category}
                </span>
                <h4 className="mt-2.5 text-sm font-semibold text-white">{rec.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {rec.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel glow-border rounded-3xl p-6">
        <div>
          <h3 className="text-base font-semibold text-white">
            Ready to turn these insights into gentle action?
          </h3>
          <p className="text-xs text-slate-400">
            Explore your personalized weekly therapy plan or begin a live voice session right away.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/schedule')}
            className="flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20 transition cursor-pointer"
          >
            <CalendarDays className="h-4 w-4" />
            <span>View my therapy plan</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/session')}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 hover:brightness-110 transition cursor-pointer"
          >
            <span>Start a session now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

