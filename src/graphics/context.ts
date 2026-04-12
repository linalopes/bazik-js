/**
 * Main preview canvas — Canvas2D only for a lightweight shell placeholder (no GPU preset pipeline).
 */
export let cvs: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
export let W = 960;
export let H = 540;

export function syncMainCanvasSize(): void {
  W = cvs.width;
  H = cvs.height;
}

export function initMainCanvas(canvas: HTMLCanvasElement): void {
  cvs = canvas;
  const c = canvas.getContext('2d', { alpha: true });
  if (!c) throw new Error('Could not get 2d context');
  ctx = c;
  W = canvas.width;
  H = canvas.height;
}
