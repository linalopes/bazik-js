/**
 * Assembles {@link AudioFeatures} and applies them to app state + BPM label (legacy wiring).
 */
import type { AudioFeatures } from './types';
import { writeEqAll, writeBanger } from '../core/state';
import { renderBpmDisplay } from './audioUiAdapter';

export function applyAudioFeaturesToState(features: AudioFeatures): void {
  writeEqAll([features.processed.bass, features.processed.mid, features.processed.high]);
  writeBanger(features.beatPulse);
}

export function syncBpmDisplay(features: AudioFeatures): void {
  renderBpmDisplay(features);
}

/** Convenience: state writes + DOM (matches old `analyzeAudio` tail). */
export function publishAudioFrame(features: AudioFeatures): void {
  applyAudioFeaturesToState(features);
  syncBpmDisplay(features);
}
