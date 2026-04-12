import type { RenderSnapshot } from './engine/renderSnapshot';
import { ctx, W, H } from './context';
import { hex2rgb } from '../utils/color';

export type PresetDrawFn = (t: number, snap: RenderSnapshot) => void;

/**
 * Single preview implementation for all bank slots: background from palette + soft EQ motion (shell only).
 */
export function drawPreviewPlaceholder(_t: number, snap: RenderSnapshot): void {
  const [br, bg, bb] = hex2rgb(snap.colors[3] ?? '#050210');
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgb(${br},${bg},${bb})`;
  ctx.fillRect(0, 0, W, H);

  const w3 = W / 3;
  for (let i = 0; i < 3; i++) {
    const h = Math.max(4, snap.eq[i]! * H * 0.28);
    const [r, g, b] = hex2rgb(snap.colors[i % 3] ?? '#ffffff');
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(i * w3 + 10, H - h - 14, w3 - 20, h);
  }
  ctx.globalAlpha = 1;

  const s = snap.fade;
  if (s < 0) {
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = (Math.abs(s) / 100) * 0.92;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  } else if (s > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = (s / 100) * 0.92;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}
