/**
 * Shell frame: sync 2D canvas size, run the shared preview draw for the selected bank slot.
 */
import { syncMainCanvasSize } from '../context';
import { PRESETS } from '../../presets/list';
import type { RenderSnapshot } from './renderSnapshot';

export type FramePhase = 'complete';

export function renderFrame(snapshot: RenderSnapshot): FramePhase {
  syncMainCanvasSize();
  /* speed −100..+100; 0 → same time scale as legacy mid-knob (50/50 = 1). */
  const t = snapshot.frame * 0.018 * (1 + snapshot.speed / 100);
  PRESETS[snapshot.currentPreset]?.draw(t, snapshot);
  return 'complete';
}
