import { initMainCanvas } from '../graphics/context';
import { render } from '../graphics/render';
import {
  selectPreset,
  selectColorBank,
  setMode,
  setPar1Value,
  setPar2Value,
  setSpeedValue,
  setExplodeValue,
} from '../input/actions';
import { registerKeyboard } from '../input/keyboard';
import { initializeControllerLearnMode } from '../input/controllerLearn';
import { getSavedSchemaVersion, loadStateFromStorage } from '../persistence/storage';
import { writeFxAt } from '../core/state';
import { writeFxArmed } from '../core/state/fxStore';
import { getPresetIndexById, initializePresetRegistry, refreshPresetList } from '../presets/list';

export async function init(): Promise<void> {
  const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  initMainCanvas(canvas);

  await initializePresetRegistry();
  refreshPresetList();
  selectColorBank(0);

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
    });
    if (Array.isArray(saved.fxArmed)) {
      writeFxArmed(saved.fxArmed);
    }
  }

  const barsIdx = getPresetIndexById('bars');
  selectPreset(barsIdx >= 0 ? barsIdx : 0);
  setMode(1);

  registerKeyboard();
  initializeControllerLearnMode();
  render();
}
