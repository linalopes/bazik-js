import { S, writeActiveColor, writeColorAt } from '../core/state';
import { hslToHex, hexToHsl } from '../utils/color';
import { buildSwatches } from './swatches';

let cpTargetIndex = 0;
let cpH = 0;
let cpS = 0;
let cpL = 50;
let cpWheelDragging = false;

function drawColorWheel(): void {
  const canvas = document.getElementById('cp-wheel') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx2 = canvas.getContext('2d');
  if (!ctx2) return;
  const cx = 80;
  const cy = 80;
  const r = 78;
  ctx2.clearRect(0, 0, 160, 160);
  for (let angle = 0; angle < 360; angle += 1) {
    const startA = ((angle - 1) * Math.PI) / 180;
    const endA = ((angle + 1) * Math.PI) / 180;
    const grd = ctx2.createRadialGradient(cx, cy, 0, cx, cy, r);
    // Keep wheel readability stable: hue+saturation field at a fixed reference lightness.
    // Actual chosen lightness remains controlled by the L slider via cpUpdateFromHSL().
    grd.addColorStop(0, `hsl(${angle},0%,50%)`);
    grd.addColorStop(1, `hsl(${angle},100%,50%)`);
    ctx2.beginPath();
    ctx2.moveTo(cx, cy);
    ctx2.arc(cx, cy, r, startA, endA);
    ctx2.closePath();
    ctx2.fillStyle = grd;
    ctx2.fill();
  }
  ctx2.globalCompositeOperation = 'destination-in';
  ctx2.beginPath();
  ctx2.arc(cx, cy, r, 0, Math.PI * 2);
  ctx2.fill();
  ctx2.globalCompositeOperation = 'source-over';
}

function cpUpdateFromHSL(): void {
  const hex = hslToHex(cpH, cpS, cpL);
  const r = 78;
  const angle = (cpH * Math.PI) / 180;
  const dist = (cpS / 100) * r;
  const cursor = document.getElementById('cp-cursor');
  if (cursor) {
    cursor.style.left = 80 + Math.cos(angle) * dist + 'px';
    cursor.style.top = 80 + Math.sin(angle) * dist + 'px';
  }
  const slider = document.getElementById('cp-l-slider') as HTMLInputElement | null;
  if (slider) {
    const sliderBg = `linear-gradient(to right, hsl(${cpH},${cpS}%,0%), hsl(${cpH},${cpS}%,50%), hsl(${cpH},${cpS}%,100%))`;
    slider.style.background = sliderBg;
    slider.value = String(cpL);
  }
  const hexInput = document.getElementById('cp-hex') as HTMLInputElement | null;
  if (hexInput) hexInput.value = hex.slice(1).toUpperCase();
  const preview = document.getElementById('cp-preview');
  if (preview) preview.style.background = hex;
  writeColorAt(cpTargetIndex, hex);
  buildSwatches();
  const swatches = document.querySelectorAll('.swatch');
  if (swatches[cpTargetIndex]) swatches[cpTargetIndex]!.classList.add('active');
}

function cpPickFromWheel(e: MouseEvent | TouchEvent): void {
  const canvas = document.getElementById('cp-wheel') as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
  const x = clientX - rect.left - 80;
  const y = clientY - rect.top - 80;
  const dist = Math.min(Math.sqrt(x * x + y * y), 78);
  let angle = (Math.atan2(y, x) * 180) / Math.PI;
  cpH = ((angle % 360) + 360) % 360;
  cpS = Math.round((dist / 78) * 100);
  drawColorWheel();
  cpUpdateFromHSL();
}

export function cpLightnessChange(val: string): void {
  cpL = parseInt(val, 10);
  drawColorWheel();
  cpUpdateFromHSL();
}

export function cpHexChange(val: string): void {
  if (val.length !== 6) return;
  const hex = '#' + val;
  try {
    const hsl = hexToHsl(hex);
    cpH = hsl[0];
    cpS = hsl[1];
    cpL = hsl[2];
    drawColorWheel();
    cpUpdateFromHSL();
  } catch {
    /* ignore */
  }
}

export function openColorPicker(swatchIdx: number, swatchEl: HTMLElement): void {
  cpTargetIndex = swatchIdx;
  writeActiveColor(swatchIdx);
  const hex = S.colors[swatchIdx]!;
  const hsl = hexToHsl(hex);
  cpH = hsl[0];
  cpS = hsl[1];
  cpL = hsl[2];

  const popover = document.getElementById('cp-popover');
  const overlay = document.getElementById('cp-overlay');
  if (!popover || !overlay) return;

  const r = swatchEl.getBoundingClientRect();
  popover.style.display = 'block';
  overlay.classList.add('open');

  let top = r.bottom + 6;
  let left = r.left;
  if (left + 196 > window.innerWidth) left = window.innerWidth - 204;
  if (top + 320 > window.innerHeight) top = r.top - 326;
  popover.style.top = top + 'px';
  popover.style.left = left + 'px';

  drawColorWheel();
  cpUpdateFromHSL();

  const wheel = document.getElementById('cp-wheel');
  if (!wheel) return;
  wheel.onmousedown = (e) => {
    cpWheelDragging = true;
    cpPickFromWheel(e);
  };
  wheel.ontouchstart = (e) => {
    cpWheelDragging = true;
    cpPickFromWheel(e);
    e.preventDefault();
  };
  window.onmousemove = (e) => {
      if (cpWheelDragging) cpPickFromWheel(e);
    };
  window.ontouchmove = (e) => {
      if (cpWheelDragging) cpPickFromWheel(e);
    };
  window.onmouseup = () => {
    cpWheelDragging = false;
  };
  window.ontouchend = () => {
    cpWheelDragging = false;
  };
}

export function closeColorPicker(): void {
  const pop = document.getElementById('cp-popover');
  const overlay = document.getElementById('cp-overlay');
  if (pop) pop.style.display = 'none';
  if (overlay) overlay.classList.remove('open');
  window.onmousemove = null;
  window.ontouchmove = null;
}
