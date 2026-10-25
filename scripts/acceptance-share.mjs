// Machine-checked acceptance for the two sharing paths a visitor can reach: a
// saved analytics report (/activity/?report=…) and a saved engineering
// leaderboard (/activity/leaderboards/?report=…).
//
// The observed failure this prevents: the share controllers had unit tests for
// one branch at a time, but nothing drove the real page in a real browser, so a
// duplicated native share call, a stale "preparing" message or a broken preview
// frame could only be found by a person on a phone. This runs the browser paths
// and records a pass/fail matrix.
//
// What it does not claim: a physical iOS or Android share sheet, an operating
// system download or gallery save, a platform unfurl, or MP's taste acceptance.
// A Playwright browser is a browser, not a phone.
//
// Usage:
//   pnpm run acceptance:share [-- --playwright <path|specifier>] [--browser chromium|webkit|both]
//   pnpm run acceptance:share [-- --origin http://localhost:4471 --evidence output/run]
//
// The runner owns its host: unless --origin is given it seeds a deterministic
// local fixture into the ignored .wrangler D1, starts `pnpm dev` on a free port,
// drives the pages, writes its receipt and screenshots under
// output/acceptance-share/ and stops the dev server it started. It reuses an
// existing Playwright installation; it adds no dependency and no paid CI job.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:net";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DAY = 86400000;
const PORTFOLIO_IMAGE = "**/api/portfolio-card.png*";
const LEADERBOARD_IMAGE = "**/api/leaderboard-card.png*";

/** Fixture identity. Owned local data for a browser run, never published. */
const FIXTURE_LEADERBOARD = "0123456789abcdef01234567";
const FIXTURE_COLLECTED_AT = "2026-10-24T03:00:00.000Z";

function parseArguments(argv) {
  const options = { origin: undefined, playwright: undefined, browser: "chromium", keep: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    else if (argument === "--origin") options.origin = argv[(index += 1)];
    else if (argument === "--playwright") options.playwright = argv[(index += 1)];
    else if (argument === "--browser") options.browser = argv[(index += 1)];
    else if (argument === "--evidence") options.evidence = argv[(index += 1)];
    else if (argument === "--keep") options.keep = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!["chromium", "webkit", "both"].includes(options.browser))
    throw new Error(`Unknown browser: ${options.browser}`);
  return options;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} exited with ${result.status}: ${(result.stderr ?? "").trim().slice(0, 600)}`
    );
  return result.stdout;
}

/** The Playwright runtime this host already has. Nothing is downloaded. */
async function loadPlaywright(specifier) {
  const tried = [];
  const candidatesFor = (value) => {
    if (!value || !existsSync(value)) return [value];
    if (!statSync(value).isDirectory()) return [pathToFileURL(value).href];
    const entries = [join(value, "index.mjs")]
      .concat(
        existsSync(join(value, "package.json"))
          ? [
              join(
                value,
                JSON.parse(readFileSync(join(value, "package.json"), "utf8")).main ?? "index.js"
              )
            ]
          : []
      )
      .filter((entry) => existsSync(entry));
    return entries.map((entry) => pathToFileURL(entry).href);
  };
  const attempts = [
    ...candidatesFor(specifier),
    ...candidatesFor(process.env.WOODHOUSE_PLAYWRIGHT),
    "playwright"
  ].filter(Boolean);
  for (const attempt of attempts) {
    tried.push(attempt);
    try {
      return { module: await import(attempt), source: attempt };
    } catch {
      /* try the next candidate */
    }
  }
  const cache = join(process.env.HOME ?? "", ".npm", "_npx");
  if (existsSync(cache)) {
    const candidates = [];
    for (const entry of readdirSync(cache)) {
      const manifest = join(cache, entry, "node_modules", "playwright", "package.json");
      if (!existsSync(manifest)) continue;
      candidates.push({
        version: JSON.parse(readFileSync(manifest, "utf8")).version,
        entry: join(cache, entry, "node_modules", "playwright")
      });
    }
    candidates.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
    for (const candidate of candidates) {
      const entry = join(candidate.entry, "index.mjs");
      if (!existsSync(entry)) continue;
      tried.push(entry);
      try {
        return {
          module: await import(pathToFileURL(entry).href),
          source: entry,
          version: candidate.version
        };
      } catch {
        /* keep looking */
      }
    }
  }
  throw new Error(
    `No Playwright runtime was found. Tried: ${tried.join(", ")}. Pass --playwright <path> to an installed module.`
  );
}

const sqlText = (value) => `'${String(value).replaceAll("'", "''")}'`;

