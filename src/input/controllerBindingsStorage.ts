import type { SemanticId } from './ShortcutMap';

const KEY = 'bazikjs_controller_bindings';
const SCHEMA_VERSION = 1;

interface ControllerBindingsPayload {
  schemaVersion?: number;
  bindings?: Record<string, SemanticId>;
}

export function saveControllerBindings(bindings: Readonly<Record<string, SemanticId>>): void {
  const payload: ControllerBindingsPayload = {
    schemaVersion: SCHEMA_VERSION,
    bindings: { ...bindings },
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function loadControllerBindings(): Record<string, SemanticId> | undefined {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return undefined;
    const payload = JSON.parse(raw) as ControllerBindingsPayload;
    if (!payload.bindings || typeof payload.bindings !== 'object') return undefined;
    return { ...payload.bindings };
  } catch {
    return undefined;
  }
}

export function clearControllerBindings(): void {
  localStorage.removeItem(KEY);
}
