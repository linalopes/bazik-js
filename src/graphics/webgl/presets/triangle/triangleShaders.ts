/**
 * Nested point-up triangles (Bazik-style). u_mode 0..3 = UI modes 1..4.
 * Y+ is screen-up (apex above base). Colors: outer ring = c0, mid band = c1, inner = c2, bg = c3.
 *
 * u_par.xy: par1/100, par2/100 ∈ [-1,1] — nesting / border ratio (par1), inner scale & pulse depth (par2).
 */

export const TRIANGLE_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const TRIANGLE_FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform int u_mode;
uniform vec3 u_eq;
uniform vec2 u_par;
uniform float u_banger;
uniform vec3 u_outer;
uniform vec3 u_mid;
uniform vec3 u_inner;
uniform vec3 u_bg;

out vec4 outColor;

const float SQRT3 = 1.73205080757;

vec3 barycentric(vec2 p, vec2 a, vec2 b, vec2 c) {
  vec2 v0 = b - a, v1 = c - a, v2 = p - a;
  float d00 = dot(v0, v0);
  float d01 = dot(v0, v1);
  float d11 = dot(v1, v1);
  float d20 = dot(v2, v0);
  float d21 = dot(v2, v1);
  float denom = d00 * d11 - d01 * d01;
  if (abs(denom) < 1e-8) return vec3(-1.0);
  float v = (d11 * d20 - d01 * d21) / denom;
  float w = (d00 * d21 - d01 * d20) / denom;
  float u = 1.0 - v - w;
  return vec3(u, v, w);
}

/** Point-up: apex at +y (top of screen), base below, width ≈ equilateral for given height. */
bool insideUpTri(vec2 p, float scale) {
  float H = 0.86 * scale;
  float halfBase = H / SQRT3;
  vec2 apex = vec2(0.0, H * 0.5);
  float baseY = -H * 0.5;
  vec2 bl = vec2(-halfBase, baseY);
  vec2 br = vec2(halfBase, baseY);
  vec3 bc = barycentric(p, apex, bl, br);
  return bc.x >= -1e-4 && bc.y >= -1e-4 && bc.z >= -1e-4;
}

void main() {
  float mn = min(u_resolution.x, u_resolution.y);
  vec2 fc = gl_FragCoord.xy;
  // gl_FragCoord.y grows upward from bottom; map so +q.y is top (apex at +H/2 sits on screen top).
  vec2 q = vec2((fc.x - 0.5 * u_resolution.x) / mn, (fc.y - 0.5 * u_resolution.y) / mn);
  q.y += 0.022;

  float px = clamp(u_par.x, -1.0, 1.0);
  float py = clamp(u_par.y, -1.0, 1.0);
  float eqB = clamp(u_eq.x, 0.0, 1.0);

  float pulse = 1.0;
  float midS;
  float innerS;
  float rot = 0.0;
  float innerRot = 0.0;

  float modePulseAmp = 0.055 + 0.12 * abs(py);

  if (u_mode == 2) {
    float breathe = 0.045 * sin(u_time * 0.76);
    float border = mix(0.46, 0.76, 0.52 - 0.34 * px);
    midS = border + breathe + 0.05 * px;
    innerS = midS * mix(0.34, 0.54, 0.5 + 0.45 * py);
  } else {
    float border = mix(0.44, 0.74, 0.54 - 0.36 * px);
    midS = border;
    innerS = midS * mix(0.34, 0.56, 0.5 + 0.45 * py);
  }

  if (u_mode == 0) {
    pulse = 1.0;
  } else if (u_mode == 1) {
    pulse = 1.0 + modePulseAmp * sin(u_time * 2.12);
    pulse += 0.03 * abs(py) * sin(u_time * 3.0 + py * 1.7);
  } else if (u_mode == 3) {
    rot = 0.11 * sin(u_time * 0.85);
    innerRot = 0.32 * sin(u_time * 0.4);
  }

  float eqMotion = (u_mode == 0) ? (0.018 * eqB + 0.012 * u_banger) : (0.045 * eqB + 0.038 * u_banger);
  float outerScale = pulse * (0.92 + eqMotion);

  float c = cos(rot);
  float s = sin(rot);
  vec2 qr = mat2(c, -s, s, c) * q;

  bool inO = insideUpTri(qr, outerScale);
  bool inM = insideUpTri(qr, outerScale * midS);
  float ci = cos(innerRot);
  float si = sin(innerRot);
  vec2 qi = mat2(ci, -si, si, ci) * qr;
  bool inI = insideUpTri(qi, outerScale * innerS);

  vec3 col = u_bg;
  if (inO) col = u_outer;
  if (inM) col = u_mid;
  if (inI) col = u_inner;

  if (u_mode == 0 && inM && !inI) {
    col = mix(col, u_outer, 0.045 * (1.0 - px * 0.15));
  }

  outColor = vec4(col, 1.0);
}
`;
