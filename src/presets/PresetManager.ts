/**
 * Facade for preset lookup. Keeps `graphics/` and UI off raw registry shape if it grows.
 */
import type { PresetManifest } from './manifestTypes';
import type { PresetDrawFn } from '../graphics/presetDraws';
import {
  getAllPresetEntries,
  getPresetCount,
  getPresetEntryAt,
  getPresetEntryById,
  getPresetIndexById,
  initializePresetRegistry,
} from './PresetRegistry';

export type { PresetManifest } from './manifestTypes';
export { getPresetEntryById, getPresetIndexById, getPresetCount, getAllPresetEntries, initializePresetRegistry };

export function getManifestAt(index: number): PresetManifest | undefined {
  return getPresetEntryAt(index)?.manifest;
}

export function getDrawAt(index: number): PresetDrawFn | undefined {
  return getPresetEntryAt(index)?.draw;
}

export function getDisplayNameAt(index: number): string | undefined {
  return getManifestAt(index)?.name;
}

/** Shape consumed by legacy call sites (`PRESETS[i].name`, `.draw`). */
export interface LegacyPresetSlot {
  readonly name: string;
  readonly draw: PresetDrawFn;
}

export function getLegacyPresetBank(): readonly LegacyPresetSlot[] {
  return getAllPresetEntries().map((e) => ({ name: e.manifest.name, draw: e.draw }));
}
