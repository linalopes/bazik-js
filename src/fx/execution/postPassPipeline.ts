/**
 * Post-preset Canvas 2D stack driven by FX registry metadata.
 * Order remains equivalent to legacy behavior:
 * edge → zoom → kaleido → split → lightray → blursat
 */
import { hex2rgb } from '../../utils/color';
import { cvs, ctx, W, H } from '../../graphics/context';
import type { RenderSnapshot } from '../../graphics/engine/renderSnapshot';
import { getPresetEntryAt } from '../../presets/PresetRegistry';
import { getAllFxSlots, getFxSlotIndexById } from '../FXRegistry';
import type { FxId } from '../builtinSlots';
import { getFxAmount } from './fxAmount';
import { isFxArmed } from '../../ui/fxStrip';

function runEdge(snap: RenderSnapshot): void {
  const amount = getFxAmount(snap, 'edge');
  if (amount <= 0) return;
  ctx.globalCompositeOperation = 'difference';
  ctx.globalAlpha = amount / 200;
  ctx.fillStyle = '#CAD8D8';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

/** Canvas 2D zoom is skipped when the main pass already applied WebGL zoom. */
function snapshotSkipsCanvas2DZoom(snap: RenderSnapshot): boolean {
  const id = getPresetEntryAt(snap.currentPreset)?.manifest.id;
  return id === 'bars' || id === 'triangle' || id === 'tunnel';
}

const ZOOM_SLOT_INDEX = getFxSlotIndexById('zoom');

function runZoom(snap: RenderSnapshot): void {
  if (snapshotSkipsCanvas2DZoom(snap)) return;
  if (ZOOM_SLOT_INDEX < 0 || !isFxArmed(ZOOM_SLOT_INDEX)) return;
  const amount = getFxAmount(snap, 'zoom');
  if (amount === 0) return;
  const sc = 1 + (amount / 100) * 0.03 * snap.eq[0]!;
  const ox = (W - W * sc) / 2;
  const oy = (H - H * sc) / 2;
  ctx.globalAlpha = 0.25;
  ctx.drawImage(cvs, ox, oy, W * sc, H * sc);
  ctx.globalAlpha = 1;
}

function runKaleido(snap: RenderSnapshot): void {
  const amount = getFxAmount(snap, 'kaleido');
  if (amount <= 30) return;
  ctx.globalAlpha = amount / 200;
  ctx.save();
  ctx.translate(W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(cvs, 0, 0, W / 2, H, 0, 0, W / 2, H);
  ctx.restore();
}

function runSplit(snap: RenderSnapshot): void {
  const amount = getFxAmount(snap, 'split');
  if (amount <= 0) return;
  const off = Math.round(amount * 0.08 * snap.eq[0]! * 10);
  ctx.globalAlpha = 0.15;
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(cvs, off, 0);
  ctx.drawImage(cvs, -off, 0);
  ctx.globalCompositeOperation = 'source-over';
}

function runLightrayOverlay(snap: RenderSnapshot): void {
  const amount = getFxAmount(snap, 'lightray');
  if (amount <= 0) return;
  const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.7);
  const [r, g, b] = hex2rgb(snap.colors[0]!);
  grd.addColorStop(0, `rgba(${r},${g},${b},${amount * 0.003 * snap.eq[0]!})`);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

function runBlurSat(snap: RenderSnapshot): void {
  const amount = getFxAmount(snap, 'blursat');
  if (amount <= 0) return;
  ctx.globalAlpha = amount * 0.003;
  ctx.globalCompositeOperation = 'screen';
  const [r, g, b] = hex2rgb(snap.colors[1]!);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

type PostFxRunner = (snap: RenderSnapshot) => void;
const POST_RUNNERS: Readonly<Partial<Record<FxId, PostFxRunner>>> = {
  edge: runEdge,
  zoom: runZoom,
  kaleido: runKaleido,
  split: runSplit,
  lightray: runLightrayOverlay,
  blursat: runBlurSat,
};

const POST_SLOT_ORDER = getAllFxSlots()
  .filter((slot) => slot.attachment === 'post')
  .slice()
  .sort((a, b) => a.runOrder - b.runOrder)
  .map((slot) => slot.id) as readonly FxId[];

export function runPostFxPipeline(snap: RenderSnapshot): void {
  for (const id of POST_SLOT_ORDER) {
    POST_RUNNERS[id]?.(snap);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
