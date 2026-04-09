import * as actions from './actions';
import { toggleFxArmById } from '../ui/fxStrip';

export type SemanticBinding = {
  onDown?: () => void;
  onUp?: () => void;
};

const STEP_SPEED = 4;
const STEP_EXPLODE = 4;
const STEP_PAR = 5;

function requestFullscreenSafe(): void {
  const fs = document.documentElement;
  if (fs.requestFullscreen) void fs.requestFullscreen();
}

export function createDefaultBindings(): Record<string, SemanticBinding> {
  return {
    'transport.shift': { onDown: () => actions.doShift() },
    'transport.prevPreset': { onDown: () => actions.prevPreset() },
    'transport.nextPreset': { onDown: () => actions.nextPreset() },

    'controller.button1': { onDown: () => actions.toggleAuto() },
    'controller.button2': {
      onDown: () => actions.startBreak(),
      onUp: () => actions.endBreak(),
    },
    'controller.button3': { onDown: () => actions.prevPreset() },
    'controller.button4': { onDown: () => actions.nextPreset() },
    'controller.button5': { onDown: () => actions.doShift() },
    'controller.button6': { onDown: () => requestFullscreenSafe() },
    'controller.button7': { onDown: () => actions.exportFrame() },
    'controller.button8': { onDown: () => actions.saveStateSilent() },
    'controller.button9': { onDown: () => actions.cloneState() },
    'controller.button10': { onDown: () => actions.toggleMidiLearn() },
    'controller.button11': { onDown: () => actions.toggleFxPanel() },
    'controller.button12': { onDown: () => actions.resetPars() },

    'controller.knob1.decrement': { onDown: () => actions.applySpeedDelta(-STEP_SPEED) },
    'controller.knob1.increment': { onDown: () => actions.applySpeedDelta(STEP_SPEED) },
    'controller.knob1.press': { onDown: () => actions.nextPreset() },

    'controller.knob2.decrement': { onDown: () => actions.applyExplodeDelta(-STEP_EXPLODE) },
    'controller.knob2.increment': { onDown: () => actions.applyExplodeDelta(STEP_EXPLODE) },
    'controller.knob2.press': { onDown: () => actions.toggleFxPanel() },

    'controller.knob3.decrement': { onDown: () => actions.adjustPar('par1', -STEP_PAR) },
    'controller.knob3.increment': { onDown: () => actions.adjustPar('par1', STEP_PAR) },
    'controller.knob3.press': { onDown: () => actions.randomizePars() },

    'controller.knob4.decrement': { onDown: () => actions.adjustPar('par2', -STEP_PAR) },
    'controller.knob4.increment': { onDown: () => actions.adjustPar('par2', STEP_PAR) },
    'controller.knob4.press': { onDown: () => actions.triggerBlackout() },
  };
}

export class InputRouter {
  constructor(private bindings: Record<string, SemanticBinding>) {}

  handleDown(id: string, mode: number | undefined, ev: KeyboardEvent): void {
    if (id === 'transport.shift') ev.preventDefault();

    if (id === 'transport.setMode' && mode !== undefined) {
      actions.setMode(mode);
      return;
    }
    if (id.startsWith('mode.')) {
      const m = parseInt(id.split('.')[1] ?? '', 10);
      if (!Number.isNaN(m)) actions.setMode(m);
      return;
    }

    if (id.startsWith('fx.') && id.endsWith('.toggle')) {
      const fxId = id.split('.')[1];
      if (fxId) toggleFxArmById(fxId);
      return;
    }

    this.bindings[id]?.onDown?.();
  }

  handleUp(id: string): void {
    this.bindings[id]?.onUp?.();
  }
}

export function createDefaultRouter(): InputRouter {
  return new InputRouter(createDefaultBindings());
}
