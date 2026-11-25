import React from 'react';
import { motion } from 'framer-motion';
import type { OrbState } from '../types';

interface VoiceWaveformProps {
  state: OrbState;
  audioLevel?: number;
  frequencyBands?: number[];
  bars?: number;
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  state,
  audioLevel = 0,
  frequencyBands = [],
  bars = 24,
  className = '',
}) => {
  const barArray = Array.from({ length: bars }, (_, idx) => idx);
  const hasLiveAudio =
    (state === 'listening' || state === 'speaking') &&
    (frequencyBands.length > 0 || audioLevel > 0.01);

  return (
    <div
      className={`flex items-center justify-center gap-1 h-10 ${className}`}
      aria-label={`AI voice waveform (${state})`}
    >
      {barArray.map((idx) => {
        const centerDist = Math.abs(idx - (bars - 1) / 2) / (bars / 2);
        const envelope = Math.max(0.25, 1 - centerDist * 0.72);

        if (hasLiveAudio) {
          const band =
            frequencyBands.length > 0
              ? frequencyBands[idx % frequencyBands.length]
              : audioLevel;
          const px = Math.round(7 + Math.min(1, band) * 31 * envelope);
          return (
            <span
              key={idx}
              className={`w-[3px] rounded-full transition-[height] duration-75 ${
                state === 'listening'
                  ? 'bg-gradient-to-t from-cyan-500/80 to-sky-300'
                  : 'bg-gradient-to-t from-indigo-500 via-sky-400 to-cyan-200'
              }`}
              style={{ height: `${px}px` }}
            />
          );
        }

        const targetHeights =
          state === 'muted'
            ? ['4px', '5px', '4px']
            : state === 'speaking'
              ? [
                  `${Math.round(12 * envelope)}px`,
                  `${Math.round(28 * envelope)}px`,
                  `${Math.round(12 * envelope)}px`,
                ]
              : state === 'listening'
                ? [
                    `${Math.round(8 * envelope)}px`,
                    `${Math.round(14 * envelope)}px`,
                    `${Math.round(8 * envelope)}px`,
                  ]
                : state === 'thinking'
                  ? [
                      `${Math.round(8 * envelope)}px`,
                      `${Math.round(16 * envelope)}px`,
                      `${Math.round(8 * envelope)}px`,
                    ]
                  : [
                      `${Math.round(6 * envelope)}px`,
                      `${Math.round(9 * envelope)}px`,
                      `${Math.round(6 * envelope)}px`,
                    ];

        const duration =
          state === 'muted'
            ? 3.2
            : state === 'speaking'
              ? 0.8 + (idx % 4) * 0.1
              : state === 'listening'
                ? 1.1 + (idx % 3) * 0.14
                : state === 'thinking'
                  ? 1.3 + (idx % 5) * 0.15
                  : 2.6;

        return (
          <motion.span
            key={idx}
            className={`w-[3px] rounded-full transition-colors duration-300 ${
              state === 'muted'
                ? 'bg-slate-600/45'
                : state === 'listening'
                  ? 'bg-gradient-to-t from-cyan-500/70 to-sky-300'
                  : state === 'thinking'
                    ? 'bg-gradient-to-t from-violet-500/70 to-indigo-300'
                    : state === 'speaking'
                      ? 'bg-gradient-to-t from-indigo-500 via-sky-400 to-cyan-200'
                      : 'bg-slate-500/45'
            }`}
            animate={{ height: targetHeights }}
            transition={{
              repeat: Infinity,
              repeatType: 'mirror',
              duration,
              ease: 'easeInOut',
              delay: idx * 0.03,
            }}
          />
        );
      })}
    </div>
  );
};
