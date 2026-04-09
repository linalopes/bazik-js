/** Main preview canvas (Canvas 2D today; WebGL2 pipeline can attach here later). */

export let cvs: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
export let W = 960;
export let H = 540;

export function initMainCanvas(canvas: HTMLCanvasElement) {
  cvs = canvas;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Could not get 2d context');
  ctx = c;
  W = canvas.width;
  H = canvas.height;
}
