/**
 * Center zoom FX pass: input texture → shared work target (or passthrough) in the preset pipeline.
 */
import { compileShader, linkProgram } from '../createProgram';
import { bindFullscreenTriangle } from '../pipeline/fullscreenTriangle';
import { FULLSCREEN_VERT } from '../pipeline/fullscreenShaders';
import { ensurePresetFxTargets, getPresetFxTargets } from '../pipeline/presetFxTargets';
import { ZOOM_COMP_FRAG } from './zoomCompositeShader';

/** Max deviation from scale=1 when amount = ±100 (zoom in / zoom out). */
const ZOOM_K = 0.34;

let zoomProg: WebGLProgram | null = null;
let uTex: WebGLUniformLocation | null = null;
let uRes: WebGLUniformLocation | null = null;
let uScale: WebGLUniformLocation | null = null;
let uDoZoom: WebGLUniformLocation | null = null;

function ensureZoomProgram(gl: WebGL2RenderingContext): boolean {
  if (zoomProg) return true;
  try {
    const vs = compileShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, ZOOM_COMP_FRAG);
    zoomProg = linkProgram(gl, vs, fs);
    uTex = gl.getUniformLocation(zoomProg, 'u_tex');
    uRes = gl.getUniformLocation(zoomProg, 'u_resolution');
    uScale = gl.getUniformLocation(zoomProg, 'u_scale');
    uDoZoom = gl.getUniformLocation(zoomProg, 'u_doZoom');
    return true;
  } catch (e) {
    console.error('[zoom pass] program failed', e);
    zoomProg = null;
    return false;
  }
}

/**
 * Maps bipolar amount -100..100 to shader scale: positive → zoom in (scale > 1), negative → zoom out (scale < 1).
 */
export function zoomAmountToScale(amountBipolar: number): number {
  const t = Math.max(-100, Math.min(100, amountBipolar)) / 100;
  return 1 + ZOOM_K * t;
}

/**
 * If zoom is off or amount is 0, returns `srcTex` unchanged.
 * Otherwise draws into the shared work target and returns `texWork`.
 */
export function runZoomPass(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  srcTex: WebGLTexture,
  zoomArmed: boolean,
  zoomAmountBipolar: number,
): WebGLTexture | null {
  if (!zoomArmed || zoomAmountBipolar === 0) {
    return srcTex;
  }

  ensurePresetFxTargets(gl, w, h);
  const { texWork, fboWork } = getPresetFxTargets();
  if (!texWork || !fboWork || !ensureZoomProgram(gl) || !zoomProg) {
    return srcTex;
  }

  const scale = zoomAmountToScale(zoomAmountBipolar);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fboWork);
  gl.viewport(0, 0, w, h);
  gl.useProgram(zoomProg);
  bindFullscreenTriangle(gl, zoomProg);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, srcTex);
  if (uTex) gl.uniform1i(uTex, 0);
  if (uRes) gl.uniform2f(uRes, w, h);
  if (uScale) gl.uniform1f(uScale, scale);
  if (uDoZoom) gl.uniform1i(uDoZoom, 1);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return texWork;
}

export function invalidateZoomPass(gl: WebGL2RenderingContext): void {
  if (zoomProg) gl.deleteProgram(zoomProg);
  zoomProg = null;
  uTex = uRes = uScale = uDoZoom = null;
}
