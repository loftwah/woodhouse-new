/**
 * "The loom" — Woodhouse's signature homepage art.
 *
 * A single twisted assembly of tensioned fibres, drawn by one native WebGL2
 * program. There is no geometry buffer: every ribbon corner is generated from
 * `gl_VertexID`, so the whole sculpture costs one uniform upload per frame and
 * can be scaled down instantly by shortening the draw call. Per-fibre material
 * parameters live in a 512x2 float texture generated once from a seeded hash,
 * which keeps the resting composition identical on every load.
 *
 * The interaction is deliberately in-page rather than a canvas widget: the
 * figure never accepts pointer events, and a passive listener on the
 * surrounding band maps a pointer anywhere across the hero into the stage.
 * That keeps links, text selection and touch scrolling untouched.
 */

import { createProgram, hash, mat4, type Program } from "./gl-kit";
import { activeFrameSeconds } from "./loom-timing";

export const LOOM_STRANDS = 640;
const LOOM_SEGMENTS = 58;

const FIBRE_TEXTURE_WIDTH = 1024;
const HALF_SPAN = 3.3;
const FOV = (34 * Math.PI) / 180;
const FIT_MARGIN = 0.99;
const INK: [number, number, number] = [8 / 255, 13 / 255, 25 / 255];
const MODEL_CORNERS: [number, number, number][] = [];
for (const x of [-HALF_SPAN, HALF_SPAN])
  for (const y of [-1.15, 1.15]) for (const z of [-1.15, 1.15]) MODEL_CORNERS.push([x, y, z]);

const GROUND_VERTEX = /* glsl */ `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = corner;
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}`;

const GROUND_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uAspect;
uniform float uTime;
uniform float uIntro;
out vec4 outColour;

