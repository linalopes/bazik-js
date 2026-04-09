import { S } from '../core/state';
import { PRESETS } from '../presets/list';

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

  const stPreset = document.getElementById('st-preset');
  if (stPreset) stPreset.textContent = PRESETS[S.currentPreset]!.name;
  const stMode = document.getElementById('st-mode');
  if (stMode) stMode.textContent = String(S.currentMode);
  const stPar1 = document.getElementById('st-par1');
  if (stPar1) stPar1.textContent = String(S.par1);
  const stPar2 = document.getElementById('st-par2');
  if (stPar2) stPar2.textContent = String(S.par2);
  const stEq = document.getElementById('st-eq');
  if (stEq)
    stEq.textContent = S.eq[0].toFixed(2) + ' / ' + S.eq[1].toFixed(2) + ' / ' + S.eq[2].toFixed(2);
  const stBeat = document.getElementById('st-beat');
  if (stBeat) stBeat.style.display = S.banger ? 'block' : 'none';
  const stFps = document.querySelector('#st-fps span');
  if (stFps) stFps.textContent = String(S.fps);
}
