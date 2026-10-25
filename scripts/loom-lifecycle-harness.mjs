#!/usr/bin/env node
/**
 * Homepage loom lifecycle harness.
 *
 * The observed failure this exists to prevent: the 24 October 2026 release
 * hardened first paint and the resume clock, but nothing exercised the paths a
 * real browser takes afterwards — a hidden tab, a back/forward restore, a lost
 * WebGL context, a display change, a phone's touch scrolling, or a reduced-motion
 * preference that changes while the page is open. Manual inspection cannot tell
 * a stopped loop from a stalled one, or one scene clock from two.
 *
 * This drives the real homepage in Chromium and WebKit and measures the running
 * code: frame callbacks, event listeners, observers, WebGL contexts, pixel
 * continuity and the scene's own visible state. It is evidence for the browser
 * behaviour it actually observes. It is not a physical iPhone or Safari result,
 * and it does not decide MP's taste acceptance.
 *
 * Playwright-core is a dev dependency and deliberately does not download
 * browsers. Use the host's installed Chromium/WebKit, or pass
 * `--webkit-path <path-to-pw_run.sh>`.
 *
 *   pnpm dev --port 4331
 *   pnpm run loom:harness -- --origin http://127.0.0.1:4331
 *   pnpm run loom:harness -- --browser webkit --only context-loss,reduced-motion
 *   pnpm run loom:harness -- --headful --only bfcache      # real back/forward cache
 *
 * Artefacts land under output/loom-harness/<UTC run>/.
 */
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium, webkit } from "playwright-core";
import {
  classifyConsole,
  loomListenerMap,
  meanBrightness,
  meanPixelDiff,
  parseHarnessArguments,
  renderMatrix,
  sameListenerMap
} from "./loom-harness-support.mjs";

const STAGE = "[data-signature-stage]";
const CANVAS = "[data-signature-canvas]";
const STATUS = "[data-signature-status]";
const TOGGLE = "[data-signature-toggle]";
const POSTER = ".signature-plate__poster";
const HERO = "[data-signature]";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const selfPath = fileURLToPath(import.meta.url);

/**
 * The probe is installed before any page script. It wraps requestAnimationFrame
 * and EventTarget listener registration, counts WebGL contexts and observers,
 * records the stage's data attributes with timestamps, and can read the drawn
 * buffer back after a frame. Nothing here is product code.
 */
function installProbe() {
  const probe = {
    docId: 0,
    frames: [],
    rafRequested: 0,
    rafExecuted: 0,
    rafCancelled: 0,
    listenerMap: {},
    contexts: 0,
    resizeObservers: 0,
    resizeDisconnects: 0,
    intersectionObservers: 0,
    intersectionDisconnects: 0,
    attrs: [],
    lifecycle: [],
    longTasks: 0,
    longestTask: 0,
    hiddenOverride: null
  };
  try {
    const sequence = Number(sessionStorage.getItem("loom-doc-sequence") ?? "0") + 1;
    sessionStorage.setItem("loom-doc-sequence", String(sequence));
    probe.docId = sequence;
  } catch {
    probe.docId = 0;
  }
  window.__loomProbe = probe;

  const label = (target) => {
    if (target === window) return "window";
    if (target === document) return "document";
    if (target instanceof Element) {
      if (target.matches("[data-signature-canvas]")) return "canvas";
      if (target.matches("[data-signature-plate]")) return "plate";
      if (target.matches("[data-signature]")) return "hero";
      return "element";
    }
    return "other";
  };
  const record = (target, type, capture, delta) => {
    const key = `${label(target)}|${type}|${capture ? "capture" : "bubble"}`;
    probe.listenerMap[key] = (probe.listenerMap[key] ?? 0) + delta;
  };
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (type, handler, options) {
    const capture = typeof options === "boolean" ? options : Boolean(options?.capture);
    if (type !== "load" && type !== "error") record(this, type, capture, 1);
    return add.call(this, type, handler, options);
  };
  EventTarget.prototype.removeEventListener = function (type, handler, options) {
    const capture = typeof options === "boolean" ? options : Boolean(options?.capture);
    if (type !== "load" && type !== "error") record(this, type, capture, -1);
    return remove.call(this, type, handler, options);
  };

  const raf = window.requestAnimationFrame.bind(window);
  const caf = window.cancelAnimationFrame.bind(window);
  let capturePending = null;
  window.requestAnimationFrame = (callback) => {
    probe.rafRequested += 1;
    return raf((timestamp) => {
      probe.rafExecuted += 1;
      probe.frames.push(timestamp);
      if (probe.frames.length > 6000) probe.frames.splice(0, 3000);
      try {
        callback(timestamp);
      } finally {
        if (capturePending) {
          const pending = capturePending;
          capturePending = null;
          pending();
        }
      }
    });
  };
  window.cancelAnimationFrame = (id) => {
    probe.rafCancelled += 1;
    return caf(id);
  };

  probe.capture = (columns = 72, rows = 54) =>
    new Promise((resolve) => {
      const finish = () => {
        const canvas = document.querySelector("[data-signature-canvas]");
        const gl = canvas?.getContext("webgl2");
        if (!gl || gl.isContextLost()) return resolve(null);
        const width = gl.drawingBufferWidth;
        const height = gl.drawingBufferHeight;
        if (!width || !height) return resolve(null);
        const full = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, full);
        const data = new Array(columns * rows * 4);
        for (let row = 0; row < rows; row += 1) {
          const sourceY = Math.min(height - 1, Math.floor((row / rows) * height));
          for (let column = 0; column < columns; column += 1) {
            const sourceX = Math.min(width - 1, Math.floor((column / columns) * width));
            const from = (sourceY * width + sourceX) * 4;
            const to = (row * columns + column) * 4;
            data[to] = full[from];
            data[to + 1] = full[from + 1];
            data[to + 2] = full[from + 2];
            data[to + 3] = full[from + 3];
          }
        }
        resolve({ width: columns, height: rows, data });
      };
      const timeout = setTimeout(() => {
        if (!capturePending) return;
        capturePending = null;
        resolve(null);
      }, 900);
      capturePending = () => {
        clearTimeout(timeout);
        finish();
      };
    });

  const hiddenGetter = Object.getOwnPropertyDescriptor(Document.prototype, "hidden")?.get;
  const stateGetter = Object.getOwnPropertyDescriptor(Document.prototype, "visibilityState")?.get;
  Object.defineProperty(Document.prototype, "hidden", {
    configurable: true,
    get() {
      return probe.hiddenOverride === null
        ? hiddenGetter.call(this)
        : probe.hiddenOverride === true;
    }
  });
  Object.defineProperty(Document.prototype, "visibilityState", {
    configurable: true,
    get() {
      return probe.hiddenOverride === null
        ? stateGetter.call(this)
        : probe.hiddenOverride
          ? "hidden"
          : "visible";
    }
  });
  probe.setHidden = (hidden) => {
    probe.hiddenOverride = hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  };

  const NativeResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class extends NativeResizeObserver {
    constructor(callback) {
      super(callback);
      probe.resizeObservers += 1;
    }
    disconnect() {
      probe.resizeDisconnects += 1;
      super.disconnect();
    }
  };
  const NativeIntersectionObserver = window.IntersectionObserver;
  window.IntersectionObserver = class extends NativeIntersectionObserver {
    constructor(callback, options) {
      super(callback, options);
      probe.intersectionObservers += 1;
    }
    disconnect() {
      probe.intersectionDisconnects += 1;
      super.disconnect();
    }
  };

  const getContext = HTMLCanvasElement.prototype.getContext;
  const seenCanvases = new WeakSet();
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const result = getContext.call(this, type, ...rest);
    if ((type === "webgl2" || type === "webgl") && result && !seenCanvases.has(this)) {
      seenCanvases.add(this);
      probe.contexts += 1;
    }
    return result;
  };

  const attributeObserver = new MutationObserver((records) => {
    for (const entry of records) {
      if (entry.type !== "attributes") continue;
      probe.attrs.push({
        name: entry.attributeName,
        value: entry.target.getAttribute?.(entry.attributeName ?? ""),
        at: performance.now()
      });
    }
  });
  attributeObserver.observe(document, {
    subtree: true,
    attributes: true,
    attributeFilter: ["data-live", "data-lost"]
  });

  const log = (type, extra = {}) => probe.lifecycle.push({ type, ...extra, at: performance.now() });
  addEventListener("pagehide", (event) => log("pagehide", { persisted: event.persisted }), true);
  addEventListener("pageshow", (event) => log("pageshow", { persisted: event.persisted }), true);
  addEventListener("webglcontextlost", () => log("contextlost"), true);
  addEventListener("webglcontextrestored", () => log("contextrestored"), true);
  document.addEventListener(
    "visibilitychange",
    () => log("visibilitychange", { hidden: document.hidden, state: document.visibilityState }),
    true
  );

  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        probe.longTasks += 1;
        probe.longestTask = Math.max(probe.longestTask, entry.duration);
      }
    }).observe({ type: "longtask", buffered: true });
  } catch {
    /* long-task timing is Chromium-only; absence is recorded, not failed. */
  }

  probe.snapshot = () => ({
    docId: probe.docId,
    frames: probe.frames.length,
    lastFrames: probe.frames.slice(-240),
    rafRequested: probe.rafRequested,
    rafExecuted: probe.rafExecuted,
    rafCancelled: probe.rafCancelled,
    listenerMap: { ...probe.listenerMap },
    contexts: probe.contexts,
    resizeObservers: probe.resizeObservers,
    resizeDisconnects: probe.resizeDisconnects,
    intersectionObservers: probe.intersectionObservers,
    intersectionDisconnects: probe.intersectionDisconnects,
    attrs: probe.attrs.slice(-40),
    lifecycle: probe.lifecycle.slice(-20),
    longTasks: probe.longTasks,
    longestTask: Math.round(probe.longestTask),
    paints: performance
      .getEntriesByType("paint")
      .map((entry) => ({ name: entry.name, at: entry.startTime })),
    hidden: document.hidden,
    visibilityState: document.visibilityState
  });
}

