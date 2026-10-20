/**
 * The patch bench — Woodhouse's working exhibit for the split between a game,
 * the sound effects it owns and a soundtrack streamed from somewhere else.
 *
 * Three rules shape this file.
 *
 *  - One audio owner. The host context, the effects bus and the music bus are
 *    created once and reused. Disconnecting the music never builds a second
 *    transport and never throws away the run.
 *  - Real separation. The soundtrack is stopped through the supported LoftwahFM
 *    client, so a visitor who pulls the music out hears the difference between
 *    "the game stopped" and "the music stopped".
 *  - Interruptible motion. Every position is a spring, so a visitor can reverse
 *    a pull halfway through and the scene follows the new intention instead of
 *    finishing an obsolete animation.
 *
 * Nothing here starts sound on load. Audio is created from a deliberate gesture.
 */
import { benchStateFromParams, benchStateToParams } from "../../data/bench-state";

/* ── Types ──────────────────────────────────────────────────────────────────── */

type LayerKey = "effects" | "run" | "music";

type RadioSnapshot = {
  phase: string;
  item: { title: string; artist: string } | null;
  error?: string | null;
  preferences: { muted: boolean; volume: number };
};

type RadioClient = {
  selectStation: (manifest: string, station: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  suspend: () => void;
  preferences: (patch: Record<string, unknown>) => void;
  snapshot: () => RadioSnapshot;
  subscribe: (listener: (snapshot: RadioSnapshot) => void) => (() => void) | void;
  dispose: () => void;
};

type RadioModule = {
  createRadioClient: (options: { transport: unknown }) => RadioClient;
  createMediaElementTransport: (audio: HTMLAudioElement) => unknown;
};

type Station = { id: string; name: string };

type Layer = {
  key: LayerKey;
  el: HTMLElement;
  note: HTMLElement;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  rot: number;
  scale: number;
};

type ChipKind = "tone" | "duck" | "pass";

type Chip = {
  kind: ChipKind;
  y: number;
  spin: number;
  hit: boolean;
};

type PlugPosition = 0 | 1 | 2;
/** A demonstrative state a reader can ask the bench for. */
type BenchRequest = {
  open?: boolean;
  separation?: number;
  layer?: LayerKey | null;
  music?: boolean;
  message?: string;
};

declare global {
  var __loftwahFmSdk: RadioModule | undefined;
}

/* ── Constants ──────────────────────────────────────────────────────────────── */

const PERSPECTIVE = 1100;
const SDK_LOADER = "/exhibits/fm-sdk-loader.js";
const STATIONS_URL = "https://fm.loftwah.com/api/radio/v1/stations";
const STATION_MANIFEST = "https://fm.loftwah.com/api/radio/v1/stations";
const DEFAULT_STATION = "night-signal";
const MUSIC_VOLUME = 0.65;
const DUCK_LEVEL = 0.35;

/**
 * The documented public catalogue. Used only when the catalogue request cannot
 * be answered, so a station is never invented: the list is FM's own.
 */
const FALLBACK_STATIONS: Station[] = [
  { id: "night-signal", name: "Night Signal" },
  { id: "low-tide", name: "Low Tide" },
  { id: "pressure-system", name: "Pressure System" },
  { id: "cartridge-club", name: "Cartridge Club" },
  { id: "soft-focus", name: "Soft Focus" },
  { id: "saltwater-static", name: "Saltwater Static" }
];

const CHIP_COLOURS: Record<ChipKind, string> = {
  tone: "#79d8ff",
  duck: "#e9ff49",
  pass: "#ff746a"
};

const CHIP_TARGETS: Record<ChipKind, PlugPosition> = {
  tone: 0,
  duck: 2,
  pass: 1
};

const CHIP_LABELS: Record<ChipKind, string> = {
  tone: "Effects bus",
  duck: "Music bus",
  pass: "Let it pass"
};

const PLUG_NAMES = ["the effects socket", "the open rail", "the music socket"];

/* ── Spring ─────────────────────────────────────────────────────────────────── */

/** A damped spring. Reversing the target mid-flight is the normal case. */
class Spring {
  value: number;
  velocity = 0;
  target: number;
  constructor(
    value: number,
    readonly stiffness = 150,
    readonly damping = 24
  ) {
    this.value = value;
    this.target = value;
  }
  set(target: number) {
    this.target = target;
  }
  step(dt: number, instant: boolean): number {
    if (instant) {
      this.value = this.target;
      this.velocity = 0;
      return this.value;
    }
    const acceleration = (this.target - this.value) * this.stiffness - this.velocity * this.damping;
    this.velocity += acceleration * dt;
    this.value += this.velocity * dt;
    if (Math.abs(this.target - this.value) < 0.0005 && Math.abs(this.velocity) < 0.005) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  }
}

/* ── Small helpers ──────────────────────────────────────────────────────────── */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Point = { x: number; y: number };

/**
 * The DOM library and the Workers types both declare `Element`, and the merged
 * result no longer satisfies the DOM's `ParentNode`. This helper keeps the
 * call sites readable without depending on either constraint.
 */
type QueryRoot = { querySelector: (selectors: string) => unknown };
const pick = <T>(root: QueryRoot, selector: string): T | null =>
  root.querySelector(selector) as unknown as T | null;

const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t
});

/** The first part of a quadratic curve, cut at `t`. */
const splitQuadratic = (
  start: Point,
  control: Point,
  end: Point,
  t: number
): [Point, Point, Point] => {
  const a = lerpPoint(start, control, t);
  const b = lerpPoint(control, end, t);
  const mid = lerpPoint(a, b, t);
  return [start, a, mid];
};

/* ── The exhibit ────────────────────────────────────────────────────────────── */

class PatchBench {
  private readonly root: HTMLElement;
  private readonly stage!: HTMLElement;
  private readonly links!: SVGElement;
  private readonly grip!: HTMLElement;
  private readonly casePlate!: HTMLElement;
  private readonly status!: HTMLElement;
  private readonly notes!: HTMLElement;
  private readonly layers = new Map<LayerKey, Layer>();
  private readonly order: LayerKey[] = [];
  private readonly meters = new Map<string, HTMLElement>();
  private levelBuffer: Uint8Array<ArrayBuffer> | null = null;

  private readonly separation = new Spring(0, 120, 21);
  private readonly openAmount = new Spring(0, 90, 17);
  private readonly focusSprings = new Map<LayerKey, Spring>();

  private opened = false;
  private focused: LayerKey | null = null;
  private musicConnected = true;
  private musicWanted = false;
  private station = DEFAULT_STATION;
  private running = false;
  private visible = true;
  private reduced = false;
  private rafId = 0;
  private lastTime = 0;
  private pendingFocus: LayerKey | null = null;
  private pendingApart: number | null = null;
  private pendingOpen = false;

