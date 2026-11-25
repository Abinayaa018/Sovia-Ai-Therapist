import React from 'react';
import { motion } from 'framer-motion';
import type { OrbState } from '../types';

interface VoiceWaveformProps {
  state: OrbState;
  bars?: number;
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  state,
  bars = 24,
  className = '',
}) => {
  const barArray = Array.from({ length: bars }, (_, idx) => idx);

  return (
    <div
      className={`flex items-center justify-center gap-1 h-10 ${className}`}
      aria-label={`AI voice waveform (${state})`}
    >
      {barArray.map((idx) => {
        const centerDist = Math.abs(idx - (bars - 1) / 2) / (bars / 2);
        const envelope = Math.max(0.25, 1 - centerDist * 0.72);

        const targetHeights =
          state === 'speaking'
            ? [
                `${Math.round(14 * envelope)}px`,
                `${Math.round((34 + ((idx * 7) % 10)) * envelope)}px`,
                `${Math.round(12 * envelope)}px`,
                `${Math.round((28 + ((idx * 5) % 12)) * envelope)}px`,
              ]
            : state === 'listening'
              ? [
                  `${Math.round(10 * envelope)}px`,
                  `${Math.round((26 + ((idx * 3) % 8)) * envelope)}px`,
                  `${Math.round(10 * envelope)}px`,
                ]
              : state === 'thinking'
                ? [
                    `${Math.round(8 * envelope)}px`,
                    `${Math.round(16 * envelope)}px`,
                    `${Math.round(8 * envelope)}px`,
                  ]
                : [`${Math.round(6 * envelope)}px`, `${Math.round(9 * envelope)}px`, `${Math.round(6 * envelope)}px`];

        const duration =
          state === 'speaking'
            ? 0.75 + (idx % 4) * 0.12
            : state === 'listening'
              ? 1.0 + (idx % 3) * 0.16
              : state === 'thinking'
                ? 1.3 + (idx % 5) * 0.15
                : 2.6;

        return (
          <motion.span
            key={idx}
            className={`w-[3px] rounded-full transition-colors duration-300 ${
              state === 'listening'
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

