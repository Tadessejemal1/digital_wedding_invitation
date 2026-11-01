/**
 * Scanner feedback sounds. Tones are rendered into small WAV files in memory and played
 * through <audio> elements: unlike Web Audio, these still play when an iPhone's silent
 * switch is on. Phones only allow audio after a tap, so call unlockScanSounds() from one.
 */
const SAMPLE_RATE = 22050;

type Tone = { freq: number; start: number; duration: number; square?: boolean };

function renderWav(tones: Tone[]): string {
  const total = Math.max(...tones.map((t) => t.start + t.duration)) + 0.05;
  const n = Math.ceil(total * SAMPLE_RATE);
  const samples = new Float32Array(n);
  for (const t of tones) {
    const from = Math.floor(t.start * SAMPLE_RATE);
    const len = Math.floor(t.duration * SAMPLE_RATE);
    for (let i = 0; i < len && from + i < n; i++) {
      const phase = (2 * Math.PI * t.freq * i) / SAMPLE_RATE;
      const wave = t.square ? Math.sign(Math.sin(phase)) * 0.5 : Math.sin(phase);
      // Short fade in/out avoids clicks
      const env = Math.min(1, i / 200, (len - i) / 400);
      samples[from + i] += wave * env * 0.6;
    }
  }

  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) =>
    [...str].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + n * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, v * 0x7fff, true);
  }
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

let successAudio: HTMLAudioElement | null = null;
let rejectAudio: HTMLAudioElement | null = null;
let unlocked = false;

function ensureAudio() {
  if (typeof window === "undefined" || successAudio) return;
  // Two rising beeps
  successAudio = new Audio(
    renderWav([
      { freq: 880, start: 0, duration: 0.12 },
      { freq: 1320, start: 0.14, duration: 0.2 },
    ])
  );
  // Low double buzz
  rejectAudio = new Audio(
    renderWav([
      { freq: 220, start: 0, duration: 0.25, square: true },
      { freq: 160, start: 0.3, duration: 0.35, square: true },
    ])
  );
}

export function isScanSoundUnlocked() {
  return unlocked;
}

/** Must run inside a tap/click handler. Plays both sounds silently once to unlock them. */
export async function unlockScanSounds(): Promise<boolean> {
  ensureAudio();
  if (unlocked || !successAudio || !rejectAudio) return unlocked;
  try {
    const both = [successAudio, rejectAudio];
    // Start both plays synchronously — an await in between would lose the tap on iOS
    both.forEach((audio) => (audio.muted = true));
    await Promise.all(both.map((audio) => audio.play()));
    both.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    });
    unlocked = true;
  } catch {
    unlocked = false;
  }
  return unlocked;
}

function play(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}

export function playSuccessSound() {
  ensureAudio();
  play(successAudio);
  navigator.vibrate?.(80);
}

export function playRejectSound() {
  ensureAudio();
  play(rejectAudio);
  navigator.vibrate?.([200, 100, 200]);
}