async function stageState(page) {
  return page.evaluate(
    ({ stage, canvas, status, toggle, poster, hero }) => {
      const stageNode = document.querySelector(stage);
      const canvasNode = document.querySelector(canvas);
      const statusNode = document.querySelector(status);
      const toggleNode = document.querySelector(toggle);
      const posterNode = document.querySelector(poster);
      const heroNode = document.querySelector(hero);
      const style = canvasNode ? getComputedStyle(canvasNode) : null;
      const heading = document.querySelector("h1");
      return {
        live: stageNode?.dataset.live ?? null,
        lost: stageNode?.dataset.lost ?? null,
        status: statusNode?.textContent ?? null,
        toggleHidden: toggleNode?.hidden ?? null,
        toggleText: toggleNode?.textContent?.trim() ?? null,
        canvasOpacity: style?.opacity ?? null,
        canvasVisibility: style?.visibility ?? null,
        canvasBacking: canvasNode ? { width: canvasNode.width, height: canvasNode.height } : null,
        canvasCss: canvasNode
          ? {
              width: canvasNode.getBoundingClientRect().width,
              height: canvasNode.getBoundingClientRect().height
            }
          : null,
        poster: posterNode
          ? { complete: posterNode.complete, naturalWidth: posterNode.naturalWidth }
          : null,
        headingBox: heading?.getBoundingClientRect().toJSON() ?? null,
        headingVisible:
          heading instanceof HTMLElement &&
          heading.getBoundingClientRect().width > 0 &&
          heading.getBoundingClientRect().height > 0,
        stageBox: stageNode?.getBoundingClientRect().toJSON() ?? null,
        heroBox: heroNode?.getBoundingClientRect().toJSON() ?? null,
        scroll: { x: window.scrollX, y: window.scrollY },
        viewport: { width: window.innerWidth, height: window.innerHeight },
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        dpr: window.devicePixelRatio,
        reduce: matchMedia("(prefers-reduced-motion: reduce)").matches
      };
    },
    { stage: STAGE, canvas: CANVAS, status: STATUS, toggle: TOGGLE, poster: POSTER, hero: HERO }
  );
}

async function waitForLive(page, timeout = 20000) {
  await page.waitForFunction(
    (selector) => document.querySelector(selector)?.dataset.live === "true",
    STAGE,
    { timeout }
  );
}

async function probeSnapshot(page) {
  return page.evaluate(() => window.__loomProbe.snapshot());
}

async function measureFrames(page, durationMs) {
  const before = await probeSnapshot(page);
  await sleep(durationMs);
  const after = await probeSnapshot(page);
  const count = after.frames - before.frames;
  return {
    count,
    rate: Math.round((count * 1000) / durationMs),
    largestGap:
      after.lastFrames.length > 1
        ? Math.max(
            ...after.lastFrames.slice(1).map((value, index) => value - after.lastFrames[index])
          )
        : 0
  };
}

async function capture(page) {
  return page.evaluate(() => window.__loomProbe.capture());
}

async function stageMetrics(page) {
  return page.evaluate(
    ({ stage, canvas }) => {
      const stageNode = document.querySelector(stage);
      const canvasNode = document.querySelector(canvas);
      return {
        stage: stageNode?.getBoundingClientRect().toJSON() ?? null,
        backing: canvasNode ? { width: canvasNode.width, height: canvasNode.height } : null,
        css: canvasNode
          ? {
              width: canvasNode.getBoundingClientRect().width,
              height: canvasNode.getBoundingClientRect().height
            }
          : null,
        dpr: window.devicePixelRatio
      };
    },
    { stage: STAGE, canvas: CANVAS }
  );
}

async function moveAcross(page, { from = 0.2, to = 0.8, y = 0.5, steps = 14 } = {}) {
  const box = await page.locator(STAGE).boundingBox();
  if (!box) return false;
  await page.mouse.move(box.x + box.width * from, box.y + box.height * y);
  await page.mouse.move(box.x + box.width * to, box.y + box.height * y, { steps });
  return true;
}

async function stageScreenshot(page) {
  return page.locator(STAGE).screenshot({ animations: "allow" });
}

function createRun(engine, scenario) {
  return {
    scenario,
    engine,
    checks: [],
    metrics: {},
    check(id, ok, detail) {
      this.checks.push({ id, ok: Boolean(ok), detail });
    },
    metric(name, value) {
      this.metrics[name] = value;
    }
  };
}

