import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { build } from "esbuild";
import { dirname, resolve } from "node:path";

test("actual browser scripts revoke collection before a failed opt-out storage write", async () => {
  const window = new EventTarget();
  const sent: unknown[] = [];
  const listeners = new Map<string, (event: unknown) => void>();
  let choose: (() => void) | undefined;
  const status = { textContent: "" };
  const button = {
    textContent: "",
    addEventListener: (_: string, fn: () => void) => {
      choose = fn;
    }
  };
  class Element {
    closest() {
      return { href: "https://fm.loftwah.com/" };
    }
  }
  const context = {
    window: Object.assign(window, { setInterval: () => 1, clearInterval: () => {} }),
    Event,
    Element,
    crypto,
    URL,
    URLSearchParams,
    performance,
    location: {
      hostname: "woodhouse.loftwah.com",
      search: "",
      reload: () => assert.fail("Failed persistence must not reload into an enabled page")
    },
    navigator: { webdriver: false, doNotTrack: null },
    localStorage: {
      getItem: () => null,
      setItem: () => {
        throw new Error("Writes blocked");
      }
    },
    sessionStorage: { getItem: () => null, setItem: () => {} },
    clearInterval: () => {},
    fetch: async (_: unknown, options: { body: string }) => {
      sent.push(JSON.parse(options.body));
      return new Response();
    },
    document: {
      visibilityState: "visible",
      hasFocus: () => true,
      querySelector: (selector: string) =>
        selector === "#audience-destinations"
          ? {
              textContent: JSON.stringify([{ slug: "loftwahfm", origin: "https://fm.loftwah.com" }])
            }
          : selector === "[data-analytics-choice]"
            ? button
            : selector === "[data-analytics-status]"
              ? status
              : null,
      addEventListener: (name: string, fn: (event: unknown) => void) => listeners.set(name, fn)
    }
  };
  for (const path of [
    "src/components/AudienceTelemetry.astro",
    "src/pages/activity/measurement.astro"
  ]) {
    const script = readFileSync(path, "utf8").match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert(script);
    const bundled = await build({
      stdin: { contents: script, loader: "ts", resolveDir: dirname(resolve(path)) },
      bundle: true,
      write: false,
      format: "iife"
    });
    runInNewContext(bundled.outputFiles[0]!.text, context);
  }
  assert.equal(sent.length, 1, "Initial visit records before any opt-out");
  listeners.get("click")!({ isTrusted: true, target: new Element() });
  assert.equal(sent.length, 2, "Product discovery records while enabled");
  assert(choose);
  choose();
  assert.match(status.textContent, /off on this page/);
  assert.match(status.textContent, /could not save/);
  listeners.get("click")!({ isTrusted: true, target: new Element() });
  assert.equal(
    sent.length,
    2,
    "Requested revocation survives readable old preference and rejected write"
  );
});
