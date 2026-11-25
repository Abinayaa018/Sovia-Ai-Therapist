import type { MusicTrack } from '../types';

/**
 * Lightweight Web Audio API ambient synthesizer so the frontend music player
 * and sound controls produce soothing harmonic soundscapes without relying
 * on external audio URLs that can fail or trigger CORS errors.
 */
class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private currentTrackId: string | null = null;
  private isPlaying = false;

  private ensureContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public startTrack(track: MusicTrack, volume: number) {
    try {
      this.ensureContext();
      if (!this.ctx || !this.masterGain) return;

      if (this.currentTrackId !== track.id) {
        this.stopOscillators();
        this.currentTrackId = track.id;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 640;
        filter.Q.value = 0.7;
        filter.connect(this.masterGain);

        this.lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        this.lfo.frequency.value = 0.12;
        lfoGain.gain.value = 120;
        this.lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        this.lfo.start();

        track.chordFreqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const voiceGain = this.ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.value = freq;
          voiceGain.gain.value = idx === 0 ? 0.14 : 0.06;
          osc.connect(voiceGain);
          voiceGain.connect(filter);
          osc.start();
          this.oscillators.push(osc);
        });
      }

      const targetGain = Math.max(0.001, Math.min(0.32, volume * 0.28));
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.6);
      this.isPlaying = true;
    } catch {
      // Fail gracefully if browser blocks autoplay before user gesture
    }
  }

  public setVolume(volume: number) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const targetGain = Math.max(0.001, Math.min(0.32, volume * 0.28));
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.15);
  }

  public pause() {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);
    this.isPlaying = false;
  }

  private stopOscillators() {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore already-stopped nodes
      }
    });
    this.oscillators = [];
    if (this.lfo) {
      try {
        this.lfo.stop();
        this.lfo.disconnect();
      } catch {
        // Ignore
      }
      this.lfo = null;
    }
  }

  public dispose() {
    this.pause();
    this.stopOscillators();
    this.currentTrackId = null;
  }
}

export const ambientAudio = new AmbientAudioEngine();

