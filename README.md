# bazik-js

A Bazik-inspired audiovisual playground built with **Svelte + TypeScript + Vite**, currently in a **migration phase** from legacy **Canvas2D** rendering to a shared **WebGL2 preset/FX backbone**.

This repo already contains a polished UI and multiple real WebGL presets/FX, but the overall renderer is still hybrid: some presets and FX remain Canvas-based.

---

## Project overview

- **Target experience**: a clean, performance-friendly “Bazik-like” interface with a small fixed preset bank, color banks, a shift/mode interaction model, and a controllable FX strip.
- **Tech**:
  - UI: Svelte
  - Rendering: Canvas2D main canvas + offscreen WebGL2 surface for migrated presets
  - State: in-memory singleton `S` + Svelte stores + localStorage persistence
  - Input: keyboard + “controller learn” keybinding system (maps physical keys → semantic actions)

---

## Current State (concise)

- **Visible preset bank is fixed at 8 slots** (migration rule: replace placeholders, do not add slots).
- **WebGL presets (real)**: `bars` (slot 0), `triangle` (slot 1), `tunnel` (slot 2).
- **Canvas presets (legacy)**: `scatter`, `crystal`, `orbs`, `lattice`, `pulse` (slots 3–7).
- **WebGL FX (real, for WebGL presets)**: `echo`, `zoom` (run inside the WebGL preset pipeline).
- **Legacy/Canvas FX still exist**:
  - Main-pass Canvas2D: legacy `echo` wash background, `loufi` pixelate
  - Post-pass Canvas2D: `edge`, `zoom` (skipped for WebGL presets), `kaleido`, `split`, `lightray`, `blursat`
- **Shift behavior**:
  - On WebGL presets (`bars`, `triangle`, `tunnel`): **SHIFT cycles modes 1–4**
  - On legacy presets: **SHIFT advances to next preset**
- **Persistence caveat**: on boot the app intentionally starts on **bars + mode 1** (preset/mode are not restored yet).

---

## Current implementation status

### Preset bank and ordering (migration invariant)

The canonical 8-slot bank is defined in:

- `src/presets/builtinCatalog.ts` (`BUILTIN_PRESET_IDS`)
- `src/ui/presetBank.ts` (UI thumbnails)
- Runtime manifest loader joins `public/presets/<id>/manifest.json` with draw functions by preset id.

Current bank order:

1. `bars` (WebGL)
2. `triangle` (WebGL)
3. `tunnel` (WebGL)
4. `scatter` (Canvas2D)
5. `crystal` (Canvas2D)
6. `orbs` (Canvas2D)
7. `lattice` (Canvas2D)
8. `pulse` (Canvas2D)

Important: the repo also contains a `public/presets/cascade/manifest.json`, but **`cascade` is not in the 8-slot bank** anymore (it’s a legacy artifact; the bank intentionally stays at 8).

### Preset manifests (runtime-loaded)

At runtime, preset metadata is fetched from:

- `public/presets/<id>/manifest.json`

Loader:

- `src/presets/manifestLoader.ts`
- Joined into runtime entries in `src/presets/PresetRegistry.ts`

Fallback manifests exist in code (`src/presets/builtinCatalog.ts`) and are used if the runtime JSON is missing/invalid.

---

## Rendering architecture (hybrid)

### High-level frame loop (Canvas2D orchestrator)

The “outer loop” is still Canvas2D and runs every frame:

- `src/graphics/engine/Renderer.ts`
  - `drawEchoBackground()` (legacy echo wash background)
  - `applyLoufiPixelate()` (legacy pixelation)
  - `drawCurrentPreset()` (calls the selected preset draw function)
  - `runPostFxPipeline()` (Canvas2D post FX stack)

So even WebGL presets are invoked from this Canvas2D renderer.

### How WebGL presets integrate (offscreen surface → drawImage)

WebGL presets share a single hidden canvas + WebGL2 context:

- `src/graphics/webgl/OffscreenWebGLSurface.ts`