const scenarios = [
  {
    id: "baseline-desktop",
    label: "Normal desktop: brush, scroll away and back, pause and resume",
    async run(env, run) {
      const page = await env.page({ viewport: { width: 1440, height: 1000 } });
      env.step("load");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await waitForLive(page);
      await sleep(450);
      const loaded = await stageState(page);
      run.check(
        "still-is-first-paint",
        loaded.poster?.complete && loaded.poster.naturalWidth > 0,
        JSON.stringify(loaded.poster)
      );
      run.check(
        "live-after-first-draw",
        loaded.live === "true" && Number(loaded.canvasOpacity) > 0.9,
        `${loaded.live}/${loaded.canvasOpacity}`
      );
      run.check("status-quiet-while-running", loaded.status === "", JSON.stringify(loaded.status));
      run.check(
        "control-outside-canvas",
        loaded.toggleHidden === false && loaded.toggleText === "Freeze motion",
        `${loaded.toggleHidden}/${loaded.toggleText}`
      );
      await env.shot(page, "desktop-live");
      const firstPixels = await capture(page);
      run.metric("brightness", Math.round(meanBrightness(firstPixels) * 10) / 10);
      run.metric(
        "webglRenderer",
        await page.evaluate(() => {
          const gl = document.querySelector("[data-signature-canvas]").getContext("webgl2");
          const info = gl?.getExtension("WEBGL_debug_renderer_info");
          return gl ? gl.getParameter(info?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER) : null;
        })
      );

      env.step("brush");
      await moveAcross(page);
      await sleep(150);
      const brushedPixels = await capture(page);
      const brushDiff = meanPixelDiff(firstPixels, brushedPixels);
      run.metric("brushPixelDiff", brushDiff === null ? null : Math.round(brushDiff * 100) / 100);
      run.check("pointer-brush-draws", brushDiff !== null && brushDiff > 0.35, String(brushDiff));
      run.check(
        "brush-needs-no-status-change",
        (await stageState(page)).status === "",
        "status empty"
      );

      env.step("scroll-away");
      const visible = await measureFrames(page, 1200);
      run.metric("visibleFrameRate", visible.rate);
      run.check(
        "one-loop-while-visible",
        visible.count >= 2 && visible.rate <= 120,
        `${visible.count} frames / 1.2 s (${visible.rate}/s)`
      );
      const beforeScroll = await capture(page);
      await page.evaluate(() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })
      );
      await sleep(400);
      const hiddenFrames = await measureFrames(page, 700);
      run.check(
        "stops-out-of-view",
        hiddenFrames.count <= 1,
        `${hiddenFrames.count} frames / 700 ms away`
      );
      const away = await stageState(page);
      run.check(
        "stage-is-really-out-of-view",
        (away.stageBox?.bottom ?? 0) <= 0,
        `stage bottom ${away.stageBox?.bottom} / scrollY ${away.scroll.y}`
      );
      const bottomVisible = await page.evaluate(() => {
        const target =
          document.querySelector("#close-title") ?? document.querySelector("#register-title");
        if (!target) return false;
        const box = target.getBoundingClientRect();
        return box.top >= 0 && box.top < window.innerHeight && box.width > 0;
      });
      run.check(
        "page-still-usable-away-from-plate",
        bottomVisible && away.overflow <= 1,
        "later content readable at the bottom"
      );

      env.step("scroll-back");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await sleep(500);
      const resumedFrames = await measureFrames(page, 1200);
      run.check(
        "resumes-in-view",
        resumedFrames.count >= 2,
        `${resumedFrames.count} frames / 1.2 s back`
      );
      const afterScroll = await capture(page);
      const scrollDiff = meanPixelDiff(beforeScroll, afterScroll);
      run.metric(
        "scrollContinuityDiff",
        scrollDiff === null ? null : Math.round(scrollDiff * 100) / 100
      );
      run.check(
        "no-scene-jump-on-return",
        scrollDiff !== null && scrollDiff < Math.max(4, (brushDiff ?? 1) * 3),
        String(scrollDiff)
      );

      env.step("pause");
      await page.click(TOGGLE);
      await sleep(300);
      const paused = await stageState(page);
      run.check(
        "pause-states-the-outcome",
        paused.status?.startsWith("Motion frozen") && paused.toggleText === "Resume motion",
        `${paused.toggleText} / ${paused.status}`
      );
      const pausedFrames = await measureFrames(page, 700);
      run.check(
        "pause-stops-frames",
        pausedFrames.count <= 1,
        `${pausedFrames.count} frames / 700 ms paused`
      );
      env.step("resume");
      await page.click(TOGGLE);
      await sleep(500);
      const resumed = await stageState(page);
      const afterPauseFrames = await measureFrames(page, 1200);
      run.check(
        "resume-restarts-one-loop",
        afterPauseFrames.count >= 2 && afterPauseFrames.rate <= 120,
        `${afterPauseFrames.count} frames / 1.2 s (${afterPauseFrames.rate}/s)`
      );
      run.check(
        "resume-clears-status",
        resumed.status === "" && resumed.toggleText === "Freeze motion",
        `${resumed.status}/${resumed.toggleText}`
      );
      await env.shot(page, "desktop-resumed");
      run.check(
        "no-errors-in-baseline",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "phone-touch",
    label: "Phone-sized touch viewport: reading order, usability, touch scroll and tap",
    async run(env, run) {
      const page = await env.page({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true
      });
      env.step("load");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      const atLoad = await stageState(page);
      run.check("no-horizontal-overflow", atLoad.overflow <= 1, `overflow ${atLoad.overflow}px`);
      await waitForLive(page);
      await sleep(400);
      const loaded = await stageState(page);
      const snapshot = await probeSnapshot(page);
      const fcp =
        snapshot.paints.find((paint) => paint.name === "first-contentful-paint")?.at ?? null;
      const liveAt =
        snapshot.attrs.find((attr) => attr.name === "data-live" && attr.value === "true")?.at ??
        null;
      run.metric("firstContentfulPaint", fcp === null ? null : Math.round(fcp));
      run.metric("liveAttributeAt", liveAt === null ? null : Math.round(liveAt));
      run.check(
        "page-paints-before-webgl-handover",
        fcp !== null && (liveAt === null || fcp <= liveAt),
        `fcp ${fcp} / live ${liveAt}`
      );
      run.check(
        "heading-leads-phone-reading-order",
        loaded.headingVisible &&
          (loaded.headingBox?.bottom ?? Infinity) <= (loaded.stageBox?.top ?? 0) + 1,
        `heading ends ${loaded.headingBox?.bottom} / stage starts ${loaded.stageBox?.top}`
      );
      run.check(
        "still-visible-on-phone",
        loaded.poster?.complete && Number(loaded.canvasOpacity) > 0.9,
        JSON.stringify(loaded.poster)
      );
      run.check(
        "canvas-follows-dpr",
        loaded.canvasBacking?.width >= loaded.canvasCss?.width * 1.95,
        `${loaded.canvasBacking?.width} backing for ${loaded.canvasCss?.width} css @${loaded.dpr}`
      );
      await env.shot(page, "phone-live");

      env.step("touch-scroll");
      let scrolled;
      if (env.engine === "chromium") {
        const cdp = await env.cdp(page);
        await cdp.send("Input.synthesizeScrollGesture", {
          x: 195,
          y: 620,
          yDistance: -420,
          xDistance: 0,
          speed: 800,
          gestureSourceType: "touch"
        });
        await sleep(400);
        scrolled = await page.evaluate(() => window.scrollY);
      } else {
        await page.evaluate(() => window.scrollBy({ top: 420, behavior: "instant" }));
        scrolled = await page.evaluate(() => window.scrollY);
      }
      run.metric("touchScrollY", scrolled);
      run.check("touch-scroll-works", scrolled > 100, `scrollY ${scrolled}`);

      env.step("tap-stage");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await sleep(250);
      const box = await page.locator(STAGE).boundingBox();
      run.check("stage-has-a-box", Boolean(box), JSON.stringify(box));
      const tapX = (box?.x ?? 0) + (box?.width ?? 0) * 0.5;
      const tapY = (box?.y ?? 0) + (box?.height ?? 0) * 0.5;
      const before = await capture(page);
      await page.touchscreen.tap(tapX, tapY);
      await sleep(280);
      const after = await capture(page);
      const tapDiff = meanPixelDiff(before, after);
      run.metric("tapPixelDiff", tapDiff === null ? null : Math.round(tapDiff * 100) / 100);
      run.check("tap-does-not-navigate", page.url().endsWith("/"), page.url());
      run.check("tap-reaches-the-fibres", tapDiff !== null && tapDiff > 0.1, String(tapDiff));

      env.step("keyboard-action");
      const action = page.locator(".home-action").first();
      const beforeActionUrl = page.url();
      await action.focus();
      const focus = await page.evaluate(() => {
        const node = document.activeElement;
        const style = node ? getComputedStyle(node) : null;
        return { tag: node?.tagName, outline: style?.outlineStyle, width: style?.outlineWidth };
      });
      run.check(
        "primary-action-takes-focus",
        focus.tag === "A" && focus.outline !== "none",
        JSON.stringify(focus)
      );
      run.check(
        "primary-action-has-words",
        Boolean((await action.textContent())?.trim()),
        "labelled"
      );
      await page.keyboard.press("Enter");
      await page.waitForTimeout(700);
      run.check("action-navigates", page.url() !== beforeActionUrl, page.url());
      await env.shot(page, "phone-after-action");
      run.check(
        "no-errors-on-phone",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "visibility",
    label: "Background and foreground: no frames while hidden, no jump on return",
    async run(env, run) {
      const page = await env.page({ viewport: { width: 1280, height: 900 } });
      env.step("load");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await waitForLive(page);
      await sleep(400);

      // A control: how much does the composition legitimately change over five
      // visible seconds? That is what a five-second clock jump would look like.
      env.step("ambient-control");
      const ambientStart = await capture(page);
      await sleep(5000);
      const ambientEnd = await capture(page);
      const ambientDrift = meanPixelDiff(ambientStart, ambientEnd);
      run.metric(
        "ambientFiveSecondDiff",
        ambientDrift === null ? null : Math.round(ambientDrift * 100) / 100
      );
      run.check(
        "scene-moves-while-visible",
        ambientDrift !== null && ambientDrift > 3,
        String(ambientDrift)
      );

      env.step("hide");
      const beforeHide = await capture(page);
      await page.evaluate(() => window.__loomProbe.setHidden(true));
      await sleep(120);
      const hiddenState = await page.evaluate(() => ({
        hidden: document.hidden,
        state: document.visibilityState
      }));
      run.check(
        "visibility-api-says-hidden",
        hiddenState.hidden && hiddenState.state === "hidden",
        JSON.stringify(hiddenState)
      );
      const hiddenFrames = await measureFrames(page, 4500);
      run.metric("hiddenFrameCount", hiddenFrames.count);
      run.check(
        "no-frames-while-hidden",
        hiddenFrames.count <= 1,
        `${hiddenFrames.count} frames / 4.5 s hidden`
      );

      env.step("show");
      await page.evaluate(() => window.__loomProbe.setHidden(false));
      // Capture on the first frame after the resume, before normal motion has
      // had time to change the composition. A clock that jumped by the hidden
      // wall time would land near the ambient-control difference instead.
      const afterShow = await capture(page);
      const hideDiff = meanPixelDiff(beforeHide, afterShow);
      run.metric("hideShowPixelDiff", hideDiff === null ? null : Math.round(hideDiff * 100) / 100);
      run.check(
        "no-clock-jump-on-return",
        hideDiff !== null && hideDiff < 3 && ambientDrift !== null && hideDiff < ambientDrift * 0.5,
        `${hideDiff} after a five-second hide versus ${ambientDrift} for five visible seconds`
      );
      const afterFrames = await measureFrames(page, 2000);
      run.check(
        "frames-return",
        afterFrames.count >= 2,
        `${afterFrames.count} frames / 2 s visible (${afterFrames.rate}/s)`
      );
      const resumed = await capture(page);
      const resumedDiff = meanPixelDiff(afterShow, resumed);
      run.metric(
        "resumedSecondDiff",
        resumedDiff === null ? null : Math.round(resumedDiff * 100) / 100
      );
      run.check(
        "motion-carries-on-after-return",
        resumedDiff !== null && resumedDiff > 0.5,
        String(resumedDiff)
      );
      const afterState = await stageState(page);
      run.check(
        "state-unchanged-across-hide",
        afterState.status === "" && afterState.live === "true",
        `${afterState.status}/${afterState.live}`
      );

      if (env.engine === "chromium") {
        env.step("browser-freeze");
        const cdp = await env.cdp(page);
        const beforeFreeze = await probeSnapshot(page);
        await cdp.send("Page.setWebLifecycleState", { state: "frozen" }).catch(() => {});
        await sleep(1000);
        await cdp.send("Page.setWebLifecycleState", { state: "active" }).catch(() => {});
        await sleep(400);
        const afterFreeze = await probeSnapshot(page);
        const across = afterFreeze.frames - beforeFreeze.frames;
        run.metric("framesAcrossBrowserFreeze", across);
        // Observed in this Chromium: the command is accepted but the page keeps
        // running frames, so it is recorded rather than asserted.
        run.metric(
          "browserFreezeNote",
          across > 20
            ? "CDP Page.setWebLifecycleState did not suspend frames in this Chromium build"
            : "frames stopped for the requested freeze"
        );
      } else {
        run.metric(
          "browserFreeze",
          "Page.setWebLifecycleState is not available in WebKit via Playwright"
        );
      }
      await env.shot(page, "after-visibility");
      run.check(
        "no-errors-around-visibility",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "bfcache",
    label: "History traversal and back/forward cache: clean stop, restore and re-entry",
    async run(env, run) {
      const page = await env.page({ viewport: { width: 1280, height: 900 } });
      env.step("load");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await waitForLive(page);
      await sleep(400);
      const first = await probeSnapshot(page);
      const pixelsBefore = await capture(page);
      const liveBefore = await stageState(page);
      const framesBeforeLeaving = await measureFrames(page, 700);
      run.metric("framesBeforeLeaving", framesBeforeLeaving.count);
      run.metric(
        "webglRenderer",
        await page.evaluate(() => {
          const gl = document.querySelector("[data-signature-canvas]").getContext("webgl2");
          const info = gl?.getExtension("WEBGL_debug_renderer_info");
          return gl ? gl.getParameter(info?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER) : null;
        })
      );
      await env.shot(page, "before-leaving");

      env.step("leave");
      await page.goto(`${env.origin}/factory/`, { waitUntil: "load" });
      await sleep(1200);
      env.step("back");
      await page.goBack({ waitUntil: "commit" }).catch(() => {});
      await waitForLive(page, 10000).catch(() => {});
      await sleep(400);
      const after = await probeSnapshot(page).catch(() => null);
      const persisted = Boolean(
        after?.lifecycle.some((event) => event.type === "pageshow" && event.persisted)
      );
      const returnedState = await stageState(page).catch(() => null);
      run.metric("backForwardCache", persisted);
      run.metric("documentId", after?.docId ?? null);
      run.metric("liveBeforeLeaving", liveBefore.live);
      if (persisted && after) {
        run.check(
          "bfcache-entry-was-clean",
          after.lifecycle.some((event) => event.type === "pagehide" && event.persisted),
          JSON.stringify(after.lifecycle)
        );
        run.check(
          "same-document-on-return",
          after.docId === first.docId,
          `${first.docId} -> ${after.docId}`
        );
        run.check("one-context-after-restore", after.contexts === 1, String(after.contexts));
        run.check(
          "no-duplicate-listeners",
          sameListenerMap(first.listenerMap, after.listenerMap).length === 0,
          sameListenerMap(first.listenerMap, after.listenerMap).join("; ")
        );
        run.check(
          "scene-resumes-from-cache",
          returnedState?.live === "true" && returnedState?.status === "",
          JSON.stringify(
            returnedState && { live: returnedState.live, status: returnedState.status }
          )
        );
        const resumed = await measureFrames(page, 700);
        // A headful host can run at 120 Hz, so "one loop" is relative to the
        // rate measured before leaving, not a fixed 60 fps ceiling.
        const ceiling = Math.max(30, framesBeforeLeaving.count * 1.6);
        run.check(
          "one-loop-after-cache-restore",
          resumed.count >= 2 && resumed.count <= ceiling,
          `${resumed.count} frames after restore versus ${framesBeforeLeaving.count} before leaving`
        );
        const restoredPixels = await capture(page);
        const diff = meanPixelDiff(pixelsBefore, restoredPixels);
        run.metric("cacheRestorePixelDiff", diff === null ? null : Math.round(diff * 100) / 100);
        run.check(
          "composition-survives-cache",
          meanBrightness(restoredPixels) > 4,
          String(meanBrightness(restoredPixels))
        );
        await env.shot(page, "after-restore");
      } else {
        run.metric(
          "bfcacheNote",
          "the engine reloaded the document instead of restoring it from the cache"
        );
        run.check(
          "clean-reload-on-back",
          returnedState?.live === "true",
          JSON.stringify(
            returnedState && { live: returnedState.live, status: returnedState.status }
          )
        );
        run.check("one-context-after-reload", after?.contexts === 1, String(after?.contexts));
        run.check("reloaded-scene-draws", meanBrightness(await capture(page)) > 4, "brightness");
      }
      run.check(
        "no-errors-on-traversal",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );

      // A page containing the LoftwahFM player iframe is not eligible for
      // Chrome's back/forward cache, so the engine's real restore cannot always
      // be observed. Exercise the contract the loom implements either way:
      // pagehide(persisted) stops the loop without tearing anything down, and
      // pageshow(persisted) resumes it from the same point in the scene clock.
      env.step("synthetic-persisted-cycle");
      const beforeSynthetic = await probeSnapshot(page);
      const pixelsBeforeSynthetic = await capture(page);
      await page.evaluate(() =>
        window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true }))
      );
      await sleep(200);
      const syntheticHidden = await measureFrames(page, 900);
      run.metric("syntheticPersistedHiddenFrames", syntheticHidden.count);
      run.check(
        "persisted-hide-stops-the-loop",
        syntheticHidden.count <= 1,
        `${syntheticHidden.count} frames / 900 ms`
      );
      await page.evaluate(() =>
        window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }))
      );
      // Capture on the first frame after the resume: normal motion has not had
      // time to change the composition, so any large difference is a clock jump.
      const pixelsAfterSynthetic = await capture(page);
      const syntheticDiff = meanPixelDiff(pixelsBeforeSynthetic, pixelsAfterSynthetic);
      const afterSynthetic = await probeSnapshot(page);
      const syntheticListeners = sameListenerMap(
        loomListenerMap(beforeSynthetic.listenerMap),
        loomListenerMap(afterSynthetic.listenerMap)
      );
      run.check(
        "persisted-hide-does-not-tear-down",
        afterSynthetic.contexts === 1,
        `${afterSynthetic.contexts} contexts`
      );
      run.check(
        "persisted-restore-keeps-listeners",
        syntheticListeners.length === 0,
        syntheticListeners.join("; ")
      );
      const syntheticResumed = await measureFrames(page, 900);
      run.check(
        "persisted-restore-resumes",
        syntheticResumed.count >= 2,
        `${syntheticResumed.count} frames / 900 ms`
      );
      run.metric(
        "syntheticRestorePixelDiff",
        syntheticDiff === null ? null : Math.round(syntheticDiff * 100) / 100
      );
      run.check(
        "persisted-restore-keeps-the-scene",
        syntheticDiff !== null && syntheticDiff < 2,
        String(syntheticDiff)
      );
      const syntheticEvents = afterSynthetic.lifecycle.filter(
        (event) => event.type === "pagehide" || event.type === "pageshow"
      );
      run.check(
        "persisted-events-were-delivered",
        syntheticEvents.some((event) => event.type === "pagehide" && event.persisted) &&
          syntheticEvents.some((event) => event.type === "pageshow" && event.persisted),
        JSON.stringify(syntheticEvents)
      );
      run.check(
        "no-errors-on-traversal",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "rapid-navigation",
    label: "Rapid enter and leave: repeated document lifecycles stay clean",
    async run(env, run) {
      const page = await env.page({ viewport: { width: 1200, height: 900 } });
      const cycles = [];
      for (let index = 0; index < 6; index += 1) {
        env.step(`cycle-${index}`);
        const started = Date.now();
        await page.goto(`${env.origin}/`, { waitUntil: "load" });
        await waitForLive(page, 15000);
        const state = await stageState(page);
        const snapshot = await probeSnapshot(page);
        cycles.push({
          index,
          live: state.live,
          contexts: snapshot.contexts,
          docId: snapshot.docId,
          reachedInMs: Date.now() - started,
          listenerCount: Object.values(loomListenerMap(snapshot.listenerMap)).reduce(
            (total, value) => total + value,
            0
          ),
          allListenerCount: Object.values(snapshot.listenerMap).reduce(
            (total, value) => total + value,
            0
          )
        });
        await page.goto(`${env.origin}/factory/`, { waitUntil: "load" });
      }
      run.metric("cycles", cycles);
      run.check(
        "every-document-goes-live",
        cycles.every((cycle) => cycle.live === "true"),
        JSON.stringify(cycles.map((cycle) => cycle.live))
      );
      run.check(
        "one-context-per-document",
        cycles.every((cycle) => cycle.contexts === 1),
        JSON.stringify(cycles.map((cycle) => cycle.contexts))
      );
      run.check(
        "documents-are-distinct",
        new Set(cycles.map((cycle) => cycle.docId)).size === cycles.length,
        JSON.stringify(cycles.map((cycle) => cycle.docId))
      );
      const listenerCounts = cycles.map((cycle) => cycle.listenerCount);
      const allListenerCounts = cycles.map((cycle) => cycle.allListenerCount);
      run.metric("loomListenerCounts", listenerCounts);
      run.metric("allListenerCounts", allListenerCounts);
      run.check(
        "loom-listener-count-stable-across-documents",
        Math.max(...listenerCounts) - Math.min(...listenerCounts) <= 1,
        JSON.stringify(listenerCounts)
      );
      const slowest = Math.max(...cycles.map((cycle) => cycle.reachedInMs));
      run.metric("slowestFirstDrawMs", slowest);
      run.check("first-draw-arrives-quickly", slowest < 8000, `${slowest} ms worst case`);
      run.check(
        "no-errors-during-rapid-navigation",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "resize-dpr",
    label: "Orientation, resize and device-pixel-ratio change",
    async run(env, run) {
      const page = await env.page({ viewport: { width: 1440, height: 1000 } });
      env.step("load");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await waitForLive(page);
      await sleep(300);

      const sizes = [
        { width: 1000, height: 800 },
        { width: 700, height: 1000 },
        { width: 390, height: 844 },
        { width: 1440, height: 1000 }
      ];
      const measurements = [];
      for (const size of sizes) {
        env.step(`resize-${size.width}x${size.height}`);
        await page.setViewportSize(size);
        await sleep(350);
        const state = await stageState(page);
        const metrics = await stageMetrics(page);
        const expected = (metrics.css?.width ?? 0) * Math.min(state.dpr, 2);
        measurements.push({ size, ...metrics });
        run.check(
          `backing-follows-css-${size.width}`,
          Boolean(metrics.backing) &&
            Math.abs((metrics.backing?.width ?? 0) - expected) <= Math.max(4, expected * 0.03),
          `backing ${metrics.backing?.width} expected ~${Math.round(expected)}`
        );
        run.check(`no-overflow-${size.width}`, state.overflow <= 1, `overflow ${state.overflow}px`);
      }
      run.metric(
        "resizeMeasurements",
        measurements.map((entry) => ({
          size: entry.size,
          backing: entry.backing,
          css: entry.css,
          dpr: entry.dpr
        }))
      );
      await env.shot(page, "after-resize");

      if (env.engine === "chromium") {
        env.step("dpr-change");
        const cdp = await env.cdp(page);
        // Settle the viewport first so the only change below is the density:
        // a CSS-size change would wake the ResizeObserver and mask the defect.
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: 1100,
          height: 900,
          deviceScaleFactor: 1,
          mobile: false
        });
        await sleep(450);
        const beforeDpr = await stageMetrics(page);
        run.metric("beforeDprChange", {
          dpr: beforeDpr.dpr,
          backing: beforeDpr.backing,
          css: beforeDpr.css
        });
        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: 1100,
          height: 900,
          deviceScaleFactor: 2,
          mobile: false
        });
        await sleep(450);
        const stale = await stageMetrics(page);
        run.metric("dpr2BeforeResizeSignal", {
          dpr: stale.dpr,
          backing: stale.backing,
          css: stale.css
        });
        // A real display change is announced to the page as a window resize.
        await page.evaluate(() => window.dispatchEvent(new Event("resize")));
        await sleep(350);
        const updated = await stageMetrics(page);
        run.metric("dpr2AfterResizeSignal", {
          dpr: updated.dpr,
          backing: updated.backing,
          css: updated.css
        });
        const expected = (updated.css?.width ?? 0) * Math.min(updated.dpr, 2);
        const staleWidth = stale.backing?.width ?? 0;
        const updatedWidth = updated.backing?.width ?? 0;
        const ratio = staleWidth ? updatedWidth / staleWidth : 0;
        // The quality tier can step down during this step on a loaded host, so
        // assert that the backing store responded to the density signal without
        // exceeding what the new DPR allows, rather than an exact tier-0 size.
        run.check(
          "backing-follows-dpr-signal",
          ratio > 1.5 && updatedWidth <= expected + 8,
          `backing ${staleWidth} -> ${updatedWidth} (x${ratio.toFixed(2)}); dpr ${updated.dpr}, tier-0 maximum ~${Math.round(expected)}`
        );
        await cdp.send("Emulation.clearDeviceMetricsOverride").catch(() => {});
        await sleep(300);
      } else {
        run.metric(
          "dprChange",
          "runtime DPR change is not exposed by Playwright WebKit; load-time DPR is covered by the phone scenario"
        );
      }
      run.check(
        "no-errors-on-resize",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "context-loss",
    label: "WebGL context loss and recovery through WEBGL_lose_context",
    async run(env, run) {
      const page = await env.page({ viewport: { width: 1280, height: 900 } });
      env.step("load");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await waitForLive(page);
      await sleep(400);
      const pixelsBefore = await capture(page);
      run.check(
        "scene-painted-before-loss",
        meanBrightness(pixelsBefore) > 4,
        String(meanBrightness(pixelsBefore))
      );

      env.step("lose-context");
      const lost = await page.evaluate(() => {
        const canvas = document.querySelector("[data-signature-canvas]");
        const gl = canvas.getContext("webgl2");
        const extension = gl.getExtension("WEBGL_lose_context");
        if (!extension) return false;
        window.__loomLoseContext = extension;
        extension.loseContext();
        return true;
      });
      run.check("WEBGL_lose_context-available", lost, String(lost));
      await sleep(400);
      const lostState = await stageState(page);
      const lostMetrics = await probeSnapshot(page);
      run.metric("contextsAfterLoss", lostMetrics.contexts);
      run.check(
        "loss-is-reported",
        lostState.lost === "true" && Boolean(lostState.status?.includes("still image stays")),
        `${lostState.lost} / ${lostState.status}`
      );
      run.check(
        "still-owns-the-plate-on-loss",
        Number(lostState.canvasOpacity) === 0 && Boolean(lostState.poster?.complete),
        `${lostState.canvasOpacity} / ${lostState.poster?.naturalWidth}`
      );
      run.check(
        "control-hidden-on-loss",
        lostState.toggleHidden === true,
        String(lostState.toggleHidden)
      );
      const lostFrames = await measureFrames(page, 600);
      run.check("loop-stops-on-loss", lostFrames.count <= 1, `${lostFrames.count} frames / 600 ms`);
      run.check(
        "page-stays-operable-on-loss",
        lostState.headingVisible && lostState.overflow <= 1,
        "heading visible"
      );
      await env.shot(page, "context-lost");

      env.step("restore-context");
      await page.evaluate(() => window.__loomLoseContext.restoreContext());
      await sleep(1000);
      const restoredState = await stageState(page);
      const restoredPixels = await capture(page);
      const restoredBrightness = meanBrightness(restoredPixels);
      run.metric("brightnessAfterRestore", restoredBrightness);
      run.check(
        "restore-is-honest",
        restoredState.lost === "false" || restoredState.lost === null,
        String(restoredState.lost)
      );
      run.check(
        "scene-repaints-after-restore",
        restoredBrightness !== null && restoredBrightness > 4,
        String(restoredBrightness)
      );
      run.check(
        "canvas-returns-after-restore",
        Number(restoredState.canvasOpacity) > 0.9 && restoredState.toggleHidden === false,
        `${restoredState.canvasOpacity}/${restoredState.toggleHidden}`
      );
      await sleep(600);
      const restoredFrames = await measureFrames(page, 1200);
      run.metric("framesAfterRestore", restoredFrames.count);
      run.check(
        "one-loop-after-restore",
        restoredFrames.count >= 2 && restoredFrames.rate <= 130,
        `${restoredFrames.count} frames / 1.2 s (${restoredFrames.rate}/s)`
      );
      const restoredSnapshot = await probeSnapshot(page);
      run.check(
        "no-second-context-created",
        restoredSnapshot.contexts === 1,
        String(restoredSnapshot.contexts)
      );
      await env.shot(page, "context-restored");

      env.step("second-loss");
      await page.evaluate(() => {
        const canvas = document.querySelector("[data-signature-canvas]");
        const gl = canvas.getContext("webgl2");
        window.__loomLoseContext = gl.getExtension("WEBGL_lose_context");
        window.__loomLoseContext.loseContext();
      });
      await sleep(350);
      const secondLost = await stageState(page);
      run.check("second-loss-is-reported", secondLost.lost === "true", String(secondLost.lost));
      await page.evaluate(() => window.__loomLoseContext.restoreContext());
      await sleep(1000);
      const secondRestored = await stageState(page);
      run.check(
        "second-restore-recovers",
        secondRestored.lost === "false" || secondRestored.lost === null,
        String(secondRestored.lost)
      );
      const secondSnapshot = await probeSnapshot(page);
      run.check(
        "still-one-context-after-two-cycles",
        secondSnapshot.contexts === 1,
        String(secondSnapshot.contexts)
      );

      env.step("paused-loss");
      await page.click(TOGGLE);
      await sleep(250);
      const loseContext = () =>
        page.evaluate(() => {
          const canvas = document.querySelector("[data-signature-canvas]");
          const gl = canvas.getContext("webgl2");
          window.__loomLoseContext = gl.getExtension("WEBGL_lose_context");
          window.__loomLoseContext.loseContext();
        });
      const restoreContext = () => page.evaluate(() => window.__loomLoseContext.restoreContext());
      await loseContext();
      await sleep(350);
      await restoreContext();
      await sleep(900);
      const pausedAfterRestore = await stageState(page);
      run.check(
        "restore-respects-visitor-pause",
        Boolean(pausedAfterRestore.status?.startsWith("Motion frozen")) &&
          pausedAfterRestore.toggleText === "Resume motion" &&
          Number(pausedAfterRestore.canvasOpacity) > 0.9,
        `${pausedAfterRestore.status} / ${pausedAfterRestore.toggleText}`
      );
      const pausedRestoreFrames = await measureFrames(page, 800);
      run.check(
        "restore-does-not-start-a-paused-scene",
        pausedRestoreFrames.count <= 1,
        `${pausedRestoreFrames.count} frames / 800 ms`
      );
      await page.click(TOGGLE);
      await sleep(400);

      env.step("reduced-loss");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await sleep(350);
      await loseContext();
      await sleep(350);
      await restoreContext();
      await sleep(900);
      const reducedAfterRestore = await stageState(page);
      run.check(
        "restore-respects-reduced-motion",
        Boolean(reducedAfterRestore.status?.includes("reduced-motion")) &&
          Number(reducedAfterRestore.canvasOpacity) > 0.9,
        `${reducedAfterRestore.status}`
      );
      const reducedRestoreFrames = await measureFrames(page, 800);
      run.check(
        "restore-keeps-reduced-motion-still",
        reducedRestoreFrames.count <= 1,
        `${reducedRestoreFrames.count} frames / 800 ms`
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await sleep(500);

      env.step("teardown-after-restore");
      await page.goto(`${env.origin}/factory/`, { waitUntil: "load" });
      await sleep(500);
      run.check(
        "no-errors-on-teardown",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "reduced-motion",
    label: "Reduced motion at load and at runtime: less travel, no lost function",
    async run(env, run) {
      const page = await env.page({
        viewport: { width: 1280, height: 900 },
        reducedMotion: "reduce"
      });
      env.step("load-reduced");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await waitForLive(page);
      await sleep(400);
      const reduced = await stageState(page);
      run.check(
        "reduced-motion-draws-the-still",
        reduced.live === "true" && Number(reduced.canvasOpacity) > 0.9,
        `${reduced.live}/${reduced.canvasOpacity}`
      );
      run.check(
        "reduced-motion-is-named",
        Boolean(reduced.status?.includes("reduced-motion")),
        String(reduced.status)
      );
      run.check(
        "freeze-control-not-offered",
        reduced.toggleHidden === true,
        String(reduced.toggleHidden)
      );
      const stillFrames = await measureFrames(page, 800);
      run.metric("reducedFrameCount", stillFrames.count);
      run.check(
        "no-ambient-loop-in-reduced-motion",
        stillFrames.count <= 1,
        `${stillFrames.count} frames / 800 ms`
      );
      await env.shot(page, "reduced-motion");

      env.step("brush-in-reduced-motion");
      const stillBefore = await stageScreenshot(page);
      await moveAcross(page);
      await sleep(250);
      const stillAfter = await stageScreenshot(page);
      const changed = !stillBefore.equals(stillAfter);
      run.metric("reducedBrushChangedPixels", changed);
      run.check(
        "brush-still-works-in-reduced-motion",
        changed,
        `${stillBefore.length} -> ${stillAfter.length} bytes`
      );
      run.check(
        "reduced-motion-keeps-actions",
        await page.locator(".home-action").first().isVisible(),
        "action visible"
      );
      run.check(
        "reduced-motion-keeps-scroll",
        await page.evaluate(() => document.documentElement.scrollHeight > innerHeight),
        "document scrolls"
      );
      await moveAcross(page, { from: 0.8, to: 0.2 });

      env.step("runtime-no-preference");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await sleep(600);
      const moving = await stageState(page);
      const movingFrames = await measureFrames(page, 2000);
      run.check(
        "runtime-change-resumes-motion",
        movingFrames.count >= 2,
        `${movingFrames.count} frames / 2 s (${movingFrames.rate}/s)`
      );
      run.check(
        "control-returns-at-runtime",
        moving.toggleHidden === false && moving.status === "",
        `${moving.toggleHidden}/${moving.status}`
      );
      run.check(
        "canvas-stays-live-on-change",
        Number(moving.canvasOpacity) > 0.9,
        String(moving.canvasOpacity)
      );

      env.step("runtime-reduce");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await sleep(500);
      const back = await stageState(page);
      const backFrames = await measureFrames(page, 800);
      run.check(
        "runtime-reduce-stops-travel",
        backFrames.count <= 2,
        `${backFrames.count} frames / 800 ms`
      );
      run.check(
        "runtime-reduce-keeps-the-art",
        Number(back.canvasOpacity) > 0.9 && back.live === "true",
        `${back.canvasOpacity}/${back.live}`
      );
      run.check(
        "runtime-reduce-names-itself",
        Boolean(back.status?.includes("reduced-motion")),
        String(back.status)
      );
      run.check(
        "no-errors-on-preference-change",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "cpu-throttle",
    label: "Constrained rendering: CPU throttling, graceful quality and a usable page",
    async run(env, run) {
      const page = await env.page({ viewport: { width: 1100, height: 800 } });
      env.step("load");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await waitForLive(page);
      await sleep(400);
      const initial = await stageState(page);
      run.check(
        "starts-with-a-backing-store",
        Boolean(initial.canvasBacking),
        JSON.stringify(initial.canvasBacking)
      );
      if (env.engine !== "chromium") {
        run.metric("cpuThrottle", "CDP CPU throttling is not available in WebKit via Playwright");
        return;
      }
      const cdp = await env.cdp(page);
      env.step("throttle");
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 20 });
      const widths = [initial.canvasBacking?.width ?? 0];
      const samples = [];
      // The quality window needs 90 frames per decision and two bad windows, so
      // a software-rendered host can take tens of seconds to step down.
      for (let index = 0; index < 10; index += 1) {
        const frames = await measureFrames(page, 900);
        await sleep(900);
        const metrics = await stageMetrics(page);
        widths.push(metrics.backing?.width ?? 0);
        samples.push({ rate: frames.rate, backing: metrics.backing?.width });
        if (widths[widths.length - 1] < widths[0]) break;
      }
      const throttled = await stageState(page);
      run.metric("throttledWidths", widths);
      run.metric("throttledSamples", samples);
      run.check(
        "quality-steps-down-under-load",
        widths[widths.length - 1] < widths[0],
        `${widths[0]} -> ${widths[widths.length - 1]}`
      );
      run.check(
        "frames-continue-under-load",
        samples.every((sample) => sample.rate >= 2),
        JSON.stringify(samples.map((sample) => sample.rate))
      );
      run.check(
        "heading-usable-under-load",
        throttled.headingVisible && throttled.overflow <= 1,
        "heading visible"
      );
      run.check(
        "still-available-under-load",
        throttled.poster?.complete === true,
        JSON.stringify(throttled.poster)
      );
      run.check(
        "no-errors-under-load",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
      await env.shot(page, "throttled");
      env.step("recover");
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      await sleep(1500);
      const recovered = await stageMetrics(page);
      run.metric("recoveredBacking", recovered.backing);
      const usable = await stageState(page);
      run.check(
        "page-recovers-after-load",
        usable.headingVisible && Number(usable.canvasOpacity) > 0.9,
        `${usable.headingVisible}/${usable.canvasOpacity}`
      );
      const afterFrames = await measureFrames(page, 700);
      run.check(
        "one-loop-after-load",
        afterFrames.count >= 2 && afterFrames.rate <= 130,
        `${afterFrames.count} frames / 700 ms`
      );
    }
  },
  {
    id: "blocked-webgl",
    label: "No WebGL at all: semantic page, still image and navigation keep working",
    async run(env, run) {
      const page = await env.page({
        viewport: { width: 1280, height: 900 },
        init: () => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
            if (type === "webgl2" || type === "webgl" || type === "experimental-webgl") return null;
            return original.call(this, type, ...rest);
          };
        }
      });
      env.step("load-blocked");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await sleep(800);
      const state = await stageState(page);
      run.check(
        "blocked-scene-is-named",
        Boolean(state.status?.includes("cannot draw the live scene")),
        String(state.status)
      );
      run.check(
        "no-canvas-claim",
        Number(state.canvasOpacity) === 0 && state.live === "false",
        `${state.canvasOpacity}/${state.live}`
      );
      run.check(
        "still-holds-the-plate",
        Boolean(state.poster?.complete) && (state.poster?.naturalWidth ?? 0) > 0,
        JSON.stringify(state.poster)
      );
      run.check("control-not-offered", state.toggleHidden === true, String(state.toggleHidden));
      run.check(
        "heading-is-usable",
        state.headingVisible && state.overflow <= 1,
        `${state.headingVisible}/${state.overflow}`
      );
      const action = page.locator(".home-action").first();
      const beforeActionUrl = page.url();
      await action.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(700);
      run.check("navigation-works-without-webgl", page.url() !== beforeActionUrl, page.url());
      await page.goBack({ waitUntil: "load" });
      await sleep(500);
      run.check(
        "back-returns-to-readable-home",
        (await stageState(page)).headingVisible,
        "heading visible"
      );
      await env.shot(page, "blocked-webgl");
      run.check(
        "no-errors-without-webgl",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  },
  {
    id: "repeated-mount",
    label: "Repeated stop/start, resize, pause and preference switching: no accumulation",
    async run(env, run) {
      const page = await env.page({ viewport: { width: 1200, height: 900 } });
      env.step("load");
      await page.goto(`${env.origin}/`, { waitUntil: "load" });
      await waitForLive(page);
      await sleep(400);
      const baseline = await probeSnapshot(page);
      let domBaseline = null;
      let cdp = null;
      if (env.engine === "chromium") {
        cdp = await env.cdp(page);
        domBaseline = await cdp.send("Memory.getDOMCounters").catch(() => null);
      }
      await env.shot(page, "before-cycles");

      env.step("out-and-back-x10");
      for (let index = 0; index < 10; index += 1) {
        await page.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })
        );
        await sleep(90);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await sleep(90);
      }
      env.step("resize-x20");
      for (let index = 0; index < 10; index += 1) {
        await page.setViewportSize({ width: 1100, height: 820 });
        await sleep(60);
        await page.setViewportSize({ width: 1200, height: 900 });
        await sleep(60);
      }
      env.step("pause-x10");
      for (let index = 0; index < 10; index += 1) {
        await page.click(TOGGLE);
        await sleep(60);
      }
      const afterPause = await stageState(page);
      run.check(
        "pause-cycles-end-running",
        afterPause.toggleText === "Freeze motion",
        String(afterPause.toggleText)
      );
      env.step("reduce-x6");
      for (let index = 0; index < 3; index += 1) {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await sleep(150);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await sleep(150);
      }
      await sleep(500);

      const after = await probeSnapshot(page);
      const finalState = await stageState(page);
      run.metric(
        "baselineListeners",
        Object.values(baseline.listenerMap).reduce((total, value) => total + value, 0)
      );
      run.metric(
        "afterListeners",
        Object.values(after.listenerMap).reduce((total, value) => total + value, 0)
      );
      run.metric("contexts", after.contexts);
      run.metric("resizeObservers", after.resizeObservers);
      run.metric("intersectionObservers", after.intersectionObservers);
      run.metric("longTasks", after.longTasks);
      run.metric("longestTaskMs", after.longestTask);
      const listenerDifferences = sameListenerMap(baseline.listenerMap, after.listenerMap);
      const loomDifferences = sameListenerMap(
        loomListenerMap(baseline.listenerMap),
        loomListenerMap(after.listenerMap)
      );
      run.metric("allListenerDifferences", listenerDifferences);
      run.check(
        "no-loom-listener-accumulation",
        loomDifferences.length === 0,
        loomDifferences.join("; ")
      );
      run.check("still-one-context", after.contexts === 1, String(after.contexts));
      run.check(
        "one-resize-observer",
        after.resizeObservers === 1 && after.resizeDisconnects === 0,
        `${after.resizeObservers}/${after.resizeDisconnects}`
      );
      run.check(
        "one-intersection-observer",
        after.intersectionObservers === 1 && after.intersectionDisconnects === 0,
        `${after.intersectionObservers}/${after.intersectionDisconnects}`
      );
      const frames = await measureFrames(page, 900);
      run.metric("frameRateAfterCycles", frames.rate);
      run.check(
        "exactly-one-loop-after-cycles",
        frames.count >= 2 && frames.rate <= 130,
        `${frames.count} frames / 900 ms`
      );
      run.check(
        "scene-still-running",
        finalState.live === "true" &&
          Number(finalState.canvasOpacity) > 0.9 &&
          finalState.status === "",
        JSON.stringify({
          live: finalState.live,
          opacity: finalState.canvasOpacity,
          status: finalState.status
        })
      );

      if (cdp && domBaseline) {
        const counters = await cdp.send("Memory.getDOMCounters").catch(() => null);
        run.metric("domBaseline", domBaseline);
        run.metric("domAfter", counters);
        if (counters) {
          if (env.devMode) {
            // Astro's dev toolbar and HMR client add their own listeners during
            // a session; this counter is not evidence about the loom.
            run.metric(
              "domCounterNote",
              `dev server adds ${counters.jsEventListeners - domBaseline.jsEventListeners} document listeners of its own`
            );
          } else {
            run.check(
              "dom-listeners-stable",
              Math.abs(counters.jsEventListeners - domBaseline.jsEventListeners) <= 4,
              `${domBaseline.jsEventListeners} -> ${counters.jsEventListeners}`
            );
          }
        }
      }
      await env.shot(page, "after-cycles");
      run.check(
        "no-errors-across-cycles",
        env.consoleFailures().length === 0,
        env
          .consoleFailures()
          .map((entry) => entry.text)
          .join(" | ")
      );
    }
  }
];

/** WebKit's default install may not match this Playwright revision. */
async function cachedWebKitPaths() {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(process.env.HOME ?? "", "Library/Caches/ms-playwright"),
    path.join(process.env.HOME ?? "", ".cache/ms-playwright")
  ].filter(Boolean);
  const candidates = [];
  for (const root of roots) {
    let entries;
    try {
      entries = await readdir(root);
    } catch {
      continue;
    }
    for (const entry of entries
      .filter((name) => name.startsWith("webkit-"))
      .sort()
      .reverse()) {
      const candidate = path.join(root, entry, "pw_run.sh");
      try {
        await access(candidate);
        candidates.push(candidate);
      } catch {
        /* not a usable build */
      }
    }
  }
  return candidates;
}

