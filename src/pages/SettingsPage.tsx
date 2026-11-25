import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Captions,
  Cpu,
  Mic,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSoviaVoice } from '../hooks/useSoviaVoice';
import { AI_INTEGRATION_STATUS } from '../services/aiInterfaces';

export const SettingsPage: React.FC = () => {
  const { user, settings, updateSettings, deleteAllHistory } = useApp();
  const { isSpeaking, voiceName, speak, stopSpeaking } = useSoviaVoice();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletedBanner, setDeletedBanner] = useState(false);

  const handleDeleteHistory = () => {
    deleteAllHistory();
    setConfirmDelete(false);
    setDeletedBanner(true);
    window.setTimeout(() => setDeletedBanner(false), 3500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6 pb-10 max-w-4xl"
    >
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Privacy & Preferences</span>
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
          Settings & Privacy
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Control voice preferences, optional hardware permissions, and local demo data.
        </p>
      </div>

      {deletedBanner && (
        <div className="rounded-2xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-200">
          All local session history, assessment answers, and custom reports have been cleared.
        </div>
      )}

      {/* Profile */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-4 w-4 text-cyan-300" />
          <h2 className="text-base font-semibold text-white">Profile</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/25 border border-indigo-400/35 text-sm font-semibold text-white">
              {user?.avatarInitials ?? 'SV'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {user?.name ?? 'Guest Explorer'}
              </p>
              <p className="text-xs text-slate-400">{user?.email ?? 'guest@sovia.space'}</p>
            </div>
          </div>
          <span className="self-start sm:self-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
            Local Prototype Account
          </span>
        </div>
      </div>

      {/* Voice & Experience Preferences */}
      <div className="glass-panel rounded-3xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-cyan-300" />
            <div>
              <h2 className="text-base font-semibold text-white">Voice & Presence</h2>
              <p className="text-[11px] text-slate-400">Active system voice: {voiceName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              isSpeaking
                ? stopSpeaking()
                : speak(
                    "Hey, I'm Sovia. I'm right here to listen and take this one step at a time with you.",
                    { force: true }
                  )
            }
            className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-400/20 transition cursor-pointer"
          >
            {isSpeaking ? 'Stop Voice Preview' : 'Preview Sovia Voice'}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              SOVIA Voice Persona
            </label>
            <select
              value={settings.voiceId}
              onChange={(e) =>
                updateSettings({
                  voiceId: e.target.value as typeof settings.voiceId,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/75 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
            >
              <option value="sovia_warm">SOVIA Warm (Gentle & Empathetic)</option>
              <option value="sovia_calm">SOVIA Calm (Soft Evening Cadence)</option>
              <option value="sovia_clarity">SOVIA Clarity (Grounded & Crisp)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Speaking Pace ({settings.voiceSpeed.toFixed(1)}×)
            </label>
            <input
              type="range"
              min={0.8}
              max={1.3}
              step={0.1}
              value={settings.voiceSpeed}
              onChange={(e) => updateSettings({ voiceSpeed: Number(e.target.value) })}
              className="w-full accent-cyan-400 mt-2"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-white/10">
          <ToggleRow
            icon={Captions}
            title="Show Live Transcript"
            description="Display spoken AI reflections and your responses in text form."
            checked={settings.showTranscript}
            onChange={(val) => updateSettings({ showTranscript: val })}
          />
          <ToggleRow
            icon={Sparkles}
            title="Ambient Background Particles"
            description="Subtle starlight motion behind glass surfaces (automatically reduced on mobile)."
            checked={settings.ambientParticles}
            onChange={(val) => updateSettings({ ambientParticles: val })}
          />
        </div>
      </div>

      {/* Permissions (Mic & Optional Camera) */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          <h2 className="text-base font-semibold text-white">
            Device Permissions & Biometric Opt-In
          </h2>
        </div>

        <ToggleRow
          icon={Mic}
          title="Microphone Access (Demo Voice UI)"
          description="Allows simulated voice-first check-ins and live session microphone controls."
          checked={settings.microphoneGranted}
          onChange={(val) => updateSettings({ microphoneGranted: val })}
        />

        <ToggleRow
          icon={Camera}
          title="Optional Camera Emotion Sensing"
          description="Disabled by default. Only activates when you explicitly opt in for future facial affect integration."
          checked={settings.cameraEnabled}
          onChange={(val) => updateSettings({ cameraEnabled: val })}
        />
      </div>

      {/* Data & Privacy Controls */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Trash2 className="h-4 w-4 text-rose-300" />
          <h2 className="text-base font-semibold text-white">Data & Privacy Controls</h2>
        </div>

        <ToggleRow
          icon={ShieldCheck}
          title="Save Demo History Locally"
          description="Keep your check-ins, reports, and custom schedule in this browser."
          checked={settings.saveLocalHistory}
          onChange={(val) => updateSettings({ saveLocalHistory: val })}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4">
          <div>
            <p className="text-sm font-medium text-white">Delete Session History</p>
            <p className="text-xs text-slate-400">
              Erase all saved local sessions, assessment answers, and generated wellness reports.
            </p>
          </div>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 rounded-full border border-rose-400/35 bg-rose-500/15 px-4 py-2 text-xs font-medium text-rose-200 hover:bg-rose-500/25 transition cursor-pointer"
            >
              Delete History
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteHistory}
                className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-400 transition cursor-pointer"
              >
                Confirm Erase
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Future AI Integration Architecture Status */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Cpu className="h-4 w-4 text-indigo-300" />
          <h2 className="text-base font-semibold text-white">
            AI Architecture Adapter Status
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          SOVIA is structured with decoupled TypeScript service interfaces ready for future
          production models.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {Object.entries(AI_INTEGRATION_STATUS).map(([key, status]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-xs"
            >
              <span className="capitalize text-slate-300">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="text-cyan-300/90 font-medium">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface ToggleRowProps {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-cyan-300 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors ${
        checked
          ? 'border-cyan-400/60 bg-cyan-400/80'
          : 'border-white/15 bg-slate-800'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform mt-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

