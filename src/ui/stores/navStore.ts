import { writable } from 'svelte/store';

export type TopTab = 'controls' | 'presets' | 'output';

export const activeTopTab = writable<TopTab>('controls');
