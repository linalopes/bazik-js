/**
 * Built-in preset registry and fallback manifests.
 * Runtime manifests load from `public/presets/<id>/manifest.json`.
 * All slots share the same shell preview draw (no per-preset GPU renderer).
 */
import type { PresetManifest } from './manifestTypes';
import type { PresetDrawFn } from '../graphics/presetDraws';
import { COLOR_BANKS, PALETTES } from './constants';
import { drawPreviewPlaceholder } from '../graphics/presetDraws';

export interface PresetEntry {
  readonly manifest: PresetManifest;
  readonly draw: PresetDrawFn;
}

export const BUILTIN_PRESET_IDS = [
  'bars',
  'triangle',
  'tunnel',
  'scatter',
  'crystal',
  'orbs',
  'lattice',
  'pulse',
] as const;

const shellDraw: PresetDrawFn = drawPreviewPlaceholder;

const DRAWS_BY_ORDER: PresetDrawFn[] = BUILTIN_PRESET_IDS.map(() => shellDraw);

const FALLBACK_MANIFEST_ROW: Record<(typeof BUILTIN_PRESET_IDS)[number], number | null> = {
  bars: null,
  scatter: 0,
  crystal: 1,
  tunnel: 2,
  orbs: 3,
  lattice: 4,
  pulse: 5,
  triangle: 6,
};

export const DRAW_REGISTRY: Readonly<Record<(typeof BUILTIN_PRESET_IDS)[number], PresetDrawFn>> = {
  scatter: shellDraw,
  crystal: shellDraw,
  tunnel: shellDraw,
  orbs: shellDraw,
  lattice: shellDraw,
  pulse: shellDraw,
  bars: shellDraw,
  triangle: shellDraw,
};

function barsFallbackManifest(): PresetManifest {
  return {
    id: 'bars',
    name: 'bars',
    modes: { min: 1, max: 4 },
    paramLabels: ['par 1', 'par 2'],
    defaultParams: { par1: 0, par2: 0 },
    defaultColors: ['#FFFFFF', '#FFD84D', '#C93CFF', '#050210'],
    thumbnail: {
      kind: 'generated',
      palette: ['#FFFFFF', '#FFD84D', '#C93CFF'],
    },
  };
}

function triangleFallbackManifest(): PresetManifest {
  const row = FALLBACK_MANIFEST_ROW.triangle!;
  const bank = COLOR_BANKS[row]!;
  const pal = PALETTES[row]!;
  return {
    id: 'triangle',
    name: 'triangle',
    modes: { min: 1, max: 4 },
    paramLabels: ['par 1', 'par 2'],
    defaultParams: { par1: 0, par2: 0 },
    defaultColors: [bank[0]!, bank[1]!, bank[2]!, bank[3]!],
    thumbnail: {
      kind: 'generated',
      palette: [pal[0]!, pal[1]!, pal[2]!],
    },
  };
}

function tunnelFallbackManifest(): PresetManifest {
  const row = FALLBACK_MANIFEST_ROW.tunnel!;
  const bank = COLOR_BANKS[row]!;
  const pal = PALETTES[row]!;
  return {
    id: 'tunnel',
    name: 'tunnel',
    modes: { min: 1, max: 4 },
    paramLabels: ['par 1', 'par 2'],
    defaultParams: { par1: 0, par2: 0 },
    defaultColors: [bank[0]!, bank[1]!, bank[2]!, bank[3]!],
    thumbnail: {
      kind: 'generated',
      palette: [pal[0]!, pal[1]!, pal[2]!],
    },
  };
}

function fallbackManifestAt(index: number, id: string): PresetManifest {
  const pal = PALETTES[index]!;
  const bank = COLOR_BANKS[index]!;
  return {
    id,
    name: id,
    modes: { min: 1, max: 8 },
    paramLabels: ['par 1', 'par 2'],
    defaultParams: { par1: 0, par2: 0 },
    defaultColors: [bank[0]!, bank[1]!, bank[2]!, bank[3]!],
    thumbnail: {
      kind: 'generated',
      palette: [pal[0]!, pal[1]!, pal[2]!],
    },
  };
}

function builtinManifestFor(id: (typeof BUILTIN_PRESET_IDS)[number]): PresetManifest {
  if (id === 'bars') return barsFallbackManifest();
  if (id === 'triangle') return triangleFallbackManifest();
  if (id === 'tunnel') return tunnelFallbackManifest();
  const row = FALLBACK_MANIFEST_ROW[id];
  if (row === null) return barsFallbackManifest();
  return fallbackManifestAt(row, id);
}

export const BUILTIN_PRESET_ENTRIES: readonly PresetEntry[] = BUILTIN_PRESET_IDS.map((id, i) => ({
  manifest: builtinManifestFor(id),
  draw: DRAWS_BY_ORDER[i]!,
}));
