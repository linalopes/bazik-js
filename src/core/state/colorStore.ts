import { writable } from 'svelte/store';
import { S } from './singleton';

export const colors = writable<string[]>([...S.colors]);
export const activeColor = writable(S.activeColor);
export const activeColorBank = writable(0);

export function writeColors(next: string[]): void {
  S.colors = [...next];
  colors.set([...next]);
}

export function writeColorAt(index: number, hex: string): void {
  const next = [...S.colors];
  next[index] = hex;
  S.colors = next;
  colors.set(next);
}

export function writeActiveColor(i: number): void {
  S.activeColor = i;
  activeColor.set(i);
}

export function writeActiveColorBank(i: number): void {
  S.activeColorBank = i;
  activeColorBank.set(i);
}
