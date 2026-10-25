/**
 * Pure helpers for the homepage loom lifecycle harness.
 *
 * The harness itself launches browsers, so its decision logic lives here where
 * it can be tested without a GPU, a page or a Playwright download. Nothing in
 * this module touches the network or the filesystem.
 */

const DEFAULT_ORIGIN = "http://127.0.0.1:4331";
const DEFAULT_OUTPUT = "output/loom-harness";
const ENGINES = ["chromium", "webkit"];

/**
 * Console messages that are properties of the measurement rig or the local
 * server, not of the loom. Each entry is an exact prefix so a new message still
 * fails the run instead of being swallowed by a loose pattern.
 */
const CONSOLE_NOISE = [
  {
    contains: "GPU stall due to ReadPixels",
    kind: "capture-noise",
    why: "Chromium driver performance note raised by the harness reading pixels back"
  },
  {
    prefix: "The resource http://127.0.0.1",
    kind: "environment",
    why: "WebKit font-preload note from the local server; unrelated to the loom"
  },
  {
    prefix: "The resource https://woodhouse",
    kind: "environment",
    why: "WebKit font-preload note; unrelated to the loom"
  },
  {
    contains: "Page entered Back-Forward Cache",
    kind: "environment",
    why: "the Vite dev-server WebSocket reports its own bfcache disconnect"
  },
  {
    prefix: "Button failed to load, iconName = ",
    kind: "environment",
    why: "Playwright WebKit's own media-control button artwork fails to load; no page script is involved"
  }
];

/**
 * Classify one console/page-error record.
 *
 * `error` and `pageerror` always fail. Warnings fail unless they match a
 * documented rig/environment note, because a silent warning is how a lifecycle
 * regression would hide.
 */
export function classifyConsole(entry) {
  const text = String(entry.text ?? "");
  const type = entry.type ?? "log";
  const noise = CONSOLE_NOISE.find(
    (candidate) =>
      (candidate.prefix && text.startsWith(candidate.prefix)) ||
      (candidate.contains && text.includes(candidate.contains))
  );
  if (noise) return { kind: noise.kind, fail: false, why: noise.why };
  if (type === "pageerror") return { kind: "pageerror", fail: true };
  if (type === "error") return { kind: "error", fail: true };
  if (type === "warning") return { kind: "warning", fail: true };
  return { kind: type, fail: false };
}

export function parseHarnessArguments(argv = []) {
  const options = {
    origin: DEFAULT_ORIGIN,
    output: DEFAULT_OUTPUT,
    engines: [...ENGINES],
    scenarios: [],
    webkitPath: process.env.LOOM_WEBKIT_PATH,
    timeout: 20000,
    headful: false,
    listOnly: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    else if (argument === "--origin") options.origin = argv[(index += 1)];
    else if (argument === "--output") options.output = argv[(index += 1)];
    else if (argument === "--browser") {
      const value = argv[(index += 1)];
      if (value === "all") options.engines = [...ENGINES];
      else if (ENGINES.includes(value)) options.engines = [value];
      else throw new Error(`Unknown browser: ${value}. Use chromium, webkit or all.`);
    } else if (argument === "--only") {
      options.scenarios = argv[(index += 1)]
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    } else if (argument === "--webkit-path") options.webkitPath = argv[(index += 1)];
    else if (argument === "--headful") options.headful = true;
    else if (argument === "--list") options.listOnly = true;
    else if (argument === "--timeout") options.timeout = Number(argv[(index += 1)]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!/^https?:\/\//.test(options.origin)) throw new Error("--origin must be an http(s) URL");
  options.origin = options.origin.replace(/\/$/, "");
  return options;
}

/** Mean absolute channel difference (0-255) between two RGBA captures. */
export function meanPixelDiff(before, after) {
  if (!before?.data || !after?.data) return null;
  if (before.data.length !== after.data.length) return null;
  let total = 0;
  for (let index = 0; index < before.data.length; index += 1)
    total += Math.abs(before.data[index] - after.data[index]);
  return total / before.data.length;
}

/** Mean brightness of a capture, used to prove the scene actually painted. */
export function meanBrightness(capture) {
  if (!capture?.data?.length) return null;
  let total = 0;
  let samples = 0;
  for (let index = 0; index < capture.data.length; index += 4) {
    total += capture.data[index] + capture.data[index + 1] + capture.data[index + 2];
    samples += 3;
  }
  return total / samples;
}

export function sameListenerMap(before, after) {
  const left = before ?? {};
  const right = after ?? {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const differences = [];
  for (const key of keys) {
    const a = left[key] ?? 0;
    const b = right[key] ?? 0;
    if (a !== b) differences.push(`${key}: ${a} -> ${b}`);
  }
  return differences;
}

/**
 * Listener types the signature owns. The dev server and its toolbar register
 * their own listeners while a page runs, so a whole-document count is not a
 * fair test of the loom; these types are.
 */
const LOOM_LISTENER_TYPES = [
  "pointermove",
  "pointerleave",
  "pointerdown",
  "pointerup",
  "pointercancel",
  "visibilitychange",
  "pagehide",
  "pageshow",
  "webglcontextlost",
  "webglcontextrestored",
  "change"
];

export function loomListenerMap(map) {
  const result = {};
  for (const [key, value] of Object.entries(map ?? {})) {
    const [kind, type] = key.split("|");
    if (!LOOM_LISTENER_TYPES.includes(type)) continue;
    // The signature's only `change` listener is on a MediaQueryList, which is
    // not a DOM element. The dev toolbar attaches `change` to real controls.
    if (type === "change" && kind !== "other") continue;
    result[key] = value;
  }
  return result;
}

/**
 * Turn raw frame timestamps into the rate and the gap around a marked event.
 * The scene clock can only be continuous if the first frame after a resume is
 * requested from a fresh timestamp; a jump of seconds would show up here.
 */
export function frameRate(frames, windowMs) {
  if (!Array.isArray(frames) || frames.length === 0 || !windowMs) return 0;
  return Math.round((frames.length * 1000) / windowMs);
}

export function largestFrameGap(frames) {
  let gap = 0;
  for (let index = 1; index < (frames?.length ?? 0); index += 1)
    gap = Math.max(gap, frames[index] - frames[index - 1]);
  return Math.round(gap);
}

/** Markdown matrix for the saved report and terminal summary. */
export function renderMatrix(report) {
  const lines = ["| scenario | engine | result | failed checks |", "| --- | --- | --- | --- |"];
  for (const run of report.runs) {
    const failed = run.checks.filter((check) => !check.ok).map((check) => check.id);
    lines.push(
      `| ${run.scenario} | ${run.engine} | ${failed.length ? "FAIL" : "pass"} | ${
        failed.join(", ") || "—"
      } |`
    );
  }
  return lines.join("\n");
}
