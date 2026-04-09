/**
 * Full-screen triangle + fragment shader for the 3-bar Bazik-style preset.
 * Mode selects bar motion axis (see uniform u_mode).
 */

export const BARS_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const BARS_FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_mode;
uniform vec3 u_eq;
uniform vec2 u_par;
uniform float u_banger;
uniform vec3 u_bg;
uniform vec3 u_bar0;
uniform vec3 u_bar1;
uniform vec3 u_bar2;

out vec4 outColor;

float barFill(int i, float t) {
  float e = clamp(u_eq[i], 0.0, 1.0);
  float p = u_par.x * 0.08 + u_par.y * 0.06;
  float w = e * 0.62 + 0.18 + p * float(i - 1) * 0.12;
  return clamp(w + 0.09 * sin(t * 1.65 + float(i) * 2.0), 0.07, 1.0);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float colF = fc.x / u_resolution.x * 3.0;
  int col = int(clamp(floor(colF), 0.0, 2.0));
  float localX = fract(colF);

  float yn = fc.y / u_resolution.y;

  float f = barFill(col, u_time);
  int m = u_mode;

  bool inside = false;
  if (m == 0) {
    inside = yn < f;
  } else if (m == 1) {
    inside = yn > (1.0 - f);
  } else if (m == 2) {
    inside = localX < f;
  } else {
    inside = localX > (1.0 - f);
  }

  float margin = 0.04;
  float mx = smoothstep(margin * 0.5, margin, localX) * smoothstep(1.0 - margin * 0.5, 1.0 - margin, localX);

  vec3 cBar = col == 0 ? u_bar0 : (col == 1 ? u_bar1 : u_bar2);
  float flash = 1.0 + 0.45 * u_banger;
  cBar *= flash;

  vec3 rgb = mix(u_bg, cBar, inside ? 1.0 : 0.0);
  rgb = mix(u_bg, rgb, mx);

  outColor = vec4(rgb, 1.0);
}
`;
