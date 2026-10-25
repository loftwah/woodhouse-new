import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { build } from "esbuild";
import { periodFor, type Metric, type PortfolioReport } from "./portfolio-analytics.ts";

const REPORT_ID = "0123456789abcdef01234567";
const LEADERBOARD_ID = "a".repeat(24);
const SAVED_AT = Date.now();
const CREATED_AT = new Date(SAVED_AT).toISOString();
const PERIOD = periodFor(7, SAVED_AT);
const ORIGIN = "https://preview.example";

function metric(key: string, label: string): Metric {
  const daily = Array.from({ length: PERIOD.days }, (_, index) => ({
    date: new Date(Date.parse(PERIOD.from) + index * 86400000).toISOString().slice(0, 10),
    value: index === 0 ? 0 : 3 + index
  }));
  return {
    key,
    label,
    unit: "count",
    value: daily.reduce((sum, day) => sum + day.value, 0),
    definition: "Fixture count for the report image routes.",
    quality: "exact",
    daily
  };
}

const report: PortfolioReport = {
  schema: "woodhouse.portfolio-report/1",
  id: REPORT_ID,
  createdAt: CREATED_AT,
  days: PERIOD.days,
  period: PERIOD,
  projects: [
    {
      project: "woodhouse",
      report: {
        schema: "woodhouse.portfolio-analytics/1",
        project: "woodhouse",
        generatedAt: CREATED_AT,
        timezone: "UTC",
        period: PERIOD,
        coverage: {
          startedAt: new Date(SAVED_AT - 90 * 86400000).toISOString(),
          comparableFrom: new Date(SAVED_AT - 90 * 86400000).toISOString(),
          through: CREATED_AT,
          quality: "exact",
          limitations: []
        },
        metrics: [
          metric("visits", "Visits"),
          metric("engaged_sessions", "Engaged sessions"),
          metric("project_opens", "Project discovery")
        ],
        source: { endpoint: "https://woodhouse.loftwah.com/api/engagement", revision: "abcdef0" }
      }
    }
  ]
};

const leaderboardDays = Array.from({ length: 28 }, (_, index) => ({
  day: new Date(Date.parse("2026-09-26") + index * 86400000).toISOString().slice(0, 10),
  merged: index % 4,
  opened: index % 3,
  closed: index % 5,
  reopened: index % 11 === 0 ? 1 : 0
}));
const leaderboardBody = JSON.stringify({
  schema: "woodhouse.github-leaderboard/1",
  id: LEADERBOARD_ID,
  collectedAt: CREATED_AT,
  from: "2026-09-26",
  through: "2026-10-23",
  projects: [
    {
      slug: "woodhouse",
      daily: leaderboardDays,
      issuesComplete: true,
      eventsComplete: true,
      pullsComplete: true,
      openNow: 3
    }
  ]
});

const editionDispatch = {
  slug: "one-more-round",
  title: "One more round",
  kind: "Portfolio report",
  deck: "A table, a shot, a board, a squad.",
  reviewDate: "2026-10-24",
  content: [
    {
      _type: "prose",
      content: [
        {
          _type: "block",
          children: [],
          markDefs: [{ _type: "link", href: `/editions/one-more-round/?report=${REPORT_ID}` }]
        }
      ]
    }
  ]
};

type Repository = {
  listProjectRecords: () => Promise<unknown>;
  listPublishedDispatches: () => Promise<unknown>;
  projectRecords?: unknown;
  dispatches?: unknown;
  failIdentities?: boolean;
};

const repository: Repository = {
  projectRecords: {
    error: undefined,
    cacheHints: [],
    projects: [
      { slug: "fighter", name: "Fighter", siteUrl: "https://fighter.loftwah.com" },
      { slug: "protocol-11", name: "Protocol 11", siteUrl: "https://protocol11.loftwah.com" },
      { slug: "shoalshot", name: "SHOALSHOT", siteUrl: "https://shoalshot.loftwah.com" }
    ]
  },
  dispatches: { error: undefined, cacheHint: {}, dispatches: [editionDispatch] },
  listProjectRecords: async () => {
    if (repository.failIdentities) throw new Error("injected CMS read failure");
    return repository.projectRecords;
  },
  listPublishedDispatches: async () => repository.dispatches
};

type Database = {
  failReads: boolean;
  missingReportId: string | null;
  missingLeaderboardId: string | null;
};

const database: Database = { failReads: false, missingReportId: null, missingLeaderboardId: null };