void main() {
  vec2 centred = (vUv - vec2(0.54, 0.5)) * vec2(uAspect, 1.0);
  float distanceToLight = length(centred);
  vec3 ink = vec3(0.031, 0.051, 0.098);
  vec3 pool = vec3(0.062, 0.083, 0.125);
  float glow = exp(-distanceToLight * distanceToLight * 2.6);
  vec3 colour = mix(ink, pool, glow * uIntro);
  float skirt = exp(-pow((distanceToLight - 0.62) * 3.4, 2.0));
  colour += vec3(0.052, 0.062, 0.020) * skirt * uIntro;
  float breathe = 0.94 + 0.06 * sin(uTime * 0.19);
  outColour = vec4(colour * mix(1.0, breathe, uIntro), 1.0);
}`;

const VERTEX_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler2D;

uniform mat4 uProjection;
uniform mat4 uViewModel;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uPointerRadius;
uniform float uAspect;
uniform float uTime;
uniform float uWidthScale;
uniform float uExposure;
uniform float uIntro;
uniform int uSegments;
uniform float uGlow;
uniform sampler2D uFibre;
uniform vec4 uWake[3];

out float vSide;
out vec3 vLight;

const float HALF_SPAN = 3.30;

vec4 fibreA(int index) { return texelFetch(uFibre, ivec2(index, 0), 0); }
vec4 fibreB(int index) { return texelFetch(uFibre, ivec2(index, 1), 0); }

vec3 strand(float u, vec4 a, vec4 b) {
  float t = u * 2.0 - 1.0;
  float reach = b.z;
  float tt = t * reach;
  float shape = pow(max(0.0, cos(tt * 1.5707963268)), 1.22);
  float breathe = sin(tt * 3.3 + a.z * 6.2831853 + uTime * 0.33) * 0.05;
  float twistWave = sin(uTime * 0.41 + a.z * 6.2831853) * 0.12;
  float fray = (1.0 - shape) * sign(t);
  float tipY = (fract(a.z * 7.31 + 0.37) - 0.5) * 0.62;
  float tipZ = (fract(a.z * 3.71 + 0.11) - 0.5) * 0.52;
  float lobe = mix(0.74, 1.0, step(0.0, b.x));
  float lift = ((a.x * 1.06 + breathe) * shape * lobe + fray * tipY) * b.x;
  float depth = (a.y * 1.02 * shape * lobe + fray * tipZ) * b.x;
  float angle = b.x * 2.05 * tt + twistWave * shape;
  float c = cos(angle);
  float s = sin(angle);
  return vec3(tt * HALF_SPAN, lift * c - depth * s, lift * s + depth * c);
}

vec3 rotateAxis(vec3 v, vec3 axis, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

void main() {
  int perStrand = (uSegments - 1) * 6;
  int strandIndex = gl_VertexID / perStrand;
  int local = gl_VertexID - strandIndex * perStrand;
  int quad = local / 6;
  int corner = local - quad * 6;

  float u0 = float(quad) / float(uSegments - 1);
  float u1 = float(quad + 1) / float(uSegments - 1);
  float u = (corner == 0 || corner == 1 || corner == 4) ? u0 : u1;
  float sideSign = (corner == 0 || corner == 2 || corner == 3) ? -1.0 : 1.0;

  vec4 a = fibreA(strandIndex);
  vec4 b = fibreB(strandIndex);

  float material = b.y;
  float accent = 0.0;
  if (material > 0.66) accent = 0.45;
  if (material > 0.845) accent = 1.0;
  if (material > 0.966) accent = 0.8;

  float delta = 0.5 / float(uSegments - 1);
  vec3 p = strand(u, a, b);
  vec3 pNext = strand(min(1.0, u + delta), a, b);
  vec3 pPrev = strand(max(0.0, u - delta), a, b);

  vec3 viewPoint = (uViewModel * vec4(p, 1.0)).xyz;
  vec3 tangent = normalize((uViewModel * vec4(pNext, 1.0)).xyz - (uViewModel * vec4(pPrev, 1.0)).xyz);
  vec3 toEye = normalize(viewPoint);
  vec3 side = cross(tangent, toEye);
  float sideLength = length(side);
  side = sideLength > 0.00001 ? side / sideLength : vec3(1.0, 0.0, 0.0);

  vec4 clip = uProjection * vec4(viewPoint, 1.0);
  vec2 ndc = clip.xy / clip.w;

  vec2 aspectDelta = (ndc - uPointer) * vec2(uAspect, 1.0);
  float influence = 1.0 - smoothstep(0.0, uPointerRadius * uPointerRadius, dot(aspectDelta, aspectDelta));
  float push = uPointerStrength * influence * influence;

  vec2 wake = vec2(0.0);
  for (int index = 0; index < 3; index++) {
    vec4 impulse = uWake[index];
    if (impulse.z <= 0.001) continue;
    vec2 offset = (ndc - impulse.xy) * vec2(uAspect, 1.0);
    float distanceToRing = abs(length(offset) - impulse.w);
    float ring = max(0.0, 1.0 - distanceToRing * 4.5);
    wake += normalize(offset + vec2(0.00001)) * ring * ring * impulse.z;
  }

  vec2 displacement = normalize(aspectDelta + vec2(0.00001)) * push * 0.030 + wake * 0.017;
  float brushTwist = push * 2.2 + length(wake) * 3.4;
  side = rotateAxis(side, tangent, sideSign * 1.75 * (u * 2.0 - 1.0) + brushTwist);

  vec4 sideClip = uProjection * vec4(viewPoint + side * 0.05, 1.0);
  vec2 sideNdc = sideClip.xy / sideClip.w;
  vec2 pixelDirection = (sideNdc - ndc) * uResolution * 0.5;
  float pixelLength = length(pixelDirection);
  pixelDirection = pixelLength > 0.0001 ? pixelDirection / pixelLength : vec2(1.0, 0.0);

  float widthPixels = max(0.9, (1.0 + a.w * 1.5) * (1.0 + accent * 0.9) * uWidthScale * (1.0 + uGlow * 2.4));
  vec2 widthOffset = sideSign * pixelDirection * widthPixels / (uResolution * 0.5);

  ndc += displacement + widthOffset;
  clip.xy = ndc * clip.w;
  gl_Position = clip;

  vec3 normal = normalize(cross(tangent, side));
  vec3 eye = normalize(-viewPoint);
  if (dot(normal, eye) < 0.0) normal = -normal;

  vec3 keyLight = normalize(vec3(-0.48, 0.74, 0.52));
  vec3 fillLight = normalize(vec3(0.66, -0.28, 0.18));
  vec3 halfVector = normalize(keyLight + eye);
  float diffuse = max(dot(normal, keyLight), 0.0);
  float fill = max(dot(normal, fillLight), 0.0);
  float specular = pow(max(dot(normal, halfVector), 0.0), 46.0);
  float fresnel = pow(1.0 - max(dot(normal, eye), 0.0), 2.6);

  vec3 base = mix(vec3(0.13, 0.21, 0.48), vec3(0.24, 0.36, 0.70), fract(material * 9.7));
  if (material > 0.66) base = vec3(0.22, 0.80, 1.0);
  if (material > 0.845) base = vec3(0.80, 1.0, 0.16);
  if (material > 0.966) base = vec3(1.0, 0.40, 0.36);

  float depth = smoothstep(2.0, 16.0, -viewPoint.z);
  float depthFade = 1.0 - 0.62 * depth;
  float energy = 0.16 + pow(b.w, 2.1) * 1.5 + accent * 1.5;
  vec3 specTint = mix(base, vec3(1.0, 0.99, 0.92), 0.30);
  vec3 keyTint = mix(vec3(1.0), vec3(0.82, 1.0, 0.58), 0.55 * accent + 0.12);
  vec3 lit = base * keyTint * (0.06 + 0.94 * diffuse) * energy * (1.0 + accent * 0.75)
    + mix(base, vec3(0.42, 0.58, 1.0), 0.5) * fill * 0.22
    + specTint * specular * (0.62 + energy * 0.38)
    + base * fresnel * 0.28
    + base * push * 0.6;

  vec2 shadeDirection = normalize(viewPoint.xy + vec2(0.0001));
  lit *= mix(0.52, 1.0, smoothstep(-1.0, 0.9, dot(shadeDirection, vec2(0.55, 0.62))));
  lit = mix(lit, lit * vec3(0.42, 0.56, 0.92), depth * 0.85);
  lit *= depthFade * uExposure * uIntro;
  if (uGlow > 0.5) lit *= 0.016;

  vLight = lit;
  vSide = sideSign;
}`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in float vSide;
in vec3 vLight;
out vec4 outColour;

