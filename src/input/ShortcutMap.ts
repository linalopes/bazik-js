/**
 * Physical controller → semantic IDs.
 * Raw keyboard events are normalized (letters → uppercase) then looked up here.
 */

export type ControllerButtonSemantic =
  | 'controller.button1'
  | 'controller.button2'
  | 'controller.button3'
  | 'controller.button4'
  | 'controller.button5'
  | 'controller.button6'
  | 'controller.button7'
  | 'controller.button8'
  | 'controller.button9'
  | 'controller.button10'
  | 'controller.button11'
  | 'controller.button12';

export type ControllerKnobSemantic =
  | 'controller.knob1.decrement'
  | 'controller.knob1.increment'
  | 'controller.knob1.press'
  | 'controller.knob2.decrement'
  | 'controller.knob2.increment'
  | 'controller.knob2.press'
  | 'controller.knob3.decrement'
  | 'controller.knob3.increment'
  | 'controller.knob3.press'
  | 'controller.knob4.decrement'
  | 'controller.knob4.increment'
  | 'controller.knob4.press';

export type TransportSemantic =
  | 'transport.shift'
  | 'transport.prevPreset'
  | 'transport.nextPreset'
  | 'transport.setMode'
  | 'mode.1'
  | 'mode.2'
  | 'mode.3'
  | 'mode.4'
  | 'mode.5'
  | 'mode.6'
  | 'mode.7'
  | 'mode.8'
  | 'fx.edge.toggle'
  | 'fx.blursat.toggle'
  | 'fx.lightray.toggle'
  | 'fx.zoom.toggle'
  | 'fx.loufi.toggle'
  | 'fx.echo.toggle'
  | 'fx.kaleido.toggle'
  | 'fx.split.toggle';

export type SemanticId = ControllerButtonSemantic | ControllerKnobSemantic | TransportSemantic;

/** Keys emitted by the hardware (normalized form for letters: A–Z). */
const DEFAULT_CONTROLLER_KEY_TO_SEMANTIC: Record<string, SemanticId> = {
  A: 'controller.button1',
  B: 'controller.button2',
  C: 'controller.button3',
  D: 'controller.button4',
  E: 'controller.button5',
  F: 'controller.button6',
  G: 'controller.button7',
  H: 'controller.button8',
  I: 'controller.button9',
  J: 'controller.button10',
  K: 'controller.button11',
  L: 'controller.button12',
  M: 'controller.knob1.decrement',
  O: 'controller.knob1.increment',
  N: 'controller.knob1.press',
  V: 'controller.knob2.decrement',
  X: 'controller.knob2.increment',
  W: 'controller.knob2.press',
  P: 'controller.knob3.decrement',
  R: 'controller.knob3.increment',
  Q: 'controller.knob3.press',
  S: 'controller.knob4.decrement',
  U: 'controller.knob4.increment',
  T: 'controller.knob4.press',
};

/** Keys that are not part of the 12+knob layout but still drive transport (e.g. arrows, space). */
const DEFAULT_LEGACY_TRANSPORT_KEY_TO_SEMANTIC: Record<string, Exclude<TransportSemantic, 'transport.setMode'>> = {
  ' ': 'transport.shift',
  ArrowLeft: 'transport.prevPreset',
  ArrowRight: 'transport.nextPreset',
};

const runtimeKeyToSemantic: Record<string, SemanticId> = {
  ...DEFAULT_CONTROLLER_KEY_TO_SEMANTIC,
  ...DEFAULT_LEGACY_TRANSPORT_KEY_TO_SEMANTIC,
};

export const REBINDABLE_SEMANTICS: readonly SemanticId[] = Array.from(
  new Set(Object.values(runtimeKeyToSemantic)),
);

export function getCurrentBindings(): Readonly<Record<string, SemanticId>> {
  return runtimeKeyToSemantic;
}

/** Rebind one physical key to a semantic action (used by controller learn mode). */
export function bindPhysicalKeyToSemantic(physicalKey: string, semantic: SemanticId): void {
  // Keep one primary key per semantic to avoid accidental duplicate triggers.
  Object.keys(runtimeKeyToSemantic).forEach((k) => {
    if (runtimeKeyToSemantic[k] === semantic) delete runtimeKeyToSemantic[k];
  });
  runtimeKeyToSemantic[physicalKey] = semantic;
}

export function replaceAllBindings(next: Record<string, SemanticId>): void {
  Object.keys(runtimeKeyToSemantic).forEach((k) => delete runtimeKeyToSemantic[k]);
  Object.entries(next).forEach(([k, v]) => {
    runtimeKeyToSemantic[k] = v;
  });
}

export function resetBindingsToDefaults(): void {
  replaceAllBindings({
    ...DEFAULT_CONTROLLER_KEY_TO_SEMANTIC,
    ...DEFAULT_LEGACY_TRANSPORT_KEY_TO_SEMANTIC,
  });
}

export interface ResolvedInput {
  id: SemanticId;
  /** Set only when id === 'transport.setMode'. */
  mode?: number;
}

/** Normalize KeyboardEvent key for lookup (letters uppercase; rest as-is). */
export function normalizePhysicalKey(key: string): string {
  if (key.length === 1 && /[a-zA-Z]/.test(key)) return key.toUpperCase();
  return key;
}

/**
 * Resolve a keydown to a semantic input, or null if unmapped.
 * Does not fire on modifier shortcuts (Ctrl/Cmd/Alt) so typing in inputs stays usable.
 */
export function resolveKeydown(e: KeyboardEvent): ResolvedInput | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;

  if (e.key >= '1' && e.key <= '8') {
    return { id: 'transport.setMode', mode: parseInt(e.key, 10) };
  }

  const k = normalizePhysicalKey(e.key);
  const controller = runtimeKeyToSemantic[k];
  if (controller) return { id: controller };

  return null;
}

/** Keyup resolution only for semantics that need press/hold end (buttons, not knob ticks). */
export function resolveKeyup(e: KeyboardEvent): ResolvedInput | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;

  const k = normalizePhysicalKey(e.key);
  const controller = runtimeKeyToSemantic[k];
  if (controller?.startsWith('controller.button')) return { id: controller };
  if (controller?.startsWith('transport.')) return { id: controller };

  return null;
}

export function isButtonSemantic(id: SemanticId): boolean {
  return id.startsWith('controller.button');
}

export function isKnobSemantic(id: SemanticId): boolean {
  return id.startsWith('controller.knob');
}
