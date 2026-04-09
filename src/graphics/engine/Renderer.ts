/**
 * Canvas 2D frame orchestration — no audio, DOM, or app auto-mode logic.
 * Call from {@link ../render.ts} after upstream systems (e.g. audio analysis) have run.
 */
import * as MainPass from './MainPass';
import { runPostFxPipeline } from './FXPipeline';
import type { RenderSnapshot } from './renderSnapshot';

export type CanvasFramePhase = 'fadeEarlyExit' | 'complete';

export function renderCanvas2DFrame(snapshot: RenderSnapshot): CanvasFramePhase {
  MainPass.drawEchoBackground(snapshot);
  MainPass.applyLoufiPixelate(snapshot);
  MainPass.resetAlphaBeforeFade();
  if (MainPass.applyFadeOverlay(snapshot)) {
    return 'fadeEarlyExit';
  }

  const t = MainPass.computeSceneTime(snapshot);
  MainPass.drawCurrentPreset(t, snapshot);
  runPostFxPipeline(snapshot);
  return 'complete';
}
