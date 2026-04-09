/**
 * WebGL2 nested-triangle preset: scene FBO → shared FX stack → blit to main 2D canvas.
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
import { TRIANGLE_VERT, TRIANGLE_FRAG } from './triangleShaders';

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
let uOuter: WebGLUniformLocation | null = null;
let uMid: WebGLUniformLocation | null = null;
let uInner: WebGLUniformLocation | null = null;
let uBg: WebGLUniformLocation | null = null;
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
    const vs = compileShader(gl, gl.VERTEX_SHADER, TRIANGLE_VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, TRIANGLE_FRAG);
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
    uOuter = gl.getUniformLocation(program, 'u_outer');
    uMid = gl.getUniformLocation(program, 'u_mid');
    uInner = gl.getUniformLocation(program, 'u_inner');
    uBg = gl.getUniformLocation(program, 'u_bg');
    return true;
  } catch (e) {
    console.error('[triangle webgl] Program init failed', e);
    return false;
  }
}

function drawTriangleFallback(snap: RenderSnapshot): void {
  const [br, bg, bb] = vec3FromHex(snap.colors[3] ?? '#050210');
  ctx.fillStyle = `rgb(${br},${bg},${bb})`;
  ctx.fillRect(0, 0, W, H);
  const cx = W * 0.5;
  const cy = H * 0.48;
  const r0 = Math.min(W, H) * 0.42;
  const drawTri = (scale: number, hex: string) => {
    const [r, g, b] = vec3FromHex(hex);
    const h = r0 * scale;
    const w = h * 1.05;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.55);
    ctx.lineTo(cx - w, cy + h * 0.45);
    ctx.lineTo(cx + w, cy + h * 0.45);
    ctx.closePath();
    ctx.fill();
  };
  drawTri(1.0, snap.colors[0] ?? '#fff');
  drawTri(0.55, snap.colors[1] ?? '#ccc');
  drawTri(0.28, snap.colors[2] ?? '#888');
}

export function renderTriangleWebGLPass(t: number, snap: RenderSnapshot): void {
  const gl = getOffscreenWebGL2();
  if (!gl) {
    boundGl = undefined;
    program = undefined;
    buf = undefined;
    drawTriangleFallback(snap);
    return;
  }
  if (gl !== boundGl) {
    boundGl = gl;
    invalidatePresetFxPipeline(gl);
    program = undefined;
    buf = undefined;
    uResolution = uTime = uMode = uEq = uPar = uBanger = null;
    uOuter = uMid = uInner = uBg = null;
  }
  if (!ensureProgram(gl)) {
    drawTriangleFallback(snap);
    return;
  }

  resizeOffscreenSurface(W, H);
  const off = getOffscreenCanvas();
  if (!off) {
    drawTriangleFallback(snap);
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
  if (uOuter) gl.uniform3f(uOuter, c0[0]! / 255, c0[1]! / 255, c0[2]! / 255);
  if (uMid) gl.uniform3f(uMid, c1[0]! / 255, c1[1]! / 255, c1[2]! / 255);
  if (uInner) gl.uniform3f(uInner, c2[0]! / 255, c2[1]! / 255, c2[2]! / 255);
  if (uBg) gl.uniform3f(uBg, cBg[0]! / 255, cBg[1]! / 255, cBg[2]! / 255);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.STENCIL_TEST);
  gl.disable(gl.BLEND);
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
    drawTriangleFallback(snap);
    return;
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(off, 0, 0, W, H);
}