function localDatabasePath() {
  const directory = join(root, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
  if (!existsSync(directory)) return null;
  const files = readdirSync(directory).filter(
    (name) => name.endsWith(".sqlite") && name !== "metadata.sqlite"
  );
  return files.length === 1 ? join(directory, files[0]) : null;
}

function hashNumber(text) {
  let value = 2166136261;
  for (const character of text) {
    value ^= character.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

const leaderboardProjects = [
  "woodhouse",
  "app-composer",
  "fighter",
  "shoalshot",
  "protocol-11",
  "loftwahfm",
  "bubbles",
  "asset-hunter"
];

/**
 * A complete leaderboard history wide enough for a 28-day ranking and its
 * previous period, with distinct daily counts so ranks, ties and movement are
 * real arithmetic rather than decorative numbers.
 */
function leaderboardFixture(through) {
  const days = 84;
  const from = new Date(Date.parse(through) - (days - 1) * DAY).toISOString().slice(0, 10);
  const dates = Array.from({ length: days }, (_, index) =>
    new Date(Date.parse(from) + index * DAY).toISOString().slice(0, 10)
  );
  return {
    schema: "woodhouse.github-leaderboard/1",
    id: FIXTURE_LEADERBOARD,
    collectedAt: FIXTURE_COLLECTED_AT,
    from,
    through,
    projects: leaderboardProjects.map((slug) => ({
      slug,
      issuesComplete: true,
      eventsComplete: true,
      pullsComplete: true,
      openNow: 10 + (hashNumber(slug) % 60),
      daily: dates.map((day) => {
        const value = hashNumber(slug + day);
        return {
          day,
          merged: value % 4,
          opened: (value >> 3) % 4,
          closed: (value >> 5) % 4,
          reopened: (value >> 7) % 2
        };
      })
    }))
  };
}

/** Daily analytics for Woodhouse only; every other project stays honestly absent. */
function dailyRows(through) {
  const metrics = [
    ["visit", 1],
    ["engaged", 1],
    ["project_open", 1],
    ["active_time", 60],
    ["story_arrival", 1],
    ["story_explored", 1]
  ];
  const rows = [];
  for (let offset = 130; offset >= 1; offset -= 1) {
    const day = new Date(Date.parse(through) - offset * DAY).toISOString().slice(0, 10);
    for (const [metric, scale] of metrics) {
      const value = (hashNumber("woodhouse" + day + metric) % 9) * scale;
      rows.push(
        `('woodhouse',${sqlText(day)},${sqlText(metric)},${value + (scale > 1 ? 120 : 0)})`
      );
    }
  }
  return rows;
}

async function seedDatabase(evidenceDir, through) {
  const database = localDatabasePath();
  assert(database, "Could not identify one local D1 database under .wrangler");
  // Seeding into a database that already exists keeps its earlier block-type
  // schema — EmDash's seed uses `onConflict: "skip"`. A machine that has run
  // `pnpm dev` since the last diagram was added therefore rejects the seed with
  // "Invalid option", and the fixture is only reproducible on a fresh clone.
  // Move the developer's local database aside and build the fixture from
  // nothing, then put the original back.
  const backup = join(evidenceDir, "local-d1-backup");
  const moved = [];
  for (const suffix of ["", "-wal", "-shm"]) {
    const source = database + suffix;
    if (!existsSync(source)) continue;
    const target = join(backup, basename(source));
    await mkdir(backup, { recursive: true });
    await rename(source, target);
    moved.push([target, source]);
  }
  const restore = async () => {
    for (const [target, source] of moved) {
      await rm(source, { force: true });
      await rename(target, source);
    }
  };
  // EmDash's own local bootstrap, the same sequence scripts/emdash-doctor.mjs uses.
  const cli = join(root, "node_modules/emdash/dist/cli/index.mjs");
  assert(existsSync(cli), "The EmDash CLI is missing; run pnpm install --frozen-lockfile");
  try {
    run(process.execPath, [cli, "init", "--cwd", root, "--database", database]);
    run(process.execPath, [
      cli,
      "seed",
      "seed/seed.json",
      "--cwd",
      root,
      "--database",
      database,
      "--skip-media"
    ]);
  } catch (error) {
    await restore();
    throw error;
  }
  // A fresh database has EmDash's own schema but not Woodhouse's analytics
  // tables, which live in plain SQL migrations rather than EmDash's ledger.
  const migrations = readdirSync(join(root, "migrations"))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  assert(migrations.length > 0, "No analytics migrations were found to apply");
  for (const name of migrations)
    run("pnpm", [
      "exec",
      "wrangler",
      "d1",
      "execute",
      "DB",
      "--local",
      "--file",
      join(root, "migrations", name)
    ]);
  const snapshot = JSON.stringify(leaderboardFixture(through));
  const file = join(evidenceDir, "fixture.sql");
  const statements = [
    `INSERT OR REPLACE INTO wh_analytics_daily (project, day, metric, value) VALUES ${dailyRows(through).join(",")};`,
    `INSERT OR REPLACE INTO wh_analytics_reports (id, created_at, days, body) VALUES (${sqlText(FIXTURE_LEADERBOARD)}, ${sqlText(FIXTURE_COLLECTED_AT)}, 0, ${sqlText(snapshot)});`
  ];
  await writeFile(file, statements.join("\n") + "\n", "utf8");
  run("pnpm", ["exec", "wrangler", "d1", "execute", "DB", "--local", "--file", file]);
  return { database, from: JSON.parse(snapshot).from, restore };
}

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
  });
}

