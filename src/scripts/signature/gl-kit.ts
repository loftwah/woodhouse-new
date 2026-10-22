/**
 * Small native WebGL2 helpers for the Woodhouse signature. No framework and no
 * third-party runtime: the scene is one program, one empty vertex array and a
 * handful of uniforms per frame, so a route change costs nothing to undo.
 */

export type Program = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL shader allocation failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): Program {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("WebGL program allocation failed");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "unknown link error";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let index = 0; index < count; index += 1) {
    const info = gl.getActiveUniform(program, index);
    if (!info) continue;
    const name = info.name.replace(/\[0\]$/, "");
    uniforms[name] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
}

export const mat4 = {
  identity(): Float32Array {
    const m = new Float32Array(16);
    m[0] = 1;
    m[5] = 1;
    m[10] = 1;
    m[15] = 1;
    return m;
  },
  perspective(fovRadians: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1 / Math.tan(fovRadians / 2);
    const range = 1 / (near - far);
    const m = new Float32Array(16);
    m[0] = f / aspect;
    m[5] = f;
    m[10] = (near + far) * range;
    m[11] = -1;
    m[14] = 2 * near * far * range;
    return m;
  },
  translation(x: number, y: number, z: number): Float32Array {
    const m = mat4.identity();
    m[12] = x;
    m[13] = y;
    m[14] = z;
    return m;
  },
  multiply(a: Float32Array, b: Float32Array): Float32Array {
    // Column-major, fixed 4x4: every index below is inside the array.
    const out = new Float32Array(16);
    const a0 = a[0] ?? 0;
    const a1 = a[1] ?? 0;
    const a2 = a[2] ?? 0;
    const a3 = a[3] ?? 0;
    const a4 = a[4] ?? 0;
    const a5 = a[5] ?? 0;
    const a6 = a[6] ?? 0;
    const a7 = a[7] ?? 0;
    const a8 = a[8] ?? 0;
    const a9 = a[9] ?? 0;
    const a10 = a[10] ?? 0;
    const a11 = a[11] ?? 0;
    const a12 = a[12] ?? 0;
    const a13 = a[13] ?? 0;
    const a14 = a[14] ?? 0;
    const a15 = a[15] ?? 0;
    for (let column = 0; column < 4; column += 1) {
      const b0 = b[column * 4] ?? 0;
      const b1 = b[column * 4 + 1] ?? 0;
      const b2 = b[column * 4 + 2] ?? 0;
      const b3 = b[column * 4 + 3] ?? 0;
      out[column * 4] = a0 * b0 + a4 * b1 + a8 * b2 + a12 * b3;
      out[column * 4 + 1] = a1 * b0 + a5 * b1 + a9 * b2 + a13 * b3;
      out[column * 4 + 2] = a2 * b0 + a6 * b1 + a10 * b2 + a14 * b3;
      out[column * 4 + 3] = a3 * b0 + a7 * b1 + a11 * b2 + a15 * b3;
    }
    return out;
  }
};

/** Deterministic 32-bit hash so a reload produces the same sculpture. */
export function hash(seed: number): number {
  let value = seed | 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = value ^ (value >>> 16);
  return (value >>> 0) / 4294967296;
}
