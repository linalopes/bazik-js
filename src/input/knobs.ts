import { S, writeExplode, writeFade, writeSpeed } from '../core/state';

export type KnobParam = 'speed' | 'explode' | 'screen';

/** Bipolar: top (12 o'clock) = 0; CCW → −100, CW → +100 (same 280° sweep as before, centered at 0). */
export function updateKnob(param: KnobParam, val: number): void {
  const deg = (val / 100) * 140;
  const knob = document.getElementById('knob-' + param);
  const ind = knob?.querySelector('.knob-indicator') as HTMLElement | undefined;
  if (ind) ind.style.transform = `translateX(-50%) rotate(${deg}deg)`;
}

function readKnobValue(param: KnobParam): number {
  if (param === 'screen') return S.fade;
  return S[param];
}

function writeKnobValue(param: KnobParam, nv: number): void {
  if (param === 'speed') writeSpeed(nv);
  else if (param === 'explode') writeExplode(nv);
  else writeFade(nv);
}

export function makeKnob(id: string, param: KnobParam, onUiSync?: () => void): void {
  const el = document.getElementById(id);
  if (!el) return;
  let startY = 0;
  let startVal = 0;
  el.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startY = e.clientY;
    startVal = readKnobValue(param);
    el.classList.add('dragging');
    const onMove = (ev: MouseEvent) => {
      const delta = Math.round((startY - ev.clientY) * 0.8);
      const nv = Math.max(-100, Math.min(100, Math.round(startVal + delta)));
      writeKnobValue(param, nv);
      updateKnob(param, nv);
      onUiSync?.();
    };
    const onUp = () => {
      el.classList.remove('dragging');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}
