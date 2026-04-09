import { getAllPresetEntries } from '../presets/PresetRegistry';
import type { PresetEntry } from '../presets/PresetRegistry';

const NEUTRAL_THUMB_PALETTE = ['#6E7385', '#A2A8BD', '#3E445C'] as const;

function drawGeneratedThumb(
  tx: CanvasRenderingContext2D,
  i: number,
  palette: readonly [string, string, string],
): void {
  const [c1, c2, c3] = palette;
  tx.fillStyle = '#050210';
  tx.fillRect(0, 0, 64, 64);
  const n = 12 + i * 4;
  for (let j = 0; j < n; j++) {
    const x = Math.random() * 64;
    const y = Math.random() * 64;
    const s = 1 + Math.random() * 6;
    tx.fillStyle = [c1, c2, c3][j % 3]!;
    tx.globalAlpha = 0.4 + Math.random() * 0.5;
    const sh = (j + i) % 4;
    if (sh === 0) tx.fillRect(x - s / 2, y - s / 2, s, s);
    else if (sh === 1) {
      tx.beginPath();
      tx.arc(x, y, s / 2, 0, Math.PI * 2);
      tx.fill();
    } else if (sh === 2) {
      tx.beginPath();
      tx.moveTo(x, y - s);
      tx.lineTo(x + s, y + s);
      tx.lineTo(x - s, y + s);
      tx.closePath();
      tx.fill();
    } else {
      tx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        tx.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
      }
      tx.closePath();
      tx.fill();
    }
    tx.globalAlpha = 1;
  }
}

function fallbackPalette(entry: PresetEntry): readonly [string, string, string] {
  const thumb = entry.manifest.thumbnail;
  if (thumb.kind === 'generated') return thumb.palette;
  const dc = entry.manifest.defaultColors;
  return [dc[0], dc[1], dc[2]];
}

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image failed to load: ${path}`));
    img.src = path;
  });
}

function drawBarsThumb(tx: CanvasRenderingContext2D, entry: PresetEntry): void {
  const dc = entry.manifest.defaultColors;
  tx.fillStyle = dc[3] ?? '#050210';
  tx.fillRect(0, 0, 64, 64);
  const w = 64 / 3;
  for (let b = 0; b < 3; b++) {
    tx.fillStyle = dc[b] ?? '#fff';
    const h = 44 + b * 3;
    tx.fillRect(b * w + 1, 64 - h, w - 2, h - 2);
  }
}

function drawTriangleThumb(tx: CanvasRenderingContext2D, entry: PresetEntry): void {
  const dc = entry.manifest.defaultColors;
  tx.fillStyle = dc[3] ?? '#050210';
  tx.fillRect(0, 0, 64, 64);
  const cx = 32;
  const cy = 30;
  const draw = (sc: number, fill: string) => {
    const h = 22 * sc;
    const w = h * 1.05;
    tx.fillStyle = fill;
    tx.beginPath();
    tx.moveTo(cx, cy - h * 0.55);
    tx.lineTo(cx - w, cy + h * 0.45);
    tx.lineTo(cx + w, cy + h * 0.45);
    tx.closePath();
    tx.fill();
  };
  draw(1, dc[0] ?? '#fff');
  draw(0.55, dc[1] ?? '#aaa');
  draw(0.28, dc[2] ?? '#888');
}

function drawTunnelThumb(tx: CanvasRenderingContext2D, entry: PresetEntry): void {
  const dc = entry.manifest.defaultColors;
  const bg = dc[3] ?? '#050210';
  tx.fillStyle = bg;
  tx.fillRect(0, 0, 64, 64);
  const cx = 32;
  const cy = 32;
  const c0 = dc[0] ?? '#aaa';
  const c1 = dc[1] ?? '#888';
  const c2 = dc[2] ?? '#666';

  const n = 13;
  for (let k = n; k >= 1; k--) {
    const t = k / n;
    const r = 3 + t * 27;
    const idx = k % 4;
    let col = c0;
    if (idx === 1) col = c1;
    else if (idx === 2) col = c2;
    else if (idx === 3) col = bg;
    tx.strokeStyle = col;
    tx.lineWidth = k <= 4 ? 2.0 : 1.15;
    tx.globalAlpha = 0.28 + t * 0.62;
    tx.beginPath();
    tx.arc(cx, cy, r, 0, Math.PI * 2);
    tx.stroke();
  }

  const grad = tx.createRadialGradient(cx, cy, 0, cx, cy, 11);
  grad.addColorStop(0, c0);
  grad.addColorStop(0.45, c1);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  tx.fillStyle = grad;
  tx.globalAlpha = 0.92;
  tx.beginPath();
  tx.arc(cx, cy, 10, 0, Math.PI * 2);
  tx.fill();
  tx.globalAlpha = 1;
}

export async function drawThumb(tc: HTMLCanvasElement, i: number, entry: PresetEntry): Promise<void> {
  const tx = tc.getContext('2d');
  if (!tx) return;
  if (entry.manifest.id === 'bars') {
    drawBarsThumb(tx, entry);
    return;
  }
  if (entry.manifest.id === 'triangle') {
    drawTriangleThumb(tx, entry);
    return;
  }
  if (entry.manifest.id === 'tunnel') {
    drawTunnelThumb(tx, entry);
    return;
  }
  const thumb = entry.manifest.thumbnail;
  if (thumb.kind === 'asset' && thumb.path.trim().length > 0) {
    try {
      const img = await loadImage(thumb.path);
      tx.clearRect(0, 0, 64, 64);
      tx.drawImage(img, 0, 0, 64, 64);
      return;
    } catch {
      console.warn(`[presets] Thumbnail asset missing for "${entry.manifest.id}": ${thumb.path}. Using palette fallback.`);
    }
  }
  const pal = fallbackPalette(entry);
  if (pal.every((c) => typeof c === 'string' && c.length > 0)) {
    drawGeneratedThumb(tx, i, pal);
    return;
  }
  console.warn(`[presets] Thumbnail fallback palette missing for "${entry.manifest.id}". Using neutral thumbnail.`);
  drawGeneratedThumb(tx, i, NEUTRAL_THUMB_PALETTE);
}

export function buildPresetBank(onSelectPreset: (i: number) => void): void {
  const bank = document.getElementById('preset-bank');
  if (!bank) return;
  getAllPresetEntries().forEach((entry, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'preset-thumb' + (i === 0 ? ' active' : '');
    thumb.id = 'preset-' + i;
    const tc = document.createElement('canvas');
    tc.width = 64;
    tc.height = 64;
    const lbl = document.createElement('div');
    lbl.className = 'pt-label';
    lbl.textContent = entry.manifest.name;
    thumb.appendChild(tc);
    thumb.appendChild(lbl);
    thumb.onclick = () => onSelectPreset(i);
    bank.appendChild(thumb);
    void drawThumb(tc, i, entry);
  });
}
