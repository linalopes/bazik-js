import { writable } from 'svelte/store';

export const controllerLearnButtonLabel = writable('controller learn');
export const controllerLearnSelectedTargetId = writable<string | null>(null);
