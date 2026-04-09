/**
 * WebGL2 render pass for the bars preset: draws to offscreen surface, then blits to main 2D canvas.
 */
import { hex2rgb } from '../../../../utils/color';
import type { RenderSnapshot } from '../../../engine/renderSnapshot';
import { ctx, W, H } from '../../../context';
import { getFxAmount } from '../../../../fx/execution/fxAmount';
import { getFxSlotIndexById } from '../../../../fx/FXRegistry';
import { isFxArmed } from '../../../../ui/fxStrip';
import { compileShader, linkProgram } from '../../createProgram';
import {
  bindPresetSceneRenderTarget,
  finishPresetFxChainAndPresent,
  invalidatePresetFxPipeline,
} from '../../pipeline/presetFxPipeline';
import { getOffscreenWebGL2, getOffscreenCanvas, resizeOffscreenSurface } from '../../OffscreenWebGLSurface';
import { BARS_VERT, BARS_FRAG } from './barsShaders';

const ECHO_SLOT_INDEX = getFxSlotIndexById('echo');
const ZOOM_SLOT_INDEX = getFxSlotIndexById('zoom');

let program: WebGLProgram | undefined;
let buf: WebGLBuffer | undefined;
let uResolution: WebGLUniformLocation | null = null;
let uTime: WebGLUniformLocation | null = null;
let uMode: WebGLUniformLocation | null = null;
let uEq: WebGLUniformLocation | null = null;
let uPar: WebGLUniformLocation | null = null;
let uBanger: WebGLUniformLocation | null = null;
let uBg: WebGLUniformLocation | null = null;
let uBar0: WebGLUniformLocation | null = null;
let uBar1: WebGLUniformLocation | null = null;
let uBar2: WebGLUniformLocation | null = null;
/** Invalidate GPU handles if the WebGL context object changes (e.g. context restore). */
let boundGl: WebGL2RenderingContext | undefined;

function vec3FromHex(hex: string): [number, number, number] {
  if (typeof hex !== 'string' || hex.length < 7) return [5, 2, 16];
  const v = hex2rgb(hex);
  if (v.some((n) => Number.isNaN(n))) return [5, 2, 16];
  return v;
}

function ensureProgram(gl: WebGL2RenderingContext): boolean {
  if (program) return true;
  try {
    const vs = compileShader(gl, gl.VERTEX_SHADER, BARS_VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, BARS_FRAG);
    program = linkProgram(gl, vs, fs);
    buf = gl.createBuffer();
    if (!buf) return false;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    gl.useProgram(program);
    const locPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

    uResolution = gl.getUniformLocation(program, 'u_resolution');
    uTime = gl.getUniformLocation(program, 'u_time');
    uMode = gl.getUniformLocation(program, 'u_mode');
    uEq = gl.getUniformLocation(program, 'u_eq');
    uPar = gl.getUniformLocation(program, 'u_par');
    uBanger = gl.getUniformLocation(program, 'u_banger');
    uBg = gl.getUniformLocation(program, 'u_bg');
    uBar0 = gl.getUniformLocation(program, 'u_bar0');
    uBar1 = gl.getUniformLocation(program, 'u_bar1');
    uBar2 = gl.getUniformLocation(program, 'u_bar2');
    return true;
  } catch (e) {
    console.error('[bars webgl] Program init failed', e);
    return false;
  }
}

function drawBarsFallback(snap: RenderSnapshot): void {
  const [br, bg, bb] = vec3FromHex(snap.colors[3] ?? '#050210');
  ctx.fillStyle = `rgb(${br},${bg},${bb})`;
  ctx.fillRect(0, 0, W, H);
  const w = W / 3;
  for (let i = 0; i < 3; i++) {
    const [r, g, b] = vec3FromHex(snap.colors[i] ?? '#ffffff');
    const fh = 0.2 + snap.eq[i]! * 0.75;
    const h = fh * H;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(i * w, H - h, w * 0.92, h);
  }
}

/**
 * Renders the bars preset into the current 2D context (`ctx`) at (0,0)-(W,H).
 */
export function renderBarsWebGLPass(t: number, snap: RenderSnapshot): void {
  const gl = getOffscreenWebGL2();
  if (!gl) {
    boundGl = undefined;
    program = undefined;
    buf = undefined;
    drawBarsFallback(snap);
    return;
  }
  if (gl !== boundGl) {
    boundGl = gl;
    invalidatePresetFxPipeline(gl);
    program = undefined;
    buf = undefined;
    uResolution = null;
    uTime = null;
    uMode = null;
    uEq = null;
    uPar = null;
    uBanger = null;
    uBg = null;
    uBar0 = null;
    uBar1 = null;
    uBar2 = null;
  }
  if (!ensureProgram(gl)) {
    drawBarsFallback(snap);
    return;
  }

  resizeOffscreenSurface(W, H);
  const off = getOffscreenCanvas();
  if (!off) {
    drawBarsFallback(snap);
    return;
  }

  const useFbo = bindPresetSceneRenderTarget(gl, W, H);
  if (!useFbo) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
  }

  gl.useProgram(program!);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf!);
  const locPos = gl.getAttribLocation(program!, 'a_position');
  gl.enableVertexAttribArray(locPos);
  gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

  const modeIdx = (Math.max(1, snap.currentMode) - 1) % 4;
  const c0 = vec3FromHex(snap.colors[0] ?? '#ffffff');
  const c1 = vec3FromHex(snap.colors[1] ?? '#ffffff');
  const c2 = vec3FromHex(snap.colors[2] ?? '#ffffff');
  const cBg = vec3FromHex(snap.colors[3] ?? '#050210');

  if (uResolution) gl.uniform2f(uResolution, W, H);
  if (uTime) gl.uniform1f(uTime, t);
  if (uMode) gl.uniform1i(uMode, modeIdx);
  if (uEq) gl.uniform3f(uEq, snap.eq[0]!, snap.eq[1]!, snap.eq[2]!);
  if (uPar) gl.uniform2f(uPar, snap.par1 / 100, snap.par2 / 100);
  if (uBanger) gl.uniform1f(uBanger, snap.banger);
  if (uBg) gl.uniform3f(uBg, cBg[0]! / 255, cBg[1]! / 255, cBg[2]! / 255);
  if (uBar0) gl.uniform3f(uBar0, c0[0]! / 255, c0[1]! / 255, c0[2]! / 255);
  if (uBar1) gl.uniform3f(uBar1, c1[0]! / 255, c1[1]! / 255, c1[2]! / 255);
  if (uBar2) gl.uniform3f(uBar2, c2[0]! / 255, c2[1]! / 255, c2[2]! / 255);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.STENCIL_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(cBg[0]! / 255, cBg[1]! / 255, cBg[2]! / 255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  if (!useFbo) {
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(off, 0, 0, W, H);
    return;
  }

  const echoAmt = ECHO_SLOT_INDEX >= 0 ? getFxAmount(snap, 'echo') : 0;
  const echoOn = ECHO_SLOT_INDEX >= 0 && isFxArmed(ECHO_SLOT_INDEX);
  const zoomAmt = ZOOM_SLOT_INDEX >= 0 ? getFxAmount(snap, 'zoom') : 0;
  const zoomOn = ZOOM_SLOT_INDEX >= 0 && isFxArmed(ZOOM_SLOT_INDEX);
  if (!finishPresetFxChainAndPresent(gl, W, H, echoOn, echoAmt, zoomOn, zoomAmt)) {
    drawBarsFallback(snap);
    return;
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(off, 0, 0, W, H);
}
