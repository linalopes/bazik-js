/**
 * Single hidden canvas + WebGL2 context shared by WebGL-backed presets.
 * The main app canvas stays 2D; presets blit from here via drawImage().
 */

let canvas: HTMLCanvasElement | undefined;
let gl: WebGL2RenderingContext | undefined;
let lost = false;
let listenersBound = false;

function ensureCanvas(): HTMLCanvasElement {
  if (!canvas) {
    canvas = document.createElement('canvas');
  }
  return canvas;
}

export function getOffscreenWebGL2(): WebGL2RenderingContext | null {
  if (lost) return null;
  const c = ensureCanvas();
  if (!gl) {
    const ctx = c.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!ctx) return null;
    gl = ctx;
    if (!listenersBound) {
      listenersBound = true;
      c.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        lost = true;
        gl = undefined;
      });
      c.addEventListener('webglcontextrestored', () => {
        lost = false;
      });
    }
  }
  return gl;
}

export function resizeOffscreenSurface(width: number, height: number): void {
  const c = canvas;
  if (!c) return;
  if (c.width === width && c.height === height) return;
  c.width = width;
  c.height = height;
  if (gl) gl.viewport(0, 0, width, height);
}

export function getOffscreenCanvas(): HTMLCanvasElement | undefined {
  return canvas;
}