  /* Audio */
  private context: AudioContext | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxMeter: AnalyserNode | null = null;
  private musicMeter: AnalyserNode | null = null;
  private radio: RadioClient | null = null;
  private radioReady = false;
  private sdkLoading: Promise<RadioModule> | null = null;

  /* Game */
  private canvas: HTMLCanvasElement | null = null;
  private gameContext: CanvasRenderingContext2D | null = null;
  private chips: Chip[] = [];
  private plug = 1;
  private plugTarget: PlugPosition = 1;
  private score = 0;
  private streak = 0;
  private lives = 3;
  private grace = 3;
  private level = 1;
  private spawnIn = 0.4;
  private fallSpeed = 150;
  private gameOver = false;
  private shake = 0;
  private pulses = [0, 0, 0];

  constructor(root: HTMLElement) {
    this.root = root;
    const stage = pick<HTMLElement>(root, "[data-bench-stage]");
    const links = pick<SVGElement>(root, "[data-bench-links]");
    const grip = pick<HTMLElement>(root, "[data-bench-grip]");
    const casePlate = pick<HTMLElement>(root, "[data-bench-case]");
    const status = pick<HTMLElement>(root, "[data-bench-status]");
    const notes = pick<HTMLElement>(root, "[data-bench-notes]");
    if (!stage || !links || !grip || !casePlate || !status || !notes) return;
    this.stage = stage;
    this.links = links;
    this.grip = grip;
    this.casePlate = casePlate;
    this.status = status;
    this.notes = notes;

    for (const element of Array.from(root.querySelectorAll<HTMLElement>("[data-module]"))) {
      const key = element.dataset.module as LayerKey | undefined;
      if (!key || !["effects", "run", "music"].includes(key)) continue;
      const note = pick<HTMLElement>(element, "[data-module-note]");
      if (!note) continue;
      this.layers.set(key, {
        key,
        el: element,
        note,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        z: 0,
        rot: 0,
        scale: 1
      });
      this.focusSprings.set(key, new Spring(0, 170, 24));
      this.order.push(key);
    }
    if (this.layers.size !== 3) return;

    this.canvas = pick<HTMLCanvasElement>(root, "[data-game-canvas]");
    const gameContext = this.canvas?.getContext("2d");
    if (this.canvas && gameContext) this.gameContext = gameContext;

    this.reduced = prefersReducedMotion();
    this.readDeepLink();
    this.wire();
    this.measure();

    // A reader can ask the bench for a particular state: the dispatch uses
    // this to show the decisive moment and let the reader change it.
    this.root.addEventListener("woodhouse:bench", (event) => {
      const detail = (event as CustomEvent<BenchRequest>).detail;
      this.show(detail);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        this.ensureRunning();
      },
      { rootMargin: "140px" }
    );
    observer.observe(this.stage);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("orientationchange", this.onResize);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("pagehide", this.onPageHide);
  }

  /**
   * The exhibit only works while it is on screen, but it must never be left
   * stopped by a scroll it did not cause. Any scroll, resize or request for a
   * state brings it back.
   */
  private ensureRunning() {
    if (this.visible) this.start();
    else this.stop();
  }

  /* ── Layout ──────────────────────────────────────────────────────────────── */

  private get wide(): boolean {
    return this.stage.clientWidth >= 880;
  }

  private measure() {
    for (const layer of this.layers.values()) {
      layer.width = layer.el.offsetWidth;
      layer.height = layer.el.offsetHeight;
    }
    const run = this.layers.get("run");
    this.closedHeight = (run?.height ?? 320) + 48;
    let stacked = 12;
    for (const key of ["run", "effects", "music"] as LayerKey[]) {
      stacked += (this.layers.get(key)?.height ?? 0) + 42;
    }
    this.openHeight = stacked;
    if (this.wide) {
      this.stage.style.height = "";
      this.stageHeight = 0;
    }
    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    this.links.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.sizeCanvas();
  }

  private closedHeight = 400;
  private openHeight = 900;
  private stageHeight = 0;

  private applyStageHeight(value: number) {
    const next = Math.round(value);
    if (next === this.stageHeight) return;
    this.stageHeight = next;
    this.stage.style.height = `${next}px`;
  }

  private sizeCanvas() {
    if (!this.canvas || !this.gameContext) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(120, this.canvas.clientWidth || 640);
    const height = Math.max(90, this.canvas.clientHeight || 360);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }
    this.gameContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /**
   * The scene is composed in projected screen space and then converted back to
   * world space, so a module can never drift away from the place it was drawn.
   */
  private layout() {
    if (!this.wide) {
      // A phone stacks the layers, so the bench grows as it opens.
      this.applyStageHeight(lerp(this.closedHeight, this.openHeight, this.openAmount.value));
    }
    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    const separation = this.separation.value;
    const open = this.openAmount.value;
    const effects = this.layers.get("effects")!;
    const run = this.layers.get("run")!;
    const music = this.layers.get("music")!;
    const originX = width * 0.5;
    const originY = height * 0.46;
    const scaleOf = (z: number) => PERSPECTIVE / (PERSPECTIVE - z);
    const place = (layer: Layer, projectedX: number, projectedY: number) => {
      const scale = scaleOf(layer.z);
      layer.x = originX + (projectedX - originX) / scale;
      layer.y = originY + (projectedY - originY) / scale;
    };

    if (this.wide) {
      const focusOf = (key: LayerKey) => this.focusSprings.get(key)?.value ?? 0;
      const runFocus = focusOf("run");
      const effectsFocus = focusOf("effects");
      const musicFocus = focusOf("music");
      const anyFocus = Math.max(runFocus, effectsFocus, musicFocus);
      effects.z = -20 + separation * 30 - (anyFocus - effectsFocus) * 55;
      run.z = 80 + separation * 60 - (anyFocus - runFocus) * 55;
      music.z = -20 + separation * 30 - (anyFocus - musicFocus) * 55;
      effects.z += effectsFocus * 90;
      run.z += runFocus * 90;
      music.z += musicFocus * 90;
      const wE = effects.width * scaleOf(effects.z);
      const wM = music.width * scaleOf(music.z);
      const baseY = originY;
      // A focused layer drifts towards the middle so it never leaves the bench.
      const drift = (projectedX: number, focus: number) =>
        projectedX + (width / 2 - projectedX) * 0.24 * focus;
      place(effects, drift(wE / 2, effectsFocus), baseY - separation * height * 0.06);
      place(run, drift(width / 2, runFocus), baseY + separation * height * 0.05);
      place(music, drift(width - wM / 2, musicFocus), baseY - separation * height * 0.06);
      effects.rot = -10 * separation;
      run.rot = 0;
      music.rot = 10 * separation;
    } else {
      // A phone gets an exploded vertical rack: same bench, read downwards.
      const gap = 16 + separation * 26;
      let cursor = 6;
      for (const key of ["run", "effects", "music"] as LayerKey[]) {
        const layer = this.layers.get(key)!;
        layer.z = key === "run" ? 60 : 10;
        layer.rot = 0;
        const scale = scaleOf(layer.z);
        layer.x = originX;
        layer.y = originY + (cursor + layer.height / 2 - originY) / scale;
        cursor += layer.height + gap;
      }
    }

    // The closed bench stacks the modules behind the run, like a packed case.
    const stack = 1 - open;
    if (stack > 0.001) {
      const cx = width / 2;
      const cy = height * 0.4;
      const offsets: Record<LayerKey, number> = { run: 0, effects: 30, music: -30 };
      const depth: Record<LayerKey, number> = { run: 30, effects: -26, music: -78 };
      for (const layer of this.layers.values()) {
        layer.x = lerp(layer.x, cx + offsets[layer.key], stack);
        layer.y = lerp(layer.y, cy, stack);
        layer.z = lerp(layer.z, depth[layer.key], stack);
        layer.rot = lerp(layer.rot, 0, stack);
        layer.scale = lerp(1, layer.key === "run" ? 0.92 : 0.84, stack);
      }
    } else {
      for (const layer of this.layers.values()) layer.scale = 1;
    }
  }

