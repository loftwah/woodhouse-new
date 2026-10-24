import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

// The real module, with its single WASM dependency replaced so a failed init can
// be injected. `initWasm` in @resvg/resvg-wasm can only succeed once per module
// instance; the route's promise cache must not turn one rejection into a
// permanent failure for the isolate.
const bundled = await build({
  entryPoints: ["src/data/report-renderer.ts"],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "node",
  target: "node22",
  loader: { ".wasm": "binary" },
  plugins: [
    {
      name: "resvg-init-double",
      setup(plugin) {
        plugin.onResolve({ filter: /^@resvg\/resvg-wasm$/ }, () => ({
          path: "resvg",
          namespace: "fixture"
        }));
        plugin.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents: `
            export async function initWasm() {
              globalThis.__INIT_CALLS__ = (globalThis.__INIT_CALLS__ ?? 0) + 1;
              if (globalThis.__INIT_FAIL_ONCE__) {
                globalThis.__INIT_FAIL_ONCE__ = false;
                throw new Error("transient renderer init failure");
              }
            }
            export class Resvg {}
          `
        }));
      }
    }
  ]
});
const code = bundled.outputFiles[0]!.text;

function load() {
  const module = { exports: {} as Record<string, unknown> };
  new Function("module", "exports", code)(module, module.exports);
  return module.exports as {
    ensureReportRenderer: () => Promise<void>;
    loadReportFonts: (origin: string) => Promise<Uint8Array[]>;
  };
}

const globals = globalThis as unknown as {
  __INIT_CALLS__?: number;
  __INIT_FAIL_ONCE__?: boolean;
  fetch: typeof fetch;
};

test("a failed renderer init is retried by the next request instead of staying cached", async () => {
  const renderer = load();
  globals.__INIT_CALLS__ = 0;
  globals.__INIT_FAIL_ONCE__ = true;
  await assert.rejects(renderer.ensureReportRenderer(), /transient renderer init failure/);
  assert.equal(globals.__INIT_CALLS__, 1);
  await renderer.ensureReportRenderer();
  assert.equal(globals.__INIT_CALLS__, 2);
  await renderer.ensureReportRenderer();
  assert.equal(globals.__INIT_CALLS__, 2, "a successful init is still cached");
});

test("a failed font load releases the shared cache for the next request", async () => {
  const renderer = load();
  const originalFetch = globals.fetch;
  let fetches = 0;
  let fail = true;
  globals.fetch = (async () => {
    fetches += 1;
    if (fail) throw new Error("font fetch failed");
    return new Response(new Uint8Array([0, 1, 2]), { status: 200 });
  }) as typeof fetch;
  try {
    await assert.rejects(renderer.loadReportFonts("https://preview.example"), /font fetch failed/);
    assert.equal(fetches, 2, "both weights are requested");
    fail = false;
    const buffers = await renderer.loadReportFonts("https://preview.example");
    assert.equal(fetches, 4);
    assert.deepEqual(
      buffers.map((buffer) => buffer.length),
      [3, 3]
    );
    await renderer.loadReportFonts("https://preview.example");
    assert.equal(fetches, 4, "a successful load is shared, not refetched");
  } finally {
    globals.fetch = originalFetch;
  }
});
