import type { AlertSeverity } from './alert-data';

// Preload HTML5 Audio element for reliable mobile playback
let alertAudio: HTMLAudioElement | null = null;

function getAlertAudio(): HTMLAudioElement {
  if (!alertAudio) {
    alertAudio = new Audio('/alert-sound.wav');
    alertAudio.preload = 'auto';
    alertAudio.volume = 1.0;
  }
  return alertAudio;
}

/**
 * Must be called from a user gesture (click/touch) to unlock audio on iOS/Android.
 * Plays a silent moment to allow future programmatic playback.
 */
export function unlockAudio() {
  try {
    const audio = getAlertAudio();
    // Play and immediately pause to unlock audio on iOS Safari
    const p = audio.play();
    if (p) {
      p.then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => { /* ignore */ });
    }
  } catch {
    // ignore
  }
}

/** Trigger device vibration (works on Android even in silent mode) */
function vibrateDevice(severity: 'critical' | 'high') {
  if (!navigator.vibrate) return;
  if (severity === 'critical') {
    navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500]);
  } else {
    navigator.vibrate([400, 200, 400, 200, 400]);
  }
}

/**
 * Plays the alert siren sound using HTML5 Audio API.
 * This is far more reliable than Web Audio API on mobile devices.
 * Also triggers device vibration.
 */
export function playAlertSound(severity: 'critical' | 'high' = 'critical') {
  // Vibrate device
  vibrateDevice(severity);

  try {
    const audio = getAlertAudio();
    audio.volume = severity === 'critical' ? 1.0 : 0.8;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // HTML5 Audio blocked — try Web Audio API as fallback
        playWebAudioFallback(severity);
      });
    }
  } catch {
    // Last resort fallback
    playWebAudioFallback(severity);
  }
}

/** Web Audio API fallback if HTML5 Audio fails */
function playWebAudioFallback(severity: 'critical' | 'high') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    const dur = severity === 'critical' ? 4.0 : 3.0;
    const vol = severity === 'critical' ? 0.6 : 0.5;
    const freqHi = severity === 'critical' ? 1000 : 880;
    const freqLo = severity === 'critical' ? 700 : 660;
    const count = severity === 'critical' ? 16 : 10;
    const step = dur / count;

    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.gain.setValueAtTime(1.0, now + dur - 0.5);
    masterGain.gain.linearRampToValueAtTime(0, now + dur);

    for (let i = 0; i < count; i++) {
      const freq = i % 2 === 0 ? freqHi : freqLo;
      const start = i * step;
      const end = (i + 1) * step;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(vol, now + start + 0.03);
      gain.gain.setValueAtTime(vol, now + end - 0.03);
      gain.gain.linearRampToValueAtTime(0, now + end);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + start);
      osc.stop(now + end);
    }
  } catch {
    // Both audio methods failed — vibration is the last resort
  }
}

/** Check if a severity should trigger the urgent alarm */
export function isUrgentSeverity(severity: AlertSeverity): boolean {
  return severity === 'critical' || severity === 'high';
}

/** Check if Notification API is available in this browser */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/** Safely request notification permission — no-op if unsupported */
export function requestNotificationPermission() {
  if (isNotificationSupported() && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/** Safely send a browser notification — no-op if unsupported */
export function sendNotification(title: string, body: string, icon?: string, tag?: string) {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: icon || '/icon-192.png', tag });
  } catch {
    // Some environments throw even after feature detection
  }
}