const db = {
  prepare(sql: string) {
    return {
      bind(id: string) {
        return {
          async first() {
            if (database.failReads) throw new Error("D1_ERROR: Network connection lost");
            if (sql.includes("days=0") && id === database.missingLeaderboardId) return null;
            if (!sql.includes("days=0") && id === database.missingReportId) return null;
            return {
              body: sql.includes("days=0") ? leaderboardBody : JSON.stringify(report)
            };
          }
        };
      }
    };
  }
};

const globals = globalThis as unknown as {
  __REPORT_ENV__?: unknown;
  __REPOSITORY__?: Repository;
  fetch: typeof fetch;
};
globals.__REPORT_ENV__ = { DB: db };
globals.__REPOSITORY__ = repository;

const bundled = await build({
  stdin: {
    contents: `
      export { GET as portfolio } from "./src/pages/api/portfolio-card.png.ts";
      export { GET as leaderboard } from "./src/pages/api/leaderboard-card.png.ts";
      export { GET as shareImage } from "./src/pages/api/share-image.ts";
      export { GET as reportJson } from "./src/pages/api/portfolio-report.json.ts";
      export { GET as activityCard } from "./src/pages/api/activity-card.png.ts";
      export { GET as activityJson } from "./src/pages/api/activity.json.ts";
      export { GET as leaderboardJson } from "./src/pages/api/leaderboard.json.ts";
    `,
    resolveDir: process.cwd(),
    sourcefile: "report-routes-entry.mjs",
    loader: "js"
  },
  bundle: true,
  write: false,
  format: "cjs",
  platform: "node",
  target: "node22",
  loader: { ".wasm": "binary" },
  plugins: [
    {
      name: "worker-bindings",
      setup(plugin) {
        plugin.onResolve({ filter: /^cloudflare:workers$/ }, () => ({
          path: "env",
          namespace: "fixture-env"
        }));
        plugin.onLoad({ filter: /.*/, namespace: "fixture-env" }, () => ({
          contents: `export const env = globalThis.__REPORT_ENV__;`
        }));
        plugin.onResolve({ filter: /content\/repository(\.ts)?$/ }, () => ({
          path: "repository",
          namespace: "fixture-repository"
        }));
        plugin.onLoad({ filter: /.*/, namespace: "fixture-repository" }, () => ({
          contents: `
            export const listProjectRecords = () => globalThis.__REPOSITORY__.listProjectRecords();
            export const listPublishedDispatches = () => globalThis.__REPOSITORY__.listPublishedDispatches();
          `
        }));
      }
    }
  ]
});
const code = bundled.outputFiles[0]!.text;

type RouteHandler = (context: {
  url: URL;
  cache: { set: (value: boolean) => void };
}) => Promise<Response>;

function loadRoutes() {
  const module = { exports: {} as Record<string, unknown> };
  new Function("module", "exports", code)(module, module.exports);
  return module.exports as {
    portfolio: RouteHandler;
    leaderboard: RouteHandler;
    shareImage: RouteHandler;
    reportJson: RouteHandler;
    activityCard: RouteHandler;
    activityJson: RouteHandler;
    leaderboardJson: RouteHandler;
  };
}

function invoke(handler: RouteHandler, path: string) {
  return handler({ url: new URL(path, ORIGIN), cache: { set: () => {} } });
}

type LogRecord = { level: string; line: string };

