import { writable } from 'svelte/store';

/** When false, the FX strip is hidden (`display: none`) to match legacy panel toggle. */
export const fxPanelOpen = writable(true);
