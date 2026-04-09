/**
 * Shared RGBA targets for the preset WebGL pipeline: scene + echo ping-pong + FX work buffer.
 * Used by any preset that renders into the offscreen scene FBO and chains FX before present.
 */
let fbW = 0;
let fbH = 0;
let texScene: WebGLTexture | null = null;
let texPing: WebGLTexture | null = null;
let texPong: WebGLTexture | null = null;
let texWork: WebGLTexture | null = null;
let fboScene: WebGLFramebuffer | null = null;
let fboPing: WebGLFramebuffer | null = null;
let fboPong: WebGLFramebuffer | null = null;
let fboWork: WebGLFramebuffer | null = null;

let boundGl: WebGL2RenderingContext | undefined;

function mkRgbaTex(gl: WebGL2RenderingContext, w: number, h: number): WebGLTexture {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  return t;
}

export function ensurePresetFxTargets(gl: WebGL2RenderingContext, w: number, h: number): void {
  if (gl !== boundGl) {
    invalidatePresetFxTargets(gl);
    boundGl = gl;
  }
  if (w === fbW && h === fbH && texScene) return;
  fbW = w;
  fbH = h;

  const dropT = (t: WebGLTexture | null) => t && gl.deleteTexture(t);
  const dropF = (f: WebGLFramebuffer | null) => f && gl.deleteFramebuffer(f);

  dropT(texScene);
  dropT(texPing);
  dropT(texPong);
  dropT(texWork);
  dropF(fboScene);
  dropF(fboPing);
  dropF(fboPong);
  dropF(fboWork);

  texScene = mkRgbaTex(gl, w, h);
  texPing = mkRgbaTex(gl, w, h);
  texPong = mkRgbaTex(gl, w, h);
  texWork = mkRgbaTex(gl, w, h);

  fboScene = gl.createFramebuffer();
  fboPing = gl.createFramebuffer();
  fboPong = gl.createFramebuffer();
  fboWork = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, fboScene);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texScene, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fboPing);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texPing, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fboPong);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texPong, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fboWork);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texWork, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

/** Bind the scene color target for preset geometry (first pass of the pipeline). */
export function bindPresetSceneFramebuffer(gl: WebGL2RenderingContext, w: number, h: number): boolean {
  ensurePresetFxTargets(gl, w, h);
  if (!fboScene) return false;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fboScene);
  gl.viewport(0, 0, w, h);
  return true;
}

export function getPresetFxTargets(): {
  texScene: WebGLTexture | null;
  texPing: WebGLTexture | null;
  texPong: WebGLTexture | null;
  texWork: WebGLTexture | null;
  fboPing: WebGLFramebuffer | null;
  fboPong: WebGLFramebuffer | null;
  fboWork: WebGLFramebuffer | null;
} {
  return { texScene, texPing, texPong, texWork, fboPing, fboPong, fboWork };
}

export function invalidatePresetFxTargets(gl: WebGL2RenderingContext): void {
  fbW = 0;
  fbH = 0;
  if (texScene) gl.deleteTexture(texScene);
  if (texPing) gl.deleteTexture(texPing);
  if (texPong) gl.deleteTexture(texPong);
  if (texWork) gl.deleteTexture(texWork);
  if (fboScene) gl.deleteFramebuffer(fboScene);
  if (fboPing) gl.deleteFramebuffer(fboPing);
  if (fboPong) gl.deleteFramebuffer(fboPong);
  if (fboWork) gl.deleteFramebuffer(fboWork);
  texScene = texPing = texPong = texWork = null;
  fboScene = fboPing = fboPong = fboWork = null;
}
