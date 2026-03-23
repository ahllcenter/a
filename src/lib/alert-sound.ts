import type { AlertSeverity } from './alert-data';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Must be called from a user gesture (click/touch) to unlock AudioContext.
 * iOS Safari and many Android browsers require this before any programmatic playback.
 */
export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    // Play a silent buffer to fully unlock on iOS
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch {
    // ignore
  }
}

/** Trigger device vibration (works on Android even in silent mode) */
function vibrateDevice(severity: 'critical' | 'high') {
  if (!navigator.vibrate) return;
  if (severity === 'critical') {
    // Long urgent pattern: vibrate-pause-vibrate-pause-vibrate
    navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500]);
  } else {
    navigator.vibrate([400, 200, 400, 200, 400]);
  }
}

/**
 * Plays an urgent alert siren sound at MAXIMUM volume.
 * Uses Web Audio API which can bypass silent mode on many Android devices.
 * Also triggers device vibration.
 * Only meant for 'critical' and 'high' severity alerts.
 */
export function playAlertSound(severity: 'critical' | 'high' = 'critical') {
  // Vibrate device (works even in silent mode on Android)
  vibrateDevice(severity);

  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    if (severity === 'critical') {
      // Critical: full volume, longer duration, more aggressive
      masterGain.gain.setValueAtTime(1.0, now);
      masterGain.gain.setValueAtTime(1.0, now + 3.5);
      masterGain.gain.linearRampToValueAtTime(0, now + 4.0);

      // Fast alternating siren — 3 layers for maximum urgency
      const tones: { freq: number; start: number; end: number }[] = [];
      for (let i = 0; i < 16; i++) {
        tones.push({
          freq: i % 2 === 0 ? 1000 : 700,
          start: i * 0.25,
          end: (i + 1) * 0.25,
        });
      }

      tones.forEach(({ freq, start, end }) => {
        // Main tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.6, now + start + 0.03);
        gain.gain.setValueAtTime(0.6, now + end - 0.03);
        gain.gain.linearRampToValueAtTime(0, now + end);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + start);
        osc.stop(now + end);

        // Harmonic overlay for piercing effect
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 1.5, now + start);
        gain2.gain.setValueAtTime(0, now + start);
        gain2.gain.linearRampToValueAtTime(0.3, now + start + 0.03);
        gain2.gain.setValueAtTime(0.3, now + end - 0.03);
        gain2.gain.linearRampToValueAtTime(0, now + end);
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start(now + start);
        osc2.stop(now + end);
      });
    } else {
      // High: loud but slightly shorter
      masterGain.gain.setValueAtTime(0.8, now);
      masterGain.gain.setValueAtTime(0.8, now + 2.5);
      masterGain.gain.linearRampToValueAtTime(0, now + 3.0);

      const tones: { freq: number; start: number; end: number }[] = [];
      for (let i = 0; i < 10; i++) {
        tones.push({
          freq: i % 2 === 0 ? 880 : 660,
          start: i * 0.3,
          end: (i + 1) * 0.3,
        });
      }

      tones.forEach(({ freq, start, end }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.5, now + start + 0.04);
        gain.gain.setValueAtTime(0.5, now + end - 0.04);
        gain.gain.linearRampToValueAtTime(0, now + end);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + start);
        osc.stop(now + end);
      });
    }
  } catch {
    // Fallback: vibration already triggered above
  }
}

/** Check if a severity should trigger the urgent alarm */
export function isUrgentSeverity(severity: AlertSeverity): boolean {
  return severity === 'critical' || severity === 'high';
}
