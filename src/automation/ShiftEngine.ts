/**
 * Preset/mode shift cadence. Keeps legacy timer rules explicit.
 */
import { AUTOMATION_CONFIG } from './AutomationConfig';

export interface ShiftStep {
  advancePreset: boolean;
  nextMode: number | null;
}

export interface ShiftInputs {
  autoTimer: number;
  currentMode: number;
}

export function computeShiftStep(inputs: ShiftInputs): ShiftStep {
  if (inputs.autoTimer % AUTOMATION_CONFIG.shift.presetInterval === 0) {
    return { advancePreset: true, nextMode: null };
  }
  if (inputs.autoTimer % AUTOMATION_CONFIG.shift.modeInterval === 0) {
    return {
      advancePreset: false,
      nextMode: (inputs.currentMode % AUTOMATION_CONFIG.maxMode) + 1,
    };
  }
  return { advancePreset: false, nextMode: null };
}
