import type { AudioFeatures } from './types';

/** Mic button adapter: keeps DOM details out of audio input logic. */
export function setMicButtonState(isActive: boolean): void {
  const btn = document.getElementById('mic-btn');
  if (!btn) return;
  btn.textContent = isActive ? 'mic on' : 'mic off';
  btn.classList.toggle('active', isActive);
}

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
