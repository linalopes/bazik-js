import { S, adjustFxAt, writeFxAt } from '../core/state';
import { FX_NAMES, isFxControlActive } from '../fx/FXManager';

/** Effect enabled (on/off). Independent of stored bipolar value in `S.fx`. */
export function isFxArmed(slotIndex: number): boolean {
  return fxArmed[slotIndex] === true;
}

const fxArmed: boolean[] = [];

export function updateFxSlot(i: number): void {
  const amount = S.fx[i] ?? 0;
  if (fxArmed[i] === undefined) {
    fxArmed[i] = false;
  }
  const valEl = document.getElementById('fxval-' + i);
  if (valEl) valEl.textContent = String(amount);
  const ind = document.getElementById('fxind-' + i);
  if (ind) {
    const deg = (amount / 100) * 140;
    ind.style.transform = `translateX(-50%) rotate(${deg}deg)`;
  }
  const slot = document.getElementById('fx-slot-' + i);
  const armed = fxArmed[i] === true;
  const active = armed && isFxControlActive(i, amount);
  if (slot) slot.classList.toggle('fx-active', active);
  if (slot) slot.classList.toggle('fx-armed', armed);
  if (slot) slot.classList.toggle('fx-unarmed', !armed);
  const knob = document.getElementById('fxknob-' + i);
  if (knob) knob.classList.toggle('active-knob', armed);
  const armBtn = document.getElementById('fxarm-' + i);
  if (armBtn) {
    armBtn.textContent = armed ? 'on' : 'off';
    armBtn.classList.toggle('armed', armed);
  }
}

export function adjustFx(i: number, delta: number): void {
  adjustFxAt(i, delta);
  updateFxSlot(i);
}

function makeFxKnob(i: number): void {
  const el = document.getElementById('fxknob-' + i);
  if (!el) return;
  let startY = 0;
  let startVal = 0;
  el.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startY = e.clientY;
    startVal = S.fx[i]!;
    const onMove = (ev: MouseEvent) => {
      const delta = Math.round((startY - ev.clientY) * 0.8);
      const nv = Math.max(-100, Math.min(100, Math.round(startVal + delta)));
      writeFxAt(i, nv);
      updateFxSlot(i);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}

function toggleFxArm(i: number): void {
  fxArmed[i] = !fxArmed[i];
  updateFxSlot(i);
}

export function toggleFxArmById(fxId: string): void {
  const i = FX_NAMES.findIndex((n) => n === fxId);
  if (i < 0) return;
  toggleFxArm(i);
}

export function buildFxStrip(): void {
  const grid = document.getElementById('fx-grid');
  if (!grid) return;
  FX_NAMES.forEach((name, i) => {
    const slot = document.createElement('div');
    slot.className = 'fx-slot';
    slot.id = 'fx-slot-' + i;
    slot.innerHTML = `
      <div class="fx-knob" id="fxknob-${i}">
        <div class="fx-knob-indicator" id="fxind-${i}" style="transform:translateX(-50%) rotate(0deg)"></div>
      </div>
      <div class="fx-par-row">
        <button class="fx-par-btn" type="button" data-fx-dec="${i}">−</button>
        <span class="fx-par-val" id="fxval-${i}">0</span>
        <button class="fx-par-btn" type="button" data-fx-inc="${i}">+</button>
      </div>
      <button class="fx-arm-btn" id="fxarm-${i}" type="button" data-fx-arm="${i}" data-controller-target="fx.${name}.toggle">off</button>
      <span class="fx-name">${name}</span>
    `;
    grid.appendChild(slot);
    const dec = slot.querySelector('[data-fx-dec="' + i + '"]');
    const inc = slot.querySelector('[data-fx-inc="' + i + '"]');
    const arm = slot.querySelector('[data-fx-arm="' + i + '"]');
    dec?.addEventListener('click', () => adjustFx(i, -5));
    inc?.addEventListener('click', () => adjustFx(i, 5));
    arm?.addEventListener('click', () => toggleFxArm(i));
    makeFxKnob(i);
    updateFxSlot(i);
  });
}
