import { writable } from 'svelte/store';

export type TopTab = 'controls' | 'presets' | 'options';

export const activeTopTab = writable<TopTab>('controls');
