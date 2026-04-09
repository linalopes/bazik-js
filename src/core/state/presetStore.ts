import { writable } from 'svelte/store';
import { S } from './singleton';

export const currentPreset = writable(S.currentPreset);

export function writeCurrentPreset(i: number): void {
  S.currentPreset = i;
  currentPreset.set(i);
}
