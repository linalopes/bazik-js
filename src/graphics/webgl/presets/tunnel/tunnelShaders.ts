/**
 * Depth-illusion tunnel: bands in inverse-radius space (vanishing center) + forward travel phase.
 * u_mode 0..3 = UI modes 1..4. +q.y is screen-up.
 *
 * par1: depth compression / ring density. par2: motion, drift, and warp strength.
 */

export const TUNNEL_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const TUNNEL_FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_mode;
uniform vec3 u_eq;
uniform vec2 u_par;
uniform float u_banger;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_bg;

out vec4 outColor;

vec3 pickRingColor(float k) {
  float m4 = mod(k + 1024.0, 4.0);
  if (m4 < 0.5) return u_c0;
  if (m4 < 1.5) return u_c1;
  if (m4 < 2.5) return u_c2;
  return mix(u_c2, u_bg, 0.55);
}

void main() {
  float mn = min(u_resolution.x, u_resolution.y);
  vec2 fc = gl_FragCoord.xy;
  vec2 q = vec2((fc.x - 0.5 * u_resolution.x) / mn, (fc.y - 0.5 * u_resolution.y) / mn);

  float px = clamp(u_par.x, -1.0, 1.0);
  float py = clamp(u_par.y, -1.0, 1.0);
  float eq0 = clamp(u_eq.x, 0.0, 1.0);

  vec2 qc = q;
  float travel = 0.0;
  float breath = 1.0;
  float radialWarp = 0.0;

  if (u_mode == 0) {
    travel = u_time * 0.54;
  } else if (u_mode == 1) {
    travel = u_time * 0.62 + 0.42 * sin(u_time * 0.88);
    float amp = 0.12 + 0.2 * abs(py);
    breath = 1.0 + amp * sin(u_time * 2.05);
    travel += 0.22 * sin(u_time * 1.35);
  } else if (u_mode == 2) {
    travel = u_time * 0.5;
    float dm = 0.06 + 0.14 * abs(py);
    qc -= vec2(dm * sin(u_time * 0.74), dm * cos(u_time * 0.57));
    float rot = (0.08 + 0.12 * abs(py)) * sin(u_time * 0.4);
    float cr = cos(rot);
    float sr = sin(rot);
    qc = mat2(cr, -sr, sr, cr) * qc;
    qc.x *= 1.0 + 0.07 * sin(u_time * 0.46) * (0.5 + 0.5 * px);
    qc.y *= 1.0 + 0.055 * cos(u_time * 0.51) * (0.5 + 0.5 * px);
    travel += 0.18 * sin(u_time * 1.05);
  } else {
    travel = u_time * 0.66;
    float ang = atan(qc.y, qc.x);
    float wm = 0.06 * abs(py) + 0.035 * abs(px) + 0.025;
    radialWarp = wm * sin(ang * 4.5 + u_time * 1.35);
    radialWarp += 0.038 * py * sin(ang * 7.5 - u_time * 1.85);
    radialWarp += 0.025 * sin(ang * 3.0 + u_time * 0.7) * (0.5 + 0.5 * px);
    travel += 0.12 * sin(u_time * 1.55 + ang);
  }

  float d = length(qc);
  d *= 1.0 + radialWarp;
  d = max(d, 1e-5);

  float eps = mix(0.045, 0.13, 0.5 + 0.5 * px);
  float powK = mix(0.84, 1.12, 0.5 + 0.5 * px);
  float depthZ = pow(1.0 / (d + eps), powK) * breath;

  float density = mix(2.15, 6.2, 0.5 + 0.5 * px);
  density *= 0.96 + 0.06 * eq0 + 0.04 * u_banger;

  float speedSig = 2.05 + 0.45 * py * sin(u_time * 0.42);
  float cell = depthZ * density - travel * speedSig;
  float shallow = sin(depthZ * 2.35 - u_time * 1.45);
  cell += (0.055 * py + 0.028 * px) * shallow * smoothstep(0.16, 0.48, d);

  float bandF = floor(cell);
  float fr = fract(cell);
  float edge = smoothstep(0.0, 0.36, fr) * smoothstep(1.0, 0.64, fr);

  vec3 ringCol = pickRingColor(bandF);
  float flowSh = 0.032 * sin(fr * 6.2831853 - u_time * 2.4) * (0.35 + 0.4 * eq0);
  ringCol *= 1.0 + flowSh;

  vec3 col = mix(u_bg * 0.86, ringCol, edge);

  float wall = smoothstep(0.16, 0.66, d);
  col = mix(col, mix(col, u_bg, 0.58), wall * 0.48);

  float rim = smoothstep(0.55, 0.84, d);
  col = mix(col, u_bg * 0.95, rim * 0.72);

  float coreR = mix(0.072, 0.135, 0.5 + 0.5 * py);
  float core = pow(max(0.0, 1.0 - d / coreR), 1.85);
  vec3 hot = mix(u_c0, u_c1, 0.38) * (1.12 + 0.14 * eq0 + 0.08 * u_banger);
  col = mix(col, hot, core * 0.88);

  outColor = vec4(col, 1.0);
}
`;
