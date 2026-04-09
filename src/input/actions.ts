import {
  S,
  eqGain,
  type ParKey,
  writeCurrentPreset,
  writeCurrentMode,
  writeColors,
  writeActiveColorBank,
  writeAutoMode,
  writeIsBreak,
  writeFade,
  writePar,
  adjustSpeed,
  adjustExplode,
  writeSpeed,
  writeExplode,
} from '../core/state';
import { getManifestAt, getPresetIndexById, PRESETS } from '../presets/list';
import { COLOR_BANKS } from '../presets/constants';
import { PRESET_BEHAVIOR_CONFIG } from '../presets/presetBehaviorConfig';
import { toggleMic } from '../audio/analysis';
import { resetControllerBindings, toggleControllerLearn } from './controllerLearn';
import { buildSwatches } from '../ui/swatches';
import { cvs } from '../graphics/context';
import { saveStateToStorage } from '../persistence/storage';
import { updateKnob } from './knobs';

export function refreshParDisplays(): void {
  syncParLabels();
}

function syncParLabels(): void {
  const p1s = ['par1-val', 'par1r-val'];
  const p2s = ['par2-val', 'par2-left-val'];
  p1s.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(S.par1);
  });
  p2s.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(S.par2);
  });
  const xpct = (S.par1 + 100) / 200;
  const ypct = 1 - (S.par2 + 100) / 200;
  const dot = document.getElementById('xy-dot');
  if (dot) {
    dot.style.left = xpct * 100 + '%';
    dot.style.top = ypct * 100 + '%';
  }
}

export function switchTab(tab: string): void {
  (['controls', 'presets', 'options'] as const).forEach((t) => {
    document.getElementById('tab-' + t)?.classList.toggle('active', t === tab);
  });
}

export function toggleAuto(): void {
  writeAutoMode(!S.autoMode);
  document.getElementById('auto-led')?.classList.toggle('on', S.autoMode);
}

export function toggleMidiLearn(): void {
  toggleControllerLearn();
}

export function resetControllerMappings(): void {
  resetControllerBindings();
}

export { toggleMic };

export function selectPreset(i: number): void {
  writeCurrentPreset(i);
  document.querySelectorAll('.preset-thumb').forEach((t, j) => t.classList.toggle('active', j === i));
  const badge = document.getElementById('preset-badge');
  if (badge) badge.textContent = PRESETS[i]!.name;
  applyPresetDefaultsIfEnabled(i);
}

function applyPresetDefaultsIfEnabled(i: number): void {
  if (!PRESET_BEHAVIOR_CONFIG.applyDefaultsOnSelect) return;
  const manifest = getManifestAt(i);
  if (!manifest) return;
  setPar1Value(manifest.defaultParams.par1);
  setPar2Value(manifest.defaultParams.par2);
  if (PRESET_BEHAVIOR_CONFIG.applyDefaultColorsOnSelect) {
    writeColors([...manifest.defaultColors]);
    buildSwatches();
  }
}

export function prevPreset(): void {
  selectPreset((S.currentPreset + PRESETS.length - 1) % PRESETS.length);
}

export function nextPreset(): void {
  selectPreset((S.currentPreset + 1) % PRESETS.length);
}

export function doShift(): void {
  const barsIdx = getPresetIndexById('bars');
  if (barsIdx >= 0 && S.currentPreset === barsIdx) {
    const next = ((S.currentMode - 1 + 1) % 4) + 1;
    setMode(next);
    return;
  }
  const triangleIdx = getPresetIndexById('triangle');
  if (triangleIdx >= 0 && S.currentPreset === triangleIdx) {
    const next = ((S.currentMode - 1 + 1) % 4) + 1;
    setMode(next);
    return;
  }
  const tunnelIdx = getPresetIndexById('tunnel');
  if (tunnelIdx >= 0 && S.currentPreset === tunnelIdx) {
    const next = ((S.currentMode - 1 + 1) % 4) + 1;
    setMode(next);
    return;
  }
  nextPreset();
}

