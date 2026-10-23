import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";
import { collectEngagement } from "./engagement.ts";
import type { D1Database } from "@cloudflare/workers-types";

const scripts = await Promise.all(
  ["src/components/MeasurementNavigation.astro", "src/components/AudienceTelemetry.astro"].map(
    async (path) => {
      const source = readFileSync(path, "utf8").match(
        /<script(?: is:inline)?>([\s\S]*?)<\/script>/
      )?.[1];
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

// An ordinary manual browser: no webdriver, DNT/GPC, bot UA, persisted opt-out,
// test header or preview host. The real collector would admit an escaped visit.
async function hop(href: string, destination: string, middle = false, download = false) {
  const location = new URL(href);
  const listeners = new Map<string, (event: unknown) => void>();
  const pending: Promise<unknown>[] = [];
  let accepted = 0;
  class Anchor {
    value = new URL(destination, location).href;
    get href() {
      return this.value;
    }
    set href(value: string) {
      this.value = new URL(value, location).href;
    }
    closest() {
      return this;
    }
    hasAttribute(name: string) {
      return name === "download" && download;
    }
  }
  const anchor = new Anchor();
  const db = {
    prepare() {
      return {
        bind() {
          return this;
        },
        async first() {
          return { attempts: 1 };
        }
      };
    },
    async batch() {
      accepted++;
      return [];
    }
  } as unknown as D1Database;
  const context = {
    location,
    navigator: { webdriver: false, doNotTrack: null, globalPrivacyControl: false },
    URL,
    URLSearchParams,
    Element: Anchor,
    HTMLAnchorElement: Anchor,
    Event,
    crypto,
    performance,
    window: Object.assign(new EventTarget(), { setInterval: () => 1 }),
    clearInterval() {},
    localStorage: { getItem: () => null },
    sessionStorage: { getItem: () => null, setItem() {} },
    document: {
      querySelector: () => null,
      addEventListener: (name: string, fn: (event: unknown) => void) => listeners.set(name, fn)
    },
    fetch: (_: unknown, options: { body: string }) => {
      const response = collectEngagement(
        new Request("https://woodhouse.loftwah.com/api/engagement", {
          method: "POST",
          headers: {
            origin: location.origin,
            "content-type": "application/json",
            "cf-connecting-ip": "192.0.2.1",
            "user-agent": "Mozilla/5.0 Safari/605.1.15"
          },
          body: options.body
        }),
        db
      );
      pending.push(response);
      return response;
    }
  };
  for (const script of scripts) runInNewContext(script, context);
  listeners.get(middle ? "auxclick" : "click")?.({
    target: anchor,
    button: middle ? 1 : 0,
    type: middle ? "auxclick" : "click",
    isTrusted: true,
    defaultPrevented: false
  });
  await Promise.all(pending);
  return { href: anchor.href, accepted };
}

test("manual editorial/exhibit hops cannot resume accepted public collection", async () => {
  const base = "https://woodhouse.loftwah.com";
  for (const marker of ["analytics=off", "qa", "qa=manual", "analytics=off&qa=manual"]) {
    let current = `${base}/editions/one-more-round/?report=8496128e32ddfd0bddf8da66&${marker}#build`;
    for (const [index, destination] of [
      "/dispatches/your-game-its-own-soundtrack/",
      "/exhibits/patch-bench/",
      "/dispatches/your-apps-should-get-along/",
      "/dispatches/one-more-round/",
      "/connections/?story=music&report=8496128e32ddfd0bddf8da66#selected-story"
    ].entries()) {
      const result = await hop(current, destination, index % 2 === 1);
      assert.equal(result.accepted, 0, result.href);
      const next = new URL(result.href);
      assert(
        marker.includes("analytics")
          ? next.searchParams.get("analytics") === "off"
          : next.searchParams.has("qa")
      );
      current = result.href;
    }
    const editionSource = readFileSync("src/pages/editions/[slug].astro", "utf8");
    const secondary = editionSource.match(
      /internal\(\s*"(https:\/\/composer\.loftwah\.com\/reports\/r971f5140bbe0c84c8147a64b[^"]*)"/
    )?.[1];
    assert(secondary, "The actual secondary report link must use navigation context");
    const composer = new URL((await hop(current, secondary)).href);
    assert.equal(composer.searchParams.get("analytics"), "off");
    assert.equal(composer.searchParams.get("from"), "woodhouse-edition");
    assert.equal(composer.pathname, "/reports/r971f5140bbe0c84c8147a64b");
  }
  assert.equal(
    (await hop(`${base}/dispatches/one-more-round/`, "/exhibits/patch-bench/")).accepted,
    1,
    "Positive control reaches the actual collector without automation exclusions"
  );
});

test("download/public artefacts and unrelated products retain canonical addresses", async () => {
  const current = "https://woodhouse.loftwah.com/?analytics=off&qa=manual";
  for (const href of [
    "/api/portfolio-card.png?report=8496128e32ddfd0bddf8da66",
    "/share/one-more-round/one-more-round-edition-pack.zip",
    "https://fm.loftwah.com/"
  ]) {
    assert.equal((await hop(current, href)).href, new URL(href, current).href);
  }
  const frozen =
    "https://woodhouse.loftwah.com/connections/?story=music&report=8496128e32ddfd0bddf8da66";
  assert.equal((await hop(current, frozen, false, true)).href, frozen);
});

// The browser replay caught early navigation before deferred modules ran. This
// guard must be synchronous in head, independent of telemetry/module loading.
test("navigation exclusion installs before links can be activated", () => {
  const source = readFileSync("src/components/MeasurementNavigation.astro", "utf8");
  assert.match(source, /<script is:inline>/);
  const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
  assert(layout.indexOf("<MeasurementNavigation />") < layout.indexOf("</head>"));
});
