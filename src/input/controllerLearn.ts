import { S, writeControllerLearn } from '../core/state';
import {
  bindPhysicalKeyToSemantic,
  getCurrentBindings,
  normalizePhysicalKey,
  replaceAllBindings,
  resetBindingsToDefaults,
  type SemanticId,
} from './ShortcutMap';
import { clearControllerBindings, loadControllerBindings, saveControllerBindings } from './controllerBindingsStorage';
import { controllerLearnButtonLabel, controllerLearnSelectedTargetId } from '../ui/stores/controllerLearnUiStore';

let learnTarget: SemanticId | null = null;

const TARGET_TO_SEMANTIC: Record<string, SemanticId> = {
  'shift': 'transport.shift',
  'break': 'controller.button2',
  'preset.prev': 'transport.prevPreset',
  'preset.next': 'transport.nextPreset',
  'auto.toggle': 'controller.button1',
  'mode.1': 'mode.1',
  'mode.2': 'mode.2',
  'mode.3': 'mode.3',
  'mode.4': 'mode.4',
  'mode.5': 'mode.5',
  'mode.6': 'mode.6',
  'mode.7': 'mode.7',
  'mode.8': 'mode.8',
  'par1.decrement': 'controller.knob3.decrement',
  'par1.increment': 'controller.knob3.increment',
  'par2.decrement': 'controller.knob4.decrement',
  'par2.increment': 'controller.knob4.increment',
  'fx.edge.toggle': 'fx.edge.toggle',
  'fx.blursat.toggle': 'fx.blursat.toggle',
  'fx.lightray.toggle': 'fx.lightray.toggle',
  'fx.zoom.toggle': 'fx.zoom.toggle',
  'fx.loufi.toggle': 'fx.loufi.toggle',
  'fx.echo.toggle': 'fx.echo.toggle',
  'fx.kaleido.toggle': 'fx.kaleido.toggle',
  'fx.split.toggle': 'fx.split.toggle',
};

function semanticLabel(s: string): string {
  return s.replace(/\./g, ' ');
}

export function beginControllerLearn(target: SemanticId): void {
  learnTarget = target;
  writeControllerLearn(true);
  controllerLearnButtonLabel.set(`listening: ${semanticLabel(target)}`);
}

export function cancelControllerLearn(): void {
  learnTarget = null;
  controllerLearnSelectedTargetId.set(null);
  writeControllerLearn(false);
  controllerLearnButtonLabel.set('controller learn');
}

export function toggleControllerLearn(): void {
  if (S.controllerLearn) {
    cancelControllerLearn();
    return;
  }
  writeControllerLearn(true);
  controllerLearnButtonLabel.set('controller learn');
}

function onLearnTargetClickCapture(e: Event): void {
  if (!S.controllerLearn) return;
  const t = e.target as HTMLElement | null;
  if (!t) return;
  const hit = t.closest<HTMLElement>('[data-controller-target]');
  if (!hit) return;
  e.preventDefault();
  e.stopPropagation();
  const targetId = hit.dataset.controllerTarget ?? '';
  const semantic = TARGET_TO_SEMANTIC[targetId];
  if (!semantic) return;
  controllerLearnSelectedTargetId.set(targetId);
  beginControllerLearn(semantic);
}

/** Called from KeyboardInput before regular routing; consumes the key when learning. */
export function captureControllerLearnKey(e: KeyboardEvent): boolean {
  if (!S.controllerLearn || !learnTarget) return false;
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  const key = normalizePhysicalKey(e.key);
  if (!key) return false;
  bindPhysicalKeyToSemantic(key, learnTarget);
  saveControllerBindings(getCurrentBindings());
  controllerLearnButtonLabel.set(`mapped ${key} -> ${semanticLabel(learnTarget)}`);
  controllerLearnSelectedTargetId.set(null);
  learnTarget = null;
  window.setTimeout(() => {
    if (S.controllerLearn) {
      controllerLearnButtonLabel.set('controller learn');
    }
  }, 900);
  return true;
}

export function getCurrentControllerBindings(): Readonly<Record<string, SemanticId>> {
  return getCurrentBindings();
}

export function initializeControllerLearnMode(): void {
  const saved = loadControllerBindings();
  if (saved) replaceAllBindings(saved);
  document.addEventListener('click', onLearnTargetClickCapture, true);
  controllerLearnButtonLabel.set('controller learn');
  controllerLearnSelectedTargetId.set(null);
}

export function resetControllerBindings(): void {
  resetBindingsToDefaults();
  clearControllerBindings();
  cancelControllerLearn();
  controllerLearnButtonLabel.set('bindings reset');
  window.setTimeout(() => {
    controllerLearnButtonLabel.set('controller learn');
  }, 1000);
}