async function launchWebKit(options) {
  const headless = !options.headful;
  if (options.webkitPath) return webkit.launch({ executablePath: options.webkitPath, headless });
  try {
    return await webkit.launch({ headless });
  } catch (error) {
    for (const candidate of await cachedWebKitPaths()) {
      try {
        return await webkit.launch({ executablePath: candidate, headless });
      } catch {
        /* try the next cached build */
      }
    }
    throw error;
  }
}

async function createBrowser(engine, options, { bfcache = false } = {}) {
  if (engine === "chromium") {
    if (bfcache)
      return chromium.launch({
        channel: "chrome",
        headless: false,
        ignoreDefaultArgs: ["--disable-back-forward-cache"]
      });
    return chromium.launch({ headless: !options.headful });
  }
  return launchWebKit(options);
}

async function runEngine(engine, options, report, outputRoot) {
  const browser = await createBrowser(engine, options);
  report.environment.browsers[engine] = browser.version();
  const engineRoot = path.join(outputRoot, engine);
  await mkdir(engineRoot, { recursive: true });
  try {
    for (const scenario of scenarios) {
      if (options.scenarios.length && !options.scenarios.includes(scenario.id)) continue;
      const run = createRun(engine, scenario.id);
      const started = Date.now();
      const logs = [];
      let page = null;
      let context = null;
      let scenarioBrowser = browser;
      const consoleFailures = () =>
        logs.filter((entry) => {
          if (!entry.type.startsWith("console:") && entry.type !== "pageerror") return false;
          return classifyConsole({ type: entry.type.replace("console:", ""), text: entry.text })
            .fail;
        });
      const openPage = async (pageOptions = {}) => {
        const { init, ...rest } = pageOptions;
        context = await scenarioBrowser.newContext({ ignoreHTTPSErrors: true, ...rest });
        page = await context.newPage();
        page.on("console", (message) =>
          logs.push({ type: `console:${message.type()}`, text: message.text() })
        );
        page.on("pageerror", (error) => logs.push({ type: "pageerror", text: error.message }));
        await page.addInitScript(installProbe);
        if (init) await page.addInitScript(init);
        return page;
      };
      const env = {
        origin: options.origin,
        engine,
        devMode: report.devMode,
        step(label) {
          logs.push({ type: "step", text: label });
        },
        page: openPage,
        currentPage() {
          return page;
        },
        async cdp(targetPage = page) {
          if (!context) throw new Error("No page is open");
          return context.newCDPSession(targetPage);
        },
        consoleFailures,
        async shot(targetPage, name, { fullPage = false } = {}) {
          const directory = path.join(engineRoot, scenario.id);
          await mkdir(directory, { recursive: true });
          await targetPage.screenshot({ path: path.join(directory, `${name}.png`), fullPage });
        }
      };

      try {
        // The back/forward cache needs a browser whose launch flags do not
        // disable it. In this environment that is a headful system Chrome, so
        // the scenario gets its own browser for the duration of the run.
        if (scenario.id === "bfcache" && engine === "chromium" && options.headful) {
          const bfcacheBrowser = await createBrowser(engine, options, { bfcache: true }).catch(
            () => null
          );
          if (bfcacheBrowser) scenarioBrowser = bfcacheBrowser;
          else run.metric("browser", "system Chrome headful unavailable; default Chromium used");
        }
        await scenario.run(env, run);
      } catch (error) {
        run.errors = [String(error?.stack ?? error)];
        run.check("scenario-completed", false, String(error?.message ?? error));
      } finally {
        if (context) await context.close().catch(() => {});
        if (scenarioBrowser !== browser) await scenarioBrowser.close().catch(() => {});
      }
      run.durationMs = Date.now() - started;
      run.logs = logs;
      run.console = logs.filter(
        (entry) => entry.type.startsWith("console:") || entry.type === "pageerror"
      );
      report.runs.push(run);
      const failed = run.checks.filter((check) => !check.ok);
      process.stdout.write(
        `${failed.length ? "FAIL" : "pass"}  ${engine}  ${scenario.id}  (${run.durationMs} ms)${
          failed.length ? `  failed: ${failed.map((check) => check.id).join(", ")}` : ""
        }\n`
      );
      if (run.errors)
        for (const error of run.errors) process.stdout.write(`      ${error.split("\n")[0]}\n`);
    }
  } finally {
    await browser.close().catch(() => {});
  }
}

