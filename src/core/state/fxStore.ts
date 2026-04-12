import { writable } from 'svelte/store';
import { S } from './singleton';

export const fxLevels = writable<number[]>([...S.fx]);

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
