import { S, writeExplode, writeSpeed } from '../core/state';

export function updateKnob(param: 'speed' | 'explode', val: number): void {
  const deg = -140 + (val / 100) * 280;
  const knob = document.getElementById('knob-' + param);
  const ind = knob?.querySelector('.knob-indicator') as HTMLElement | undefined;
  if (ind) ind.style.transform = `translateX(-50%) rotate(${deg}deg)`;
  const vEl = document.getElementById('knob-' + param + '-val');
  if (vEl) vEl.textContent = String(val);
}

export function makeKnob(id: string, param: 'speed' | 'explode', onChange?: (v: number) => void): void {
  const el = document.getElementById(id);
  if (!el) return;
  let startY = 0;
  let startVal = 0;
  el.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startY = e.clientY;
    startVal = S[param];
    el.classList.add('dragging');
    const onMove = (ev: MouseEvent) => {
      const delta = Math.round((startY - ev.clientY) * 0.8);
      const nv = Math.max(0, Math.min(100, startVal + delta));
      if (param === 'speed') writeSpeed(nv);
      else writeExplode(nv);
      updateKnob(param, nv);
      onChange?.(nv);
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
