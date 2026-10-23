import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { build } from "esbuild";
import { dirname, resolve } from "node:path";
const consentKey = "woodhouse:analytics-browser-consent";
const tokenKey = "woodhouse:analytics-browser-token";
const token = "aabbccdd-1122-4333-8444-aabbccddeeff";
const scripts = await Promise.all(
  ["src/components/AudienceTelemetry.astro", "src/pages/activity/measurement.astro"].map(
    async (path) => {
      const source = readFileSync(path, "utf8").match(/<script>([\s\S]*?)<\/script>/)?.[1];
      assert(source);
      const bundled = await build({
        stdin: { contents: source, loader: "ts", resolveDir: dirname(resolve(path)) },
        bundle: true,
        write: false,
        format: "iife"
      });
      return bundled.outputFiles[0]!.text;
    }
  )
);
async function browser(
  options: {
    consent?: string;
    token?: string;
    failWrites?: boolean;
    failRemovals?: boolean;
    privacy?: string;
    distribution?: unknown;
    href?: string;
  } = {}
) {
  let clock = Date.parse("2026-10-16T03:00:00Z"),
    ticks = 0,
    reloads = 0,
    randoms = 0;
  const saved = new Map<string, string>();
  if (options.consent) saved.set(consentKey, options.consent);
  if (options.token) saved.set(tokenKey, options.token);
  const operations: string[] = [],
    sent: Record<string, unknown>[] = [];
  const listeners = new Map<string, (event?: unknown) => void>();
  const timers = new Map<number, () => void>();
  let nextTimer = 0;
  const status = { textContent: "" },
    returnStatus = { textContent: "" };
  let choose: (() => void) | undefined, chooseReturn: (() => void) | undefined;
  const button = {
    textContent: "",
    addEventListener: (_: string, fn: () => void) => {
      choose = fn;
    }
  };
  const returnButton = {
    textContent: "",
    setAttribute: () => {},
    addEventListener: (_: string, fn: () => void) => {
      chooseReturn = fn;
    }
  };
  const window = Object.assign(new EventTarget(), {
    setInterval: (fn: () => void) => {
      timers.set(++nextTimer, fn);
      return nextTimer;
    },
    clearInterval: (id: number) => timers.delete(id)
  });
  const register = window.addEventListener.bind(window);
  Object.assign(window, {
    addEventListener(name: string, fn: EventListener, options?: AddEventListenerOptions | boolean) {
      listeners.set(name, fn as (event?: unknown) => void);
      register(name, fn, options);
    }
  });
  class Element {
    closest() {
      return { href: options.href ?? "https://fm.loftwah.com/" };
    }
  }
  const navigator = {
    webdriver: options.privacy === "webdriver",
    doNotTrack: options.privacy === "dnt" ? "1" : null,
    globalPrivacyControl: options.privacy === "gpc"
  };
  const document = {
    visibilityState: "visible",
    hasFocus: () => true,
    querySelector: (selector: string) =>
      ({
        "#audience-destinations": {
          textContent: JSON.stringify([{ slug: "loftwahfm", origin: "https://fm.loftwah.com" }])
        },
        "#story-distribution-context": {
          textContent: JSON.stringify(options.distribution ?? null)
        },
        "[data-analytics-choice]": button,
        "[data-analytics-status]": status,
        "[data-browser-return-choice]": returnButton,
        "[data-browser-return-status]": returnStatus
      })[selector] ?? null,
    addEventListener: (name: string, fn: (event?: unknown) => void) => listeners.set(name, fn)
  };
  const context = {
    window,
    document,
    navigator,
    Event,
    Element,
    URL,
    URLSearchParams,
    Date: class extends Date {
      static override now() {
        return clock;
      }
    },
    performance: { now: () => ticks },
    crypto: {
      randomUUID: () => {
        randoms++;
        return crypto.randomUUID();
      }
    },
    location: {
      hostname: options.privacy === "preview" ? "preview.example" : "woodhouse.loftwah.com",
      search:
        options.privacy === "qa" ? "?qa=1" : options.privacy === "off" ? "?analytics=off" : "",
      reload: () => {
        reloads++;
      }
    },
    localStorage: {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => {
        operations.push(`write:${key}`);
        if (options.failWrites) throw new Error("Writes blocked");
        saved.set(key, value);
      },
      removeItem: (key: string) => {
        operations.push(`remove:${key}`);
        if (options.failRemovals) throw new Error("Removals blocked");
        saved.delete(key);
      }
    },
    sessionStorage: { getItem: () => null, setItem: () => {} },
    clearInterval: (id: number) => timers.delete(id),
    fetch: async (_: unknown, init: { body: string }) => {
      sent.push(JSON.parse(init.body));
      return new Response();
    }
  };
  for (const script of scripts) runInNewContext(script, context);
  return {
    sent,
    saved,
    operations,
    status,
    returnStatus,
    navigator,
    window,
    get reloads() {
      return reloads;
    },
    get randoms() {
      return randoms;
    },
    choose: () => {
      assert(choose);
      choose();
    },
    chooseReturn: () => {
      assert(chooseReturn);
      chooseReturn();
    },
    clickProject: () => listeners.get("click")?.({ isTrusted: true, target: new Element() }),
    untrustedInput: () => listeners.get("keydown")?.({ isTrusted: false }),
    restore: () => window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true })),
    idleSeconds(seconds: number) {
      for (let i = 0; i < seconds; i++) {
        clock += 1000;
        ticks += 1000;
        timers.forEach((fn) => fn());
      }
    },
    activeSeconds(seconds: number) {
      listeners.get("keydown")?.({ isTrusted: true });
      for (let i = 0; i < seconds; i++) {
        clock += 1000;
        ticks += 1000;
        timers.forEach((fn) => fn());
      }
    },
    hide: () => {
      document.visibilityState = "hidden";
      listeners.get("visibilitychange")?.();
    }
  };
}
test("story page context follows arrival, active exploration and deliberate openings without creating an identity", async () => {
  const distribution = { edition: "one-more-round", story: "music", report: "a".repeat(24) };
  const page = await browser({ distribution });
  assert.equal(page.sent.filter((event) => event.event === "story_arrival").length, 1);
  page.untrustedInput();
  page.idleSeconds(12);
  assert(!page.sent.some((event) => event.event === "story_explored"));
  page.activeSeconds(5);
  assert(!page.sent.some((event) => event.event === "story_explored"));
  page.window.dispatchEvent(new Event("pagehide"));
  page.restore();
  page.idleSeconds(12);
  assert(!page.sent.some((event) => event.event === "story_explored"));
  page.activeSeconds(5);
  assert.equal(page.sent.filter((event) => event.event === "story_explored").length, 1);
  page.clickProject();
  assert.deepEqual(page.sent.at(-1)!.distribution, distribution);
  assert.equal(page.sent.at(-1)!.target, "loftwahfm");
  assert(page.sent.every((event) => !event.browserToken));
  page.activeSeconds(12);
  assert.equal(page.sent.filter((event) => event.event === "story_explored").length, 1);
  for (const privacy of ["qa", "off", "webdriver", "dnt", "gpc", "preview"])
    assert.equal((await browser({ distribution, privacy })).sent.length, 0);
  const invalid = await browser({ distribution: { ...distribution, extra: "private" } });
  invalid.activeSeconds(12);
  assert(
    !invalid.sent.some(
      (event) => typeof event.event === "string" && event.event.startsWith("story_")
    )
  );
  const native = await browser({
    distribution: { ...distribution, story: "link-check" },
    href: "https://share.loftwah.com/"
  });
  native.clickProject();
  assert.equal(native.sent.at(-1)!.target, "app-composer");
  const unrelated = await browser({ distribution, href: "https://share.loftwah.com/" });
  unrelated.clickProject();
  assert(!unrelated.sent.some((event) => event.event === "project_open"));
});
test("default off never creates or sends a browser token; consent persists before reload", async () => {
  const page = await browser();
  assert.equal(page.sent.length, 1);
  assert(!page.sent[0]!.browserToken);
  assert(!page.saved.has(tokenKey));
  page.clickProject();
  assert(page.sent.every((event) => !event.browserToken));
  assert(!page.operations.some((op) => op.includes(tokenKey)));
  page.chooseReturn();
  assert.equal(page.saved.get(consentKey), "1");
  assert.equal(page.reloads, 1);
  assert(!page.saved.has(tokenKey), "The choice UI never manufactures an identifier");
});
test("explicit consent saves a random token, reuses it and rotates at the 90-day boundary", async () => {
  const page = await browser({ consent: "1" });
  const stored = JSON.parse(page.saved.get(tokenKey)!);
  assert.equal(page.sent[0]!.browserToken, stored.id);
  page.clickProject();
  assert.equal(page.sent[1]!.browserToken, stored.id);
  const expired = await browser({
    consent: "1",
    token: JSON.stringify({ id: token, at: Date.parse("2026-10-16T03:00:00Z") - 90 * 86400000 })
  });
  assert.notEqual(expired.sent[0]!.browserToken, token);
  assert.equal(expired.sent[0]!.browserToken, JSON.parse(expired.saved.get(tokenKey)!).id);
});
test("revocation latches before blocked writes/removals, including pending active-time flush", async () => {
  const page = await browser({
    consent: "1",
    token: JSON.stringify({ id: token, at: Date.parse("2026-10-16T02:00:00Z") }),
    failWrites: true,
    failRemovals: true
  });
  assert.equal(page.sent[0]!.browserToken, token);
  page.activeSeconds(12);
  const before = page.sent.length;
  page.chooseReturn();
  assert.equal(
    page.saved.get(consentKey),
    "1",
    "Readable old choice remains after failed persistence"
  );
  assert(page.operations.includes(`write:${consentKey}`));
  assert(
    page.operations.includes(`remove:${tokenKey}`),
    "Removal was attempted independently of the failed write"
  );
  assert.match(page.returnStatus.textContent, /off on this page/);
  assert.match(page.returnStatus.textContent, /future pages/);
  page.hide();
  page.clickProject();
  assert(page.sent.length > before, "Anonymous reporting continues after optional revocation");
  assert(page.sent.slice(before).every((event) => !event.browserToken));
  assert.equal(page.reloads, 0);
});
test("failed token persistence leaves anonymous reporting and honest initial status", async () => {
  const page = await browser({ consent: "1", failWrites: true, failRemovals: true });
  assert(page.sent.every((event) => !event.browserToken));
  assert.match(page.returnStatus.textContent, /identifier could not be saved/);
  page.clickProject();
  assert(page.sent.every((event) => !event.browserToken));
  assert.equal(
    page.operations.filter((op) => op === `write:${tokenKey}`).length,
    1,
    "Failed persistence does not retry creating tokens"
  );
});
test("global reporting opt-out dominates consent even when every persistence operation fails", async () => {
  const page = await browser({
    consent: "1",
    token: JSON.stringify({ id: token, at: Date.parse("2026-10-16T02:00:00Z") }),
    failWrites: true,
    failRemovals: true
  });
  page.choose();
  const before = page.sent.length;
  page.clickProject();
  page.activeSeconds(20);
  page.hide();
  assert.equal(page.sent.length, before);
  assert.match(page.status.textContent, /off on this page/);
  assert(page.operations.includes(`write:${consentKey}`));
  assert(page.operations.includes(`remove:${tokenKey}`));
});
test("privacy, QA, preview and per-visit opt-out prevent creation and transmission despite saved consent", async () => {
  for (const privacy of ["gpc", "dnt", "webdriver", "qa", "preview", "off"]) {
    const page = await browser({ consent: "1", privacy });
    assert.equal(page.sent.length, 0, privacy);
    assert.equal(page.randoms, 0, privacy);
    page.chooseReturn();
    assert.equal(page.reloads, 0, privacy);
    assert(!page.saved.has(tokenKey));
    assert.match(page.returnStatus.textContent, /remains off/);
  }
  const page = await browser({ consent: "1" });
  page.navigator.globalPrivacyControl = true;
  const count = page.sent.length;
  page.clickProject();
  page.activeSeconds(20);
  page.hide();
  assert.equal(page.sent.length, count, "Privacy is checked again when pending events flush");
});
test("cross-tab revocation latches even when old storage values remain readable", async () => {
  const page = await browser({
    consent: "1",
    token: JSON.stringify({ id: token, at: Date.parse("2026-10-16T02:00:00Z") }),
    failRemovals: true
  });
  page.window.dispatchEvent(
    Object.assign(new Event("storage"), { key: consentKey, newValue: "0" })
  );
  page.clickProject();
  assert.equal(page.sent.at(-1)!.browserToken, undefined);
});
