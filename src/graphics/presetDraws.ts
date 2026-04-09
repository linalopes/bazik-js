import type { RenderSnapshot } from './engine/renderSnapshot';
import { hex2rgb } from '../utils/color';
import { ctx, W, H } from './context';
import { renderBarsWebGLPass } from './webgl/presets/bars/BarsRenderer';
import { renderTriangleWebGLPass } from './webgl/presets/triangle/TriangleRenderer';
import { renderTunnelWebGLPass } from './webgl/presets/tunnel/TunnelRenderer';

export type PresetDrawFn = (t: number, snap: RenderSnapshot) => void;

function getColor(snap: RenderSnapshot, i: number, alpha: number): string {
  const pal = snap.colors;
  const [r, g, b] = hex2rgb(pal[i % pal.length]!);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function drawScatter(t: number, snap: RenderSnapshot) {
  const n = 30 + snap.currentMode * 8 + Math.round(snap.par1 * 0.3);
  const spread = 1 + snap.explode * 0.008 * (1 + snap.banger);
  ctx.shadowBlur = 0;
  for (let i = 0; i < Math.min(n, 100); i++) {
    const seed = i * 137.508;
    const angle = seed + t;
    const dist = (40 + i * 4.5) * snap.eq[i % 3]! * spread * 2;
    const px = W / 2 + Math.cos(angle) * dist;
    const py = H / 2 + Math.sin(angle * 0.72) * dist * 0.7;
    const sz = (2 + snap.eq[0]! * 10 + (i % 3 === 0 ? snap.eq[2]! * 8 : 0)) * (1 + snap.banger * 0.4);
    ctx.globalAlpha = 0.35 + snap.eq[i % 3]! * 0.55;
    ctx.fillStyle = getColor(snap, i, 1);
    const sh = (i + snap.currentPreset) % 4;
    if (sh === 0) {
      ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
    } else if (sh === 1) {
      ctx.beginPath();
      ctx.arc(px, py, sz / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (sh === 2) {
      ctx.beginPath();
      ctx.moveTo(px, py - sz);
      ctx.lineTo(px + sz, py + sz);
      ctx.lineTo(px - sz, py + sz);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(t * 0.5 + i);
      ctx.fillRect(-sz / 2, -sz / 6, sz, sz / 3);
      ctx.fillRect(-sz / 6, -sz / 2, sz / 3, sz);
      ctx.restore();
    }
  }
}

export function drawCrystal(t: number, snap: RenderSnapshot) {
  const n = 6 + snap.currentMode * 2;
  const r0 = 60 + snap.eq[0]! * 180 + snap.par1 * 0.5;
  ctx.lineWidth = 1 + snap.eq[1]! * 2;
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * Math.PI * 2 + t * 0.3;
    const a2 = a1 + Math.PI / n;
    const r1 = r0 * (0.5 + snap.eq[i % 3]! * 0.8);
    const r2 = r0 * (0.3 + snap.eq[(i + 1) % 3]! * 0.6);
    ctx.globalAlpha = 0.5 + snap.banger * 0.3;
    ctx.strokeStyle = getColor(snap, i, 1);
    ctx.fillStyle = getColor(snap, i + 1, 0.08 + snap.eq[i % 3]! * 0.1);
    ctx.beginPath();
    ctx.moveTo(W / 2, H / 2);
    ctx.lineTo(W / 2 + Math.cos(a1) * r1, H / 2 + Math.sin(a1) * r1);
    ctx.lineTo(W / 2 + Math.cos(a2) * r2, H / 2 + Math.sin(a2) * r2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

/** Legacy Canvas tunnel (unused in preset bank; kept for reference / tooling). */
export function drawTunnelCanvas2D(t: number, snap: RenderSnapshot) {
  const rings = 10 + snap.currentMode * 2;
  for (let i = rings; i > 0; i--) {
    const pct = i / rings;
    const r = pct * Math.min(W, H) * 0.55 * (1 + snap.eq[0]! * 0.3);
    const alpha = (1 - pct) * 0.6 + snap.eq[i % 3]! * 0.3;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = getColor(snap, i, 1);
    ctx.lineWidth = 1 + snap.eq[i % 3]! * 3;
    const sides = 3 + (snap.currentMode % 5) + (i % 3);
    ctx.beginPath();
    for (let k = 0; k <= sides; k++) {
      const a = (k / sides) * Math.PI * 2 + t * (i % 2 === 0 ? 0.4 : -0.4) * (snap.speed / 50);
      const x = W / 2 + Math.cos(a) * r + Math.sin(t + i) * snap.par1 * 0.5;
      const y = H / 2 + Math.sin(a) * r + Math.cos(t + i) * snap.par2 * 0.5;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

export function drawOrbs(t: number, snap: RenderSnapshot) {
  const n = 3 + snap.currentMode;
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 + t * (0.5 + i * 0.1);
    const orbit = 80 + snap.par1 * 0.8 + snap.eq[1]! * 120;
    const px = W / 2 + Math.cos(angle) * orbit;
    const py = H / 2 + Math.sin(angle) * orbit * 0.6;
    const r = 20 + snap.eq[i % 3]! * 60 * (1 + snap.banger * 0.5);
    const grd = ctx.createRadialGradient(px, py, 0, px, py, r);
    const [r0, g0, b0] = hex2rgb(snap.colors[i % 3]!);
    grd.addColorStop(0, `rgba(${r0},${g0},${b0},0.9)`);
    grd.addColorStop(1, `rgba(${r0},${g0},${b0},0)`);
    ctx.globalAlpha = 0.7 + snap.eq[i % 3]! * 0.3;
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = getColor(snap, i, 1);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, r * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawLattice(t: number, snap: RenderSnapshot) {
  const cols = 4 + snap.currentMode * 2;
  const rows = Math.round(cols * (H / W));
  const cw = W / cols;
  const ch = H / rows;
  ctx.lineWidth = 0.5 + snap.eq[1]! * 1.5;
  for (let c = 0; c < cols; c++) {
    for (let row = 0; row < rows; row++) {
      const px = c * cw + cw / 2;
      const py = row * ch + ch / 2;
      const dist = Math.hypot(px - W / 2, py - H / 2);
      const wave = Math.sin(dist * 0.02 - t * 2 + snap.par1 * 0.05) * 0.5 + 0.5;
      const sz = (cw * 0.3 + snap.eq[0]! * cw * 0.4) * wave;
      ctx.globalAlpha = 0.2 + wave * 0.5 + snap.eq[(c + row) % 3]! * 0.3;
      ctx.strokeStyle = getColor(snap, c + row, 1);
      ctx.strokeRect(px - sz / 2, py - sz / 2, sz, sz);
    }
  }
}

export function drawPulse(t: number, snap: RenderSnapshot) {
  const rings = 5 + snap.currentMode * 3;
  for (let i = 0; i < rings; i++) {
    const phase = i / rings + t * 0.4;
    const r = ((phase % 1.0) * Math.min(W, H) * 0.6) * (1 + snap.eq[0]! * 0.5);
    const alpha = (1 - (phase % 1)) * (0.3 + snap.eq[i % 3]! * 0.5);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = getColor(snap, i, 1);
    ctx.lineWidth = 1.5 + snap.eq[i % 3]! * 4;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.8 + snap.banger * 0.2;
  const cr = 4 + snap.eq[0]! * 20 * (1 + snap.banger);
  ctx.fillStyle = getColor(snap, 0, 1);
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, cr, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCascade(t: number, snap: RenderSnapshot) {
  const lines = 8 + snap.currentMode * 4;
  for (let i = 0; i < lines; i++) {
    const x = (i / lines) * W;
    const amp = 40 + snap.eq[i % 3]! * 120 + snap.par2 * 0.8;
    const freq = 0.005 + i * 0.001 + snap.par1 * 0.00005;
    ctx.globalAlpha = 0.3 + snap.eq[i % 3]! * 0.5;
    ctx.strokeStyle = getColor(snap, i, 1);
    ctx.lineWidth = 1 + snap.eq[i % 3]! * 2;
    ctx.beginPath();
    for (let y = 0; y <= H; y += 3) {
      const xo = x + Math.sin(y * freq + t + i) * amp;
      if (y === 0) ctx.moveTo(xo, y);
      else ctx.lineTo(xo, y);
    }
    ctx.stroke();
  }
}

export function drawGlitch(t: number, snap: RenderSnapshot) {
  const slices = 4 + snap.currentMode * 3;
  const sliceH = H / slices;
  for (let i = 0; i < slices; i++) {
    const offset = (Math.random() - 0.5) * (snap.eq[0]! * 60 + snap.par1 * 0.5) * (snap.banger ? 3 : 1);
    const pal = snap.colors;
    const [r, g, b] = hex2rgb(pal[i % pal.length]!);
    ctx.fillStyle = `rgba(${r},${g},${b},${0.1 + snap.eq[i % 3]! * 0.3})`;
    ctx.globalAlpha = 0.5 + snap.eq[i % 3]! * 0.4;
    if (Math.random() > 0.7) {
      ctx.fillRect(offset, i * sliceH, W, sliceH);
    }
    ctx.globalAlpha = 0.06 + snap.eq[2]! * 0.08;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, i * sliceH, W, 1);
  }
  ctx.globalAlpha = 0.4 + snap.banger * 0.4;
  ctx.strokeStyle = getColor(snap, 0, 1);
  ctx.lineWidth = snap.eq[0]! * 3;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, H * 0.5 + Math.sin(t) * 40);
  ctx.lineTo(W * 0.8, H * 0.5 + Math.cos(t) * 40);
  ctx.stroke();
}

/** WebGL2 bars preset — blits into the main 2D canvas; see `renderBarsWebGLPass`. */
export function drawBarsWebGL(t: number, snap: RenderSnapshot): void {
  renderBarsWebGLPass(t, snap);
}

/** WebGL2 triangle preset — same offscreen pipeline + FX stack as bars. */
export function drawTriangleWebGL(t: number, snap: RenderSnapshot): void {
  renderTriangleWebGLPass(t, snap);
}

/** WebGL2 tunnel preset — shared preset pipeline + echo/zoom. */
export function drawTunnelWebGL(t: number, snap: RenderSnapshot): void {
  renderTunnelWebGLPass(t, snap);
}
