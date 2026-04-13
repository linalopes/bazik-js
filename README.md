# BAZIK JS

Repository / npm package name: `bazik-js`.

## 1. Project Overview

BAZIK JS is a browser-based audiovisual instrument and a homage to the original Bazik.
It combines audio analysis, a canvas-based visual engine, and a performance-oriented control surface that can be driven by UI interactions and a controller mapping layer.

## 2. Architecture Overview

### 2.1 Svelte-driven UI

Most visible UI is now reactive and store-driven through `App.svelte` + UI components in `src/ui/components`.

Current Svelte-driven areas:

- tabs
- buttons (bang vs toggle)
- preset bank
- color system (swatches + picker UI)
- FX strip UI
- knobs (parameters + screen)
- XY pad
- live feedback (EQ, BPM, beat flash)
- controller learn UI state
- color picker visibility/state flow

### 2.2 Imperative Core (by design)

These parts remain imperative intentionally:

- canvas render loop and draw path in `src/graphics`
- audio capture/analysis pipeline in `src/audio`
- pointer math inside interactive components (knob drag, XY drag, color wheel pick)
- controller learn event capture (global click capture + key capture)

These are low-level runtime/input systems where imperative control is appropriate.

## 3. State Model

State architecture uses a bridge model:

- `S` singleton (`src/core/state/singleton.ts`) is the canonical runtime object used by engine-level systems.
- Svelte stores in `src/core/state/*Store.ts` mirror `S` for reactive UI.
- `write*` functions are the mutation interface (`writePar`, `writeCurrentPreset`, `writeFxAt`, `writeFxArmed`, `writeColorAt`, etc.).

Philosophy:

- UI reads from stores.
- Mutations go through `write*` functions.
- `write*` keeps `S` and stores synchronized.

## 4. Rendering Flow

High-level runtime flow:

1. Audio input/analysis computes features.
2. Features update state (`S` + stores).
3. `requestAnimationFrame` loop builds render snapshot.
4. Canvas preview renders from snapshot.

In short: **audio input → analysis → state updates → render loop → canvas preview**.

## 5. FX System

FX layer is fixed to 8 slots (ordered metadata in `src/fx/builtinSlots.ts`):

1. Edge
2. BlurSat
3. LightRay
4. Zoom
5. LoFi
6. Echo
7. Kaleido
8. Split

Each slot has two independent dimensions:

- **value**: bipolar intensity `-100..100`
- **armed**: on/off boolean

Important behavior:

- Arming does not change value.
- Value remains editable while unarmed.
- UI for strip/slots is Svelte-driven (`FxStrip.svelte`, `FxSlot.svelte`).
- The UI is Svelte-driven, while effect application happens outside the Svelte UI layer in the rendering pipeline.

## 6. Controller Learn

Controller learn uses `data-controller-target` on mappable UI controls and semantic bindings in input mapping.

Behavior model:

- learn mode on/off state is store-driven for UI
- selected target and button label are store-driven
- click/key capture remains imperative in `src/input/controllerLearn.ts` (intentional)

This preserves deterministic input capture while keeping visuals reactive.

## 7. Persistence

Persistence uses `localStorage`:

- app state key: `bazikjs_state`
- controller bindings key: `bazikjs_controller_bindings`

Current saved payload includes (via `src/persistence/storage.ts`):

- schema version
- preset index/id
- mode
- parameters (`par1`, `par2`, `speed`, `explode`; `par1`/`par2` are the generic internal parameter model, while `speed`/`explode` are the current preset parameter labels)
- FX values (`fx`)
- FX armed state (`fxArmed`)

Schema compatibility is handled through version-aware restore helpers.

## 8. Project Structure

Main directories:

- `src/app` — app shell and bootstrap
- `src/ui` — Svelte components, UI stores, style layer
- `src/input` — keyboard/controller routing + controller learn logic
- `src/core/state` — singleton + stores + write functions
- `src/audio` — Web Audio input + analysis + feature publishing
- `src/graphics` — render loop + canvas draw pipeline
- `src/presets` — preset registry/catalog/metadata
- `src/persistence` — save/load + schema handling

## 9. What is intentionally NOT refactored

Still intentionally imperative:

- canvas engine internals
- audio analysis internals
- low-level pointer math for interactive controls
- controller event capture plumbing

These are runtime/input concerns where direct imperative flow is preferred for control and predictability.

## 10. Development Guidelines

- Prefer Svelte components + stores for UI behavior.
- Avoid adding new UI DOM mutation paths (`getElementById`, `querySelector`, manual class toggles) unless absolutely required for low-level runtime behavior.
- Route state changes through `write*` functions.
- Preserve existing interaction grammar and visual language (bang/toggle/knob paradigms).