void main() {
  float across = clamp(vSide, -1.0, 1.0);
  float profile = 1.0 - across * across;
  outColour = vec4(1.0 - exp(-vLight * profile * 1.15), 1.0);
}`;

export type LoomStatus = "running" | "paused" | "still" | "unsupported" | "lost";

export type LoomOptions = {
  canvas: HTMLCanvasElement;
  pointerHost: HTMLElement;
  reducedMotion: boolean;
  onFirstFrame?: () => void;
  onStatusChange?: (status: LoomStatus) => void;
};

type QualityTier = { strands: number; resolution: number };

const TIERS: [QualityTier, ...QualityTier[]] = [
  { strands: 1, resolution: 1 },
  { strands: 0.74, resolution: 0.82 },
  { strands: 0.52, resolution: 0.66 }
];

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function createLoom(options: LoomOptions) {
  const { canvas, pointerHost } = options;
  let context: WebGL2RenderingContext | null = null;
  try {
    context = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      desynchronized: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false
    });
  } catch (error) {
    console.warn("Woodhouse signature: WebGL context unavailable", error);
  }
  if (!context) {
    options.onStatusChange?.("unsupported");
    return null;
  }
  const gl: WebGL2RenderingContext = context;

  type Resources = {
    mainProgram: Program;
    groundProgram: Program;
    fibreTexture: WebGLTexture;
    vertexArray: WebGLVertexArrayObject;
  };

  /**
   * Every GL object the scene owns. A restored context has none of them: the
   * shader programs, the fibre texture and the empty vertex array all belong to
   * the context generation that was lost, so recovery builds a fresh set rather
   * than reusing handles that no longer name anything.
   */
  function disposeResources(resources: Resources) {
    if (gl.isContextLost()) return;
    gl.deleteTexture(resources.fibreTexture);
    gl.deleteVertexArray(resources.vertexArray);
    gl.deleteProgram(resources.mainProgram.program);
    gl.deleteProgram(resources.groundProgram.program);
  }

  function buildResources(): Resources | null {
    let mainProgram: Program | undefined;
    let groundProgram: Program | undefined;
    let fibreTexture: WebGLTexture | null = null;
    let vertexArray: WebGLVertexArrayObject | null = null;
    try {
      mainProgram = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
      groundProgram = createProgram(gl, GROUND_VERTEX, GROUND_FRAGMENT);
      fibreTexture = gl.createTexture();
      if (!fibreTexture) throw new Error("WebGL texture allocation failed");
      gl.bindTexture(gl.TEXTURE_2D, fibreTexture);
      const fibres = new Float32Array(FIBRE_TEXTURE_WIDTH * 2 * 4);
      for (let index = 0; index < LOOM_STRANDS; index += 1) {
        fibres[index * 4] = 0.16 + Math.pow(hash(index * 7 + 1), 0.62) * 0.94;
        fibres[index * 4 + 1] = (hash(index * 11 + 5) - 0.5) * 2;
        fibres[index * 4 + 2] = hash(index * 13 + 9);
        fibres[index * 4 + 3] = hash(index * 17 + 21);
        const second = (FIBRE_TEXTURE_WIDTH + index) * 4;
        fibres[second] = hash(index * 23 + 3) < 0.46 ? -1 : 1;
        fibres[second + 1] = hash(index * 29 + 37);
        fibres[second + 2] = 0.76 + hash(index * 19 + 55) * 0.26;
        fibres[second + 3] = hash(index * 31 + 41);
      }
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA32F,
        FIBRE_TEXTURE_WIDTH,
        2,
        0,
        gl.RGBA,
        gl.FLOAT,
        fibres
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      vertexArray = gl.createVertexArray();
      if (!vertexArray) throw new Error("WebGL vertex array allocation failed");
    } catch (error) {
      if (fibreTexture) gl.deleteTexture(fibreTexture);
      if (vertexArray) gl.deleteVertexArray(vertexArray);
      if (mainProgram) gl.deleteProgram(mainProgram.program);
      if (groundProgram) gl.deleteProgram(groundProgram.program);
      console.warn("Woodhouse signature: shader unavailable", error);
      return null;
    }
    if (!mainProgram || !groundProgram || !fibreTexture || !vertexArray) return null;
    return { mainProgram, groundProgram, fibreTexture, vertexArray };
  }

  const state = {
    reducedMotion: options.reducedMotion,
    paused: false,
    destroyed: false,
    contextLost: false,
    status: "running" as LoomStatus,
    phase: 0,
    // The authored still is the first composed frame, so the live scene joins it
    // fully lit. Fading up from black behind the still produced a visible dim
    // dip during the handover.
    intro: 1,
    lastTimestamp: 0,
    raf: 0,
    width: 0,
    height: 0,
    dpr: 1,
    tier: 0,
    frameStamps: [] as number[],
    badWindows: 0,
    goodWindows: 0,
    resources: null as Resources | null,
    pointer: { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
    strength: { value: 0, velocity: 0, target: 0 },
    inside: false,
    visible: true,
    lastWakeAt: 0,
    wakes: [] as { x: number; y: number; strength: number; born: number }[]
  };

  /** Context state is reset by a loss, so every draw setup is re-applied here. */
  function configureGl() {
    gl.bindVertexArray(state.resources?.vertexArray ?? null);
    if (state.resources) gl.useProgram(state.resources.mainProgram.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(INK[0], INK[1], INK[2], 1);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  const initialResources = buildResources();
  if (!initialResources) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    options.onStatusChange?.("unsupported");
    return null;
  }
  state.resources = initialResources;
  configureGl();

  const pointerVec = new Float32Array(2);
  const wakeVec = new Float32Array(12);

  function setStatus(status: LoomStatus) {
    if (state.status === status) return;
    state.status = status;
    options.onStatusChange?.(status);
  }

  function orientation() {
    const aspect = state.height > 0 ? state.width / state.height : 1;
    const portrait = clamp((1.42 - aspect) / 0.42, 0, 1);
    const roll = portrait * 1.24 - 0.075;
    // Active scene time, not performance.now(): returning from a hidden tab or
    // a frozen page must not rotate the sculpture to a different pose.
    const clock = state.phase * 1000;
    const yaw = 0.26 + Math.sin(clock * 0.00011) * 0.11;
    const pitch = -0.26 + Math.sin(clock * 0.00007 + 1.7) * 0.05;
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    const ry = new Float32Array([cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1]);
    const rx = new Float32Array([1, 0, 0, 0, 0, cp, sp, 0, 0, -sp, cp, 0, 0, 0, 0, 1]);
    const rz = new Float32Array([cr, sr, 0, 0, -sr, cr, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return { model: mat4.multiply(ry, mat4.multiply(rx, rz)), aspect };
  }

  function fitDistance(model: Float32Array, aspect: number) {
    const tanHalf = Math.tan(FOV / 2);
    const m0 = model[0] ?? 0;
    const m1 = model[1] ?? 0;
    const m2 = model[2] ?? 0;
    const m4 = model[4] ?? 0;
    const m5 = model[5] ?? 0;
    const m6 = model[6] ?? 0;
    const m8 = model[8] ?? 0;
    const m9 = model[9] ?? 0;
    const m10 = model[10] ?? 0;
    let distance = 0;
    for (const corner of MODEL_CORNERS) {
      const x = corner[0];
      const y = corner[1];
      const z = corner[2];
      const wx = m0 * x + m4 * y + m8 * z;
      const wy = m1 * x + m5 * y + m9 * z;
      const wz = m2 * x + m6 * y + m10 * z;
      const needX = Math.abs(wx) / (FIT_MARGIN * aspect * tanHalf);
      const needY = Math.abs(wy) / (FIT_MARGIN * tanHalf);
      distance = Math.max(distance, wz + Math.max(needX, needY));
    }
    return distance;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dpr =
      clamp(window.devicePixelRatio || 1, 1, 2) * (TIERS[state.tier] ?? TIERS[0]).resolution;
    const width = Math.max(2, Math.round(rect.width * dpr));
    const height = Math.max(2, Math.round(rect.height * dpr));
    state.width = rect.width;
    state.height = rect.height;
    state.dpr = dpr;
    if (width === canvas.width && height === canvas.height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  function mapPointer(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    state.pointer.targetX = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1.5, 1.5);
    state.pointer.targetY = clamp(-(((clientY - rect.top) / rect.height) * 2 - 1), -1.5, 1.5);
  }

  function draw() {
    const resources = state.resources;
    if (state.destroyed || state.contextLost || !resources) return;
    const { mainProgram, groundProgram, fibreTexture, vertexArray } = resources;
    const uniforms = mainProgram.uniforms;
    const { model, aspect } = orientation();
    const projection = mat4.perspective(FOV, aspect, 0.1, 60);
    const viewModel = mat4.multiply(mat4.translation(0, 0, -fitDistance(model, aspect)), model);
    // Wakes age on the same active clock as the pose, so freezing the scene
    // freezes an existing wake instead of letting it expire behind the still.
    const now = state.phase;

    gl.useProgram(mainProgram.program);
    gl.bindVertexArray(vertexArray);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fibreTexture);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(groundProgram.program);
    gl.uniform1f(groundProgram.uniforms.uAspect ?? null, aspect);
    gl.uniform1f(groundProgram.uniforms.uTime ?? null, state.phase);
    gl.uniform1f(groundProgram.uniforms.uIntro ?? null, state.intro);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.BLEND);

    gl.useProgram(mainProgram.program);

    for (let index = 0; index < 12; index += 1) wakeVec[index] = 0;
    state.wakes.forEach((wake, index) => {
      const age = now - wake.born;
      wakeVec[index * 4] = wake.x;
      wakeVec[index * 4 + 1] = wake.y;
      wakeVec[index * 4 + 2] = wake.strength * Math.max(0, 1 - age / 1.5);
      wakeVec[index * 4 + 3] = age * 0.62;
    });

    pointerVec[0] = state.pointer.x;
    pointerVec[1] = state.pointer.y;

    gl.uniformMatrix4fv(uniforms.uProjection ?? null, false, projection);
    gl.uniformMatrix4fv(uniforms.uViewModel ?? null, false, viewModel);
    gl.uniform2f(uniforms.uResolution ?? null, canvas.width, canvas.height);
    gl.uniform1f(uniforms.uAspect ?? null, aspect);
    gl.uniform1f(uniforms.uTime ?? null, state.phase);
    gl.uniform1f(uniforms.uPointerRadius ?? null, 0.42);
    gl.uniform1i(uniforms.uSegments ?? null, LOOM_SEGMENTS);
    gl.uniform1i(uniforms.uFibre ?? null, 0);
    gl.uniform4fv(uniforms.uWake ?? null, wakeVec);
    gl.uniform2fv(uniforms.uPointer ?? null, pointerVec);
    gl.uniform1f(uniforms.uPointerStrength ?? null, state.strength.value);
    gl.uniform1f(uniforms.uWidthScale ?? null, clamp(canvas.width / 1100, 0.62, 2.6));
    gl.uniform1f(uniforms.uExposure ?? null, 0.34);
    gl.uniform1f(uniforms.uIntro ?? null, state.intro);

    const strands = Math.max(
      32,
      Math.round(LOOM_STRANDS * (TIERS[state.tier] ?? TIERS[0]).strands)
    );
    const vertices = strands * (LOOM_SEGMENTS - 1) * 6;

    gl.uniform1f(uniforms.uGlow ?? null, 1);
    gl.drawArrays(gl.TRIANGLES, 0, vertices);
    gl.uniform1f(uniforms.uGlow ?? null, 0);
    gl.drawArrays(gl.TRIANGLES, 0, vertices);
  }

  function step(deltaMs: number) {
    const dt = activeFrameSeconds(deltaMs);
    const pointer = state.pointer;
    pointer.vx += (pointer.targetX - pointer.x) * 170 * dt;
    pointer.vy += (pointer.targetY - pointer.y) * 170 * dt;
    pointer.vx -= pointer.vx * 18 * dt;
    pointer.vy -= pointer.vy * 18 * dt;
    pointer.x += pointer.vx * dt;
    pointer.y += pointer.vy * dt;

    const strength = state.strength;
    strength.velocity += (strength.target - strength.value) * 210 * dt;
    strength.velocity -= strength.velocity * 16 * dt;
    strength.value += strength.velocity * dt;
    if (Math.abs(strength.value) < 0.0006 && strength.target === 0) {
      strength.value = 0;
      strength.velocity = 0;
    }

    const speed = Math.hypot(pointer.vx, pointer.vy);
    const now = state.phase;
    if (state.inside && speed > 0.55 && now - state.lastWakeAt > 0.12) {
      state.lastWakeAt = now;
      state.wakes.unshift({
        x: pointer.x,
        y: pointer.y,
        strength: clamp(speed * 0.18, 0.05, 0.7),
        born: now
      });
      state.wakes.length = Math.min(state.wakes.length, 3);
    }
    if (state.wakes.length) state.wakes = state.wakes.filter((wake) => now - wake.born < 1.5);
  }

  function trackQuality(delta: number) {
    if (state.reducedMotion || state.tier === TIERS.length - 1) return;
    state.frameStamps.push(delta);
    if (state.frameStamps.length < 90) return;
    const sorted = state.frameStamps.slice().sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 16.7;
    state.frameStamps.length = 0;
    if (p95 > 26) {
      state.badWindows += 1;
      state.goodWindows = 0;
    } else {
      state.goodWindows += 1;
      state.badWindows = 0;
    }
    if (state.badWindows >= 2) {
      state.tier += 1;
      state.badWindows = 0;
      resize();
    } else if (state.goodWindows >= 8 && state.tier > 0) {
      // Eight good windows, not four: demoting lowers the cost, which earns the
      // upgrade, which restores it. A short symmetry made a mid-range device
      // soften and sharpen on a loop.
      state.tier -= 1;
      state.goodWindows = 0;
      resize();
    }
  }

  let firstFrameSeen = false;

  function announceFirstFrame() {
    if (firstFrameSeen) return;
    firstFrameSeen = true;
    options.onFirstFrame?.();
  }

  function frame(timestamp: number) {
    if (state.destroyed || state.paused || state.contextLost) return;
    state.raf = requestAnimationFrame(frame);
    const delta = state.lastTimestamp ? timestamp - state.lastTimestamp : 16.7;
    state.lastTimestamp = timestamp;
    // Clamp the scene clock as well as the physics: a frozen or stalled page
    // must resume where it stopped, not skip ahead by the wall-clock gap.
    state.phase += activeFrameSeconds(delta);
    step(delta);
    draw();
    // A tab loaded in the background never ran the bootstrap callback, so the
    // control would stay hidden for the whole session. Claim the first frame
    // from the first draw that actually happened.
    announceFirstFrame();
    trackQuality(delta);
  }

  function drawStill() {
    state.intro = 1;
    draw();
  }

  function onPointerMove(event: PointerEvent) {
    state.inside = true;
    state.strength.target = 1;
    mapPointer(event.clientX, event.clientY);
    if (state.reducedMotion && !state.paused) {
      state.phase = 0;
      state.strength.value = 1;
      state.pointer.x = state.pointer.targetX;
      state.pointer.y = state.pointer.targetY;
      draw();
    }
  }

  function onPointerLeave() {
    state.inside = false;
    state.strength.target = 0;
    if (state.reducedMotion && !state.paused) {
      state.strength.value = 0;
      draw();
    }
  }

  function onPointerDown(event: PointerEvent) {
    state.inside = true;
    state.strength.target = 1.4;
    mapPointer(event.clientX, event.clientY);
    // Without an animation loop, a press that does not move still deserves the
    // same immediate response as the live scene.
    if (state.reducedMotion && !state.paused) {
      state.strength.value = 1.4;
      state.pointer.x = state.pointer.targetX;
      state.pointer.y = state.pointer.targetY;
      draw();
    }
  }

  function onPointerUp() {
    state.strength.target = state.inside ? 1 : 0;
    if (state.reducedMotion && !state.paused) {
      state.strength.value = state.strength.target;
      draw();
    }
  }

  const listeners: [EventTarget, string, EventListener][] = [
    [pointerHost, "pointermove", onPointerMove as EventListener],
    [pointerHost, "pointerleave", onPointerLeave as EventListener],
    [pointerHost, "pointerdown", onPointerDown as EventListener],
    [pointerHost, "pointerup", onPointerUp as EventListener],
    [pointerHost, "pointercancel", onPointerUp as EventListener]
  ];
  for (const [target, type, handler] of listeners)
    target.addEventListener(type, handler, { passive: true });

  function resizeAndRedraw() {
    resize();
    if (state.contextLost) return;
    if (state.reducedMotion || state.paused) drawStill();
  }
  const resizeObserver = new ResizeObserver(resizeAndRedraw);
  resizeObserver.observe(canvas);
  // A display or zoom change can alter devicePixelRatio without changing the
  // canvas's CSS box, so the ResizeObserver never hears about it. The browser
  // announces that change as a window resize; without this the backing store
  // stays at the old density and the artwork turns soft.
  window.addEventListener("resize", resizeAndRedraw);

  function start() {
    if (
      state.destroyed ||
      state.paused ||
      state.reducedMotion ||
      state.contextLost ||
      !state.visible ||
      document.hidden
    )
      return;
    cancelAnimationFrame(state.raf);
    state.lastTimestamp = 0;
    state.raf = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(state.raf);
  }

  function onVisibility() {
    if (document.hidden) stop();
    else if (state.visible) start();
  }
  document.addEventListener("visibilitychange", onVisibility);

  // A bfcached page keeps its timers and listeners but stops receiving frames.
  // Restart from a fresh timestamp on the way back; the scene clock itself only
  // advances while frames run, so the sculpture does not jump.
  function onPageHide(event: PageTransitionEvent) {
    if (event.persisted) stop();
  }
  function onPageShow(event: PageTransitionEvent) {
    if (!event.persisted) return;
    state.lastTimestamp = 0;
    start();
  }
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);

  const intersection = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1];
      if (!entry || state.visible === entry.isIntersecting) return;
      state.visible = entry.isIntersecting;
      if (state.visible) start();
      else stop();
    },
    { threshold: 0 }
  );
  intersection.observe(canvas);

  function onContextLost(event: Event) {
    event.preventDefault();
    // The context generation is gone, and so are every program, texture and
    // vertex array made from it. Dropping the reference stops draw() from
    // touching dead objects until a restored context supplies new ones.
    state.contextLost = true;
    state.resources = null;
    stop();
    setStatus("lost");
  }

  /**
   * A restored context has no shaders, texture or vertex array. The still image
   * held the plate while it was gone; now that the browser says the context is
   * usable again, build one fresh set and carry on from the same point in the
   * scene clock. If the rebuild fails, the still stays and the caption keeps
   * saying the live scene stopped.
   */
  function onContextRestored() {
    if (state.destroyed) return;
    stop();
    const resources = buildResources();
    if (!resources) {
      state.contextLost = true;
      state.resources = null;
      setStatus("lost");
      return;
    }
    state.contextLost = false;
    state.resources = resources;
    configureGl();
    state.lastTimestamp = 0;
    state.intro = 1;
    state.wakes = [];
    state.lastWakeAt = 0;
    state.frameStamps.length = 0;
    resize();
    draw();
    announceFirstFrame();
    if (state.reducedMotion) {
      setStatus("still");
    } else if (state.paused) {
      setStatus("paused");
    } else {
      start();
      setStatus("running");
    }
  }
  canvas.addEventListener("webglcontextlost", onContextLost as EventListener, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored as EventListener, false);

  resize();
  if (state.reducedMotion) {
    drawStill();
    setStatus("still");
    options.onFirstFrame?.();
  } else {
    start();
    setStatus("running");
  }

  return {
    setPaused(paused: boolean) {
      if (state.destroyed || state.contextLost) return;
      state.paused = paused;
      if (paused) {
        stop();
        state.strength.target = 0;
        state.strength.value = 0;
        draw();
        setStatus("paused");
      } else {
        start();
        setStatus(state.reducedMotion ? "still" : "running");
      }
    },
    setReducedMotion(reduced: boolean) {
      if (state.destroyed || reduced === state.reducedMotion) return;
      state.reducedMotion = reduced;
      // A dead context owns the still, whatever the motion preference now says.
      // Letting this path report "running" would unhide a canvas that cannot draw.
      if (state.contextLost) {
        setStatus("lost");
        return;
      }
      if (reduced) {
        stop();
        state.pointer.x = 0;
        state.pointer.vx = 0;
        state.strength.value = 0;
        state.wakes = [];
        state.lastWakeAt = 0;
        state.phase = 0;
        state.intro = 1;
        draw();
        setStatus("still");
      } else {
        start();
        setStatus(state.paused ? "paused" : "running");
      }
    },
    destroy() {
      if (state.destroyed) return;
      state.destroyed = true;
      stop();
      for (const [target, type, handler] of listeners) target.removeEventListener(type, handler);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("resize", resizeAndRedraw);
      canvas.removeEventListener("webglcontextlost", onContextLost as EventListener);
      canvas.removeEventListener("webglcontextrestored", onContextRestored as EventListener);
      // Deleting objects from a context that was lost (or lost and restored
      // without a rebuild) is an INVALID_OPERATION in WebKit. disposeResources
      // checks the live context before touching anything.
      if (state.resources) disposeResources(state.resources);
      state.resources = null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  };
}

export type Loom = NonNullable<ReturnType<typeof createLoom>>;
