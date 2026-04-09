import { writable } from 'svelte/store';
import { getFxSlotAt } from '../../fx/FXRegistry';
import { S } from './singleton';

export const fxLevels = writable<number[]>([...S.fx]);

export function writeFx(next: number[]): void {
  const copy = [...next];
  S.fx = copy;
  fxLevels.set(copy);
}

export function writeFxAt(index: number, value: number): void {
  const next = [...S.fx];
  next[index] = value;
  S.fx = next;
  fxLevels.set(next);
}

export function adjustFxAt(index: number, delta: number): void {
  const id = getFxSlotAt(index)?.id;
  if (id === 'echo' || id === 'zoom') {
    const v = Math.max(-100, Math.min(100, S.fx[index]! + delta));
    writeFxAt(index, v);
    return;
  }
  const v = Math.max(0, Math.min(100, S.fx[index]! + delta));
  writeFxAt(index, v);
}
