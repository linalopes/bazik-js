import type { AudioFeatures } from './types';

/** Mic UI is bound to `micActive` in Svelte; `writeMicActive` is the source of truth. */
export function setMicButtonState(_isActive: boolean): void {}

/** BPM display adapter: keeps DOM details out of audio feature bus. */
export function renderBpmDisplay(features: AudioFeatures): void {
  const bpmEl = document.getElementById('bpm-display');
  if (!bpmEl) return;
  if (features.bpmDisplayIsApprox) {
    bpmEl.textContent = '~ ' + Math.round(features.bpmDisplayValue) + ' BPM';
    bpmEl.classList.remove('beat');
    return;
  }
  bpmEl.textContent = (features.beatPulse ? '♦ ' : '') + Math.round(features.bpmDisplayValue) + ' BPM';
  bpmEl.classList.toggle('beat', features.beatPulse === 1);
}
