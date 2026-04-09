/**
 * Serializable preset contract (suitable for future `public/presets/<id>/manifest.json`).
 * Draw implementations stay in code for this migration pass; manifests reference behavior only by `id`.
 */

/** Thumbnail: procedural bank thumb (current app) or static asset path (future). */
export type PresetThumbnailSpec =
  | { readonly kind: 'generated'; readonly palette: readonly [string, string, string] }
  | { readonly kind: 'asset'; readonly path: string };

export interface PresetManifest {
  /** Stable slug (matches folder name when externalized). */
  readonly id: string;
  /** Short display name (preset badge, bank label). */
  readonly name: string;
  /** Inclusive mode range the visuals expect (global mode knob is still 1–8 today). */
  readonly modes: { readonly min: number; readonly max: number };
  readonly paramLabels: readonly [string, string];
  readonly defaultParams: { readonly par1: number; readonly par2: number };
  /** Four recommended swatch colors (aligned with color-bank rows for each slot index). */
  readonly defaultColors: readonly [string, string, string, string];
  readonly thumbnail: PresetThumbnailSpec;
}