async function captureLogs(run: () => Promise<Response>) {
  const records: LogRecord[] = [];
  const originalError = console.error,
    originalWarn = console.warn;
  console.error = ((...args: unknown[]) => {
    records.push({ level: "error", line: String(args[1] ?? args[0]) });
  }) as typeof console.error;
  console.warn = ((...args: unknown[]) => {
    records.push({ level: "warn", line: String(args[1] ?? args[0]) });
  }) as typeof console.warn;
  try {
    const response = await run();
    return { response, records };
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
}

const fontFiles = await Promise.all(
  [400, 700].map((weight) =>
    readFile(new URL(`../../public/fonts/bricolage-report-${weight}.ttf`, import.meta.url))
  )
);
const jpeg = await readFile(
  new URL("../../public/share/protocol-11/last-card-cover.jpg", import.meta.url)
);
const shoalshotJpeg = await readFile(
  new URL(
    "../../public/share/shoalshot/showcase-still/tideglass-landscape-field.jpg",
    import.meta.url
  )
);

function listeningReportFixture() {
  const asOf = new Date(Math.floor(Date.now() / 3600000) * 3600000).toISOString();
  const to = asOf.slice(0, 10);
  const from = new Date(Date.parse(to) - 29 * 86400000).toISOString().slice(0, 10);
  return {
    ok: true,
    available: true,
    days: 30,
    asOf,
    from,
    to,
    collectionStarted: from,
    games: [
      { id: "bubbles", seconds: 120, starts: 2 },
      { id: "fighter", seconds: 60, starts: 1 }
    ]
  };
}

/** Only the PNG envelope and IHDR dimensions matter to `cardIsPng`. */
function listeningCardPng(width: number, height: number) {
  const bytes = new Uint8Array(33);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  bytes.set([73, 72, 68, 82], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 13);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function responseFor(
  href: string,
  behaviour: { failArtwork?: boolean; failAllArtwork?: boolean } = {}
) {
  if (href.includes("/fonts/bricolage-report-")) {
    const weight = href.includes("-700") ? 1 : 0;
    return new Response(fontFiles[weight]!, {
      status: 200,
      headers: { "content-type": "font/ttf" }
    });
  }
  if (href.includes("fm.loftwah.com/api/analytics/games-card.png"))
    return new Response(listeningCardPng(1200, 630), {
      status: 200,
      headers: { "content-type": "image/png" }
    });
  if (href.includes("fm.loftwah.com/api/analytics/games"))
    return Response.json(listeningReportFixture());
  if (href.includes("protocol-11")) {
    if (behaviour.failArtwork)
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    return new Response(jpeg, { status: 200, headers: { "content-type": "image/jpeg" } });
  }
  if (href.includes("shoalshot")) {
    if (behaviour.failAllArtwork)
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    return new Response(shoalshotJpeg, { status: 200, headers: { "content-type": "image/jpeg" } });
  }
  throw new Error(`unexpected fixture fetch: ${href}`);
}

function installFetch(
  behaviour: { failArtwork?: boolean; failAllArtwork?: boolean; failFonts?: boolean } = {}
) {
  globals.fetch = (async (input: string | URL | Request) => {
    const href = input instanceof URL ? input.href : String(input);
    if (behaviour.failFonts && href.includes("/fonts/"))
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    return responseFor(href, behaviour);
  }) as typeof fetch;
}

function pngSize(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function resetFixtures() {
  repository.failIdentities = false;
  database.failReads = false;
  database.missingReportId = null;
  database.missingLeaderboardId = null;
}

test("the portfolio card renders a PNG inside its published cache contract", async () => {
  resetFixtures();
  installFetch();
  const { portfolio } = loadRoutes();
  const { response, records } = await captureLogs(() =>
    invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}&format=landscape`)
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.equal(response.headers.get("cache-control"), "public, max-age=300");
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual([...bytes.slice(0, 4)], [137, 80, 78, 71]);
  assert.deepEqual(pngSize(bytes), { width: 1200, height: 630 });
  assert.deepEqual(records, []);
});

test("a downloaded portfolio card names its scope once", async () => {
  resetFixtures();
  installFetch();
  const { portfolio } = loadRoutes();
  // `woodhouse` is the portfolio scope's own project key. Interpolating it
  // beside the site prefix produced `woodhouse-woodhouse-<id>-landscape.png`,
  // which is what a visitor saw when they saved the image.
  const names = new Map<string, string | null>();
  for (const [label, query] of [
    ["portfolio default", ""],
    ["portfolio named", "&project=woodhouse"]
  ] as const) {
    const { response } = await captureLogs(() =>
      invoke(
        portfolio,
        `/api/portfolio-card.png?report=${REPORT_ID}&format=landscape&download=1${query}`
      )
    );
    assert.equal(response.status, 200, label);
    names.set(label, response.headers.get("content-disposition"));
  }
  for (const [label, disposition] of names) {
    assert.match(disposition ?? "", /^attachment; filename="woodhouse-portfolio-/, label);
    assert.doesNotMatch(disposition ?? "", /woodhouse-woodhouse/, `${label} doubles the prefix`);
  }
  // Naming the portfolio scope explicitly and omitting it are the same request.
  assert.equal(names.get("portfolio named"), names.get("portfolio default"));
});

test("a rejected CMS identity read is a route 503 with evidence, not an uncaught 500", async () => {
  resetFixtures();
  installFetch();
  repository.failIdentities = true;
  const { portfolio } = loadRoutes();
  const { response, records } = await captureLogs(() =>
    invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}`)
  );
  assert.equal(response.status, 503);
  assert.equal(await response.text(), "Report image unavailable.");
  const event = JSON.parse(records[0]!.line);
  assert.equal(records[0]!.level, "error");
  assert.equal(event.event, "failure");
  assert.equal(event.route, "/api/portfolio-card.png");
  assert.equal(event.stage, "identities");
  assert.equal(event.dependency, "cms");
  assert.equal(event.report, REPORT_ID);
  assert.equal(event.status, 503);
  assert.equal(event.error, "Error: injected CMS read failure");
  resetFixtures();
});

test("a rejected report read is a route 503 that names the database dependency", async () => {
  resetFixtures();
  installFetch();
  database.failReads = true;
  const { portfolio } = loadRoutes();
  const { response, records } = await captureLogs(() =>
    invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}`)
  );
  assert.equal(response.status, 503);
  const event = JSON.parse(records[0]!.line);
  assert.equal(event.stage, "report-read");
  assert.equal(event.dependency, "database");
  assert.match(event.error, /^Error: D1_ERROR: Network connection lost$/);
  resetFixtures();
});

test("a failed font load answers 503 and the next request retries instead of staying broken", async () => {
  resetFixtures();
  const { portfolio } = loadRoutes();
  const failed = await captureLogs(async () => {
    installFetch({ failFonts: true });
    return invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}`);
  });
  assert.equal(failed.response.status, 503);
  const event = JSON.parse(failed.records[0]!.line);
  assert.equal(event.stage, "fonts");
  assert.equal(event.dependency, "font");
  assert.equal(event.error, "TimeoutError: The operation was aborted due to timeout");
  installFetch();
  const retried = await captureLogs(() =>
    invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}`)
  );
  assert.equal(retried.response.status, 200);
});

test("a failed edition artwork fetch keeps the edition card rather than failing it", async () => {
  resetFixtures();
  installFetch({ failArtwork: true });
  const { portfolio } = loadRoutes();
  const { response, records } = await captureLogs(() =>
    invoke(
      portfolio,
      `/api/portfolio-card.png?report=${REPORT_ID}&edition=one-more-round&format=landscape`
    )
  );
  assert.equal(response.status, 200);
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual(pngSize(bytes), { width: 1200, height: 630 });
  const degraded = records
    .filter((record) => record.level === "warn")
    .map((r) => JSON.parse(r.line));
  assert.equal(degraded.length, 1);
  assert.equal(degraded[0].event, "degraded");
  assert.equal(degraded[0].stage, "edition-artwork");
  assert.equal(degraded[0].scope, "edition");
  assert.equal(degraded[0].dependency, "artwork");
  assert.match(degraded[0].error, /TimeoutError/);
});

test("an edition request without a published snapshot is still a 404", async () => {
  resetFixtures();
  installFetch();
  repository.dispatches = { error: undefined, cacheHint: {}, dispatches: [] };
  const { portfolio } = loadRoutes();
  const { response } = await captureLogs(() =>
    invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}&edition=one-more-round`)
  );
  assert.equal(response.status, 404);
  repository.dispatches = { error: undefined, cacheHint: {}, dispatches: [editionDispatch] };
});

