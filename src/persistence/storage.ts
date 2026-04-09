import { S } from '../core/state';
import { getManifestAt, getPresetIndexById } from '../presets/PresetManager';

const KEY = 'bazikjs_state';
const LEGACY_SCHEMA_VERSION = 1;
/** Numeric `preset` index is written as direct bank position (e.g. bars-first: 0 = bars). */
const CURRENT_SCHEMA_VERSION = 5;
const PRESET_BANK_SIZE = 8;

export interface SavedStatePayload {
  schemaVersion?: number;
  preset?: number;
  presetId?: string;
  mode?: number;
  par1?: number;
  par2?: number;
  speed?: number;
  explode?: number;
  fx?: number[];
}

export function saveStateToStorage(): void {
  const data = JSON.stringify({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    preset: S.currentPreset,
    presetId: getManifestAt(S.currentPreset)?.id,
    mode: S.currentMode,
    par1: S.par1,
    par2: S.par2,
    speed: S.speed,
    explode: S.explode,
    fx: S.fx,
  });
  localStorage.setItem(KEY, data);
}

export function loadStateFromStorage(): SavedStatePayload | undefined {
  try {
    const saved = localStorage.getItem(KEY);
    if (!saved) return undefined;
    return JSON.parse(saved) as SavedStatePayload;
  } catch {
    return undefined;
  }
}

/** Missing schemaVersion means legacy v1 payload. */
export function getSavedSchemaVersion(saved: SavedStatePayload): number {
  return saved.schemaVersion ?? LEGACY_SCHEMA_VERSION;
}

/** Built-in ids removed from the bank map to their replacement for restore. */
const REMOVED_PRESET_ID_TO_REPLACEMENT: Readonly<Record<string, string>> = {
  glitch: 'bars',
  cascade: 'triangle',
};

/**
 * For saved `schemaVersion` &lt; 3 without `presetId`: numeric slot was **bars-last** order
 * (scatter…cascade, then bars). Maps slot → id for stable restore.
 */
const LEGACY_BANK_SLOT_TO_ID = [
  'scatter',
  'crystal',
  'tunnel',
  'orbs',
  'lattice',
  'pulse',
  'cascade',
  'bars',
] as const;

/**
 * `schemaVersion` 3 only: numeric `preset` in an older 8-slot layout; map via id to current bank.
 */
const V3_BANK_SLOT_TO_ID = [
  'bars',
  'triangle',
  'scatter',
  'crystal',
  'tunnel',
  'orbs',
  'lattice',
  'pulse',
] as const;

/**
 * `schemaVersion` 4: numeric slot order before tunnel moved to position 3 (WebGL third slot).
 * bars, triangle, scatter, crystal, tunnel, orbs, lattice, pulse
 */
const V4_BANK_SLOT_TO_ID = [
  'bars',
  'triangle',
  'scatter',
  'crystal',
  'tunnel',
  'orbs',
  'lattice',
  'pulse',
] as const;

/**
 * Forward-compatible preset restore:
 * - Prefer `presetId` (stable identity across ordering changes).
 * - `schemaVersion` ≥ 5: numeric `preset` is a direct index into the current 8-slot bank.
 * - `schemaVersion` === 4: numeric slot uses {@link V4_BANK_SLOT_TO_ID} → id → current index.
 * - `schemaVersion` === 3: numeric slot uses {@link V3_BANK_SLOT_TO_ID}; `preset` 8 → triangle (9-slot era).
 * - Older schemas: numeric slot uses {@link LEGACY_BANK_SLOT_TO_ID} (bars-last era).
 */
export function resolveSavedPresetIndex(saved: SavedStatePayload): number | undefined {
  if (saved.presetId) {
    const id = REMOVED_PRESET_ID_TO_REPLACEMENT[saved.presetId] ?? saved.presetId;
    const byId = getPresetIndexById(id);
    if (byId >= 0) return byId;
  }
  if (saved.preset !== undefined) {
    const schema = getSavedSchemaVersion(saved);
    const slot = saved.preset;

    if (schema >= CURRENT_SCHEMA_VERSION) {
      if (slot >= 0 && slot < PRESET_BANK_SIZE) return slot;
      return undefined;
    }

    if (schema === 4) {
      if (slot >= 0 && slot < V4_BANK_SLOT_TO_ID.length) {
        const rawId = V4_BANK_SLOT_TO_ID[slot]!;
        const id = REMOVED_PRESET_ID_TO_REPLACEMENT[rawId] ?? rawId;
        const byId = getPresetIndexById(id);
        if (byId >= 0) return byId;
      }
      return undefined;
    }

    if (schema === 3) {
      if (slot >= 0 && slot < V3_BANK_SLOT_TO_ID.length) {
        const rawId = V3_BANK_SLOT_TO_ID[slot]!;
        const id = REMOVED_PRESET_ID_TO_REPLACEMENT[rawId] ?? rawId;
        const byId = getPresetIndexById(id);
        if (byId >= 0) return byId;
      }
      if (slot === 8) {
        const tri = getPresetIndexById('triangle');
        if (tri >= 0) return tri;
      }
      return undefined;
    }

    if (slot >= 0 && slot < LEGACY_BANK_SLOT_TO_ID.length) {
      const rawId = LEGACY_BANK_SLOT_TO_ID[slot]!;
      const id = REMOVED_PRESET_ID_TO_REPLACEMENT[rawId] ?? rawId;
      const byId = getPresetIndexById(id);
      if (byId >= 0) return byId;
    }
    return saved.preset;
  }
  return undefined;
}
