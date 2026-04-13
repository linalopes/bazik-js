import { writable } from 'svelte/store';

export type OutputResolution = 'auto' | '1280x720' | '1920x1080' | '2560x1440' | '3840x2160';
export type OutputScaling = 'fit' | 'fill' | 'stretch';

export const outputConnected = writable(false);
export const outputFullscreen = writable(false);
export const outputResolution = writable<OutputResolution>('auto');
export const outputScaling = writable<OutputScaling>('fit');
export const outputStatusText = writable('Not connected');

export function writeOutputConnected(v: boolean): void {
  outputConnected.set(v);
  outputStatusText.set(v ? 'Connected' : 'Not connected');
  if (!v) {
    outputFullscreen.set(false);
  }
}

export function writeOutputFullscreen(v: boolean): void {
  outputFullscreen.set(v);
}

export function writeOutputResolution(v: OutputResolution): void {
  outputResolution.set(v);
}

export function writeOutputScaling(v: OutputScaling): void {
  outputScaling.set(v);
}
