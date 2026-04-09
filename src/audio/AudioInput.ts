/**
 * Microphone capture and Web Audio analyser graph. Owns raw buffers only.
 */
import { S, writeMicActive } from '../core/state';
import { setMicButtonState } from './audioUiAdapter';

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let frequencyData: Uint8Array<ArrayBuffer> | null = null;
let timeDomainData: Uint8Array<ArrayBuffer> | null = null;

export function isLiveAudioActive(): boolean {
  return analyser !== null && frequencyData !== null && timeDomainData !== null;
}

export function getAnalyserSnapshot(): {
  analyser: AnalyserNode;
  frequencyData: Uint8Array<ArrayBuffer>;
  timeDomainData: Uint8Array<ArrayBuffer>;
} | null {
  if (!analyser || !frequencyData || !timeDomainData) return null;
  return { analyser, frequencyData, timeDomainData };
}

/** Fill buffers from the live graph (call once per frame when active). */
export function pullAnalyserFrames(): void {
  const snap = getAnalyserSnapshot();
  if (!snap) return;
  snap.analyser.getByteFrequencyData(snap.frequencyData);
  snap.analyser.getByteTimeDomainData(snap.timeDomainData);
}

export async function toggleMic(): Promise<void> {
  if (S.micActive) {
    if (audioCtx) {
      await audioCtx.close();
      audioCtx = null;
      analyser = null;
      frequencyData = null;
      timeDomainData = null;
    }
    writeMicActive(false);
    setMicButtonState(false);
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AC();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;
    const src = audioCtx.createMediaStreamSource(stream);
    src.connect(analyser);
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    timeDomainData = new Uint8Array(analyser.fftSize);
    writeMicActive(true);
    setMicButtonState(true);
  } catch {
    alert('Microphone access denied or unavailable.');
  }
}
