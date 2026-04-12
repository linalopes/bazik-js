/**
 * Preset draw list for `Renderer`, actions, status line, and preset bank.
 * Prefer `PresetManager` / manifests when adding metadata-driven behavior.
 */
import type { PresetDrawFn } from '../graphics/presetDraws';
import { getLegacyPresetBank } from './PresetManager';

export type PresetDefinition = {
  name: string;
  draw: PresetDrawFn;
};

export const PRESETS: PresetDefinition[] = [];

export function refreshPresetList(): void {
  PRESETS.splice(0, PRESETS.length, ...getLegacyPresetBank());
}

refreshPresetList();

export type { PresetManifest } from './manifestTypes';
export {
  getManifestAt,
  getDrawAt,
  getDisplayNameAt,
  getPresetCount,
  getAllPresetEntries,
  getPresetEntryById,
  getPresetIndexById,
  initializePresetRegistry,
} from './PresetManager';
