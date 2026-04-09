import { writePar, writeXy } from '../core/state';
import { refreshParDisplays } from './actions';

export function setupXYPad(): void {
  const pad = document.getElementById('xy-pad');
  if (!pad) return;
  let dragging = false;
  const move = (e: MouseEvent | TouchEvent) => {
    const r = pad.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0]!.clientX : (e as MouseEvent).clientX;
    const cy = 'touches' in e ? e.touches[0]!.clientY : (e as MouseEvent).clientY;
    const x = Math.max(0, Math.min(1, (cx - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (cy - r.top) / r.height));
    writeXy({ x, y });
    writePar('par1', Math.round((x - 0.5) * 200));
    writePar('par2', Math.round((0.5 - y) * 200));
    const dot = document.getElementById('xy-dot');
    if (dot) {
      dot.style.left = x * 100 + '%';
      dot.style.top = y * 100 + '%';
    }
    refreshParDisplays();
  };
  pad.addEventListener('mousedown', (e) => {
    dragging = true;
    move(e);
  });
  pad.addEventListener(
    'touchstart',
    (e) => {
      dragging = true;
      move(e);
      e.preventDefault();
    },
    { passive: false },
  );
  window.addEventListener('mousemove', (e) => {
    if (dragging) move(e);
  });
  window.addEventListener('touchmove', (e) => {
    if (dragging) move(e);
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
  });
  window.addEventListener('touchend', () => {
    dragging = false;
  });
}
