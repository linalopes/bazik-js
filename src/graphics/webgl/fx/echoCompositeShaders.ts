/**
 * Fullscreen composite: current scene + ping-pong feedback with horizontal shift.
 * `u_shiftUV` is signed (negative vs positive amount); `u_mix` scales trail strength from |amount|.
 */

export const ECHO_COMP_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_scene;
uniform sampler2D u_history;
uniform vec2 u_resolution;
uniform float u_shiftUV;
uniform float u_mix;
uniform int u_doEcho;
in vec2 v_uv;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 scene = texture(u_scene, uv).rgb;
  if (u_doEcho < 1) {
    outColor = vec4(scene, 1.0);
    return;
  }
  vec2 off = vec2(u_shiftUV, 0.0);
  vec3 hist = texture(u_history, uv + off).rgb;
  float m = clamp(u_mix, 0.0, 0.92);
  vec3 col = mix(scene, hist, m);
  outColor = vec4(col, 1.0);
}
`;
