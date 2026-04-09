/**
 * Echo feedback FX pass: scene + ping-pong history → output texture for the shared preset pipeline.
 */
import { compileShader, linkProgram } from '../createProgram';
import { bindFullscreenTriangle } from '../pipeline/fullscreenTriangle';
import { FULLSCREEN_VERT } from '../pipeline/fullscreenShaders';
import { ensurePresetFxTargets, getPresetFxTargets } from '../pipeline/presetFxTargets';
import { ECHO_COMP_FRAG } from './echoCompositeShaders';

const MAX_SHIFT_UV = 0.028;
const MIX_SCALE = 0.72;

let echoProg: WebGLProgram | null = null;
let uScene: WebGLUniformLocation | null = null;
let uHistory: WebGLUniformLocation | null = null;
let uResEcho: WebGLUniformLocation | null = null;
let uShift: WebGLUniformLocation | null = null;
let uMix: WebGLUniformLocation | null = null;
let uDoEcho: WebGLUniformLocation | null = null;

let readPing = true;
let lastArmed = false;
let echoTargetW = 0;
let echoTargetH = 0;

function clearPingPong(gl: WebGL2RenderingContext): void {
  const { fboPing, fboPong } = getPresetFxTargets();
  if (!fboPing || !fboPong) return;
  for (const f of [fboPing, fboPong]) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function syncEchoToTargets(gl: WebGL2RenderingContext, w: number, h: number): void {
  ensurePresetFxTargets(gl, w, h);
  if (w !== echoTargetW || h !== echoTargetH) {
    echoTargetW = w;
    echoTargetH = h;
    clearPingPong(gl);
    readPing = true;
  }
}

function ensureEchoProgram(gl: WebGL2RenderingContext): boolean {
  if (echoProg) return true;
  try {
    const vs = compileShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERT);
    const fsEcho = compileShader(gl, gl.FRAGMENT_SHADER, ECHO_COMP_FRAG);
    echoProg = linkProgram(gl, vs, fsEcho);
    gl.useProgram(echoProg);
    uScene = gl.getUniformLocation(echoProg, 'u_scene');
    uHistory = gl.getUniformLocation(echoProg, 'u_history');
    uResEcho = gl.getUniformLocation(echoProg, 'u_resolution');
    uShift = gl.getUniformLocation(echoProg, 'u_shiftUV');
    uMix = gl.getUniformLocation(echoProg, 'u_mix');
    uDoEcho = gl.getUniformLocation(echoProg, 'u_doEcho');
    return true;
  } catch (e) {
    console.error('[echo pass] program failed', e);
    echoProg = null;
    return false;
  }
}

/**
 * Runs echo if armed; otherwise returns the scene texture unchanged.
 * Updates ping-pong when echo is active.
 */
export function runEchoPass(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  echoArmed: boolean,
  echoAmountBipolar: number,
): WebGLTexture | null {
  syncEchoToTargets(gl, w, h);
  const { texScene, texPing, texPong, fboPing, fboPong } = getPresetFxTargets();
  if (!texScene) return null;

  if (lastArmed && !echoArmed) {
    clearPingPong(gl);
    readPing = true;
  }
  lastArmed = echoArmed;

  if (!echoArmed || !ensureEchoProgram(gl) || !echoProg || !fboPing || !fboPong || !texPing || !texPong) {
    return texScene;
  }

  const amt = Math.max(-100, Math.min(100, echoAmountBipolar));
  const absAmt = Math.abs(amt) / 100;
  const shiftUV = (amt / 100) * MAX_SHIFT_UV;
  const mixAmt = absAmt * MIX_SCALE;

  const fboOut = readPing ? fboPong : fboPing;
  const texHist = readPing ? texPing : texPong;

  gl.bindFramebuffer(gl.FRAMEBUFFER, fboOut);
  gl.viewport(0, 0, w, h);
  gl.useProgram(echoProg);
  bindFullscreenTriangle(gl, echoProg);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texScene);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texHist);

  if (uScene) gl.uniform1i(uScene, 0);
  if (uHistory) gl.uniform1i(uHistory, 1);
  if (uResEcho) gl.uniform2f(uResEcho, w, h);
  if (uShift) gl.uniform1f(uShift, shiftUV);
  if (uMix) gl.uniform1f(uMix, mixAmt);
  if (uDoEcho) gl.uniform1i(uDoEcho, 1);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  readPing = !readPing;
  return readPing ? texPing! : texPong!;
}

export function invalidateEchoPass(gl: WebGL2RenderingContext): void {
  if (echoProg) gl.deleteProgram(echoProg);
  echoProg = null;
  uScene = uHistory = uResEcho = uShift = uMix = uDoEcho = null;
  readPing = true;
  lastArmed = false;
  echoTargetW = echoTargetH = 0;
}
