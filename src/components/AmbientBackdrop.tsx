import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';

interface AmbientBackdropProps {
  intensity?: 'calm' | 'focused' | 'cinematic';
}

export const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({
  intensity = 'calm',
}) => {
  const { settings } = useApp();

  const particles = useMemo(() => {
    const count = intensity === 'cinematic' ? 24 : 14;
    return Array.from({ length: count }, (_, idx) => ({
      id: idx,
      left: `${(idx * 37 + 11) % 96}%`,
      top: `${(idx * 53 + 7) % 94}%`,
      size: (idx % 3) + 1.5,
      delay: `${(idx % 7) * 0.9}s`,
      duration: `${8 + (idx % 6) * 2.5}s`,
      opacity: 0.14 + (idx % 4) * 0.08,
    }));
  }, [intensity]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#040712]">
      {/* Deep atmospheric glows */}
      <div
        className="absolute -top-48 left-1/4 h-[520px] w-[520px] rounded-full blur-[150px]"
        style={{
          background:
            intensity === 'cinematic'
              ? 'radial-gradient(circle, rgba(79,70,229,0.22) 0%, rgba(4,7,18,0) 72%)'
              : 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, rgba(4,7,18,0) 72%)',
        }}
      />
      <div
        className="absolute -bottom-40 right-1/5 h-[480px] w-[480px] rounded-full blur-[150px]"
        style={{
          background:
            intensity === 'cinematic'
              ? 'radial-gradient(circle, rgba(56,189,248,0.16) 0%, rgba(4,7,18,0) 72%)'
              : 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(4,7,18,0) 72%)',
        }}
      />
      <div
        className="absolute top-1/3 right-1/3 h-[340px] w-[340px] rounded-full blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.11) 0%, rgba(4,7,18,0) 75%)',
        }}
      />

      {/* Subtle floating ambient particles (hidden on low-power mobile when disabled) */}
      {settings.ambientParticles && (
        <div className="hidden sm:block">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-full bg-cyan-200/80 animate-pulse"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDelay: p.delay,
                animationDuration: p.duration,
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

