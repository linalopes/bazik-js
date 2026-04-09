/** Shared fullscreen triangle vertex + texture blit fragment (present / copy pass). */

export const FULLSCREEN_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const BLIT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_resolution;
in vec2 v_uv;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  outColor = texture(u_tex, uv);
}
`;
