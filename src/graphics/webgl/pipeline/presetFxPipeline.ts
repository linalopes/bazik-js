/**
 * Shared WebGL preset pipeline: **scene pass** (preset draws into scene RT) → **FX chain** (echo, zoom, …)
 * → **present** (blit to default framebuffer).
 */
import { invalidateEchoPass, runEchoPass } from '../fx/echoPass';
import { invalidateZoomPass, runZoomPass } from '../fx/zoomPass';
import { invalidateBlitPass, blitTextureToDefaultFramebuffer } from './blitPass';
import { bindPresetSceneFramebuffer, invalidatePresetFxTargets } from './presetFxTargets';
import { invalidateFullscreenTriangleVbo } from './fullscreenTriangle';

/** Bind the shared scene render target before drawing preset geometry. */
export function bindPresetSceneRenderTarget(gl: WebGL2RenderingContext, w: number, h: number): boolean {
  return bindPresetSceneFramebuffer(gl, w, h);
}

/**
 * After the scene pass, run the FX chain in order and blit the final texture to the default framebuffer.
 */
export function finishPresetFxChainAndPresent(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  echoArmed: boolean,
  echoAmountBipolar: number,
  zoomArmed: boolean,
  zoomAmountBipolar: number,
): boolean {
  const afterEcho = runEchoPass(gl, w, h, echoArmed, echoAmountBipolar);
  if (!afterEcho) return false;

  const afterZoom = runZoomPass(gl, w, h, afterEcho, zoomArmed, zoomAmountBipolar);
  if (!afterZoom) return false;

  return blitTextureToDefaultFramebuffer(gl, w, h, afterZoom);
}

/** Drop GPU objects when context is lost or replaced (scene/FX/blit + shared fullscreen VBO). */
export function invalidatePresetFxPipeline(gl: WebGL2RenderingContext): void {
  invalidatePresetFxTargets(gl);
  invalidateEchoPass(gl);
  invalidateZoomPass(gl);
  invalidateBlitPass(gl);
  invalidateFullscreenTriangleVbo();
}