Each WebGL preset does:

1. Render into an offscreen WebGL surface at `(W,H)`
2. Optionally render into a shared **scene FBO** so FX can run
3. Run the WebGL FX chain (currently echo → zoom)
4. Present to the offscreen default framebuffer
5. Blit to the main Canvas2D canvas via `ctx.drawImage(offscreenCanvas, 0, 0, W, H)`

See:

- `src/graphics/webgl/presets/bars/BarsRenderer.ts`
- `src/graphics/webgl/presets/triangle/TriangleRenderer.ts`
- `src/graphics/webgl/presets/tunnel/TunnelRenderer.ts`

### Shared WebGL preset/FX backbone

Shared targets (scene + ping-pong + work):

- `src/graphics/webgl/pipeline/presetFxTargets.ts`

Shared pipeline orchestration:

- `src/graphics/webgl/pipeline/presetFxPipeline.ts`
  - `bindPresetSceneRenderTarget()` (scene pass target)
  - `finishPresetFxChainAndPresent()` (echo → zoom → blit)

Current WebGL FX implementations:

- `src/graphics/webgl/fx/echoPass.ts` (+ `echoCompositeShaders.ts`)
- `src/graphics/webgl/fx/zoomPass.ts` (+ `zoomCompositeShader.ts`)

---

## Presets status

### WebGL presets (migrated)

- **bars**:
  - Renderer: `src/graphics/webgl/presets/bars/BarsRenderer.ts`
  - Shaders: `src/graphics/webgl/presets/bars/barsShaders.ts`
  - Modes: 4 (SHIFT cycles these)
- **triangle**:
  - Renderer: `src/graphics/webgl/presets/triangle/TriangleRenderer.ts`
  - Shaders: `src/graphics/webgl/presets/triangle/triangleShaders.ts`
  - Modes: 4 (SHIFT cycles these)
- **tunnel**:
  - Renderer: `src/graphics/webgl/presets/tunnel/TunnelRenderer.ts`
  - Shaders: `src/graphics/webgl/presets/tunnel/tunnelShaders.ts`
  - Modes: 4 (SHIFT cycles these)
  - Note: tunnel is an active refinement target to match the original Bazik tunnel feel more closely.

All three share:

- Same offscreen WebGL surface
- Same WebGL FX chain (echo/zoom)
- Same uniform conventions (`u_time`, `u_mode` 0–3, `u_eq`, `u_par`, `u_banger`, `u_c*`, `u_bg` as applicable)

### Legacy Canvas2D presets (not yet migrated)

Canvas preset draw functions live in:

- `src/graphics/presetDraws.ts`

These are still the default draw path for slots 3–7.

---

## FX status

FX slots are metadata-only and must stay aligned with the legacy `S.fx[]` indices:

- `src/fx/builtinSlots.ts`

### Real WebGL FX (for WebGL presets)

- **echo**: implemented as a ping-pong feedback pass in WebGL (`src/graphics/webgl/fx/echoPass.ts`)
- **zoom**: implemented as a fullscreen texture resample in WebGL (`src/graphics/webgl/fx/zoomPass.ts`)

These are applied only when a preset renders through the shared WebGL pipeline.

### Legacy / Canvas2D FX (still active)

Main-pass legacy FX:

- `src/fx/execution/mainPassFx.ts`:
  - `echo` background wash
  - `loufi` pixelate

Post-pass legacy FX:

- `src/fx/execution/postPassPipeline.ts`:
  - `edge`, `zoom` (Canvas zoom is skipped for WebGL presets), `kaleido`, `split`, `lightray`, `blursat`

---

## Controls / interaction model

### Preset + mode interaction

- Preset select: preset bank UI (`src/ui/presetBank.ts`) and actions (`src/input/actions.ts`)
- Mode:
  - `setMode(m)` updates `S.currentMode` and UI
  - **SHIFT behavior** (`src/input/actions.ts` → `doShift()`):
    - If current preset is `bars`, `triangle`, or `tunnel`: SHIFT cycles modes **1–4**
    - Otherwise: SHIFT advances preset

