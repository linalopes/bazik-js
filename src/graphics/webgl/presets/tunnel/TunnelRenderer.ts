/**
 * WebGL2 tunnel preset: scene FBO → shared FX chain → 2D canvas.
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
import { TUNNEL_VERT, TUNNEL_FRAG } from './tunnelShaders';

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
let uC0: WebGLUniformLocation | null = null;
let uC1: WebGLUniformLocation | null = null;
let uC2: WebGLUniformLocation | null = null;
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
    const vs = compileShader(gl, gl.VERTEX_SHADER, TUNNEL_VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, TUNNEL_FRAG);
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
    uC0 = gl.getUniformLocation(program, 'u_c0');
    uC1 = gl.getUniformLocation(program, 'u_c1');
    uC2 = gl.getUniformLocation(program, 'u_c2');
    uBg = gl.getUniformLocation(program, 'u_bg');
    return true;
  } catch (e) {
    console.error('[tunnel webgl] Program init failed', e);
    return false;
  }
}

function drawTunnelFallback(snap: RenderSnapshot): void {
  const [br, bg, bb] = vec3FromHex(snap.colors[3] ?? '#050210');
  ctx.fillStyle = `rgb(${br},${bg},${bb})`;
  ctx.fillRect(0, 0, W, H);
  const cx = W * 0.5;
  const cy = H * 0.5;
  const n = 12;
  for (let i = n; i > 0; i--) {
    const pct = i / n;
    const r = pct * Math.min(W, H) * 0.42;
    const hex = snap.colors[(i + 1) % 3] ?? '#fff';
    const [r255, g255, b255] = vec3FromHex(hex);
    ctx.strokeStyle = `rgb(${r255},${g255},${b255})`;
    ctx.lineWidth = 1 + pct * 2;
    ctx.globalAlpha = 0.4 + pct * 0.45;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function renderTunnelWebGLPass(t: number, snap: RenderSnapshot): void {
  const gl = getOffscreenWebGL2();
  if (!gl) {
    boundGl = undefined;
    program = undefined;
    buf = undefined;
    drawTunnelFallback(snap);
    return;
  }
  if (gl !== boundGl) {
    boundGl = gl;
    invalidatePresetFxPipeline(gl);
    program = undefined;
    buf = undefined;
    uResolution = uTime = uMode = uEq = uPar = uBanger = null;
    uC0 = uC1 = uC2 = uBg = null;
  }
  if (!ensureProgram(gl)) {
    drawTunnelFallback(snap);
    return;
  }

  resizeOffscreenSurface(W, H);
  const off = getOffscreenCanvas();
  if (!off) {
    drawTunnelFallback(snap);
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
  if (uC0) gl.uniform3f(uC0, c0[0]! / 255, c0[1]! / 255, c0[2]! / 255);
  if (uC1) gl.uniform3f(uC1, c1[0]! / 255, c1[1]! / 255, c1[2]! / 255);
  if (uC2) gl.uniform3f(uC2, c2[0]! / 255, c2[1]! / 255, c2[2]! / 255);
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
    drawTunnelFallback(snap);
    return;
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(off, 0, 0, W, H);
}
