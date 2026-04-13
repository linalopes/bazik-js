import { writable } from 'svelte/store';
import type { AudioFeatures } from '../../audio/types';

export interface BpmFeedbackState {
  value: number | null;
  isApprox: boolean;
  beatPulse: 0 | 1;
}

export const bpmFeedback = writable<BpmFeedbackState>({
  value: null,
  isApprox: true,
  beatPulse: 0,
});

export function writeBpmFeedback(features: AudioFeatures): void {
  bpmFeedback.set({
    value: features.bpmDisplayValue,
    isApprox: features.bpmDisplayIsApprox,
    beatPulse: features.beatPulse,
  });
}
