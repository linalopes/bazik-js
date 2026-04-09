/**
 * Center-weighted zoom: samples `u_tex` with UV remapped around 0.5.
 * `u_scale` = 1 → identity; >1 zoom in; <1 zoom out (see zoom pass TS for mapping from amount).
 */

export const ZOOM_COMP_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_scale;
uniform int u_doZoom;
in vec2 v_uv;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  if (u_doZoom < 1) {
    outColor = texture(u_tex, uv);
    return;
  }
  vec2 c = vec2(0.5);
  vec2 suv = c + (uv - c) / u_scale;
  outColor = texture(u_tex, suv);
}
`;