test("a failed edition dispatch read is a 503 rather than a missing snapshot", async () => {
  resetFixtures();
  installFetch();
  repository.dispatches = {
    error: new Error("dispatches unavailable"),
    cacheHint: {},
    dispatches: []
  };
  const { portfolio } = loadRoutes();
  const { response, records } = await captureLogs(() =>
    invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}&edition=one-more-round`)
  );
  assert.equal(response.status, 503);
  const event = JSON.parse(records[0]!.line);
  assert.equal(event.stage, "edition-dispatches");
  assert.equal(event.dependency, "cms");
  assert.equal(event.status, 503);
  assert.equal(event.error, "Error: dispatches unavailable");
  repository.dispatches = { error: undefined, cacheHint: {}, dispatches: [editionDispatch] };
  resetFixtures();
});

test("the leaderboard route answers 503 when its CMS read rejects", async () => {
  resetFixtures();
  installFetch();
  repository.failIdentities = true;
  const { leaderboard } = loadRoutes();
  const { response, records } = await captureLogs(() =>
    invoke(leaderboard, `/api/leaderboard-card.png?report=${LEADERBOARD_ID}`)
  );
  assert.equal(response.status, 503);
  const event = JSON.parse(records[0]!.line);
  assert.equal(event.route, "/api/leaderboard-card.png");
  assert.equal(event.stage, "identities");
  assert.equal(event.dependency, "cms");
  resetFixtures();
});

test("the leaderboard card renders through the shared renderer and font cache", async () => {
  resetFixtures();
  installFetch();
  const { portfolio, leaderboard } = loadRoutes();
  const card = await captureLogs(() =>
    invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}`)
  );
  assert.equal(card.response.status, 200);
  const { response, records } = await captureLogs(() =>
    invoke(leaderboard, `/api/leaderboard-card.png?report=${LEADERBOARD_ID}&days=28&measure=merged`)
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.deepEqual(
    [...new Uint8Array(await response.arrayBuffer()).slice(0, 4)],
    [137, 80, 78, 71]
  );
  assert.deepEqual(records, []);
});