  /** Stage coordinates of a world point, matching the CSS perspective exactly. */
  private project(x: number, y: number, z: number) {
    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    const originX = width * 0.5;
    const originY = height * 0.46;
    const scale = PERSPECTIVE / (PERSPECTIVE - z);
    return {
      x: originX + (x - originX) * scale,
      y: originY + (y - originY) * scale
    };
  }

  private apply() {
    this.root.style.setProperty("--separation", this.separation.value.toFixed(3));
    for (const layer of this.layers.values()) {
      const focus = this.focusSprings.get(layer.key)!.value;
      const dimmed = this.focused !== null && this.focused !== layer.key;
      layer.el.style.transform = `translate3d(calc(${layer.x}px - 50%), calc(${layer.y}px - 50%), ${layer.z}px) rotateY(${layer.rot}deg) scale(${layer.scale})`;
      layer.el.style.opacity = String(dimmed ? 1 - focus * 0.55 : 1);
      layer.el.style.setProperty("--focus", focus.toFixed(3));
      layer.el.classList.toggle("is-focused", focus > 0.5);
      layer.el.classList.toggle("is-dimmed", dimmed);
    }
    this.drawLinks();
    this.applyCase();
  }

  private applyCase() {
    const open = this.openAmount.value;
    this.casePlate.style.setProperty("--case-shift", `${(open * 52).toFixed(1)}px`);
    this.casePlate.style.opacity = String(clamp(1 - open * 1.7, 0, 1));
    this.casePlate.style.pointerEvents = open > 0.5 ? "none" : "auto";
    this.casePlate.hidden = open > 0.96;
    // The signal path belongs to the open bench; a closed case has no wires.
    this.links.style.opacity = String(clamp(open * 1.6 - 0.25, 0, 1));
  }

  /** The signal path, drawn between the real module edges. */
  private drawLinks() {
    const run = this.layers.get("run")!;
    const effects = this.layers.get("effects")!;
    const music = this.layers.get("music")!;
    if (run.width === 0) return;
    const wide = this.wide;
    // Anchors sit on the module edges, so a cable never crosses a face.
    const fromEffects = this.project(
      wide ? run.x - run.width / 2 : run.x - run.width * 0.3,
      wide ? run.y : run.y + run.height * 0.3,
      run.z
    );
    const fromMusic = this.project(
      wide ? run.x + run.width / 2 : run.x + run.width * 0.3,
      wide ? run.y : run.y + run.height * 0.3,
      run.z
    );
    const toEffects = this.project(
      wide ? effects.x + effects.width / 2 : effects.x - effects.width * 0.3,
      wide ? effects.y : effects.y - effects.height * 0.4,
      effects.z
    );
    const toMusic = this.project(
      wide ? music.x - music.width / 2 : music.x + music.width * 0.3,
      wide ? music.y : music.y - music.height * 0.4,
      music.z
    );

    this.setLink("effects", fromEffects, toEffects);
    this.setLink("music", fromMusic, toMusic);
  }