function reportMarkdown(report) {
  const lines = [
    "# Homepage loom lifecycle harness",
    "",
    `Run: ${report.startedAt}`,
    `Origin: ${report.origin}`,
    `Browsers: ${report.engines.join(", ")}`,
    `Headful: ${report.headful}`,
    ""
  ];
  lines.push(renderMatrix(report));
  lines.push("", "## Checks", "");
  for (const run of report.runs) {
    lines.push(`### ${run.scenario} — ${run.engine}`, "");
    for (const check of run.checks)
      lines.push(
        `- ${check.ok ? "pass" : "FAIL"} \`${check.id}\`${check.detail ? `: ${check.detail}` : ""}`
      );
    lines.push("", "Metrics:", "", "```json", JSON.stringify(run.metrics, null, 2), "```", "");
    const noise = run.console.filter(
      (entry) =>
        !classifyConsole({ type: entry.type.replace("console:", ""), text: entry.text }).fail
    );
    if (noise.length) {
      lines.push("Recorded console noise (not failures):", "");
      for (const entry of noise) lines.push(`- ${entry.type}: ${entry.text}`);
      lines.push("");
    }
    const failures = run.console.filter(
      (entry) =>
        classifyConsole({ type: entry.type.replace("console:", ""), text: entry.text }).fail
    );
    if (failures.length) {
      lines.push("Console failures:", "");
      for (const entry of failures) lines.push(`- ${entry.type}: ${entry.text}`);
      lines.push("");
    }
    if (run.errors?.length) lines.push("Error:", "", "```", ...run.errors, "```", "");
  }
  return lines.join("\n");
}