test("the share image and report JSON reads stay inside their routes' own 503", async () => {
  resetFixtures();
  installFetch();
  repository.failIdentities = true;
  const routes = loadRoutes();
  const share = await captureLogs(() =>
    invoke(routes.shareImage, "/api/share-image?project=fighter&asset=social")
  );
  const json = await captureLogs(() =>
    invoke(routes.reportJson, `/api/portfolio-report.json?report=${REPORT_ID}`)
  );
  assert.equal(share.response.status, 503);
  assert.equal(json.response.status, 503);
  assert.deepEqual(await json.response.json(), { available: false });
  for (const record of [...share.records, ...json.records]) {
    const event = JSON.parse(record.line);
    assert.equal(event.stage, "identities");
    assert.equal(event.status, 503);
  }
  resetFixtures();
});

test("a rejected leaderboard database read answers 503 with database evidence", async () => {
  resetFixtures();
  installFetch();
  database.failReads = true;
  const { leaderboard } = loadRoutes();
  const { response, records } = await captureLogs(() =>
    invoke(leaderboard, `/api/leaderboard-card.png?report=${LEADERBOARD_ID}`)
  );
  assert.equal(response.status, 503);
  const event = JSON.parse(records[0]!.line);
  assert.equal(event.stage, "report-read");
  assert.equal(event.dependency, "database");
  assert.equal(event.status, 503);
  assert.match(event.error, /^Error: D1_ERROR: Network connection lost$/);
  resetFixtures();
});

test("a totally failed edition artwork pair still renders the cover", async () => {
  resetFixtures();
  installFetch({ failArtwork: true, failAllArtwork: true });
  const { portfolio } = loadRoutes();
  const { response, records } = await captureLogs(() =>
    invoke(portfolio, `/api/portfolio-card.png?report=${REPORT_ID}&edition=one-more-round`)
  );
  assert.equal(response.status, 200);
  assert.deepEqual(pngSize(new Uint8Array(await response.arrayBuffer())), {
    width: 1200,
    height: 630
  });
  const degraded = records
    .filter((record) => record.level === "warn")
    .map((record) => JSON.parse(record.line));
  assert.equal(degraded.length, 2);
  for (const event of degraded) {
    assert.equal(event.event, "degraded");
    assert.equal(event.stage, "edition-artwork");
  }
  assert.deepEqual(degraded.map((event) => event.error).sort(), [
    "TimeoutError: The operation was aborted due to timeout",
    "TimeoutError: The operation was aborted due to timeout"
  ]);
});

test("the activity card answers 400 and 503 inside its own contract", async () => {
  resetFixtures();
  installFetch();
  const routes = loadRoutes();
  const invalid = await captureLogs(() =>
    invoke(routes.activityCard, "/api/activity-card.png?format=wide")
  );
  assert.equal(invalid.response.status, 400);
  assert.deepEqual(invalid.records, []);
  repository.failIdentities = true;
  const failed = await captureLogs(() =>
    invoke(routes.activityCard, "/api/activity-card.png?game=fighter")
  );
  assert.equal(failed.response.status, 503);
  const event = JSON.parse(failed.records[0]!.line);
  assert.equal(event.route, "/api/activity-card.png");
  assert.equal(event.stage, "identities");
  assert.equal(event.scope, "game:fighter");
  assert.equal(event.dependency, "cms");
  resetFixtures();
});

test("the activity card keeps its success contract and public membership check", async () => {
  resetFixtures();
  installFetch();
  const routes = loadRoutes();
  const ok = await captureLogs(() =>
    invoke(routes.activityCard, "/api/activity-card.png?game=fighter")
  );
  assert.equal(ok.response.status, 200);
  assert.equal(ok.response.headers.get("content-type"), "image/png");
  assert.equal(ok.response.headers.get("cache-control"), "public, max-age=60");
  assert.equal(ok.response.headers.get("x-image-width"), "1200");
  assert.deepEqual(ok.records, []);
  const missing = await captureLogs(() =>
    invoke(routes.activityCard, "/api/activity-card.png?game=bubbles")
  );
  assert.equal(missing.response.status, 404);
  assert.deepEqual(missing.records, []);
});

