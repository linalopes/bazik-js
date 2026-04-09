import { writeFxAt } from '../core/state';
import { updateKnob } from './knobs';
import { updateFxSlot } from '../ui/fxStrip';
import {
  doShift,
  startBreak,
  endBreak,
  setPar1Value,
  setPar2Value,
  setSpeedValue,
  setExplodeValue,
} from './actions';

export async function setupMidi(): Promise<void> {
  try {
    const midi = await navigator.requestMIDIAccess();
    midi.inputs.forEach((input) => {
      input.onmidimessage = (msg: MIDIMessageEvent) => {
        const data = msg.data;
        if (!data || data.length < 3) return;
        const cc = data[1]!;
        const val = data[2]!;
        const norm = val / 127;
        if (cc === 1) setPar1Value(Math.round((norm - 0.5) * 200));
        if (cc === 2) setPar2Value(Math.round((norm - 0.5) * 200));
        if (cc === 7) setSpeedValue(Math.round(norm * 100));
        if (cc === 11) setExplodeValue(Math.round(norm * 100));
        if (cc === 64 && val > 0) doShift();
        if (cc === 65 && val > 0) startBreak();
        else if (cc === 65) endBreak();
        for (let i = 0; i < 8; i++) {
          if (cc === 20 + i) {
            writeFxAt(i, Math.round(norm * 100));
            updateFxSlot(i);
          }
        }
      };
    });
  } catch {
    console.warn('MIDI not available');
  }
}
