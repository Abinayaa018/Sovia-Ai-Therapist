import React, { Component, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import { VolumeX } from 'lucide-react';
import * as THREE from 'three';
import type { OrbState } from '../types';

interface AiOrb3DProps {
  state?: OrbState;
  audioLevel?: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AiOrb3DProps['size']>, string> = {
  sm: 'w-24 h-24',
  md: 'w-44 h-44',
  lg: 'w-60 h-60 sm:w-72 sm:h-72',
  hero: 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96',
};

interface OrbMeshProps {
  state: OrbState;
  audioLevelRef: React.RefObject<number>;
}

const OrbScene: React.FC<OrbMeshProps> = ({ state, audioLevelRef }) => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particlePositions = useMemo(() => {
    const count = 90;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.62 + (i % 5) * 0.08;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const liveLevel = audioLevelRef.current ?? 0;

    const speed =
      state === 'thinking'
        ? 0.9
        : state === 'speaking'
          ? 0.65 + liveLevel * 0.45
          : state === 'listening'
            ? 0.45 + liveLevel * 0.35
            : state === 'muted'
              ? 0.1
              : 0.22;

    const breathAmp =
      state === 'speaking'
        ? 0.03 + liveLevel * 0.13 + 0.025 * Math.sin(t * 5.2)
        : state === 'listening'
          ? 0.025 + liveLevel * 0.11 + 0.02 * Math.sin(t * 2.6)
          : state === 'thinking'
            ? 0.03 * Math.sin(t * 3.5)
            : state === 'muted'
              ? 0.012 * Math.sin(t * 0.9)
              : 0.032 * Math.sin(t * 1.4);

    if (outerRef.current) {
      outerRef.current.rotation.y = t * speed * 0.45;
      outerRef.current.rotation.x = Math.sin(t * 0.3) * 0.25;
      const s = 1 + breathAmp;
      outerRef.current.scale.set(s, s, s);
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = -t * speed * 0.6;
      const innerScale = 0.62 + breathAmp * 1.35;
      innerRef.current.scale.set(innerScale, innerScale, innerScale);
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * (state === 'thinking' ? 0.55 : 0.16);
      particlesRef.current.rotation.z = Math.sin(t * 0.25) * 0.22;
    }
  });

  const primaryColor =
    state === 'muted'
      ? '#475569'
      : state === 'listening'
        ? '#38bdf8'
        : state === 'thinking'
          ? '#a78bfa'
          : state === 'speaking'
            ? '#60a5fa'
            : '#6366f1';

  const emissiveColor =
    state === 'muted'
      ? '#1e293b'
      : state === 'listening'
        ? '#0284c7'
        : state === 'speaking'
          ? '#38bdf8'
          : state === 'thinking'
            ? '#7c3aed'
            : '#312e81';

  const distort =
    state === 'muted'
      ? 0.12
      : state === 'speaking'
        ? 0.38
        : state === 'listening'
          ? 0.32
          : state === 'thinking'
            ? 0.48
            : 0.24;

  const distortSpeed =
    state === 'muted'
      ? 0.6
      : state === 'speaking'
        ? 3.4
        : state === 'thinking'
          ? 4.2
          : state === 'listening'
            ? 2.4
            : 1.3;

  return (
    <>
      <ambientLight intensity={state === 'muted' ? 0.45 : 0.65} />
      <pointLight position={[3, 3, 4]} intensity={state === 'muted' ? 1.2 : 2.6} color="#38bdf8" />
      <pointLight position={[-3, -2, 3]} intensity={state === 'muted' ? 1.0 : 2.0} color="#8b5cf6" />
      <pointLight position={[0, 0, 2.5]} intensity={1.4} color="#c4b5fd" />

      {/* Outer translucent organic presence */}
      <Sphere ref={outerRef} args={[1.18, 64, 64]}>
        <MeshDistortMaterial
          color={primaryColor}
          emissive={emissiveColor}
          emissiveIntensity={state === 'speaking' ? 0.9 : state === 'muted' ? 0.25 : 0.52}
          roughness={0.18}
          metalness={0.35}
          distort={distort}
          speed={distortSpeed}
          transparent
          opacity={state === 'muted' ? 0.55 : 0.78}
        />
      </Sphere>

      {/* Luminous inner heart */}
      <Sphere ref={innerRef} args={[0.92, 48, 48]}>
        <MeshDistortMaterial
          color={state === 'muted' ? '#64748b' : state === 'listening' ? '#7dd3fc' : '#a5b4fc'}
          emissive={state === 'speaking' ? '#38bdf8' : state === 'muted' ? '#334155' : '#6366f1'}
          emissiveIntensity={state === 'speaking' ? 1.45 : state === 'muted' ? 0.35 : 0.9}
          roughness={0.1}
          metalness={0.1}
          distort={distort * 0.7}
          speed={distortSpeed * 1.15}
          transparent
          opacity={state === 'muted' ? 0.7 : 0.92}
        />
      </Sphere>

      {/* Orbital micro-particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={state === 'thinking' ? 0.048 : 0.032}
          color={state === 'thinking' ? '#c4b5fd' : state === 'muted' ? '#64748b' : '#7dd3fc'}
          transparent
          opacity={state === 'muted' ? 0.25 : state === 'idle' ? 0.5 : 0.85}
          sizeAttenuation
        />
      </points>
    </>
  );
};

class WebGLErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const CssOrbFallback: React.FC<{ state: OrbState; audioLevel: number }> = ({
  state,
  audioLevel,
}) => (
  <div className="relative flex h-full w-full items-center justify-center">
    <div
      className={`h-3/4 w-3/4 rounded-full transition-transform duration-150 ${
        state === 'muted'
          ? 'bg-gradient-to-br from-slate-600/60 via-slate-700/70 to-slate-800/80 shadow-none'
          : 'bg-gradient-to-br from-cyan-400/75 via-indigo-500/80 to-violet-600/80 shadow-[0_0_65px_rgba(56,189,248,0.45)]'
      } ${state === 'idle' ? 'animate-orb-halo' : ''}`}
      style={{
        transform:
          state === 'speaking' || state === 'listening'
            ? `scale(${(1 + audioLevel * 0.14).toFixed(3)})`
            : undefined,
      }}
    />
  </div>
);

export const AiOrb3D: React.FC<AiOrb3DProps> = ({
  state = 'idle',
  audioLevel = 0,
  size = 'lg',
  className = '',
}) => {
  const audioLevelRef = useRef(audioLevel);
  audioLevelRef.current = audioLevel;

  const haloScale =
    state === 'speaking' || state === 'listening'
      ? 1 + audioLevel * 0.22
      : 1;

  return (
    <div className={`relative flex items-center justify-center ${SIZE_CLASSES[size]} ${className}`}>
      {/* Ambient aura behind orb reactive to actual audio level */}
      <div
        className={`pointer-events-none absolute inset-3 rounded-full blur-2xl transition-colors duration-500 ${
          state === 'muted'
            ? 'bg-slate-600/15'
            : state === 'listening'
              ? 'bg-cyan-400/30'
              : state === 'speaking'
                ? 'bg-sky-400/35'
                : state === 'thinking'
                  ? 'bg-violet-500/28'
                  : 'bg-indigo-500/20'
        }`}
        style={{ transform: `scale(${haloScale.toFixed(3)})` }}
      />

      {/* Expanding waveform rings when listening or speaking */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          <span
            className={`pointer-events-none absolute inset-2 rounded-full border ${
              state === 'listening' ? 'border-cyan-400/40' : 'border-indigo-400/35'
            } animate-ping`}
            style={{ animationDuration: state === 'listening' ? '2.2s' : '2.6s' }}
          />
          <span
            className="pointer-events-none absolute inset-6 rounded-full border border-sky-300/25 transition-transform duration-100"
            style={{ transform: `scale(${(1 + audioLevel * 0.14).toFixed(3)})` }}
          />
        </>
      )}

      {/* Subtle rotating ring when thinking */}
      {state === 'thinking' && (
        <span
          className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-violet-400/40 animate-spin"
          style={{ animationDuration: '9s' }}
        />
      )}

      {/* Clear visual indication when voice output is muted */}
      {state === 'muted' && (
        <>
          <span className="pointer-events-none absolute inset-4 rounded-full border border-slate-500/30" />
          <span className="pointer-events-none absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-rose-400/40 bg-slate-950/90 text-rose-300 shadow-lg">
            <VolumeX className="h-4 w-4" />
          </span>
        </>
      )}

      <WebGLErrorBoundary fallback={<CssOrbFallback state={state} audioLevel={audioLevel} />}>
        <div className="h-full w-full">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.1], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <OrbScene state={state} audioLevelRef={audioLevelRef} />
          </Canvas>
        </div>
      </WebGLErrorBoundary>
    </div>
  );
};