async function waitForServer(origin, timeout = 120000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/activity/measurement/`, {
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) return;
    } catch {
      /* not listening yet */
    }
    await new Promise((done) => setTimeout(done, 1000));
  }
  throw new Error(`The dev server did not answer on ${origin}`);
}

/**
 * `astro dev` in this repository runs the server as a managed process behind a
 * worktree lock, so the runner starts it and stops it again through that same
 * command rather than leaving a stray listener behind.
 */
function startServer(port, logPath) {
  const child = spawn("pnpm", ["dev", "--port", String(port)], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"]
  });
  const chunks = [];
  const collect = (data) => {
    chunks.push(data.toString());
    if (chunks.length > 500) chunks.shift();
    return true;
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  return {
    async stop() {
      await writeFile(logPath, chunks.join(""), "utf8").catch(() => {});
      spawnSync("pnpm", ["exec", "astro", "dev", "stop"], { cwd: root, encoding: "utf8" });
    }
  };
}

const isPng = (bytes) =>
  bytes.length > 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
const dimensions = (bytes) => ({ width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

/**
 * Replaces navigator.share/canShare with a recorder this run controls. The File
 * handed to the device is kept, so the test can compare its bytes with the PNG
 * the same query returns. `mode` decides how the share sheet behaves.
 */
function shareStub() {
  const state = {
    calls: [],
    files: [],
    pending: [],
    mode: "ok",
    canShare: true,
    rejections: []
  };
  window.__share = state;
  window.addEventListener("unhandledrejection", (event) => {
    state.rejections.push(String(event.reason?.message ?? event.reason));
  });
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: (data) => {
      const files = [...(data?.files ?? [])];
      state.files.push(files[0] ?? null);
      state.calls.push({
        count: files.length,
        type: files[0]?.type ?? null,
        size: files[0]?.size ?? null,
        text: data?.text ?? null,
        title: data?.title ?? null,
        url: data?.url ?? null
      });
      if (state.mode === "cancel")
        return Promise.reject(new DOMException("The user aborted a request", "AbortError"));
      if (state.mode === "fail") return Promise.reject(new Error("share failed"));
      if (state.mode === "pending") return new Promise((settle) => state.pending.push(settle));
      return Promise.resolve();
    }
  });
  Object.defineProperty(navigator, "canShare", { configurable: true, value: () => state.canShare });
  // The copy branches are asserted against the text the page actually asked to
  // write. Writing still goes through the browser's own Clipboard API where it
  // exists; the read-back is recorded here because WebKit blocks readText in
  // Playwright. `state.clipboard` names which behaviour was in use.
  const native = navigator.clipboard;
  const canWrite = typeof native?.writeText === "function";
  state.clipboard = canWrite ? "browser write, recorded read-back" : "in-memory double";
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text) => {
        if (canWrite) await native.writeText.call(native, String(text));
        state.clipboardText = String(text);
      },
      readText: async () => state.clipboardText ?? ""
    }
  });
}

/** Payloads the page handed to the device, with the file's own SHA-256. */
async function shareCalls(page) {
  return page.evaluate(async () => {
    const state = window.__share;
    const digests = await Promise.all(
      state.files.map(async (file) => {
        if (!file) return null;
        const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      })
    );
    return state.calls.map((call, index) => ({
      ...call,
      name: state.files[index]?.name ?? null,
      digest: digests[index]
    }));
  });
}

const shareMode = (page, mode) =>
  page.evaluate((value) => {
    window.__share.mode = value;
    window.__share.pending = [];
  }, mode);

const releaseShare = (page) =>
  page.evaluate(() => {
    for (const settle of window.__share.pending.splice(0)) settle();
  });

const denialCount = (page) => page.evaluate(() => window.__share?.rejections.length ?? 0);

/** Clipboard write failure, injected after navigation like a denied permission. */
const denyClipboard = (page) =>
  page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Write permission denied.", "NotAllowedError");
        },
        readText: async () => ""
      }
    });
  });

/**
 * The whole matrix. Each entry drives one browser path and states what it saw.
 * A failure is recorded and the run continues, so one report covers the rest.
 */
export async function runShareAcceptance(page, context) {
  const { origin, evidence, reportId, leaderboardId, browser } = context;
  const results = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const step = async (id, path, body) => {
    errors.length = 0;
    try {
      const detail = (await body()) ?? {};
      assert.equal(errors.length, 0, `page error: ${errors.join("; ")}`);
      results.push({ id, path, status: "pass", detail });
    } catch (error) {
      results.push({ id, path, status: "fail", detail: String(error?.message ?? error) });
    }
  };

  const reportUrl = (extra = {}) => {
    const url = new URL("/activity/", origin);
    url.searchParams.set("report", reportId);
    url.searchParams.set("project", "woodhouse");
    url.searchParams.set("measure", "visits");
    url.searchParams.set("analytics", "off");
    url.searchParams.set("qa", "1");
    for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
    return url.href;
  };
  const leaderboardUrl = (extra = {}) => {
    const url = new URL("/activity/leaderboards/", origin);
    url.searchParams.set("report", leaderboardId);
    url.searchParams.set("days", "28");
    url.searchParams.set("measure", "merged");
    url.searchParams.set("analytics", "off");
    url.searchParams.set("qa", "1");
    for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
    return url.href;
  };
  const payload = async () => JSON.parse(await page.locator("#report-sharing").textContent());
  const reportImage = async () => new URL((await payload()).image, origin).href;
  const leaderboardData = () =>
    page.locator("[data-leaderboard]").evaluate((element) => ({
      image: element.dataset.image,
      link: element.dataset.link,
      caption: element.dataset.caption,
      filename: element.dataset.filename
    }));
  const statusText = async (selector) => (await page.locator(selector).first().innerText()).trim();
  /** Clear the recorder so one activation can be measured on its own. */
  const resetShare = () =>
    page.evaluate(() => {
      window.__share.calls = [];
      window.__share.files = [];
      window.__share.pending = [];
    });
  /**
   * The leaderboard prepares its PNG outside the gesture, so a first activation
   * can legitimately answer "still preparing". This waits for a real hand-off
   * before the check measures the behaviour it cares about.
   */
  const reachReady = async (button) => {
    for (let attempt = 0; attempt < 15; attempt += 1) {
      await button.click();
      await page.waitForTimeout(400);
      const status = await statusText("[data-lb-status]");
      if (!/preparing/i.test(status)) {
        await resetShare();
        return status;
      }
    }
    throw new Error("the leaderboard image never became ready to share");
  };
  const activeText = () =>
    page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return "none";
      return `${active.tagName}|${(active.getAttribute("aria-label") ?? active.textContent ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 60)}`;
    });
  const fetchBytes = async (url) => {
    const response = await page.request.get(url);
    assert.equal(response.status(), 200, `${url} answered ${response.status()}`);
    return Buffer.from(await response.body());
  };

  // ---- Saved report: native share available ------------------------------
  await step("report.share.available", "report · native share available", async () => {
    await page.goto(reportUrl({ view: "share" }));
    const button = page.locator("[data-report-share]");
    await button.waitFor({ state: "visible", timeout: 30000 });
    assert.equal(await button.getAttribute("data-state"), "ready");
    assert.match(await statusText("[data-report-status]"), /ready to share/i);
    const bytes = await fetchBytes(await reportImage());
    await button.click();
    const calls = await shareCalls(page);
    assert.equal(calls.length, 1, "one activation must produce one share call");
    assert.equal(calls[0].count, 1);
    assert.equal(calls[0].type, "image/png");
    assert.equal(calls[0].name, "woodhouse-report.png");
    assert.equal(calls[0].size, bytes.length);
    assert.equal(calls[0].digest, digest(bytes), "the shared file is this report's PNG");
    // The design sends the image alone; the caption is a separate copy action.
    assert.equal(calls[0].text, null);
    assert.equal(calls[0].url, null);
    assert.match(await statusText("[data-report-status]"), /handed to your device/i);
    assert.equal(await denialCount(page), 0);
    return { bytes: bytes.length, sha256: digest(bytes).slice(0, 16), payload: "image only" };
  });

  // ---- Saved report: no file sharing capability -------------------------
  await step("report.share.unsupported", "report · no file sharing", async () => {
    await page.goto(reportUrl({ view: "share" }));
    await page.locator("[data-report-preview]").waitFor({ state: "visible" });
    await page.evaluate(() => {
      window.__share.canShare = false;
    });
    // Reopening the panel re-runs preparation against the new capability.
    const panel = page.locator("[data-share-panel]");
    await panel.evaluate((element) => {
      element.open = false;
    });
    await panel.evaluate((element) => {
      element.open = true;
    });
    await page.waitForTimeout(1200);
    assert.equal(await page.locator("[data-report-share]").isVisible(), false);
    assert.match(await statusText("[data-report-status]"), /cannot share the image directly/i);
    assert.equal(await page.locator(".share-actions a[download]").count(), 3);
    assert.equal((await shareCalls(page)).length, 0, "no text-only share is attempted");
    return { downloads: 3, shareCalls: 0 };
  });

  // ---- Saved report: user cancels ---------------------------------------
  await step("report.share.cancelled", "report · user cancels", async () => {
    await page.goto(reportUrl({ view: "share" }));
    const button = page.locator("[data-report-share]");
    await button.waitFor({ state: "visible", timeout: 30000 });
    const before = page.url();
    const focusBefore = await activeText();
    await shareMode(page, "cancel");
    await button.click();
    const status = await statusText("[data-report-status]");
    assert.match(status, /cancelled/i);
    assert.doesNotMatch(status, /handed|sent/i);
    assert.equal(page.url(), before, "cancelling must not change the selection");
    // Safari does not focus a button on click, so the place is "the action or
    // exactly where it was"; it never jumps, and it never lands on the status.
    const focusAfter = await activeText();
    assert.equal(
      focusAfter === focusBefore || /^BUTTON\|.*Share image/s.test(focusAfter),
      true,
      `focus moved to ${focusAfter}`
    );
    assert.doesNotMatch(focusAfter, /^P\|/);
    assert.equal(await denialCount(page), 0);
    return { status, focus: focusAfter, selection: "unchanged" };
  });

  // ---- Saved report: repeated rapid activation --------------------------
  await step("report.share.repeat", "report · repeated rapid activation", async () => {
    await page.goto(reportUrl({ view: "share" }));
    const button = page.locator("[data-report-share]");
    await button.waitFor({ state: "visible", timeout: 30000 });
    await shareMode(page, "pending");
    await button.click();
    await button.click();
    await button.click();
    await page.waitForTimeout(150);
    const calls = await shareCalls(page);
    assert.equal(calls.length, 1, `a pending share must not start again (saw ${calls.length})`);
    const status = await statusText("[data-report-status]");
    assert.match(status, /still finishing the last share/i);
    assert.doesNotMatch(status, /preparing/i, "a prepared image is not still preparing");
    assert.doesNotMatch(status, /handed|sent/i, "no false success while the sheet is open");
    await releaseShare(page);
    await page.waitForTimeout(150);
    assert.equal(await denialCount(page), 0);
    assert.equal((await shareCalls(page)).length, 1);
    return { shareCalls: calls.length, status };
  });

  // ---- Saved report: clipboard permission denied ------------------------
  await step("report.copy.denied", "report · clipboard denied", async () => {
    await page.goto(reportUrl({ view: "share" }));
    await denyClipboard(page);
    const button = page.getByRole("button", { name: "Copy caption and link", exact: true });
    const before = page.url();
    await button.click();
    const status = await statusText("[data-report-status]");
    assert.match(status, /copy unavailable/i);
    assert.match(status, /saved report/i, "the message names a usable alternative");
    assert.equal(page.url(), before);
    const alternative = page.getByRole("link", { name: "Open the saved report", exact: true });
    assert.equal(await alternative.isVisible(), true);
    await alternative.focus();
    assert.match(await activeText(), /^A\|Open the saved report/);
    return { status, alternative: "Open the saved report" };
  });

  // ---- Saved report: downloads -----------------------------------------
  await step("report.download", "report · PNG downloads", async () => {
    await page.goto(reportUrl({ view: "share" }));
    const sizes = {};
    // The published portfolio-card formats: 1200×630, 1200×1200, 1080×1920.
    for (const [label, width, height] of [
      ["Download landscape PNG", 1200, 630],
      ["Download square PNG", 1200, 1200],
      ["Download portrait PNG", 1080, 1920]
    ]) {
      const link = page.getByRole("link", { name: label, exact: true });
      const direct = await fetchBytes(new URL(await link.getAttribute("href"), origin).href);
      const pending = page.waitForEvent("download");
      await link.click();
      const download = await pending;
      const saved = await readFile(await download.path());
      assert.equal(isPng(saved), true, `${label} is a PNG`);
      assert.deepEqual(dimensions(saved), { width, height });
      assert.equal(digest(saved), digest(direct), `${label} matches the route's own output`);
      sizes[`${width}x${height}`] = saved.length;
    }
    return sizes;
  });

  // ---- Saved report: the image cannot be produced ----------------------
  // A download started by an `<a download>` is a browser operation the page
  // cannot observe (Playwright cannot fail it and reports no failure even for a
  // 503). What the page owns is the honest state around it: the missing preview,
  // the fallback message, the listed downloads and a working retry.
  await step("report.download.failure", "report · image cannot be produced", async () => {
    await page.route(PORTFOLIO_IMAGE, (route) =>
      route.fulfill({ status: 503, contentType: "text/plain", body: "Image unavailable." })
    );
    try {
      await page.goto(reportUrl({ view: "share" }));
      await page.waitForTimeout(1500);
      const status = await statusText("[data-report-status]");
      assert.match(status, /unavailable|try a PNG download/i);
      assert.doesNotMatch(status, /ready to share|handed/i, "no false success");
      const hidden = await page
        .locator("[data-report-preview]")
        .evaluate((element) => element.hidden);
      assert.equal(hidden, true, "a failed preview is not left as a broken frame");
      assert.equal(
        await page.locator(".share-actions a[download]").count(),
        3,
        "the downloads stay available while the preview is missing"
      );
      assert.equal(await page.locator("[data-report-share]").isVisible(), false);
      // The route itself refuses an impossible scope rather than serving a placeholder.
      const rejected = await page.request.get(
        `${origin}/api/portfolio-card.png?report=ffffffffffffffffffffffff&project=woodhouse&measure=visits`
      );
      assert.notEqual(rejected.status(), 200);
      assert.equal(
        isPng(Buffer.from(await rejected.body())),
        false,
        "no placeholder image is served"
      );
      return { status, preview: "hidden", scopeRejection: rejected.status() };
    } finally {
      await page.unroute(PORTFOLIO_IMAGE);
    }
  });

  // ---- Saved report: the image belongs to this scope -------------------
  await step("report.image.scope", "report · image matches the selection", async () => {
    await page.goto(reportUrl({ view: "share" }));
    const saved = new URL(
      await page
        .getByRole("link", { name: "Open the saved report", exact: true })
        .getAttribute("href"),
      origin
    );
    const image = new URL((await payload()).image, origin);
    for (const key of ["report", "project", "measure"]) {
      assert.equal(image.searchParams.get(key), saved.searchParams.get(key), key);
      assert.equal(saved.searchParams.get(key), new URL(reportUrl()).searchParams.get(key), key);
    }
    const first = await fetchBytes(image.href);
    const second = await fetchBytes(image.href);
    assert.equal(digest(first), digest(second), "the same query renders the same image");
    const other = new URL(image);
    other.searchParams.set("measure", "project_opens");
    const different = await fetchBytes(other.href);
    assert.notEqual(
      digest(first),
      digest(different),
      "a different measure must not reuse the image"
    );
    assert.deepEqual(dimensions(first), { width: 1200, height: 630 });
    return {
      report: reportId,
      measure: image.searchParams.get("measure"),
      sha256: digest(first).slice(0, 16)
    };
  });

  // ---- Saved report: shared URL restores the scope ---------------------
  await step("report.deeplink", "report · shared URL restores the scope", async () => {
    await page.goto(reportUrl({ view: "share", week: "1999-01-04" }));
    const restored = new URL(page.url());
    assert.equal(restored.searchParams.get("report"), reportId);
    assert.equal(restored.searchParams.get("project"), "woodhouse");
    assert.equal(restored.searchParams.get("measure"), "visits");
    assert.equal(restored.searchParams.get("view"), "share");
    const first = await payload();
    const dates = (await page.locator(".snapshot-line span").first().innerText()).trim();
    assert.match(dates, /UTC/);
    assert.match(first.caption, /visits/i);
    // An invented week cannot become a shared claim.
    assert.doesNotMatch(first.caption, /1999/);
    await page.reload();
    assert.deepEqual(await payload(), first, "reloading restores the same report identity");
    const views = page.getByRole("navigation", { name: "Report views" });
    await views.getByRole("link", { name: "Data", exact: true }).click();
    await views.getByRole("link", { name: "Share", exact: true }).click();
    assert.deepEqual(await payload(), first, "moving between task views keeps the saved report");
    await page.goBack();
    await page.goForward();
    assert.deepEqual(await payload(), first, "history navigation keeps the saved report");
    return { report: reportId, dates, week: "dropped, not claimed" };
  });

  // ---- Saved report: status and focus ----------------------------------
  await step("report.status", "report · status and focus", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(reportUrl({ view: "share" }));
    const status = page.locator("[data-report-status]");
    assert.equal(await status.getAttribute("role"), "status");
    assert.equal(await page.locator(".share-report [role=status]").count(), 1);
    const button = page.locator("[data-report-share]");
    await button.waitFor({ state: "visible", timeout: 30000 });
    await button.focus();
    const box = await button.boundingBox();
    assert.equal(box.height >= 44, true, "the share action is a full-size target on a phone");
    let escaped = false;
    for (let press = 0; press < 30; press += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() =>
        Boolean(document.activeElement?.closest(".share-report"))
      );
      if (!inside) {
        escaped = true;
        break;
      }
    }
    assert.equal(escaped, true, "focus is not trapped inside the share panel");
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      "no horizontal overflow at 390px"
    );
    await page.screenshot({ path: join(evidence, "report-share-phone.png"), fullPage: true });
    return { viewport: "390x844", focus: "leaves the panel", overflow: "none" };
  });

  // ---- Leaderboard: native share available -----------------------------
  await step("leaderboard.share.available", "leaderboard · native share available", async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(leaderboardUrl());
    assert.equal(await page.locator("[data-lb-status]").getAttribute("role"), "status");
    assert.equal(await page.locator(".lb-sharebar [role=status]").count(), 1);
    const data = await leaderboardData();
    const bytes = await fetchBytes(new URL(data.image, origin).href);
    const button = page.locator("[data-lb-share]").first();
    await reachReady(button);
    await button.click();
    await page.waitForTimeout(500);
    const calls = await shareCalls(page);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].count, 1);
    assert.equal(calls[0].type, "image/png");
    assert.equal(calls[0].name, data.filename);
    assert.equal(calls[0].size, bytes.length);
    assert.equal(calls[0].digest, digest(bytes));
    assert.equal(calls[0].text, null);
    assert.equal(calls[0].url, null);
    assert.match(await statusText("[data-lb-status]"), /image sent/i);
    return { report: leaderboardId, sha256: digest(bytes).slice(0, 16), name: calls[0].name };
  });

  // ---- Leaderboard: user cancels ---------------------------------------
  await step("leaderboard.share.cancelled", "leaderboard · user cancels", async () => {
    await page.goto(leaderboardUrl());
    const button = page.locator("[data-lb-share]").first();
    await reachReady(button);
    const before = page.url();
    const focusBefore = await activeText();
    await shareMode(page, "cancel");
    await button.click();
    await page.waitForTimeout(300);
    const status = await statusText("[data-lb-status]");
    assert.match(status, /cancelled/i);
    assert.doesNotMatch(status, /image sent/i);
    assert.equal(page.url(), before);
    const focusAfter = await activeText();
    assert.equal(
      focusAfter === focusBefore || /^BUTTON\|.*Share image/s.test(focusAfter),
      true,
      `focus moved to ${focusAfter}`
    );
    assert.doesNotMatch(focusAfter, /^P\|/);
    return { status, focus: focusAfter };
  });

  // ---- Leaderboard: no file sharing capability -------------------------
  await step("leaderboard.share.unsupported", "leaderboard · no file sharing", async () => {
    await page.goto(leaderboardUrl());
    const button = page.locator("[data-lb-share]").first();
    await reachReady(button);
    await page.evaluate(() => {
      window.__share.canShare = false;
    });
    await button.click();
    await page.waitForTimeout(500);
    const status = await statusText("[data-lb-status]");
    assert.match(status, /sharing unavailable|save a PNG/i);
    const focus = await page.evaluate(() => ({
      inImages: Boolean(document.activeElement?.closest("#share-images")),
      text: (document.activeElement?.textContent ?? "").trim().replace(/\s+/g, " ")
    }));
    assert.equal(focus.inImages, true, "focus moves to the visible downloads");
    assert.match(focus.text, /Save landscape PNG/);
    assert.equal((await shareCalls(page)).length, 0);
    return { status, focus: focus.text };
  });

  // ---- Leaderboard: the image cannot be fetched -----------------------
  await step("leaderboard.share.failure", "leaderboard · image fails to load", async () => {
    await page.route(LEADERBOARD_IMAGE, (route) =>
      route.fulfill({ status: 503, contentType: "text/plain", body: "Image unavailable." })
    );
    try {
      await page.goto(leaderboardUrl());
      await page.locator("[data-lb-share]").first().click();
      await page.waitForTimeout(1200);
      const status = await statusText("[data-lb-status]");
      assert.match(status, /didn’t load|save a PNG/i);
      const focus = await page.evaluate(() =>
        (document.activeElement?.textContent ?? "").trim().replace(/\s+/g, " ")
      );
      assert.match(focus, /Save PNG/);
      await page.unroute(LEADERBOARD_IMAGE);
      // Recovery: once the route returns, one activation shares one image.
      await page.reload();
      const button = page.locator("[data-lb-share]").first();
      await reachReady(button);
      await button.click();
      await page.waitForTimeout(500);
      assert.equal((await shareCalls(page)).length, 1, "a retried share sends one image");
      return { status, recovery: "shared after retry" };
    } finally {
      await page.unroute(LEADERBOARD_IMAGE);
    }
  });

  // ---- Leaderboard: repeated rapid activation -------------------------
  await step("leaderboard.share.repeat", "leaderboard · repeated rapid activation", async () => {
    await page.goto(leaderboardUrl());
    const button = page.locator("[data-lb-share]").first();
    await reachReady(button);
    await shareMode(page, "pending");
    await button.click();
    await button.click();
    await button.click();
    await page.waitForTimeout(250);
    const calls = await shareCalls(page);
    assert.equal(calls.length, 1, `a pending share must not start again (saw ${calls.length})`);
    const status = await statusText("[data-lb-status]");
    assert.match(
      status,
      /still finishing|still open|in progress/i,
      "the message names the running work"
    );
    assert.doesNotMatch(status, /preparing/i, "the image is already prepared");
    await releaseShare(page);
    await page.waitForTimeout(150);
    assert.equal(await denialCount(page), 0);
    return { shareCalls: calls.length, status };
  });

  // ---- Leaderboard: clipboard denied ----------------------------------
  await step("leaderboard.copy.denied", "leaderboard · clipboard denied", async () => {
    await page.goto(leaderboardUrl());
    await denyClipboard(page);
    await page.locator("[data-lb-link]").first().click();
    await page.waitForTimeout(400);
    const status = await statusText("[data-lb-status]");
    assert.match(status, /copy unavailable/i);
    assert.match(status, /saved-view link/i);
    assert.match(await activeText(), /^A\|Open this exact view/);
    return { status, alternative: "Open this exact view" };
  });

  // ---- Leaderboard: the edited caption is what copies -----------------
  await step(
    "leaderboard.caption.edit",
    "leaderboard · edited caption is what copies",
    async () => {
      await page.goto(leaderboardUrl());
      const field = page.locator("#leaderboard-caption");
      const caption = await field.inputValue();
      assert.match(caption, /\d/, "the caption carries a real figure");
      assert.doesNotMatch(
        caption,
        /https?:\/\/|\?report=/,
        "the caption is post text, not a query URL"
      );
      const edited = `${caption.split("\n")[0]} Edited by the visitor.`;
      await field.fill(edited);
      await page.locator(".lb-export-actions [data-lb-caption]").click();
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), edited);
      assert.match(await statusText("[data-lb-export-status]"), /caption copied/i);
      return { characters: edited.length };
    }
  );

  // ---- Leaderboard: downloads and the saved link ----------------------
  await step("leaderboard.download", "leaderboard · PNG downloads and saved link", async () => {
    await page.goto(leaderboardUrl());
    const data = await leaderboardData();
    const sizes = {};
    for (const [format, width, height] of [
      ["landscape", 1200, 630],
      ["square", 1080, 1080],
      ["portrait", 1080, 1350]
    ]) {
      const direct = await fetchBytes(new URL(`${data.image}&format=${format}`, origin).href);
      const pending = page.waitForEvent("download");
      await page.locator(`.lb-image-grid a[href*="format=${format}"]`).click();
      const download = await pending;
      const saved = await readFile(await download.path());
      assert.equal(isPng(saved), true, `${format} is a PNG`);
      assert.deepEqual(dimensions(saved), { width, height });
      assert.equal(digest(saved), digest(direct));
      sizes[format] = saved.length;
    }
    await page.locator("[data-lb-link]").first().click();
    await page.waitForTimeout(300);
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    const link = new URL(copied);
    assert.equal(link.origin, origin, "the copied link opens the report on this origin");
    const response = await page.request.get(link.href);
    assert.equal(response.status(), 200);
    assert.equal(new URL(response.url()).searchParams.get("report"), leaderboardId);
    // The primary Save PNG action points at the same landscape composition.
    const save = await page.locator("[data-lb-save]").getAttribute("href");
    assert.equal(save, `${data.image}&download=1`);
    return { sizes, savedLink: link.pathname };
  });

  // ---- Images: revisions and stability --------------------------------
  await step("images.revisions", "images · older revisions keep their artwork", async () => {
    const detail = {};
    const seen = new Set();
    for (const [suffix, label] of [
      ["", "1"],
      ["&v=2", "2"],
      ["&v=3", "3"]
    ]) {
      const url = `${origin}/api/leaderboard-card.png?report=${leaderboardId}&days=28&measure=merged${suffix}`;
      const first = await fetchBytes(url);
      const second = await fetchBytes(url);
      assert.equal(isPng(first), true, `revision ${label} still returns a PNG`);
      assert.equal(digest(first), digest(second), `revision ${label} is stable`);
      assert.equal(seen.has(digest(first)), false, `revision ${label} keeps its own artwork`);
      seen.add(digest(first));
      detail[`v${label}`] = digest(first).slice(0, 12);
      if (label !== "3") await writeFile(join(evidence, `leaderboard-v${label}.png`), first);
    }
    return detail;
  });

  await step("images.concurrency", "images · bounded concurrent load", async () => {
    const requests = [];
    for (let index = 0; index < 4; index += 1) {
      const format = ["landscape", "square", "portrait", "landscape"][index];
      requests.push(
        `${origin}/api/leaderboard-card.png?report=${leaderboardId}&days=${[7, 28, 90, 28][index]}&measure=${["merged", "closed", "reduction", "merged"][index]}&format=${format}&v=3`
      );
      requests.push(
        `${origin}/api/portfolio-card.png?report=${reportId}&project=woodhouse&measure=visits&format=${format}`
      );
    }
    const started = Date.now();
    const responses = await Promise.all(
      requests.map(async (url) => {
        const response = await page.request.get(url);
        return { url, status: response.status(), bytes: (await response.body()).length };
      })
    );
    assert.deepEqual(
      responses.filter((item) => item.status !== 200),
      [],
      "no 5xx under bounded concurrency"
    );
    return { requests: responses.length, elapsedMs: Date.now() - started };
  });

  // ---- Screenshots ----------------------------------------------------
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(leaderboardUrl());
  await page.screenshot({ path: join(evidence, "leaderboard-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(leaderboardUrl());
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
    "the leaderboard has no horizontal overflow at 390px"
  );
  await page.screenshot({ path: join(evidence, "leaderboard-phone.png"), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(reportUrl({ view: "share" }));
  await page.screenshot({ path: join(evidence, "report-share-desktop.png"), fullPage: true });

  return { browser, report: reportId, leaderboard: leaderboardId, results };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const stamp = new Date().toISOString().replaceAll(":", "").slice(0, 15);
  const evidence = resolve(options.evidence ?? join(root, "output/acceptance-share", stamp));
  await mkdir(evidence, { recursive: true });

  // The last complete UTC day, so every saved report and ranking is comparable.
  const through = new Date(Date.now() - DAY).toISOString().slice(0, 10);
  const { module: playwright, source, version } = await loadPlaywright(options.playwright);
  const playwrightVersion =
    version ??
    (() => {
      const directory = source.startsWith("file:") ? dirname(fileURLToPath(source)) : undefined;
      const manifest = directory ? join(directory, "package.json") : undefined;
      return manifest && existsSync(manifest)
        ? JSON.parse(readFileSync(manifest, "utf8")).version
        : "unknown";
    })();

  let server;
  let restoreDatabase;
  let origin = options.origin;
  if (!origin) {
    const port = await freePort();
    const fixture = await seedDatabase(evidence, through);
    restoreDatabase = fixture.restore;
    origin = `http://localhost:${port}`;
    console.log(`Seeded the local fixture from ${fixture.from} to ${through}; starting ${origin}…`);
    server = startServer(port, join(evidence, "dev-server.log"));
    await waitForServer(origin);
  }

  const browsers = options.browser === "both" ? ["chromium", "webkit"] : [options.browser];
  const receipt = {
    schema: "woodhouse.share-acceptance/1",
    startedAt: new Date().toISOString(),
    origin,
    through,
    playwright: { source, version: playwrightVersion },
    claims: {
      proves: "browser-level behaviour of the saved-report and leaderboard sharing paths",
      doesNotClaim: [
        "a physical iOS or Android share sheet",
        "an operating system download or gallery save",
        "a live platform unfurl or cache refresh",
        "MP taste acceptance"
      ]
    },
    runs: []
  };

  try {
    for (const name of browsers) {
      const runDirectory = join(evidence, name);
      await mkdir(runDirectory, { recursive: true });
      let browser;
      let context;
      try {
        browser = await playwright[name].launch({ headless: true });
        context = await browser.newContext({
          viewport: { width: 1440, height: 1000 },
          acceptDownloads: true,
          // WebKit rejects a clipboard permission it does not implement.
          permissions: name === "chromium" ? ["clipboard-read", "clipboard-write"] : []
        });
        await context.addInitScript(shareStub);
        const page = await context.newPage();
        const run = await runShareAcceptance(page, {
          origin,
          evidence: runDirectory,
          reportId: await discoverReport(page, origin, through),
          leaderboardId: FIXTURE_LEADERBOARD,
          browser: name
        });
        run.clipboard = await page.evaluate(() => window.__share.clipboard);
        receipt.runs.push(run);
      } catch (error) {
        // A browser that is not installed on this host is a gap in the evidence,
        // not a hidden pass: record it and keep the run's other browsers.
        receipt.runs.push({
          browser: name,
          results: [
            {
              id: `${name}.launch`,
              path: `${name} · browser could not start`,
              status: "fail",
              detail: String(error?.message ?? error).split("\n")[0]
            }
          ]
        });
      } finally {
        await context?.close().catch(() => {});
        await browser?.close().catch(() => {});
      }
    }
  } finally {
    if (server) await server.stop();
    // The fixture replaced the developer's local database. Put it back whatever
    // happened, so running the acceptance suite never costs anyone their state.
    await restoreDatabase?.();
    receipt.finishedAt = new Date().toISOString();
    const failed = receipt.runs.flatMap((run) =>
      (run.results ?? []).filter((item) => item.status !== "pass")
    );
    receipt.summary = {
      runs: receipt.runs.length,
      checks: receipt.runs.reduce((total, run) => total + (run.results?.length ?? 0), 0),
      passed: receipt.runs.reduce(
        (total, run) => total + (run.results ?? []).filter((item) => item.status === "pass").length,
        0
      ),
      failed: failed.length
    };
    await writeFile(
      join(evidence, "receipt.json"),
      JSON.stringify(receipt, null, 2) + "\n",
      "utf8"
    );
    for (const run of receipt.runs)
      for (const item of run.results)
        console.log(
          `${item.status === "pass" ? "PASS" : "FAIL"}  ${run.browser.padEnd(8)} ${item.id.padEnd(30)} ${item.status === "pass" ? item.path : `${item.path} — ${item.detail}`}`
        );
    console.log(
      `\n${receipt.summary.passed}/${receipt.summary.checks} checks passed · ${join(evidence, "receipt.json")}`
    );
    if (receipt.summary.failed) process.exitCode = 1;
  }
}

/**
 * The saved report the app itself creates for a fixed complete UTC window. The
 * runner never invents a report body: it seeds daily counters, asks the page for
 * a report, and reads the id the page published.
 */
async function discoverReport(page, origin, through) {
  const url = new URL("/activity/", origin);
  url.searchParams.set("project", "woodhouse");
  url.searchParams.set("measure", "visits");
  url.searchParams.set("from", new Date(Date.parse(through) - 29 * DAY).toISOString().slice(0, 10));
  url.searchParams.set("to", through);
  url.searchParams.set("analytics", "off");
  url.searchParams.set("qa", "1");
  await page.goto(url.href);
  const payload = JSON.parse(await page.locator("#report-sharing").textContent());
  const id = new URL(payload.image, origin).searchParams.get("report");
  assert.match(id ?? "", /^[a-f0-9]{24}$/, "the page published a saved report");
  return id;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
