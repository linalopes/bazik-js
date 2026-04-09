import type { PresetManifest } from './manifestTypes';
import { BUILTIN_PRESET_IDS } from './builtinCatalog';

function isStringArray(v: unknown, n: number): v is string[] {
  return Array.isArray(v) && v.length === n && v.every((x) => typeof x === 'string');
}

function validateManifest(expectedId: string, raw: unknown): raw is PresetManifest {
  if (!raw || typeof raw !== 'object') return false;
  const m = raw as Record<string, unknown>;
  if (typeof m.id !== 'string' || m.id !== expectedId) return false;
  if (typeof m.name !== 'string') return false;
  if (!m.modes || typeof m.modes !== 'object') return false;
  const modes = m.modes as Record<string, unknown>;
  if (typeof modes.min !== 'number' || typeof modes.max !== 'number') return false;
  if (!isStringArray(m.paramLabels, 2)) return false;
  if (!m.defaultParams || typeof m.defaultParams !== 'object') return false;
  const defaults = m.defaultParams as Record<string, unknown>;
  if (typeof defaults.par1 !== 'number' || typeof defaults.par2 !== 'number') return false;
  if (!isStringArray(m.defaultColors, 4)) return false;
  if (!m.thumbnail || typeof m.thumbnail !== 'object') return false;
  const thumb = m.thumbnail as Record<string, unknown>;
  if (thumb.kind === 'generated') return isStringArray(thumb.palette, 3);
  if (thumb.kind === 'asset') return typeof thumb.path === 'string';
  return false;
}

async function loadManifest(id: string): Promise<PresetManifest | undefined> {
  try {
    const res = await fetch(`/presets/${id}/manifest.json`);
    if (!res.ok) {
      console.warn(`[presets] Failed to load manifest for "${id}" (${res.status}); using built-in fallback.`);
      return undefined;
    }
    const raw = (await res.json()) as unknown;
    if (!validateManifest(id, raw)) {
      console.warn(`[presets] Invalid manifest for "${id}"; using built-in fallback.`);
      return undefined;
    }
    return raw;
  } catch (err) {
    console.warn(`[presets] Error loading manifest for "${id}"; using built-in fallback.`, err);
    return undefined;
  }
}

/**
 * Load external manifests in stable built-in order.
 * Returns one item per preset id; invalid/missing entries are `undefined`.
 */
export async function loadExternalPresetManifests(): Promise<Array<PresetManifest | undefined>> {
  const manifests: Array<PresetManifest | undefined> = [];
  for (const id of BUILTIN_PRESET_IDS) {
    const manifest = await loadManifest(id);
    manifests.push(manifest);
  }
  return manifests;
}
