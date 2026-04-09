import { S } from '../core/state';

export function buildSwatches(): void {
  const el = document.getElementById('color-swatches');
  if (!el) return;
  el.innerHTML = '';
  S.colors.forEach((c, i) => {
    const sw = document.createElement('div');
    sw.className = 'swatch' + (i === S.activeColor ? ' active' : '');
    sw.style.background = c;
    const luminance =
      parseInt(c.slice(1, 3), 16) * 0.299 + parseInt(c.slice(3, 5), 16) * 0.587 + parseInt(c.slice(5, 7), 16) * 0.114;
    if (luminance < 40) sw.style.borderColor = 'rgba(202,216,216,0.3)';
    sw.onclick = (e) => {
      e.stopPropagation();
      void import('./colorPicker').then((m) => m.openColorPicker(i, sw));
    };
    el.appendChild(sw);
  });
}
