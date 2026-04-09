/** Single VBO: fullscreen CCW triangle (−1,−1), (3,−1), (−1,3). */

let buf: WebGLBuffer | null = null;

export function getFullscreenTriangleVbo(gl: WebGL2RenderingContext): WebGLBuffer {
  if (!buf) {
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  }
  return buf;
}

export function bindFullscreenTriangle(gl: WebGL2RenderingContext, program: WebGLProgram): void {
  gl.bindBuffer(gl.ARRAY_BUFFER, getFullscreenTriangleVbo(gl));
  const loc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
}

export function invalidateFullscreenTriangleVbo(): void {
  buf = null;
}
