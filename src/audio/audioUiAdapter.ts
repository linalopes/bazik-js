import type { AudioFeatures } from './types';
import { writeBpmFeedback } from '../ui/stores/liveFeedbackStore';

/** Mic UI is bound to `micActive` in Svelte; `writeMicActive` is the source of truth. */
export function setMicButtonState(_isActive: boolean): void {}

/** BPM feedback is Svelte-bound from store state. */
export function renderBpmDisplay(features: AudioFeatures): void {
  writeBpmFeedback(features);
}
