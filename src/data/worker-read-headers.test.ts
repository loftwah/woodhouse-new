import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

// Exercise the real Worker wrapper. Stub only provider bindings and unrelated
// scheduled/ingestion handlers; publication policy and header logic stay real.
const bundled = await build({
  entryPoints: ["src/worker.ts"],
  bundle: true,
  write: false,
  format: "iife",
  globalName: "WorkerUnderTest",
  plugins: [
    {
      name: "worker-provider-fixture",
      setup(builder) {
        builder.onResolve({ filter: /^@emdash-cms\/cloudflare\/worker$/ }, () => ({
          path: "provider",
          namespace: "fixture"
        }));
        builder.onResolve({ filter: /^\.\/data\/(analytics-schedule|engagement)$/ }, (args) => ({
          path: args.path,
          namespace: "fixture"
        }));
        builder.onLoad({ filter: /.*/, namespace: "fixture" }, (args) => ({
          contents:
            args.path === "provider"
              ? "export default {fetch: (...args) => globalThis.originFetch(...args)}; export const PluginBridge={}; export const createScheduledHandler=()=>()=>{};"
              : args.path.endsWith("analytics-schedule")
                ? "export const createAnalyticsScheduledHandler=handler=>handler;"
                : "export const collectEngagement=()=>new Response(null,{status:204});",
          loader: "js"
        }));
      }
    }
  ]
});
function worker(originHeaders: Record<string, string>) {
  const context = vm.createContext({
    URL,
    Headers,
    Request,
    Response,
    originFetch: () => new Response(null, { headers: originHeaders })
  });
  vm.runInContext(bundled.outputFiles[0]!.text, context);
  return context.WorkerUnderTest.default as {
    fetch(request: Request, env: object, ctx: object): Promise<Response>;
  };
}
const environment = {
  WOODHOUSE_ENVIRONMENT: "production",
  WOODHOUSE_PUBLICATION_MODE: "read-only"
};
test("public GET and HEAD preserve the same indexability and explicit route cache policy", async () => {
  for (const [path, type, cache] of [
    ["/activity/", "text/html", "private, no-store"],
    ["/api/portfolio-card.png?report=test", "image/png", "public, max-age=300"]
  ] as const) {
    const wrapped = worker({ "content-type": type!, "cache-control": cache! });
    for (const method of ["GET", "HEAD"]) {
      const response = await wrapped.fetch(
        new Request("https://woodhouse.loftwah.com" + path, { method }),
        environment,
        {}
      );
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-robots-tag"), null);
      assert.equal(response.headers.get("cache-control"), cache);
    }
  }
});
test("HEAD keeps upstream preview noindex and cannot bypass editorial or mutation boundaries", async () => {
  const wrapped = worker({
    "content-type": "text/html",
    "x-robots-tag": "noindex, nofollow, noarchive"
  });
  const preview = await wrapped.fetch(
    new Request("https://preview.example/activity/", { method: "HEAD" }),
    environment,
    {}
  );
  assert.equal(preview.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  for (const [path, method] of [
    ["/?_preview=secret", "HEAD"],
    ["/_emdash/admin", "HEAD"],
    ["/", "POST"]
  ] as const) {
    const response = await wrapped.fetch(
      new Request("https://woodhouse.loftwah.com" + path, { method }),
      environment,
      {}
    );
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
    assert.match(response.headers.get("cache-control")!, /no-store/);
  }
});

test("preview environment excludes GET and HEAD reads without relying on layout headers", async () => {
  for (const [path, type, cache] of [
    ["/activity/", "text/html", "private, no-store"],
    ["/api/portfolio-card.png?report=test", "image/png", "public, max-age=300"],
    ["/api/portfolio-report.json?report=test", "application/json", "public, max-age=300"]
  ] as const) {
    const wrapped = worker({ "content-type": type, "cache-control": cache });
    for (const method of ["GET", "HEAD"]) {
      const response = await wrapped.fetch(
        new Request("https://woodhouse-loftwah-preview.loftwah.workers.dev" + path, { method }),
        { WOODHOUSE_ENVIRONMENT: "preview", WOODHOUSE_PUBLICATION_MODE: "read-only" },
        {}
      );
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
      assert.equal(response.headers.get("cache-control"), cache);
    }
  }
});
