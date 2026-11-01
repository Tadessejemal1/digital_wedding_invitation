/** Short scanner feedback tones generated with Web Audio (no sound files needed). */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Phones only allow audio after a tap — call this from any user tap to unlock it. */
export function unlockScanSounds() {
  getContext();
}

function tone(freq: number, start: number, duration: number, type: OscillatorType) {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime + start;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** Two rising beeps. */
export function playSuccessSound() {
  tone(880, 0, 0.12, "sine");
  tone(1320, 0.14, 0.18, "sine");
  navigator.vibrate?.(80);
}

/** Low double buzz. */
export function playRejectSound() {
  tone(220, 0, 0.25, "square");
  tone(160, 0.3, 0.35, "square");
  navigator.vibrate?.([200, 100, 200]);
}
