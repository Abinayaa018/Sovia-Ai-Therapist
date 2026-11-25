import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Disc3, Music2, Pause, Play } from 'lucide-react';
import { MusicPlayerPanel } from '../components/MusicPlayerPanel';
import { QuickActionsPanel } from '../components/QuickActionsPanel';
import { WellnessExerciseModal } from '../components/WellnessExerciseModal';
import { useApp } from '../context/AppContext';
import type { MusicCategory, TherapyActivityType } from '../types';

const CATEGORIES: { id: MusicCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Soundscapes' },
  { id: 'calming', label: 'Calming' },
  { id: 'focus', label: 'Focus' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'meditation', label: 'Meditation' },
];

export const MusicPage: React.FC = () => {
  const {
    tracks,
    currentTrack,
    isMusicPlaying,
    selectedMusicCategory,
    setMusicCategory,
    playTrack,
    togglePlayPause,
  } = useApp();
  const [activeExercise, setActiveExercise] = useState<TherapyActivityType | null>(null);

  const filteredTracks =
    selectedMusicCategory === 'all'
      ? tracks
      : tracks.filter((t) => t.category === selectedMusicCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6 pb-10"
    >
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-200">
          <Music2 className="h-3.5 w-3.5" />
          <span>Ambient Sanctuary Audio</span>
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
          Music & Relaxation
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Curated Web Audio soundscapes and personal assistant wellness triggers.
        </p>
      </div>

      {/* Main Player */}
      <MusicPlayerPanel />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setMusicCategory(cat.id)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition cursor-pointer ${
              selectedMusicCategory === cat.id
                ? 'bg-gradient-to-r from-indigo-500/30 to-cyan-500/25 border border-cyan-400/45 text-white'
                : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Track Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredTracks.map((track) => {
          const isActive = track.id === currentTrack.id;
          const mins = Math.floor(track.durationSeconds / 60);
          const secs = (track.durationSeconds % 60).toString().padStart(2, '0');

          return (
            <div
              key={track.id}
              onClick={() => (isActive ? togglePlayPause() : playTrack(track.id))}
              className={`glass-panel rounded-3xl p-4 transition cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'border-cyan-400/50 shadow-[0_0_25px_rgba(56,189,248,0.18)]'
                  : 'hover:border-indigo-400/35'
              }`}
            >
              <div>
                <div
                  className="relative flex h-28 w-full items-center justify-center rounded-2xl border border-white/10 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${track.gradientFrom}, ${track.gradientTo})`,
                  }}
                >
                  <Disc3
                    className={`h-10 w-10 text-white/85 ${
                      isActive && isMusicPlaying ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '7s' }}
                  />
                  <span className="absolute right-2.5 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur-md">
                    {isActive && isMusicPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5 ml-0.5" />
                    )}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-cyan-300">
                  <span>{track.category}</span>
                  <span className="text-slate-400">
                    {mins}:{secs}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-semibold text-white">{track.title}</h3>
                <p className="text-xs text-slate-400">{track.artist}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400 line-clamp-2">
                  {track.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Personal Assistant Quick Actions */}
      <QuickActionsPanel onStartExercise={(type) => setActiveExercise(type)} />

      <WellnessExerciseModal
        activity={activeExercise}
        onClose={() => setActiveExercise(null)}
      />
    </motion.div>
  );
};