test("the activity JSON keeps its read boundary and success body", async () => {
  resetFixtures();
  installFetch();
  const routes = loadRoutes();
  const ok = await captureLogs(() => invoke(routes.activityJson, "/api/activity.json"));
  assert.equal(ok.response.status, 200);
  const body = (await ok.response.json()) as { available: boolean; games: Array<{ id: string }> };
  assert.equal(body.available, true);
  assert.deepEqual(
    body.games.map((game) => game.id),
    ["fighter"]
  );
  assert.deepEqual(ok.records, []);
  repository.failIdentities = true;
  const failed = await captureLogs(() => invoke(routes.activityJson, "/api/activity.json"));
  assert.equal(failed.response.status, 503);
  assert.deepEqual(await failed.response.json(), {
    available: false,
    source: "https://fm.loftwah.com/api/analytics/games?days=30"
  });
  const event = JSON.parse(failed.records[0]!.line);
  assert.equal(event.route, "/api/activity.json");
  assert.equal(event.dependency, "cms");
  resetFixtures();
});

test("the leaderboard JSON keeps its read boundary, success body and 404", async () => {
  resetFixtures();
  installFetch();
  const routes = loadRoutes();
  const ok = await captureLogs(() =>
    invoke(routes.leaderboardJson, `/api/leaderboard.json?report=${LEADERBOARD_ID}`)
  );
  assert.equal(ok.response.status, 200);
  assert.equal(ok.response.headers.get("cache-control"), "public, max-age=60");
  const body = (await ok.response.json()) as { schema: string };
  assert.equal(body.schema, "woodhouse.github-leaderboard/1");
  assert.deepEqual(ok.records, []);
  database.missingLeaderboardId = "b".repeat(24);
  const missing = await captureLogs(() =>
    invoke(routes.leaderboardJson, `/api/leaderboard.json?report=${"b".repeat(24)}`)
  );
  assert.equal(missing.response.status, 404);
  assert.deepEqual(await missing.response.json(), { available: false });
  database.failReads = true;
  const failed = await captureLogs(() =>
    invoke(routes.leaderboardJson, `/api/leaderboard.json?report=${LEADERBOARD_ID}`)
  );
  assert.equal(failed.response.status, 503);
  const event = JSON.parse(failed.records[0]!.line);
  assert.equal(event.route, "/api/leaderboard.json");
  assert.equal(event.stage, "report-read");
  assert.equal(event.dependency, "database");
  resetFixtures();
});

test("expected 400 and 404 answers carry no failure evidence", async () => {
  resetFixtures();
  installFetch();
  const routes = loadRoutes();
  const probes: Array<[RouteHandler, string, number]> = [
    [routes.portfolio, `/api/portfolio-card.png?report=${REPORT_ID}&project=unknown`, 404],
    [routes.portfolio, `/api/portfolio-card.png?report=${REPORT_ID}&destination=nowhere`, 404],
    [routes.portfolio, `/api/portfolio-card.png?report=${REPORT_ID}&format=wide`, 400],
    [routes.portfolio, `/api/portfolio-card.png?report=${REPORT_ID}&story=music`, 400],
    [
      routes.portfolio,
      `/api/portfolio-card.png?report=${REPORT_ID}&edition=one-more-round&project=woodhouse`,
      400
    ],
    [routes.shareImage, "/api/share-image?project=unknown&asset=social", 404],
    [routes.shareImage, "/api/share-image?project=fighter&asset=banner", 400],
    [routes.reportJson, "/api/portfolio-report.json", 400],
    [routes.reportJson, `/api/portfolio-report.json?report=${"c".repeat(24)}`, 404],
    [routes.leaderboard, `/api/leaderboard-card.png?report=${LEADERBOARD_ID}&project=fighter`, 404],
    [routes.activityCard, "/api/activity-card.png?game=unknown", 400]
  ];
  database.missingReportId = "c".repeat(24);
  for (const [handler, path, status] of probes) {
    const { response, records } = await captureLogs(() => invoke(handler, path));
    assert.equal(response.status, status, path);
    assert.deepEqual(records, [], `${path} logged a failure`);
  }
  resetFixtures();
});