  private setLink(id: string, from: { x: number; y: number }, to: { x: number; y: number }) {
    const path = pick<SVGPathElement>(this.links, `[data-link="${id}"]`);
    if (!path) return;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    const bow = clamp(length * 0.16, 10, 64);
    const control = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + bow };
    const open = id === "music" && !this.musicConnected;
    let plugPoint = to;
    if (open) {
      // The connector is pulled out of its socket, leaving a real air gap.
      const cut = splitQuadratic(from, control, to, 0.88);
      path.setAttribute(
        "d",
        `M ${cut[0].x.toFixed(1)} ${cut[0].y.toFixed(1)} Q ${cut[1].x.toFixed(1)} ${cut[1].y.toFixed(1)} ${cut[2].x.toFixed(1)} ${cut[2].y.toFixed(1)}`
      );
      plugPoint = cut[2];
    } else {
      path.setAttribute(
        "d",
        `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
      );
    }
    path.dataset.strength = open ? "0" : "1";
    const plug = pick<SVGGElement>(this.links, `[data-plug="${id}"]`);
    if (plug) {
      plug.setAttribute(
        "transform",
        `translate(${plugPoint.x.toFixed(1)} ${plugPoint.y.toFixed(1)})`
      );
      plug.dataset.strength = open ? "0" : "1";
    }
  }

  /* ── Frame loop ──────────────────────────────────────────────────────────── */

  private start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.tick(dt);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private tick(dt: number) {
    const instant = this.reduced;
    this.separation.step(dt, instant);
    this.openAmount.step(dt, instant);
    for (const spring of this.focusSprings.values()) spring.step(dt, instant);
    this.layout();
    this.apply();
    this.stepGame(dt);
    this.paintMeters();
  }

  /* ── State ────────────────────────────────────────────────────────────────── */

  private setOpened(open: boolean) {
    if (this.opened === open) return;
    this.opened = open;
    this.openAmount.set(open ? 1 : 0);
    if (open) {
      this.setSeparation(0.72);
      // The station is prepared while the bench opens, so a later Play is a
      // direct call inside the visitor's gesture.
      void this.prepareMusic();
      this.say("The bench is open. Take it apart to separate the run, its effects and the music.");
    } else {
      this.setSeparation(0);
      this.setFocus(null);
      this.say("The bench is closed. Open it to start the run.");
    }
    this.root.dataset.benchOpen = String(open);
    this.syncUrl();
  }

  private setSeparation(value: number) {
    const next = clamp(value, 0, 1);
    this.separation.set(next);
    this.grip.setAttribute("aria-valuenow", next.toFixed(2));
    this.grip.setAttribute(
      "aria-valuetext",
      next < 0.02 ? "Closed up" : next > 0.98 ? "Fully apart" : `${Math.round(next * 100)}% apart`
    );
    const apart = next > 0.45;
    const button = pick<HTMLButtonElement>(this.root, "[data-toggle-apart]");
    if (button && button.dataset.state !== (apart ? "apart" : "together")) {
      button.dataset.state = apart ? "apart" : "together";
      button.textContent = apart ? "Reassemble the bench" : "Take it apart";
    }
    this.syncUrl();
  }

  /** Apply a demonstrative state without a page change. */
  private show(request: BenchRequest) {
    this.ensureRunning();
    if (request.open !== undefined) {
      this.opened = request.open;
      this.openAmount.set(request.open ? 1 : 0);
      this.root.dataset.benchOpen = String(request.open);
      if (request.open && request.separation === undefined) this.setSeparation(0.72);
    }
    if (request.separation !== undefined) this.setSeparation(request.separation);
    if (request.layer !== undefined) this.setFocus(request.layer);
    if (request.music !== undefined && request.music !== this.musicConnected) {
      this.setMusicConnected(request.music);
    }
    this.say(request.message ?? "Showing a particular state. Change it with the controls above.");
    this.syncUrl();
  }

  private setFocus(key: LayerKey | null) {
    if (this.focused === key) return;
    this.focused = key;
    for (const [layerKey, spring] of this.focusSprings) {
      spring.set(layerKey === key ? 1 : 0);
    }
    for (const layer of this.layers.values()) {
      layer.note.dataset.shown = String(layer.key === key);
    }
    for (const note of Array.from(this.notes.querySelectorAll<HTMLElement>("[data-note]"))) {
      note.hidden = note.dataset.note !== (key ?? "");
    }
    this.notes.dataset.active = key ?? "";
    for (const button of Array.from(
      this.root.querySelectorAll<HTMLButtonElement>("[data-focus]")
    )) {
      button.setAttribute("aria-pressed", String(button.dataset.focus === key));
    }
    if (key) {
      const title = this.layers.get(key)!.el.dataset.title ?? key;
      this.say(`${title} brought forward. Its controls and explanation are in view.`);
    } else {
      this.say("All three layers together again.");
    }
    this.syncUrl();
  }

  private say(message: string) {
    this.status.textContent = message;
  }

  /** The run reports its own events beside the run, not over the bench. */
  private sayGame(message: string) {
    const element = pick<HTMLElement>(this.root, "[data-game-status]");
    if (element) element.textContent = message;
  }

  /* ── URL state ───────────────────────────────────────────────────────────── */

  private readDeepLink() {
    const state = benchStateFromParams(new URLSearchParams(window.location.search));
    if (state.station) this.station = state.station;
    this.musicConnected = state.music;
    this.pendingFocus = state.layer;
    this.pendingApart = state.apart;
    this.pendingOpen = state.open;
  }

  private syncUrl() {
    const params = benchStateToParams({
      open: this.opened,
      apart: this.separation.target,
      layer: this.focused,
      music: this.musicConnected,
      station: this.station === DEFAULT_STATION ? null : this.station
    });
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }

  /* ── Wiring ──────────────────────────────────────────────────────────────── */

  private wire() {
    pick<HTMLButtonElement>(this.root, "[data-open-bench]")?.addEventListener("click", () =>
      this.setOpened(true)
    );

    pick<HTMLButtonElement>(this.root, "[data-toggle-apart]")?.addEventListener("click", () => {
      const apart = this.separation.target > 0.45;
      this.setSeparation(apart ? 0 : 1);
      this.say(
        apart
          ? "Layers together again."
          : "Layers separated. Choose one to bring its controls and explanation forward."
      );
    });

    pick<HTMLButtonElement>(this.root, "[data-reset]")?.addEventListener("click", () => {
      this.setSeparation(0.72);
      this.setFocus(null);
      this.musicConnected = true;
      this.setMusicConnected(true, { silent: true });
      this.newRun();
      this.say("Bench reset. A new run, with every layer connected.");
      this.syncUrl();
    });

    for (const button of Array.from(
      this.root.querySelectorAll<HTMLButtonElement>("[data-focus]")
    )) {
      button.addEventListener("click", () => {
        const key = button.dataset.focus as LayerKey | undefined;
        if (!key) return;
        this.setFocus(this.focused === key ? null : key);
      });
    }

    pick<HTMLButtonElement>(this.root, "[data-copy-link]")?.addEventListener("click", async () => {
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        this.say("Link copied. It reopens the bench in this state.");
      } catch {
        this.say("Copying is blocked here. The address bar holds the same link.");
      }
    });

    this.wireGrip();

    pick<HTMLButtonElement>(this.root, "[data-music-link]")?.addEventListener("click", () =>
      this.setMusicConnected(!this.musicConnected)
    );

    pick<HTMLButtonElement>(this.root, "[data-music-play]")?.addEventListener(
      "click",
      () => void this.startMusic()
    );
    pick<HTMLButtonElement>(this.root, "[data-music-pause]")?.addEventListener("click", () => {
      this.musicWanted = false;
      this.radio?.pause();
      this.renderMusic();
      this.say("Music paused. The run and its effects keep going.");
    });
    pick<HTMLButtonElement>(this.root, "[data-music-mute]")?.addEventListener("click", () => {
      if (!this.radio) return;
      this.radio.preferences({ muted: !this.radio.snapshot().preferences.muted });
      this.renderMusic();
    });
    pick<HTMLButtonElement>(this.root, "[data-music-retry]")?.addEventListener(
      "click",
      () => void this.prepareMusic()
    );
    pick<HTMLSelectElement>(this.root, "[data-station]")?.addEventListener("change", (event) => {
      const select = event.currentTarget as HTMLSelectElement;
      this.station = select.value;
      void this.selectStation();
      this.syncUrl();
    });

    pick<HTMLButtonElement>(this.root, "[data-fire-effect]")?.addEventListener("click", () => {
      const played = this.tone(520, 880, 0.12, 0.05);
      if (played) {
        this.pulses[0] = 1;
        this.say("Effect fired on the game's own bus. The music was not touched.");
      } else {
        this.say("This browser would not start an audio context. Nothing else is affected.");
      }
    });
    const effectsMute = pick<HTMLButtonElement>(this.root, "[data-effects-mute]");
    effectsMute?.addEventListener("click", () => {
      const muted = effectsMute.getAttribute("aria-pressed") !== "true";
      effectsMute.setAttribute("aria-pressed", String(muted));
      effectsMute.textContent = muted ? "Unmute the effects" : "Mute the effects";
      if (this.sfxBus) this.sfxBus.gain.value = muted ? 0 : 0.6;
      this.say(
        muted
          ? "Effects muted. The run keeps going and the music is unchanged."
          : "Effects unmuted."
      );
    });

    this.wireGame();
  }

  private wireGrip() {
    let dragging = false;
    let startX = 0;
    let startValue = 0;
    const track = pick<HTMLElement>(this.grip, "[data-grip-track]");
    this.grip.addEventListener("pointerdown", (event) => {
      dragging = true;
      startX = event.clientX;
      startValue = this.separation.target;
      this.grip.setPointerCapture(event.pointerId);
      this.grip.dataset.dragging = "true";
      event.preventDefault();
    });
    this.grip.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const width = track?.clientWidth ?? 220;
      this.setSeparation(startValue + (event.clientX - startX) / (width || 220));
    });
    const release = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete this.grip.dataset.dragging;
      if (this.grip.hasPointerCapture(event.pointerId)) {
        this.grip.releasePointerCapture(event.pointerId);
      }
      const snapped = this.separation.target > 0.42 ? 1 : 0;
      this.setSeparation(snapped);
      this.say(snapped ? "Layers apart. Choose one to bring it forward." : "Layers together.");
    };
    this.grip.addEventListener("pointerup", release);
    this.grip.addEventListener("pointercancel", release);
    this.grip.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 0.25 : 0.1;
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        this.setSeparation(this.separation.target + step);
        event.preventDefault();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        this.setSeparation(this.separation.target - step);
        event.preventDefault();
      } else if (event.key === "Home") {
        this.setSeparation(0);
        event.preventDefault();
      } else if (event.key === "End") {
        this.setSeparation(1);
        event.preventDefault();
      }
    });
  }

  private wireGame() {
    const game = pick<HTMLElement>(this.root, "[data-game]");
    if (!game) return;
    const move = (position: PlugPosition) => {
      this.plugTarget = position;
      this.updateGameHint();
    };
    pick<HTMLButtonElement>(this.root, "[data-plug-left]")?.addEventListener("click", () =>
      move(0)
    );
    pick<HTMLButtonElement>(this.root, "[data-plug-out]")?.addEventListener("click", () => move(1));
    pick<HTMLButtonElement>(this.root, "[data-plug-right]")?.addEventListener("click", () =>
      move(2)
    );
    game.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        move(clamp(this.plugTarget - 1, 0, 2) as PlugPosition);
        event.preventDefault();
      } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        move(clamp(this.plugTarget + 1, 0, 2) as PlugPosition);
        event.preventDefault();
      }
    });
    this.canvas?.addEventListener("pointerdown", (event) => {
      const rect = this.canvas?.getBoundingClientRect();
      if (!rect) return;
      const ratio = (event.clientX - rect.left) / rect.width;
      move(ratio < 0.33 ? 0 : ratio > 0.67 ? 2 : 1);
      event.preventDefault();
    });
    pick<HTMLButtonElement>(this.root, "[data-new-run]")?.addEventListener("click", () => {
      this.newRun();
      this.say("New run. The score resets; the bench is untouched.");
    });
  }

  /* ── The game ─────────────────────────────────────────────────────────────── */

  private newRun() {
    this.chips = [];
    this.score = 0;
    this.streak = 0;
    this.lives = 3;
    this.grace = 3;
    this.level = 1;
    this.spawnIn = 0.5;
    this.fallSpeed = 150;
    this.gameOver = false;
    this.plug = 1;
    this.plugTarget = 1;
    this.updateGameHud();
    this.updateGameHint();
  }

  private stepGame(dt: number) {
    this.plug = lerp(this.plug, this.plugTarget, Math.min(1, dt * 14));
    this.shake = Math.max(0, this.shake - dt * 3.2);
    for (let index = 0; index < this.pulses.length; index += 1) {
      if (this.pulses[index]! > 0) {
        this.pulses[index] = Math.max(0, this.pulses[index]! - dt * 2.6);
      }
    }
    if (this.gameOver) {
      this.paintGame();
      return;
    }
    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      this.spawnIn = clamp(1.5 - this.level * 0.11, 0.55, 1.5);
      const kinds: ChipKind[] = ["tone", "duck", "pass"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)]!;
      this.chips.push({ kind, y: -20, spin: (Math.random() - 0.5) * 2, hit: false });
    }
    const height = this.canvas?.clientHeight ?? 360;
    for (const chip of this.chips) {
      chip.y += this.fallSpeed * dt;
      chip.spin += dt * 1.4;
      if (!chip.hit && chip.y >= height * 0.68) {
        chip.hit = true;
        this.resolveChip(chip);
      }
    }
    this.chips = this.chips.filter((chip) => chip.y < height + 40);
    this.paintGame();
  }

  private resolveChip(chip: Chip) {
    const wanted = CHIP_TARGETS[chip.kind];
    if (this.plugTarget === wanted) {
      this.score += 10 + Math.min(40, this.streak * 5);
      this.streak += 1;
      this.pulses[wanted] = 1;
      if (chip.kind === "tone") {
        this.tone(320 + this.streak * 18, 640 + this.streak * 24, 0.1, 0.05);
      } else if (chip.kind === "duck") {
        if (!this.musicConnected) {
          this.sayGame("Routed to the music bus, but the link is open. Nothing to duck.");
        } else if (this.musicWanted) {
          this.duckMusic(DUCK_LEVEL, 40, 250);
          this.sayGame("Routed to the music bus. The soundtrack ducked, then came back.");
        } else {
          this.sayGame("Routed to the music bus. The soundtrack is not playing.");
        }
      } else {
        this.tone(180, 120, 0.16, 0.035);
        this.sayGame("Let it pass. The signal went nowhere on purpose.");
      }
      if (this.score >= this.level * 120) {
        this.level += 1;
        this.fallSpeed = Math.min(430, this.fallSpeed + 26);
      }
    } else {
      this.streak = 0;
      this.shake = 1;
      this.tone(190, 58, 0.24, 0.07);
      if (this.grace > 0) {
        // The first few mistakes teach the sockets instead of ending the run.
        this.grace -= 1;
        this.sayGame(
          `Not this one — ${CHIP_LABELS[chip.kind]} needed ${PLUG_NAMES[wanted]}. ${this.grace} free miss${this.grace === 1 ? "" : "es"} left.`
        );
        this.updateGameHud();
        return;
      }
      this.lives -= 1;
      this.sayGame(`Wrong socket. ${CHIP_LABELS[chip.kind]} needed ${PLUG_NAMES[wanted]}.`);
      if (this.lives <= 0) {
        this.gameOver = true;
        this.sayGame(`Run over. ${this.score} points. Start a new run when you are ready.`);
      }
    }
    this.updateGameHud();
  }

  private updateGameHud() {
    const score = pick<HTMLElement>(this.root, "[data-game-score]");
    const streak = pick<HTMLElement>(this.root, "[data-game-streak]");
    const lives = pick<HTMLElement>(this.root, "[data-game-lives]");
    if (score) score.textContent = String(this.score);
    if (streak) streak.textContent = String(this.streak);
    if (lives) {
      const remaining = Math.max(0, this.lives);
      lives.textContent = "●".repeat(remaining) + "○".repeat(3 - remaining);
      lives.setAttribute("aria-label", `${remaining} of 3 runs left`);
    }
    const over = pick<HTMLElement>(this.root, "[data-game-over]");
    if (over) over.hidden = !this.gameOver;
  }

  private updateGameHint() {
    const hint = pick<HTMLElement>(this.root, "[data-game-hint]");
    if (hint) hint.textContent = `Plug: ${PLUG_NAMES[this.plugTarget]}`;
    for (const button of Array.from(
      this.root.querySelectorAll<HTMLButtonElement>("[data-plug-position]")
    )) {
      const value = Number(button.dataset.plugPosition);
      button.setAttribute("aria-pressed", String(value === this.plugTarget));
    }
  }

  private paintGame() {
    const context = this.gameContext;
    const canvas = this.canvas;
    if (!context || !canvas) return;
    const width = canvas.clientWidth || 640;
    const height = canvas.clientHeight || 360;
    const shake = this.shake * 6;
    context.save();
    if (shake > 0.1) {
      context.translate(Math.sin(this.shake * 40) * shake, Math.cos(this.shake * 33) * shake * 0.5);
    }
    context.clearRect(-12, -12, width + 24, height + 24);

    const ground = height * 0.72;
    const backdrop = context.createLinearGradient(0, 0, 0, height);
    backdrop.addColorStop(0, "#0b1220");
    backdrop.addColorStop(1, "#070c16");
    context.fillStyle = backdrop;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(218, 231, 255, 0.06)";
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 32) {
      context.beginPath();
      context.moveTo(x + 0.5, 0);
      context.lineTo(x + 0.5, ground);
      context.stroke();
    }
    context.strokeStyle = "rgba(218, 231, 255, 0.12)";
    context.beginPath();
    context.moveTo(0, ground + 0.5);
    context.lineTo(width, ground + 0.5);
    context.stroke();

    const socketX = [width * 0.2, width * 0.5, width * 0.8];
    const unit = height / 360;
    const socketY = ground + 24 * unit;
    const socketColour = ["#79d8ff", "#b4c0d2", "#e9ff49"];
    const socketNames = ["effects", "let pass", "music"];

    context.font = "500 11px system-ui, sans-serif";
    context.textAlign = "center";
    for (let index = 0; index < 3; index += 1) {
      const pulse = this.pulses[index] ?? 0;
      const active = this.plugTarget === index;
      context.beginPath();
      context.arc(socketX[index]!, socketY, (22 + pulse * 10) * unit, 0, Math.PI * 2);
      context.fillStyle = "rgba(11, 18, 32, 0.92)";
      context.fill();
      context.lineWidth = active ? 3 : 1.5;
      context.strokeStyle = active ? socketColour[index]! : "rgba(218, 231, 255, 0.22)";
      context.stroke();
      if (pulse > 0) {
        context.beginPath();
        context.arc(socketX[index]!, socketY, (22 + (1 - pulse) * 26) * unit, 0, Math.PI * 2);
        context.globalAlpha = pulse * 0.6;
        context.strokeStyle = socketColour[index]!;
        context.lineWidth = 2;
        context.stroke();
        context.globalAlpha = 1;
      }
      context.fillStyle = active ? socketColour[index]! : "rgba(180, 192, 210, 0.75)";
      context.fillText(socketNames[index]!, socketX[index]!, socketY + 42 * unit);
    }

    for (const chip of this.chips) {
      const colour = CHIP_COLOURS[chip.kind];
      context.save();
      context.translate(width / 2, chip.y);
      context.rotate(chip.spin * 0.35);
      context.shadowColor = colour;
      context.shadowBlur = 14;
      context.strokeStyle = colour;
      context.fillStyle = colour;
      context.lineWidth = 2;
      if (chip.kind === "tone") {
        context.beginPath();
        context.arc(0, 0, 10 * unit, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.arc(0, 0, 3 * unit, 0, Math.PI * 2);
        context.fill();
      } else if (chip.kind === "duck") {
        context.fillRect(-11 * unit, -4 * unit, 22 * unit, 8 * unit);
      } else {
        context.beginPath();
        context.moveTo(-9 * unit, -9 * unit);
        context.lineTo(9 * unit, 9 * unit);
        context.moveTo(9 * unit, -9 * unit);
        context.lineTo(-9 * unit, 9 * unit);
        context.stroke();
      }
      context.restore();
    }

    const plugX = socketX[Math.round(this.plug)]!;
    const plugY = ground - 6;
    context.save();
    context.shadowColor = "#e9ff49";
    context.shadowBlur = this.plugTarget === 1 ? 6 : 14;
    context.strokeStyle = "#e9ff49";
    context.fillStyle = "rgba(233, 255, 73, 0.14)";
    context.lineWidth = 2;
    const half = 46 * unit;
    context.beginPath();
    if (typeof context.roundRect === "function") {
      context.roundRect(plugX - half, plugY - 9 * unit, half * 2, 18 * unit, 3);
    } else {
      context.rect(plugX - half, plugY - 9 * unit, half * 2, 18 * unit);
    }
    context.fill();
    context.stroke();
    context.restore();

    if (this.gameOver) {
      context.fillStyle = "rgba(8, 13, 25, 0.74)";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#f4f7fd";
      context.font = "600 20px Bricolage Grotesque, system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText("Run over", width / 2, height / 2 - 4);
      context.fillStyle = "#a9b8d0";
      context.font = "400 13px system-ui, sans-serif";
      context.fillText(`${this.score} points · start a new run`, width / 2, height / 2 + 18);
    }
    context.restore();
  }

  /* ── Audio ────────────────────────────────────────────────────────────────── */

  /** One context, one effects bus, one music bus. Created from a gesture. */
  private ensureAudio(): AudioContext | null {
    if (this.context) return this.context;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      const context = new Ctor();
      const sfxBus = context.createGain();
      sfxBus.gain.value = 0.6;
      const sfxMeter = context.createAnalyser();
      sfxMeter.fftSize = 128;
      sfxBus.connect(sfxMeter).connect(context.destination);
      const musicBus = context.createGain();
      musicBus.gain.value = 1;
      const musicMeter = context.createAnalyser();
      musicMeter.fftSize = 128;
      musicBus.connect(musicMeter).connect(context.destination);
      this.context = context;
      this.sfxBus = sfxBus;
      this.sfxMeter = sfxMeter;
      this.musicBus = musicBus;
      this.musicMeter = musicMeter;
      return context;
    } catch {
      return null;
    }
  }

  private tone(from: number, to: number, duration: number, level: number): boolean {
    const context = this.ensureAudio();
    if (!context || !this.sfxBus) return false;
    if (context.state === "suspended") void context.resume();
    try {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(from, now);
      if (to !== from) oscillator.frequency.exponentialRampToValueAtTime(to, now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(level, now + Math.min(0.02, duration / 3));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(this.sfxBus);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
      return true;
    } catch {
      return false;
    }
  }

  /** Gain only. The duck never plays, pauses or resumes the soundtrack. */
  private duckMusic(level: number, downMs: number, upMs: number) {
    const context = this.context;
    const bus = this.musicBus;
    if (!context || !bus) return;
    const at = context.currentTime;
    const gain = bus.gain;
    gain.cancelScheduledValues(at);
    gain.setValueAtTime(gain.value, at);
    gain.linearRampToValueAtTime(level, at + Math.max(1, downMs) / 1000);
    gain.linearRampToValueAtTime(1, at + (Math.max(1, downMs) + Math.max(1, upMs)) / 1000);
  }

  /**
   * LoftwahFM's documented host-gain transport. The page owns the context and
   * the music bus; the adapter only disconnects its own two nodes.
   */
  private hostGainTransport(
    audio: HTMLAudioElement,
    context: AudioContext,
    output: AudioNode,
    nativeFactory: (element: HTMLAudioElement) => unknown
  ) {
    audio.crossOrigin = "anonymous";
    audio.loop = false;
    const native = nativeFactory(audio) as {
      load: (item: unknown, token: unknown) => void;
      play: (signal: AbortSignal) => Promise<void>;
      pause: () => void;
      gain: (volume: number, muted: boolean) => void;
      subscribe: (listener: (snapshot: unknown) => void) => () => void;
      dispose: () => void;
    };
    const source = context.createMediaElementSource(audio);
    const gain = context.createGain();
    source.connect(gain);
    gain.connect(output);
    let revision = 0;
    let disposed = false;
    return {
      load(item: unknown, token: unknown) {
        if (disposed) return;
        revision += 1;
        native.load(item, token);
      },
      async play(signal: AbortSignal) {
        if (disposed || signal.aborted) return;
        const attempt = ++revision;
        const cancel = () => {
          if (attempt === revision && !disposed) native.pause();
        };
        signal.addEventListener("abort", cancel, { once: true });
        try {
          const resumed = context.state === "running" ? Promise.resolve() : context.resume();
          const playing = native.play(signal);
          await Promise.all([resumed, playing]);
          if (signal.aborted) cancel();
          if (context.state !== "running" && !signal.aborted) {
            throw new Error("host_context_not_running");
          }
        } catch (error) {
          if (attempt === revision && !disposed) native.pause();
          throw error;
        } finally {
          signal.removeEventListener("abort", cancel);
        }
      },
      pause() {
        revision += 1;
        native.pause();
      },
      gain(volume: number, muted: boolean) {
        if (disposed) return;
        const level = Number.isFinite(volume) ? clamp(volume, 0, 1) : 0;
        gain.gain.setValueAtTime(muted ? 0 : level, context.currentTime);
        native.gain(1, muted);
      },
      subscribe(listener: (snapshot: unknown) => void) {
        return native.subscribe(listener);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        revision += 1;
        native.dispose();
        source.disconnect();
        gain.disconnect();
      }
    };
  }

  private loadSdk(): Promise<RadioModule> {
    if (globalThis.__loftwahFmSdk) return Promise.resolve(globalThis.__loftwahFmSdk);
    if (!this.sdkLoading) {
      this.sdkLoading = new Promise<RadioModule>((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "module";
        script.src = SDK_LOADER;
        script.addEventListener("load", () => {
          if (globalThis.__loftwahFmSdk) resolve(globalThis.__loftwahFmSdk);
          else reject(new Error("sdk_missing"));
        });
        script.addEventListener("error", () => reject(new Error("sdk_unavailable")));
        document.head.appendChild(script);
      }).catch((error: unknown) => {
        this.sdkLoading = null;
        throw error;
      });
    }
    return this.sdkLoading;
  }

  private async prepareMusic(): Promise<void> {
    const retry = pick<HTMLButtonElement>(this.root, "[data-music-retry]");
    const play = pick<HTMLButtonElement>(this.root, "[data-music-play]");
    if (retry) retry.hidden = true;
    this.setMusicMessage("Preparing the station…");
    try {
      const context = this.ensureAudio();
      if (!context) throw new Error("no_audio_context");
      if (!this.radio) {
        const module = await this.loadSdk();
        const audio = new Audio();
        audio.preload = "none";
        if (!this.musicBus) throw new Error("no_music_bus");
        this.radio = module.createRadioClient({
          transport: this.hostGainTransport(
            audio,
            context,
            this.musicBus,
            module.createMediaElementTransport
          )
        });
        this.radio.preferences({
          enabled: false,
          muted: false,
          speech: false,
          explicit: false,
          volume: MUSIC_VOLUME
        });
        this.radio.subscribe((snapshot) => this.renderMusic(snapshot));
      }
      await this.fillStations();
      await this.selectStation();
      this.radioReady = true;
      this.renderMusic();
    } catch {
      this.radioReady = false;
      this.setMusicMessage("Music unavailable. The run and its effects keep working.");
      if (retry) retry.hidden = false;
      if (play) play.disabled = true;
    }
  }

  private async fillStations(): Promise<void> {
    const select = pick<HTMLSelectElement>(this.root, "[data-station]");
    if (!select) return;
    if (select.options.length === 0) {
      let stations = FALLBACK_STATIONS;
      try {
        const response = await fetch(STATIONS_URL, { signal: AbortSignal.timeout(8000) });
        if (response.ok) {
          const body = (await response.json()) as {
            stations?: { id: string; name: string }[];
          };
          if (Array.isArray(body.stations) && body.stations.length) {
            stations = body.stations.map((entry) => ({ id: entry.id, name: entry.name }));
          }
        }
      } catch {
        /* The documented list is used instead; no station is invented. */
      }
      select.innerHTML = "";
      for (const station of stations) {
        const option = document.createElement("option");
        option.value = station.id;
        option.textContent = station.name;
        select.appendChild(option);
      }
    }
    select.value = this.station;
  }

  private async selectStation(): Promise<void> {
    if (!this.radio) return;
    const manifest = `${STATION_MANIFEST}/${this.station}/current`;
    try {
      await this.radio.selectStation(manifest, this.station);
      this.radioReady = true;
      this.renderMusic();
    } catch {
      this.radioReady = false;
      this.setMusicMessage("That station could not be prepared. The run keeps working.");
      this.renderMusic();
    }
  }

  private async startMusic(): Promise<void> {
    const context = this.ensureAudio();
    if (!context) {
      this.setMusicMessage("This browser would not start an audio context.");
      return;
    }
    if (context.state === "suspended") void context.resume();
    if (!this.radio) await this.prepareMusic();
    if (!this.radio) return;
    if (!this.radioReady) {
      this.setMusicMessage("The station is still preparing. Try again in a moment.");
      return;
    }
    if (!this.musicConnected) {
      this.setMusicMessage("Reconnect the music link first.");
      return;
    }
    this.setMusicMessage("Starting the stream…");
    try {
      await this.radio.play();
      this.musicWanted = true;
      this.renderMusic();
    } catch {
      this.setMusicMessage("The stream would not start. The run and its effects still work.");
      this.renderMusic();
    }
  }

  private setMusicConnected(connected: boolean, options: { silent?: boolean } = {}) {
    this.musicConnected = connected;
    const button = pick<HTMLButtonElement>(this.root, "[data-music-link]");
    if (button) {
      button.textContent = connected ? "Disconnect the music" : "Reconnect the music";
      button.setAttribute("aria-pressed", String(!connected));
      button.dataset.state = connected ? "connected" : "open";
    }
    this.root.dataset.music = connected ? "connected" : "open";
    const music = this.layers.get("music");
    if (music) music.el.classList.toggle("is-open", !connected);
    if (!connected) {
      this.radio?.pause();
      this.musicWanted = false;
      if (!options.silent) {
        this.say("Music disconnected. The soundtrack stopped; the run and its effects carry on.");
      }
    } else if (!options.silent) {
      this.say("Music reconnected on the same client and transport. The run never stopped.");
    }
    this.renderMusic();
    this.syncUrl();
  }

  private setMusicMessage(message: string) {
    const element = pick<HTMLElement>(this.root, "[data-music-message]");
    if (element) element.textContent = message;
  }

  private renderMusic(snapshot?: RadioSnapshot) {
    const current = snapshot ?? this.radio?.snapshot();
    if (!current) return;
    const play = pick<HTMLButtonElement>(this.root, "[data-music-play]");
    const pause = pick<HTMLButtonElement>(this.root, "[data-music-pause]");
    const mute = pick<HTMLButtonElement>(this.root, "[data-music-mute]");
    const title = pick<HTMLElement>(this.root, "[data-music-title]");
    const phase = pick<HTMLElement>(this.root, "[data-music-phase]");
    if (title) {
      title.textContent = current.item
        ? `${current.item.title} · ${current.item.artist}`
        : "No track yet";
    }
    if (phase) phase.textContent = this.musicConnected ? current.phase : "link open";
    if (play) {
      play.disabled = !current.item || current.phase === "playing" || !this.musicConnected;
      play.textContent = current.phase === "playing" ? "Playing" : "Play the music";
    }
    if (pause) pause.disabled = current.phase !== "playing";
    if (mute) {
      mute.disabled = !current.item;
      mute.textContent = current.preferences.muted ? "Unmute the music" : "Mute the music";
    }
    if (!this.musicConnected) {
      this.setMusicMessage("The link is open. The soundtrack is stopped; the run continues.");
      return;
    }
    if (current.phase === "unavailable") {
      this.setMusicMessage("That station is unavailable. The run and its effects still work.");
      return;
    }
    if (current.item && current.phase === "playing") {
      this.musicWanted = true;
      this.setMusicMessage(`Playing — ${current.item.title}`);
    } else if (current.item) {
      this.setMusicMessage("Ready. Press play to start the soundtrack.");
    }
  }

  private paintMeters() {
    this.setMeter("effects", this.readLevel(this.sfxMeter));
    this.setMeter("music", this.musicConnected ? this.readLevel(this.musicMeter) : 0);
  }

  private readLevel(analyser: AnalyserNode | null): number {
    if (!analyser) return 0;
    // One buffer, reused. This runs on every frame of the exhibit.
    if (!this.levelBuffer || this.levelBuffer.length !== analyser.fftSize) {
      this.levelBuffer = new Uint8Array(new ArrayBuffer(analyser.fftSize));
    }
    const data = this.levelBuffer;
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const value of data) {
      const centred = (value - 128) / 128;
      sum += centred * centred;
    }
    return clamp(Math.sqrt(sum / data.length) * 3.2, 0, 1);
  }

  private setMeter(id: string, value: number) {
    let meter = this.meters.get(id);
    if (!meter) {
      const found = pick<HTMLElement>(this.root, `[data-meter="${id}"]`);
      if (!found) return;
      meter = found;
      this.meters.set(id, meter);
    }
    meter.style.setProperty("--level", value.toFixed(3));
  }

  /* ── Lifecycle ────────────────────────────────────────────────────────────── */

  private onResize = () => {
    this.measure();
    this.layout();
    this.apply();
    this.ensureRunning();
  };

  private onScroll = () => this.ensureRunning();

  private onVisibility = () => {
    if (document.hidden) this.radio?.suspend();
  };

  private onPageHide = () => {
    this.stop();
    this.radio?.suspend();
  };

  /** Apply a deep-linked state once the scene exists. */
  begin() {
    if (this.pendingOpen) {
      this.opened = true;
      this.openAmount.value = 1;
      this.openAmount.set(1);
      this.root.dataset.benchOpen = "true";
    }
    if (!this.musicConnected) this.setMusicConnected(false, { silent: true });
    this.setSeparation(this.pendingApart ?? (this.pendingOpen ? 0.72 : 0));
    if (this.pendingFocus) this.setFocus(this.pendingFocus);
    this.measure();
    this.layout();
    this.apply();
    this.newRun();
  }
}

/* ── Mount ──────────────────────────────────────────────────────────────────── */

for (const root of Array.from(document.querySelectorAll<HTMLElement>("[data-patch-bench]"))) {
  new PatchBench(root).begin();
}

export {};
