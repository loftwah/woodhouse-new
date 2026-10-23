import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { build } from "esbuild";

const seed = JSON.parse(readFileSync("seed/seed.json", "utf8"));
const focused = "2026-10-23-owner-journey-v1";
const bundled = await build({
  entryPoints: ["src/content/repository.ts"],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "node",
  plugins: [
    {
      name: "cms-fixture",
      setup(plugin) {
        plugin.onResolve({ filter: /^emdash$/ }, () => ({ path: "cms", namespace: "fixture" }));
        plugin.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents: `
        export const decodeSlug = value => value;
        export const getEmDashCollection = (collection, filter) => globalThis.readCollection(collection, filter);
        export const getEmDashEntry = (collection, slug) => globalThis.readEntry(collection, slug);
        export const getMenuWithCacheHint = async () => ({ items: [], cacheHint: {} });
      `
        }));
      }
    }
  ]
});

test("same-day current project reads agree across dossier and portfolio regardless of seed order", async () => {
  for (const reverse of [false, true]) {
    const db = new DatabaseSync(":memory:");
    try {
      db.exec(
        "CREATE TABLE entries(collection TEXT,slug TEXT,data TEXT,reviewed_at TEXT,sort_order INTEGER,name TEXT,project_key TEXT)"
      );
      for (const [collection, entries] of Object.entries(seed.content)) {
        for (const item of reverse ? [...(entries as never[])].reverse() : (entries as never[])) {
          const entry = item as { slug: string; status: string; data: Record<string, unknown> };
          if (entry.status !== "published") continue;
          db.prepare("INSERT INTO entries VALUES(?,?,?,?,?,?,?)").run(
            collection,
            entry.slug,
            JSON.stringify(entry.data),
            String(entry.data.reviewed_at ?? ""),
            Number(entry.data.sort_order ?? 0),
            String(entry.data.name ?? ""),
            String(entry.data.project_key ?? "")
          );
        }
      }
      const unpack = (row: { slug: string; data: string }) => ({
        id: row.slug,
        data: JSON.parse(row.data),
        edit: {}
      });
      const module = { exports: {} as Record<string, (...args: unknown[]) => Promise<unknown>> };
      runInNewContext(bundled.outputFiles[0]!.text, {
        module,
        exports: module.exports,
        crypto,
        TextEncoder,
        URL,
        readCollection(
          collection: string,
          filter: {
            where?: { project_key?: string };
            orderBy: Record<string, string>;
            limit: number;
          }
        ) {
          // The installed EmDash loader applies every valid orderBy field in SQL.
          // Exercise that actual query contract over the real seeded same-day rows.
          const order = Object.entries(filter.orderBy)
            .map(([key, direction]) => {
              assert(["name", "reviewed_at", "sort_order"].includes(key));
              assert(["asc", "desc"].includes(direction));
              return `${key} ${direction}`;
            })
            .join(",");
          const rows = filter.where?.project_key
            ? db
                .prepare(
                  `SELECT slug,data FROM entries WHERE collection=? AND project_key=? ORDER BY ${order} LIMIT ?`
                )
                .all(collection, filter.where.project_key, filter.limit)
            : db
                .prepare(
                  `SELECT slug,data FROM entries WHERE collection=? ORDER BY ${order} LIMIT ?`
                )
                .all(collection, filter.limit);
          return {
            entries: rows.map((row) => unpack(row as { slug: string; data: string })),
            cacheHint: {}
          };
        },
        readEntry(collection: string, slug: string) {
          const row = db
            .prepare("SELECT slug,data FROM entries WHERE collection=? AND slug=?")
            .get(collection, slug);
          return {
            entry: row ? unpack(row as { slug: string; data: string }) : null,
            cacheHint: {},
            isPreview: false
          };
        }
      });
      const detail = (await module.exports.getProjectRecord!("app-composer")) as {
        project: { statusId: string; snapshotId: string; current: string };
      };
      const listing = (await module.exports.listProjectRecords!()) as {
        projects: { slug: string; statusId: string; snapshotId: string; current: string }[];
      };
      const composer = listing.projects.find((project) => project.slug === "app-composer")!;
      for (const project of [detail.project, composer]) {
        assert.equal(project.statusId, "app-composer-2026-10-23-atlas-owner-v1");
        assert.equal(project.snapshotId, "2026-10-23-atlas-owner-v1");
        assert.match(project.current, /supported title update.*standing policy/);
      }
      assert.equal(
        listing.projects.find((project) => project.slug === "shoalshot")!.snapshotId,
        "2026-10-19"
      );
    } finally {
      db.close();
    }
  }
});

test("the focused review preserves historical scope, unique page titles and only its own evidence links", () => {
  const snapshots = seed.content.factory_snapshots;
  const statuses = seed.content.project_statuses;
  assert.equal(
    new Set(snapshots.map((entry: { data: { title: string } }) => entry.data.title)).size,
    snapshots.length
  );
  const old = snapshots.find((entry: { slug: string }) => entry.slug === "2026-10-23");
  assert.match(old.data.editorial_notes, /local fictional run is not a hosted deployment/);
  const current = statuses.find(
    (entry: { slug: string }) => entry.slug === "app-composer-" + focused
  );
  assert.notEqual(
    current.data.state,
    statuses.find((entry: { slug: string }) => entry.slug === "app-composer-2026-10-23").data.state
  );
  assert.match(current.data.proof_boundary, /no featuring occurred/);
  const moved = seed.content.evidence_records.filter(
    (entry: { data: { snapshot_key: string } }) => entry.data.snapshot_key === focused
  );
  assert.deepEqual(moved.map((entry: { slug: string }) => entry.slug).sort(), [
    "app-composer-owner-notes-2026-10-23",
    "shoalshot-encounter-art-2026-10-23"
  ]);
});
