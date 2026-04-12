import { S } from '../core/state';

/** Preview beat flash overlay (outside EQ/status DOM). Called from render orchestration. */
export function syncBeatFlashOverlay(on: boolean): void {
  document.getElementById('beat-flash')?.classList.toggle('on', on);
}

export function updateUI(): void {
  const barH = [
    S.eq[0] * 92,
    S.eq[0] * 78,
    S.eq[0] * 88,
    S.eq[1] * 82,
    S.eq[1] * 92,
    S.eq[1] * 70,
    S.eq[2] * 65,
    S.eq[2] * 55,
    S.eq[2] * 60,
  ];
  for (let i = 0; i < 9; i++) {
    const el = document.getElementById('eq' + i);
    if (el) el.style.height = Math.max(2, barH[i]!) + '%';
  }

  /* st-eq / st-beat / st-fps: Svelte-bound via `eq`, `banger`, `fps` stores */
}
