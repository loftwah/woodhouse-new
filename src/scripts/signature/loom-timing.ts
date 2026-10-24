/**
 * Timing rules for the signature loom, kept apart from the WebGL code so the
 * pause/freeze behaviour can be tested without a browser or a GPU.
 *
 * The scene clock is active time, not wall-clock time. A frozen page, a hidden
 * tab or a long main-thread stall must not teleport the sculpture to a new
 * orientation or advance its shader waves by minutes. A single frame may add at
 * most one 50 ms step, which is already the clamp used by the spring physics.
 */

const MAX_ACTIVE_STEP_MS = 50;

export function activeFrameSeconds(deltaMs: number): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return 0;
  return Math.min(deltaMs, MAX_ACTIVE_STEP_MS) / 1000;
}
