import React, { Component, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbState } from '../types';

interface AiOrb3DProps {
  state?: OrbState;
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
}

const OrbScene: React.FC<OrbMeshProps> = ({ state }) => {
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

    const speed =
      state === 'thinking'
        ? 0.9
        : state === 'speaking'
          ? 0.65
          : state === 'listening'
            ? 0.45
            : 0.22;

    const breathAmp =
      state === 'speaking'
        ? 0.065 * Math.sin(t * 5.2) + 0.03 * Math.cos(t * 8.1)
        : state === 'listening'
          ? 0.045 * Math.sin(t * 2.8)
          : state === 'thinking'
            ? 0.03 * Math.sin(t * 3.5)
            : 0.032 * Math.sin(t * 1.4);

    if (outerRef.current) {
      outerRef.current.rotation.y = t * speed * 0.45;
      outerRef.current.rotation.x = Math.sin(t * 0.3) * 0.25;
      const s = 1 + breathAmp;
      outerRef.current.scale.set(s, s, s);
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = -t * speed * 0.6;
      const innerScale = 0.62 + breathAmp * 1.3;
      innerRef.current.scale.set(innerScale, innerScale, innerScale);
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * (state === 'thinking' ? 0.55 : 0.16);
      particlesRef.current.rotation.z = Math.sin(t * 0.25) * 0.22;
    }
  });

  const primaryColor =
    state === 'listening'
      ? '#38bdf8'
      : state === 'thinking'
        ? '#a78bfa'
        : state === 'speaking'
          ? '#60a5fa'
          : '#6366f1';

  const emissiveColor =
    state === 'listening'
      ? '#0284c7'
      : state === 'speaking'
        ? '#38bdf8'
        : state === 'thinking'
          ? '#7c3aed'
          : '#312e81';

  const distort =
    state === 'speaking'
      ? 0.42
      : state === 'listening'
        ? 0.34
        : state === 'thinking'
          ? 0.48
          : 0.24;

  const distortSpeed =
    state === 'speaking'
      ? 3.6
      : state === 'thinking'
        ? 4.2
        : state === 'listening'
          ? 2.4
          : 1.3;

  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight position={[3, 3, 4]} intensity={2.6} color="#38bdf8" />
      <pointLight position={[-3, -2, 3]} intensity={2.0} color="#8b5cf6" />
      <pointLight position={[0, 0, 2.5]} intensity={1.4} color="#c4b5fd" />

      {/* Outer translucent organic presence */}
      <Sphere ref={outerRef} args={[1.18, 64, 64]}>
        <MeshDistortMaterial
          color={primaryColor}
          emissive={emissiveColor}
          emissiveIntensity={state === 'speaking' ? 0.85 : 0.52}
          roughness={0.18}
          metalness={0.35}
          distort={distort}
          speed={distortSpeed}
          transparent
          opacity={0.78}
        />
      </Sphere>

      {/* Luminous inner heart */}
      <Sphere ref={innerRef} args={[0.92, 48, 48]}>
        <MeshDistortMaterial
          color={state === 'listening' ? '#7dd3fc' : '#a5b4fc'}
          emissive={state === 'speaking' ? '#38bdf8' : '#6366f1'}
          emissiveIntensity={state === 'speaking' ? 1.4 : 0.9}
          roughness={0.1}
          metalness={0.1}
          distort={distort * 0.7}
          speed={distortSpeed * 1.15}
          transparent
          opacity={0.92}
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
          color={state === 'thinking' ? '#c4b5fd' : '#7dd3fc'}
          transparent
          opacity={state === 'idle' ? 0.5 : 0.85}
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

const CssOrbFallback: React.FC<{ state: OrbState }> = ({ state }) => (
  <div className="relative flex h-full w-full items-center justify-center">
    <div
      className={`h-3/4 w-3/4 rounded-full bg-gradient-to-br from-cyan-400/75 via-indigo-500/80 to-violet-600/80 shadow-[0_0_65px_rgba(56,189,248,0.45)] transition-transform duration-700 ${
        state === 'speaking'
          ? 'scale-105'
          : state === 'listening'
            ? 'scale-100'
            : 'animate-orb-halo'
      }`}
    />
  </div>
);

export const AiOrb3D: React.FC<AiOrb3DProps> = ({
  state = 'idle',
  size = 'lg',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${SIZE_CLASSES[size]} ${className}`}>
      {/* Ambient aura behind orb */}
      <div
        className={`pointer-events-none absolute inset-3 rounded-full blur-2xl transition-all duration-700 ${
          state === 'listening'
            ? 'bg-cyan-400/25 scale-110'
            : state === 'speaking'
              ? 'bg-sky-400/30 scale-110'
              : state === 'thinking'
                ? 'bg-violet-500/28 scale-105'
                : 'bg-indigo-500/20 scale-100'
        }`}
      />

      {/* Expanding waveform rings when listening or speaking */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          <span
            className={`pointer-events-none absolute inset-2 rounded-full border ${
              state === 'listening' ? 'border-cyan-400/35' : 'border-indigo-400/30'
            } animate-ping`}
            style={{ animationDuration: state === 'listening' ? '2.2s' : '2.8s' }}
          />
          <span
            className="pointer-events-none absolute inset-6 rounded-full border border-sky-300/20 animate-pulse"
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

      <WebGLErrorBoundary fallback={<CssOrbFallback state={state} />}>
        <div className="h-full w-full">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.1], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <OrbScene state={state} />
          </Canvas>
        </div>
      </WebGLErrorBoundary>
    </div>
  );
};

