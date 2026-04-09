/**
 * Present an RGBA texture to the WebGL default framebuffer (e.g. offscreen canvas).
 */
import { compileShader, linkProgram } from '../createProgram';
import { bindFullscreenTriangle } from './fullscreenTriangle';
import { BLIT_FRAG, FULLSCREEN_VERT } from './fullscreenShaders';

let program: WebGLProgram | null = null;
let uTex: WebGLUniformLocation | null = null;
let uRes: WebGLUniformLocation | null = null;

function ensureBlitProgram(gl: WebGL2RenderingContext): boolean {
  if (program) return true;
  try {
    const vs = compileShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, BLIT_FRAG);
    program = linkProgram(gl, vs, fs);
    uTex = gl.getUniformLocation(program, 'u_tex');
    uRes = gl.getUniformLocation(program, 'u_resolution');
    return true;
  } catch (e) {
    console.error('[blit] program failed', e);
    program = null;
    return false;
  }
}

export function blitTextureToDefaultFramebuffer(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  texture: WebGLTexture,
): boolean {
  if (!ensureBlitProgram(gl) || !program) return false;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, width, height);
  gl.useProgram(program);
  bindFullscreenTriangle(gl, program);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  if (uTex) gl.uniform1i(uTex, 0);
  if (uRes) gl.uniform2f(uRes, width, height);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return true;
}

export function invalidateBlitPass(gl: WebGL2RenderingContext): void {
  if (program) gl.deleteProgram(program);
  program = null;
  uTex = uRes = null;
}