### Keyboard / controller learn

Input uses a semantic mapping layer:

- Semantics + default bindings: `src/input/ShortcutMap.ts`
- Router: `src/input/InputRouter.ts`
- Learn UI + capture: `src/input/controllerLearn.ts`
- Persistence (localStorage): `src/input/controllerBindingsStorage.ts`

Notes:

- Controller learn highlights elements with `data-controller-target="..."` and binds the next pressed key to the selected semantic action.
- Mappings are stored under `bazikjs_controller_bindings`.

### Color banks

- Selecting a color bank writes a 4-color set into `S.colors` and rebuilds swatches.
- Entry point: `selectColorBank()` in `src/input/actions.ts`

---

## Persistence (honest caveats)

State is saved to localStorage under `bazikjs_state`:

- `src/persistence/storage.ts`

What is currently saved:

- `preset` (numeric index) and `presetId`
- `mode`, `par1`, `par2`, `speed`, `explode`, `fx[]`

What is currently restored on boot (today):

- In `src/app/init.ts`, only **par1/par2/speed/explode/fx** are restored.
- **Preset and mode are intentionally not restored yet** (boot forces `bars` + mode 1 for deterministic startup during migration).

Known caveat in restore code:

- `init.ts` uses `if (saved.par1) ...` checks, so **saved values of `0` are not restored** (same for several numeric fields). This should be fixed when persistence is made “real”.

Schema evolution notes:

- `storage.ts` contains slot/id mapping logic for older banks (e.g. “bars-last” era) and removed preset ids (`glitch`, `cascade`) mapping forward.
- Current schema version is `5`, and the visible bank size is fixed at 8.

---

## How to run

Requirements:

- Node.js (recent LTS recommended)

Commands:

```bash
npm install
npm run dev
```

Other useful commands:

```bash
npm run check
npm run build
npm run preview
```

---

## Next steps / roadmap (prioritized)

### P0 — maintain the migration invariants

- Keep the **visible preset bank at 8 slots**.
- Add new real presets by **replacing** legacy/placeholder slots; do not add bank slots.
- Keep `S.fx[]` indices compatible with `src/fx/builtinSlots.ts`.

### P1 — WebGL FX: implement **edge** in the shared WebGL pipeline

- The FX strip already has an `edge` slot (legacy post-pass).
- Implement a WebGL `edgePass` (or incorporate into the WebGL chain) so edge works for WebGL presets without falling back to Canvas post FX.
- Confirm interaction with echo/zoom ordering.

### P2 — Finish “real” persistence restore

- Restore preset + mode on startup (using `presetId` when available).
- Fix the “0 doesn’t restore” bug in `src/app/init.ts` (use `!== undefined` checks).
- Decide and document the stable state schema for future evolution.

### P3 — Continue preset migration (replace legacy Canvas slots)

- Migrate additional presets from Canvas2D into WebGL using the shared pattern:
  - renderer per preset (scene pass) + shared `finishPresetFxChainAndPresent`
  - consistent uniforms and mode behavior

### P4 — Tunnel polish (ongoing aesthetic matching)

- Continue refining `tunnel` to better match the original Bazik tunnel reference:
  - fewer readable rings, cleaner center, strong depth, less moiré/high-frequency repetition

---

## Developer notes / important conventions

- **Bank order matters**: many UI and persistence assumptions depend on a stable 8-slot ordering.
- **Manifest source of truth (runtime)**: edit `public/presets/<id>/manifest.json` for names, defaults, palettes, and thumbnails; code fallbacks exist but are secondary.
- **WebGL context lifecycle**: WebGL presets share one context; context loss/restoration is handled by invalidating cached programs and the shared pipeline (see `invalidatePresetFxPipeline` usage in each renderer).
- **Modes**: WebGL presets interpret `S.currentMode` as 1–4 and convert to shader `u_mode` 0–3.

