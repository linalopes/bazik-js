/**
 * Main-pass Canvas 2D FX (echo wash, loufi) — legacy behavior preserved.
 */
import { ctx, W, H } from '../../graphics/context';
import type { RenderSnapshot } from '../../graphics/engine/renderSnapshot';
import { getFxAmount } from './fxAmount';

export function drawEchoBackground(snap: RenderSnapshot): void {
  const echo = getFxAmount(snap, 'echo');
  const echoAlpha = echo > 0 ? 0.85 - echo * 0.006 : 0.88;
  const fade = snap.fade / 100;
  ctx.globalAlpha = echoAlpha - fade * 0.5;
  ctx.fillStyle = snap.isBreak ? 'rgba(234,125,255,0.04)' : '#050210';
  ctx.fillRect(0, 0, W, H);
}

export function applyLoufiPixelate(snap: RenderSnapshot): void {
  const loufi = getFxAmount(snap, 'loufi');
  if (loufi <= 0) return;
  const block = Math.max(1, Math.round(loufi * 0.12));
  if (block <= 1) return;
  ctx.globalAlpha = 1;
  const iData = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y += block)
    for (let x = 0; x < W; x += block) {
      const idx = (y * W + x) * 4;
      ctx.fillStyle = `rgb(${iData.data[idx]!},${iData.data[idx + 1]!},${iData.data[idx + 2]!})`;
      ctx.fillRect(x, y, block, block);
    }
}
