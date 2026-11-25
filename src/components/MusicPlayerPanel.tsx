import React from 'react';
import {
  Disc3,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MusicPlayerPanelProps {
  compact?: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const MusicPlayerPanel: React.FC<MusicPlayerPanelProps> = ({
  compact = false,
}) => {
  const {
    currentTrack,
    isMusicPlaying,
    musicProgressSeconds,
    musicVolume,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTrack,
    setMusicVolume,
    settings,
    updateSettings,
  } = useApp();

  const progressPct = Math.min(
    100,
    (musicProgressSeconds / Math.max(1, currentTrack.durationSeconds)) * 100
  );

  return (
    <div className="glass-panel glow-border rounded-3xl p-5">
      <div className="flex items-center gap-4">
        {/* Generative Album Artwork */}
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${currentTrack.gradientFrom}, ${currentTrack.gradientTo})`,
          }}
        >
          <Disc3
            className={`h-7 w-7 text-white/90 ${isMusicPlaying ? 'animate-spin' : ''}`}
            style={{ animationDuration: '6s' }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan-300 border border-cyan-400/20">
              {currentTrack.category}
            </span>
            {isMusicPlaying && (
              <span className="text-[11px] text-sky-300/80 animate-pulse">Playing</span>
            )}
          </div>
          <h4 className="mt-1 truncate text-sm font-semibold text-white">
            {currentTrack.title}
          </h4>
          <p className="truncate text-xs text-slate-400">{currentTrack.artist}</p>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevTrack}
            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={togglePlayPause}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition cursor-pointer"
            aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
          >
            {isMusicPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={nextTrack}
            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={currentTrack.durationSeconds}
          value={musicProgressSeconds}
          onChange={(e) => seekTrack(Number(e.target.value))}
          aria-label="Track progress"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400"
          style={{
            background: `linear-gradient(to right, #38bdf8 ${progressPct}%, rgba(30,41,59,0.9) ${progressPct}%)`,
          }}
        />
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatDuration(musicProgressSeconds)}</span>
          <span>{formatDuration(currentTrack.durationSeconds)}</span>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-3">
          <p className="text-xs text-slate-400 line-clamp-1">{currentTrack.description}</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className="text-slate-300 hover:text-cyan-300 transition"
              aria-label="Toggle audio output"
            >
              {settings.soundEnabled && musicVolume > 0 ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              aria-label="Volume"
              className="w-20 h-1 cursor-pointer appearance-none rounded-full bg-slate-800 accent-indigo-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};

