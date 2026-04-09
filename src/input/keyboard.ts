import { KeyboardInput } from './KeyboardInput';
import { createDefaultRouter } from './InputRouter';

let keyboardInput: KeyboardInput | null = null;

export function registerKeyboard(): void {
  if (keyboardInput) return;
  keyboardInput = new KeyboardInput(createDefaultRouter());
  keyboardInput.attach(document);
}
