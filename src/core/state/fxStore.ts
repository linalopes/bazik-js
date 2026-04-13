import { writable } from 'svelte/store';
import { getFxSlotIndexById } from '../../fx/FXRegistry';
import type { FxId } from '../../fx/builtinSlots';
import { S } from './singleton';

const SLOT_COUNT = 8;

export const fxLevels = writable<number[]>([...S.fx]);

/** Per-slot arm/on (UI). Independent of bipolar values in `fxLevels` / `S.fx`. */
export const fxArmed = writable<boolean[]>(Array.from({ length: SLOT_COUNT }, () => false));

export function writeFx(next: number[]): void {
  const copy = [...next];
  S.fx = copy;
  fxLevels.set(copy);
}

export function writeFxAt(index: number, value: number): void {
  const next = [...S.fx];
  next[index] = Math.max(-100, Math.min(100, Math.round(value)));
  S.fx = next;
  fxLevels.set(next);
}

export function adjustFxAt(index: number, delta: number): void {
  const v = Math.max(-100, Math.min(100, S.fx[index]! + delta));
  writeFxAt(index, v);
}

export function toggleFxArmAt(index: number): void {
  fxArmed.update((a) => {
    const n = [...a];
    if (n[index] === undefined) n[index] = false;
    n[index] = !n[index];
    return n;
  });
}

export function writeFxArmed(next: boolean[]): void {
  const normalized = Array.from({ length: SLOT_COUNT }, (_, i) => next[i] === true);
  fxArmed.set(normalized);
}

/** Controller / learn: semantic id matches `BUILTIN_FX_SLOTS` (e.g. `edge`, `loufi`). */
export function toggleFxArmById(fxId: string): void {
  const i = getFxSlotIndexById(fxId as FxId);
  if (i < 0) return;
  toggleFxArmAt(i);
}
