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

let learnTarget: SemanticId | null = null;
let selectedTargetEl: HTMLElement | null = null;

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

function setLearnUi(active: boolean, target?: SemanticId): void {
  const btn = document.getElementById('controller-learn-btn');
  if (!btn) return;
  btn.classList.toggle('active', active);
  btn.textContent = active && target ? `listening: ${semanticLabel(target)}` : 'controller learn';
}

function refreshLearnHighlights(): void {
  const all = document.querySelectorAll<HTMLElement>('[data-controller-target]');
  all.forEach((el) => {
    el.classList.toggle('controller-learn-target', S.controllerLearn);
    const isSel = selectedTargetEl === el;
    el.classList.toggle('controller-learn-selected', isSel);
  });
}

export function beginControllerLearn(target: SemanticId): void {
  learnTarget = target;
  writeControllerLearn(true);
  setLearnUi(true, target);
  refreshLearnHighlights();
}

export function cancelControllerLearn(): void {
  learnTarget = null;
  if (selectedTargetEl) selectedTargetEl.classList.remove('controller-learn-selected');
  selectedTargetEl = null;
  writeControllerLearn(false);
  setLearnUi(false);
  refreshLearnHighlights();
}

export function toggleControllerLearn(): void {
  if (S.controllerLearn) {
    cancelControllerLearn();
    return;
  }
  writeControllerLearn(true);
  setLearnUi(true);
  refreshLearnHighlights();
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
  if (selectedTargetEl) selectedTargetEl.classList.remove('controller-learn-selected');
  selectedTargetEl = hit;
  beginControllerLearn(semantic);
  refreshLearnHighlights();
}

/** Called from KeyboardInput before regular routing; consumes the key when learning. */
export function captureControllerLearnKey(e: KeyboardEvent): boolean {
  if (!S.controllerLearn || !learnTarget) return false;
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  const key = normalizePhysicalKey(e.key);
  if (!key) return false;
  bindPhysicalKeyToSemantic(key, learnTarget);
  saveControllerBindings(getCurrentBindings());
  const btn = document.getElementById('controller-learn-btn');
  if (btn) btn.textContent = `mapped ${key} -> ${semanticLabel(learnTarget)}`;
  if (selectedTargetEl) selectedTargetEl.classList.remove('controller-learn-selected');
  selectedTargetEl = null;
  learnTarget = null;
  window.setTimeout(() => {
    if (S.controllerLearn) {
      setLearnUi(true);
      refreshLearnHighlights();
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
  refreshLearnHighlights();
}

export function resetControllerBindings(): void {
  resetBindingsToDefaults();
  clearControllerBindings();
  cancelControllerLearn();
  const btn = document.getElementById('controller-learn-btn');
  if (btn) {
    btn.textContent = 'bindings reset';
    window.setTimeout(() => {
      btn.textContent = 'controller learn';
    }, 1000);
  }
}
