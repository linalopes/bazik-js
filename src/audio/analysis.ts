/**
 * Public entry for the animation loop and mic toggle. Implementation is split under `./`.
 * Frame deps are built by the orchestration layer so this path does not read global app state.
 */
import { toggleMic as toggleMicInput } from './AudioInput';
import { runAudioAnalysisFrame, type AudioEngineFrameDeps } from './AudioEngine';
import { publishAudioFrame } from './AudioFeatureBus';
import type { AudioFeatures } from './types';

export { type AudioFeatures } from './types';
export type { AudioEngineFrameDeps };

export async function toggleMic(): Promise<void> {
  await toggleMicInput();
}

export function analyzeAudio(deps: AudioEngineFrameDeps): AudioFeatures {
  const features = runAudioAnalysisFrame(deps);
  publishAudioFrame(features);
  return features;
}
