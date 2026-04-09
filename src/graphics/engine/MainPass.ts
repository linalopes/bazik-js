/**
 * Main 2D scene pass: clear/background, optional loufi pixelate, fade gate, preset content.
 */
import { drawEchoBackground, applyLoufiPixelate as applyLoufiPixelateFx } from '../../fx/execution/mainPassFx';
import { PRESETS } from '../../presets/list';
import { ctx, W, H } from '../context';
import type { RenderSnapshot } from './renderSnapshot';

export function computeSceneTime(snap: RenderSnapshot): number {
  return snap.frame * 0.018 * (snap.speed / 50);
}

export { drawEchoBackground };

export function applyLoufiPixelate(snap: RenderSnapshot): void {
  applyLoufiPixelateFx(snap);
}

export function resetAlphaBeforeFade(): void {
  ctx.globalAlpha = 1;
}

export function applyFadeOverlay(snap: RenderSnapshot): boolean {
  if (snap.fade <= 0) {
    ctx.globalAlpha = 1;
    return false;
  }
  ctx.globalAlpha = snap.fade / 100;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  return snap.fade >= 95;
}

export function drawCurrentPreset(t: number, snap: RenderSnapshot): void {
  ctx.globalAlpha = 1;
  PRESETS[snap.currentPreset]!.draw(t, snap);
}
