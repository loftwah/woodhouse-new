// One local EmDash draft, using the real schema and renderer. Production is never
// contacted. Like acceptance-share, preserve the developer's local D1 and restore
// it after the rehearsal. Run with no other local Woodhouse server active.
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { createServer } from "node:net";
const root = process.cwd();
const cancellation = new AbortController();
let finishWaiting;
const cancel = () => {
  cancellation.abort();
  finishWaiting?.();
};
process.on("SIGINT", cancel);
process.on("SIGTERM", cancel);
const workspace = resolve(
  root,
  ".release/edition-rehearsal",
  new Date().toISOString().replace(/[:.]/g, "-")
);
await mkdir(workspace, { recursive: true, mode: 0o700 });
const run = (args) => {
  if (cancellation.signal.aborted && args.at(-1) !== "stop")
    throw Error("Local rehearsal cancelled.");
  const r = spawnSync("pnpm", args, { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0)
    throw Error(`${args.slice(0, 3).join(" ")} failed: ${r.stderr.slice(0, 500)}`);
  return r.stdout;
};
const status = run(["exec", "astro", "dev", "status"]);
if (/running at|"running":true|"pid":\s*\d+/i.test(status))
  throw Error("Stop the existing Woodhouse dev server before rehearsing.");
const port = await new Promise((resolvePort) => {
  const server = createServer();
  server.listen(0, "127.0.0.1", () => {
    const p = server.address().port;
    server.close(() => resolvePort(p));
  });
});
const directory = resolve(root, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");
if (!existsSync(directory))
  throw Error("Bootstrap local D1 once with pnpm dev, stop it, then rerun.");
const files = readdirSync(directory).filter(
  (n) => n.endsWith(".sqlite") && n !== "metadata.sqlite"
);
if (files.length !== 1)
  throw Error("Expected exactly one local D1 database; choose an isolated checkout.");
const database = resolve(directory, files[0]);
const moved = [];
let started = false;
const seed = JSON.parse(readFileSync(resolve(root, "seed/seed.json"), "utf8"));
const base = seed.content.dispatches.find((d) => d.slug === "what-we-built-2026-10-25");
const draft = structuredClone(base);
draft.id = "dispatch-edition-rehearsal";
draft.slug = "edition-rehearsal";
draft.status = "draft";
draft.data.title = "An evening kept";
draft.data.lead =
  "Draft rehearsal: a different headline for the same source-checked work. No new release is announced.";
draft.data.content.find((b) => b.project_key === "social-club").headline =
  "Keep the evening; cancel the plan";
// The fixture is created through EmDash’s real draft API after startup.
const draftData = { ...draft.data, public_safe: false };
delete draftData.projects;
await writeFile(resolve(workspace, "draft.json"), JSON.stringify(draft, null, 2) + "\n");
await writeFile(resolve(workspace, "seed.json"), JSON.stringify(seed, null, 2) + "\n");
await writeFile(resolve(workspace, "draft-data.json"), JSON.stringify(draftData, null, 2) + "\n");
try {
  for (const suffix of ["", "-wal", "-shm"]) {
    const source = database + suffix;
    if (!existsSync(source)) continue;
    const target = resolve(workspace, basename(source) + ".original");
    await rename(source, target);
    moved.push([target, source]);
  }
  run(["exec", "emdash", "init", `--database=${database}`]);
  run([
    "exec",
    "emdash",
    "seed",
    resolve(workspace, "seed.json"),
    `--database=${database}`,
    "--skip-media"
  ]);
  started = true;
  run(["exec", "astro", "dev", "--host", "127.0.0.1", "--port", String(port)]);
  const origin = `http://localhost:${port}`;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(origin, { signal: cancellation.signal });
      if (r.status < 500) break;
    } catch {
      if (cancellation.signal.aborted) throw Error("Local rehearsal cancelled.");
      // The owned dev server may still be starting; retry the local readiness read.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  const auth = await (
    await fetch(`${origin}/_emdash/api/setup/dev-bypass?token`, { signal: cancellation.signal })
  ).json();
  const token = auth.data?.token ?? auth.token;
  if (!token) throw Error("Local EmDash dev authentication unavailable");
  run([
    "exec",
    "emdash",
    "content",
    "create",
    "dispatches",
    "--draft",
    "--slug",
    "edition-rehearsal",
    "--file",
    resolve(workspace, "draft-data.json"),
    "--url",
    origin
  ]);
  const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
  const listing = await (
    await fetch(`${origin}/_emdash/api/content/dispatches?status=draft`, {
      headers,
      signal: cancellation.signal
    })
  ).json();
  await writeFile(resolve(workspace, "draft-list.json"), JSON.stringify(listing, null, 2));
  // Ask EmDash itself for the preview, rather than exposing a draft through a custom bypass.
  const previewResponse = await fetch(
    `${origin}/_emdash/api/content/dispatches/edition-rehearsal/preview-url`,
    {
      method: "POST",
      signal: cancellation.signal,
      headers,
      body: JSON.stringify({ pathPattern: "/editions/{id}/" })
    }
  );
  const preview = await previewResponse.json();
  const previewPath = preview.data?.url ?? preview.url;
  if (!previewPath) throw Error("EmDash did not return a signed preview URL");
  const url = new URL(previewPath, origin).href;
  await writeFile(
    resolve(workspace, "preview.json"),
    JSON.stringify({ origin, url, workspace }, null, 2),
    { mode: 0o600 }
  );
  console.log(`Local draft ready. Private preview file: ${workspace}/preview.json`);
  console.log("Press Enter (or send SIGINT) to stop and restore the original local D1.");
  process.stdin.resume();
  await new Promise((resolveStop) => {
    const keepAlive = setInterval(() => {}, 60000);
    const finish = () => {
      clearInterval(keepAlive);
      process.stdin.pause();
      resolveStop();
    };
    finishWaiting = finish;
    process.stdin.once("data", finish);
    if (cancellation.signal.aborted) finish();
  });
} finally {
  process.stdin.pause();
  process.removeListener("SIGINT", cancel);
  process.removeListener("SIGTERM", cancel);
  if (started) run(["exec", "astro", "dev", "stop"]);
  for (const suffix of ["", "-wal", "-shm"]) {
    if (existsSync(database + suffix))
      await rename(
        database + suffix,
        resolve(workspace, basename(database + suffix) + ".rehearsed")
      );
  }
  for (const [target, source] of moved) {
    await rm(source, { force: true });
    await rename(target, source);
  }
  console.log(
    "Original local D1 restored; the unpublished draft and rehearsal evidence remain private."
  );
}