export function setMode(m: number): void {
  writeCurrentMode(m);
  document.querySelectorAll('.mode-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === m));
  const modeBadge = document.getElementById('mode-badge');
  if (modeBadge) modeBadge.textContent = 'mode ' + m;
  const stMode = document.getElementById('st-mode');
  if (stMode) stMode.textContent = String(m);
}

export function startBreak(): void {
  writeIsBreak(true);
  document.getElementById('break-center')?.classList.add('pressed');
  document.getElementById('break-left')?.classList.add('teal-active');
}

export function endBreak(): void {
  writeIsBreak(false);
  document.getElementById('break-center')?.classList.remove('pressed');
  document.getElementById('break-left')?.classList.remove('teal-active');
}

export function adjustPar(par: ParKey, delta: number): void {
  const v = Math.max(-100, Math.min(100, Math.round(S[par] + delta)));
  writePar(par, v);
  syncParLabels();
}

export function resetPars(): void {
  writePar('par1', 0);
  writePar('par2', 0);
  syncParLabels();
}

export function randomizePars(): void {
  writePar('par1', Math.round((Math.random() - 0.5) * 120));
  writePar('par2', Math.round((Math.random() - 0.5) * 120));
  syncParLabels();
}

export function setFade(v: string): void {
  const visibility = Math.max(0, Math.min(100, parseInt(v, 10)));
  if (!screenBlackoutActive) {
    writeFade(visibilityToFade(visibility));
  }
  syncFadeUi(visibility);
}

export function triggerBlackout(): void {
  screenBlackoutActive = !screenBlackoutActive;
  if (screenBlackoutActive) {
    writeFade(100);
  } else {
    const visibility = getCurrentFadeVisibility();
    writeFade(visibilityToFade(visibility));
  }
  syncBlackoutUi(screenBlackoutActive);
}

let screenBlackoutActive = false;

function visibilityToFade(visibility: number): number {
  return 100 - visibility;
}

function getCurrentFadeVisibility(): number {
  const slider = document.getElementById('fade-slider') as HTMLInputElement | null;
  if (!slider) return 100 - S.fade;
  const n = parseInt(slider.value, 10);
  return Math.max(0, Math.min(100, Number.isNaN(n) ? 100 - S.fade : n));
}

function syncFadeUi(visibility: number): void {
  const el = document.getElementById('fade-val');
  if (el) el.textContent = String(visibility);
}

function syncBlackoutUi(active: boolean): void {
  const btn = document.getElementById('screen-blackout-btn');
  if (!btn) return;
  btn.classList.toggle('active', active);
}

export function selectColorBank(i: number): void {
  const idx = Math.max(0, Math.min(COLOR_BANKS.length - 1, i | 0));
  writeActiveColorBank(idx);
  writeColors([...COLOR_BANKS[idx]!]);
  document.querySelectorAll('.cbank-btn').forEach((b, j) => b.classList.toggle('active', j === idx));
  buildSwatches();
}

export function setEqGain(band: 'bass' | 'mid' | 'high', val: string): void {
  eqGain[band] = parseInt(val, 10) / 100;
}

export function saveState(ev: Event): void {
  saveStateToStorage();
  const btn = ev.currentTarget as HTMLButtonElement;
  const orig = btn.textContent;
  btn.textContent = 'saved!';
  setTimeout(() => {
    btn.textContent = orig;
  }, 1000);
}

export function saveStateSilent(): void {
  saveStateToStorage();
}

export function cloneState(): void {
  window.open(window.location.href, '_blank');
}

export function exportFrame(): void {
  const link = document.createElement('a');
  link.download = 'bazikjs_' + Date.now() + '.png';
  link.href = cvs.toDataURL('image/png');
  link.click();
}

export function toggleFxPanel(): void {
  const strip = document.getElementById('fx-strip');
  if (!strip) return;
  strip.style.display = strip.style.display === 'none' ? 'block' : 'block';
}

/** Used by hardware router: store + UI knob sync */
export function applySpeedDelta(delta: number): void {
  adjustSpeed(delta);
  updateKnob('speed', S.speed);
}

/** Used by hardware router */
export function applyExplodeDelta(delta: number): void {
  adjustExplode(delta);
  updateKnob('explode', S.explode);
}

/** MIDI / absolute set */
export function setSpeedValue(v: number): void {
  const nv = Math.max(0, Math.min(100, v));
  writeSpeed(nv);
  updateKnob('speed', nv);
}

export function setExplodeValue(v: number): void {
  const nv = Math.max(0, Math.min(100, v));
  writeExplode(nv);
  updateKnob('explode', nv);
}

/** Absolute par (e.g. MIDI); keeps XY dot + labels in sync. */
export function setPar1Value(v: number): void {
  writePar('par1', Math.max(-100, Math.min(100, Math.round(v))));
  syncParLabels();
}

export function setPar2Value(v: number): void {
  writePar('par2', Math.max(-100, Math.min(100, Math.round(v))));
  syncParLabels();
}
