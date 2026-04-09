import { writable } from 'svelte/store';
import { S } from './singleton';

export const currentMode = writable(S.currentMode);

export function writeCurrentMode(m: number): void {
  S.currentMode = m;
  currentMode.set(m);
}
