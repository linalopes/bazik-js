import { initMainCanvas } from '../graphics/context';
import { render } from '../graphics/render';
import { buildFxStrip, updateFxSlot } from '../ui/fxStrip';
import {
  selectPreset,
  selectColorBank,
  setMode,
  setPar1Value,
  setPar2Value,
  setSpeedValue,
  setExplodeValue,
  refreshParDisplays,
  refreshScreenBlendUi,
} from '../input/actions';
import { setupXYPad } from '../input/xyPad';
import { makeKnob, updateKnob } from '../input/knobs';
import { registerKeyboard } from '../input/keyboard';
import { initializeControllerLearnMode } from '../input/controllerLearn';
import { getSavedSchemaVersion, loadStateFromStorage } from '../persistence/storage';
import { S, writeFxAt } from '../core/state';
import { getPresetIndexById, initializePresetRegistry, refreshPresetList } from '../presets/list';

export async function init(): Promise<void> {
  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  initMainCanvas(canvas);

  await initializePresetRegistry();
  refreshPresetList();
  buildFxStrip();
  selectColorBank(0);
  setupXYPad();

  (['speed', 'explode'] as const).forEach((p) => {
    const el = document.getElementById('knob-' + p);
    if (!el) return;
    const ind = document.createElement('div');
    ind.className = 'knob-indicator';
    ind.id = 'ind-' + p;
    el.appendChild(ind);
    makeKnob('knob-' + p, p, refreshParDisplays);
    updateKnob(p, S[p]);
  });

  const screenKnob = document.getElementById('knob-screen');
  if (screenKnob) {
    const indS = document.createElement('div');
    indS.className = 'knob-indicator';
    indS.id = 'ind-screen';
    screenKnob.appendChild(indS);
    makeKnob('knob-screen', 'screen', refreshScreenBlendUi);
    updateKnob('screen', S.fade);
  }

  const saved = loadStateFromStorage();
  if (saved) {
    const schemaVersion = getSavedSchemaVersion(saved);
    // Migration hook: branch by schemaVersion when payload upgrades require transforms.
    void schemaVersion;
    // Build phase: do not restore preset/mode from storage (deterministic bars + mode 1 below).
    if (typeof saved.par1 === 'number') setPar1Value(saved.par1);
    if (typeof saved.par2 === 'number') setPar2Value(saved.par2);
    if (typeof saved.speed === 'number') setSpeedValue(saved.speed);
    if (typeof saved.explode === 'number') setExplodeValue(saved.explode);
    if (saved.fx) saved.fx.forEach((v, i) => {
      writeFxAt(i, v!);
      updateFxSlot(i);
    });
  }

  const barsIdx = getPresetIndexById('bars');
  selectPreset(barsIdx >= 0 ? barsIdx : 0);
  setMode(1);

  registerKeyboard();
  initializeControllerLearnMode();
  render();
}
