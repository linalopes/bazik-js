/**
 * Auto mode orchestration: timer tick, shifts, subtle par motion, and optional break pulses.
 */
import type { ParKey } from '../core/state';
import { AUTOMATION_CONFIG } from './AutomationConfig';
import { BreakEngine } from './BreakEngine';
import { computeShiftStep } from './ShiftEngine';

export interface AutoPilotSignals {
  beatPulse: number;
  beatConfidence: number;
  banger: number;
  frame: number;
}

export interface AutoPilotState {
  autoMode: boolean;
  autoTimer: number;
  currentMode: number;
}

export interface AutoPilotActions {
  bumpAutoTimer: () => void;
  shiftPreset: () => void;
  setMode: (mode: number) => void;
  adjustPar: (par: ParKey, delta: number) => void;
  setBreak: (active: boolean) => void;
}

export class AutoPilot {
  private readonly breakEngine = new BreakEngine();

  step(state: AutoPilotState, signals: AutoPilotSignals, actions: AutoPilotActions): void {
    if (!state.autoMode) {
      actions.setBreak(false);
      return;
    }

    actions.bumpAutoTimer();
    const nextTimer = state.autoTimer + 1;

    const shift = computeShiftStep({
      autoTimer: nextTimer,
      currentMode: state.currentMode,
    });

    if (shift.advancePreset) {
      actions.shiftPreset();
    } else if (shift.nextMode !== null) {
      actions.setMode(shift.nextMode);
    }

    if (signals.banger && nextTimer % AUTOMATION_CONFIG.modulation.interval === 0) {
      const weight =
        AUTOMATION_CONFIG.modulation.par1WeightBase +
        Math.min(AUTOMATION_CONFIG.modulation.par1WeightMaxBoost, signals.beatConfidence);
      actions.adjustPar('par1', (Math.random() - 0.5) * AUTOMATION_CONFIG.modulation.par1Range * weight);

      // Light deterministic par2 drift keeps movement musical but stable.
      const drift =
        Math.sin(signals.frame * AUTOMATION_CONFIG.modulation.par2DriftFrequency) *
        AUTOMATION_CONFIG.modulation.par2DriftAmplitude;
      actions.adjustPar('par2', drift);
    }

    const br = this.breakEngine.step({
      autoTimer: nextTimer,
      beatPulse: signals.beatPulse,
      beatConfidence: signals.beatConfidence,
    });
    actions.setBreak(br.isBreakActive);
  }
}

export const autoPilot = new AutoPilot();
