import { writable } from 'svelte/store';

export interface ColorPickerUiState {
  open: boolean;
  targetIndex: number;
  top: number;
  left: number;
}

export const colorPickerUi = writable<ColorPickerUiState>({
  open: false,
  targetIndex: 0,
  top: 0,
  left: 0,
});
