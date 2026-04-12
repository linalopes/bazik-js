# Bazik JS

Repository / npm package name: `bazik-js`.

## What it is

**Bazik JS** is a **browser-based visual instrument**: real-time graphics on a canvas, steered by direct manipulation and optional microphone input. It is a deliberate **homage to the original Bazik** (macOS-era reference), not a clone: same family of ideas (preset bank, color sets, performance-oriented layout), but its own codebase, constraints, and evolution.

Stack: **Svelte**, **TypeScript**, **Vite**, **Canvas 2D** (main preview), **Web Audio** (analysis path).

## Current architecture

**Svelte is the primary UI layer.** `App.svelte` composes the shell; an increasing share of controls are **Svelte components** bound to **Svelte stores**. Domain logic still centers on a **mutable singleton `S`** (`src/core/state/singleton.ts`); store writers (`writePar`, `writeCurrentPreset`, `writeFade`, etc. in `src/core/state/*.ts`) keep **`S` and stores in sync** so the UI can subscribe without duplicating source-of-truth rules.

**Rendering and audio stay imperative.** The preview is driven by a **requestAnimationFrame** loop (`src/graphics/render.ts`) that reads snapshot state and draws via **Canvas 2D** (`src/graphics/engine/Renderer.ts`, `src/graphics/presetDraws.ts`). The **Web Audio** graph and feature extraction live under `src/audio/` and feed state through adapters (e.g. EQ bands into `S` / stores, BPM text still updated against the DOM in places).

**UI subsystems still built or updated imperatively** (non-exhaustive): **FX strip** (`src/ui/fxStrip.ts` — DOM built from TS, slot updates), **knobs** (`src/input/knobs.ts`), **XY pad** (`src/input/xyPad.ts`), **color picker** (`src/ui/colorPicker.ts`), **controller learn** highlights and button copy (`src/input/controllerLearn.ts`), **EQ meter bar heights** and **beat flash** (`src/ui/statusAndEq.ts`), **BPM readout** (`src/audio/audioUiAdapter.ts`).

**Persistence:** `localStorage` keys `bazikjs_state` and `bazikjs_controller_bindings` (`src/persistence/storage.ts`, `src/input/controllerBindingsStorage.ts`). Boot behavior and restore scope are intentionally conservative (see `src/app/init.ts`).

## Interaction grammar

The interface is organized around a small **interaction vocabulary** (instrument-like, not dashboard-like):

| Kind | Meaning | Examples in this app |
|------|---------|----------------------|
| **Bang** | Momentary or fire-and-forget **action**; no lasting “on” state in the control itself | Shift, preset prev/next (as actions), save/clone, pars randomize, FX panel toggle hook, reset map |
| **Toggle** | **Binary state**; UI reflects on/off | Microphone, color bank selection, FX arm per slot, controller learn mode |
| **Continuous** | **Scalar** adjusted over a range; here many musical parameters use a **bipolar −100…+100** convention | Speed/explode knobs (mapped to `par1`/`par2`), screen blend, EQ gain sliders |
| **XY** | **Two coupled axes** mapped into two parameters | XY pad → `par1` / `par2` (same pair as the speed/explode knobs in state) |

CSS groups reflect this (e.g. shared “bang/trigger” styling for a subset of buttons). **Shift** is special-cased in logic: on some presets it **cycles mode**; on others it **advances the preset** (`src/input/actions.ts` → `doShift()`).

## What is already Svelte-driven

- **Top tabs** — `activeTopTab` store (`src/ui/stores/navStore.ts`)
- **Preset selection** — `currentPreset` store + `PresetBank.svelte` / `PresetThumb.svelte`
- **Color banks** — `activeColorBank` store + `ToggleButton` (cbank variant)
- **Color swatches** — `colors` / `activeColor` stores + `ColorSwatches.svelte`
- **Parameter value readouts** — `par1` / `par2` stores + `StepperField.svelte`
- **Screen blend readout** — `fade` store + `StepperField`
- **Break** — `isBreak` store drives pressed styling (`BangButton` + `pressed`)
- **Mic** — `micActive` store + `ToggleButton` (mic variant)
- **Status line text** — preset name, mode, par1/par2, EQ summary, beat, FPS bound from stores / derived state in `App.svelte`
- **XY dot position** — derived from `par1` / `par2` in markup (pad **events** remain imperative)

Shared primitives: `src/ui/components/BangButton.svelte`, `ToggleButton.svelte`, `StepperField.svelte`.

## What is still imperative

- **Canvas preview** — frame loop, preset draw functions, context sizing (`src/graphics/`)
- **Audio engine** — capture, analysis, feature bus (`src/audio/`)
- **FX strip** — grid HTML, knob drag, slot DOM updates (`src/ui/fxStrip.ts`)
- **Knobs** — drag math, indicator rotation (`src/input/knobs.ts`)
- **XY pad** — pointer listeners (`src/input/xyPad.ts`)
- **Color picker** — wheel canvas, popover placement, overlay (`src/ui/colorPicker.ts`)
- **Controller learn** — capture flow, binding storage, highlight scanning (`src/input/controllerLearn.ts`)
- **EQ VU meters** — bar `height` from `updateUI()` (`src/ui/statusAndEq.ts`)
- **BPM display** — text on `#bpm-display` (`src/audio/audioUiAdapter.ts`)
- **Beat flash** — `.on` class on `#beat-flash` (`src/ui/statusAndEq.ts`)
- **Save button** — temporary “saved!” label in `saveState()` (`src/input/actions.ts`)

## Roadmap

**Phase 1 — done (initial migration):** Shell and listed controls moved to **Svelte + stores**; imperative DOM pruned for tabs, preset row, banks, steppers, break/mic, and status bindings.

**Phase 2 — next:** **FX strip** as Svelte components; arm/value state either lifted to stores or thinly wrapped so `updateFxSlot` stops owning the DOM.

**Phase 3:** **Knobs** and **XY pad** — Svelte-managed elements with the same math, or small dedicated components calling existing writers.

**Phase 4:** **Audio-linked visuals** — EQ meters, BPM, beat flash driven by stores updated from the audio path (remove remaining `getElementById` in those hot paths).

**Phase 5:** **Controller learn** — UI state (active target, selection) in stores; `data-controller-target` elements get `class:` from Svelte instead of global `querySelectorAll`.

## Development philosophy

- Prefer **simple, explicit** wiring over abstraction layers that obscure behavior.
- Avoid **over-engineering**: the singleton + store writers exist to bridge legacy imperative code and a growing Svelte surface without a big-bang rewrite.
- Treat the UI as an **instrument**: density and muscle memory matter; interaction grammar is the main consistency tool.
- **Visual consistency** should follow **roles** (bang / toggle / continuous / XY), not one-off styling.
