import type { AppState } from './types';
import { COLOR_BANKS } from '../../presets/constants';

/** Legacy read surface: kept in sync by domain store writers (Step 3). Renders/FX still read `S` this pass. */
export const S: AppState = {
  autoMode: false,
  controllerLearn: false,
  micActive: false,
  /** Slot 0 = `bars` (first in built-in bank). */
  currentPreset: 0,
  /** Mode 1 → bars shader `u_mode` 0 (rise from bottom). */
  currentMode: 1,
  par1: 0,
  par2: 0,
  speed: 0,
  explode: 0,
  fx: [0, 0, 0, 0, 0, 0, 0, 0],
  eq: [0.0, 0.0, 0.0],
  banger: 0,
  isBreak: false,
  fade: 0,
  frame: 0,
  xy: { x: 0.5, y: 0.5 },
  colors: [...COLOR_BANKS[0]!],
  activeColor: 0,
  activeColorBank: 0,
  autoTimer: 0,
  fps: 0,
  lastFpsTime: 0,
  fpsCount: 0,
};

/** Per-band input gain multipliers (0–1), controlled by EQ sliders — unchanged this step. */
export const eqGain = { bass: 0.75, mid: 0.6, high: 0.5 };