async function main() {
  const options = parseHarnessArguments(process.argv.slice(2));
  if (options.listOnly) {
    for (const scenario of scenarios) console.log(`${scenario.id}\t${scenario.label}`);
    return 0;
  }

  const response = await fetch(`${options.origin}/`, { signal: AbortSignal.timeout(15000) }).catch(
    (error) => ({ error })
  );
  if (!response || response.error || !response.ok) {
    console.error(
      `The harness needs the real homepage at ${options.origin}. Start it with:\n` +
        `  pnpm dev --port 4331\n` +
        `or build and serve the production artefact:\n` +
        `  pnpm run build && pnpm preview --port 4332`
    );
    if (response?.error) console.error(String(response.error));
    return 1;
  }
  const html = await response.text();
  const devMode = html.includes("@vite/client");
  if (!html.includes("data-signature-plate")) {
    console.error(`${options.origin}/ did not render the signature plate.`);
    return 1;
  }

  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const outputRoot = path.resolve(options.output, runId);
  await mkdir(outputRoot, { recursive: true });
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8")
  );
  const report = {
    startedAt: new Date().toISOString(),
    origin: options.origin,
    engines: options.engines,
    headful: options.headful,
    devMode,
    environment: {
      platform: process.platform,
      arch: process.arch,
      node: process.version,
      playwrightCore: packageJson.devDependencies?.["playwright-core"] ?? null,
      browsers: {}
    },
    runs: []
  };

  for (const engine of options.engines) await runEngine(engine, options, report, outputRoot);
  report.finishedAt = new Date().toISOString();
  report.failures = report.runs.flatMap((run) =>
    run.checks
      .filter((check) => !check.ok)
      .map((check) => `${run.engine}/${run.scenario}: ${check.id}`)
  );
  const consoleFailureCount = report.runs.reduce(
    (total, run) =>
      total +
      run.console.filter(
        (entry) =>
          classifyConsole({ type: entry.type.replace("console:", ""), text: entry.text }).fail
      ).length,
    0
  );
  report.consoleFailureCount = consoleFailureCount;
  await writeFile(path.join(outputRoot, "report.json"), JSON.stringify(report, null, 2));
  await writeFile(path.join(outputRoot, "report.md"), reportMarkdown(report));
  process.stdout.write(`\n${renderMatrix(report)}\n`);
  process.stdout.write(`\nArtefacts: ${path.relative(process.cwd(), outputRoot)}\n`);
  const failed = report.failures.length > 0 || consoleFailureCount > 0;
  process.stdout.write(
    failed
      ? `\n${report.failures.length} failed check(s), ${consoleFailureCount} console failure(s).\n`
      : `\nAll ${report.runs.length} scenario runs passed.\n`
  );
  return failed ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(selfPath))
  process.exitCode = await main();
