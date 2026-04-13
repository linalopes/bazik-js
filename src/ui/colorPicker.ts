import { writeActiveColor } from '../core/state';
import { colorPickerUi } from './stores/colorPickerStore';

export function openColorPicker(swatchIdx: number, swatchEl: HTMLElement): void {
  writeActiveColor(swatchIdx);
  const r = swatchEl.getBoundingClientRect();
  let top = r.bottom + 6;
  let left = r.left;
  if (left + 196 > window.innerWidth) left = window.innerWidth - 204;
  if (top + 320 > window.innerHeight) top = r.top - 326;
  colorPickerUi.set({
    open: true,
    targetIndex: swatchIdx,
    top,
    left,
  });
}

export function closeColorPicker(): void {
  colorPickerUi.update((s) => ({ ...s, open: false }));
}
