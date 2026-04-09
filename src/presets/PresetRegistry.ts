/**
 * Registry of runtime preset entries.
 * Starts with built-ins, then optionally hydrates manifests from `public/presets`.
 */
import { BUILTIN_PRESET_ENTRIES, DRAW_REGISTRY, type PresetEntry } from './builtinCatalog';
import { loadExternalPresetManifests } from './manifestLoader';

const ENTRIES: PresetEntry[] = [...BUILTIN_PRESET_ENTRIES];
let initialized = false;

export type { PresetEntry };

function replaceEntries(next: PresetEntry[]): void {
  ENTRIES.splice(0, ENTRIES.length, ...next);
}

/**
 * Load external manifests and join with code draw registry by preset id.
 * Falls back to built-in manifests on any error.
 */
export async function initializePresetRegistry(): Promise<void> {
  if (initialized) return;
  initialized = true;
  const manifests = await loadExternalPresetManifests();
  const joined: PresetEntry[] = BUILTIN_PRESET_ENTRIES.map((fallback, i) => {
    const external = manifests[i];
    const manifest = external ?? fallback.manifest;
    const draw = DRAW_REGISTRY[manifest.id as keyof typeof DRAW_REGISTRY] ?? fallback.draw;
    return { manifest, draw };
  });
  replaceEntries(joined);
}

export function getPresetEntryAt(index: number): PresetEntry | undefined {
  return ENTRIES[index];
}

export function getAllPresetEntries(): readonly PresetEntry[] {
  return ENTRIES;
}

export function getPresetCount(): number {
  return ENTRIES.length;
}

export function getPresetIndexById(id: string): number {
  return ENTRIES.findIndex((e) => e.manifest.id === id);
}

export function getPresetEntryById(id: string): PresetEntry | undefined {
  return ENTRIES.find((e) => e.manifest.id === id);
}
