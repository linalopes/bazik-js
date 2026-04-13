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
import { resetControllerBindings } from './controllerLearn';
import { cvs } from '../graphics/context';
import { activeTopTab, type TopTab } from '../ui/stores/navStore';
import { fxPanelOpen } from '../ui/stores/fxPanelStore';
import { saveStateToStorage } from '../persistence/storage';

export function switchTab(tab: TopTab): void {
  activeTopTab.set(tab);
}

export function toggleAuto(): void {
  writeAutoMode(!S.autoMode);
}

export function resetControllerMappings(): void {
  resetControllerBindings();
}

export { toggleMic };
export { toggleControllerLearn } from './controllerLearn';

export function selectPreset(i: number): void {
  writeCurrentPreset(i);
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
}

export function startBreak(): void {
  writeIsBreak(true);
}

export function endBreak(): void {
  writeIsBreak(false);
}

export function adjustPar(par: ParKey, delta: number): void {
  const v = Math.max(-100, Math.min(100, Math.round(S[par] + delta)));
  writePar(par, v);
}

export function resetPars(): void {
  writePar('par1', 0);
  writePar('par2', 0);
}

export function randomizePars(): void {
  writePar('par1', Math.round((Math.random() - 0.5) * 120));
  writePar('par2', Math.round((Math.random() - 0.5) * 120));
}

export function adjustScreenBlend(delta: number): void {
  writeFade(S.fade + delta);
}

/** Controller / shortcut: snap preview screen to neutral. */
export function resetScreenBlend(): void {
  writeFade(0);
}

/** Absolute set for the SCREEN knob drag path. */
export function setScreenBlendValue(v: number): void {
  writeFade(Math.max(-100, Math.min(100, Math.round(v))));
}

export function selectColorBank(i: number): void {
  const idx = Math.max(0, Math.min(COLOR_BANKS.length - 1, i | 0));
  writeActiveColorBank(idx);
  writeColors([...COLOR_BANKS[idx]!]);
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
  link.download = 'bazik-js_' + Date.now() + '.png';
  link.href = cvs.toDataURL('image/png');
  link.click();
}

export function toggleFxPanel(): void {
  fxPanelOpen.update((open) => !open);
}

/** Used by input router/controller semantics. */
export function applySpeedDelta(delta: number): void {
  adjustSpeed(delta);
}

/** Used by input router/controller semantics. */
export function applyExplodeDelta(delta: number): void {
  adjustExplode(delta);
}

/** Absolute set from UI/component or external controller semantics. */
export function setSpeedValue(v: number): void {
  writeSpeed(v);
}

export function setExplodeValue(v: number): void {
  writeExplode(v);
}

/** Absolute generic primary parameter (`par1`). */
export function setPar1Value(v: number): void {
  writePar('par1', Math.max(-100, Math.min(100, Math.round(v))));
}

/** Absolute generic secondary parameter (`par2`). */
export function setPar2Value(v: number): void {
  writePar('par2', Math.max(-100, Math.min(100, Math.round(v))));
}

/** Non-breaking alias for clearer semantics at UI call sites (`par1`). */
export function setPrimaryParamValue(v: number): void {
  setPar1Value(v);
}

/** Non-breaking alias for clearer semantics at UI call sites (`par2`). */
export function setSecondaryParamValue(v: number): void {
  setPar2Value(v);
}
