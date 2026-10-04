// Applies seed/seed.json to a remote D1 database.
//
// EmDash has no command that can put the content model into a remote database:
// `emdash seed` writes a local SQLite file, the runtime auto-seed gate is shut
// once `emdash:seed_complete` is set, `emdash schema add-field` accepts only
// `--type`, `--label` and `--required`, and `emdash site import` refuses a site
// that already holds content. That left the first production deploy of the
// EmDash build impossible: the deploy gate wants the reviewed model in
// production, and nothing could put it there.
//
// EmDash's documented answer for moving a whole database is a SQL file: export
// one D1 and execute it into another. This script produces that SQL from the
// reviewed seed, so a remote environment converges on exactly the state a fresh
// database bootstraps from seed/seed.json. Nothing is copied from another
// environment, so one can never inherit another's users, sessions, plugin state
// or editor drafts.
//
// EmDash owns the schema it produces. This script only runs `emdash init` and
// `emdash seed` against a throwaway SQLite file, reads that result back and
// replays it. It never hand-writes a collection, field, column or trigger, so
// it cannot drift from what EmDash itself would build.
//
// Deliberately not copied, because they describe an environment rather than the
// content model: users, credentials, sessions, API and OAuth tokens, rate
// limits, entry locks, audit logs, media, revisions, plugin storage, core
// migration records, and every `options` row that is not a `site:` setting from
// the seed. Setup and scheduler state stay per environment so each one runs its
// own setup wizard and its own cron.
//
// Replay order matters and is fixed by EmDash's own foreign keys: a table's
// statements are never split across requests, so a parent is always committed
// before its children. Search indexes are created before the rows and filled by
// an explicit rebuild afterwards, so the index never depends on trigger timing.
//
// Usage:
//   pnpm run emdash:seed:remote -- preview|production [--dry-run] [--output=path]

import { createHash } from "node:crypto";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { verifyDatabaseReadiness } from "./deployment-readiness.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
if (args[0] === "--") args.shift();
const environment = args[0];
const dryRun = args.includes("--dry-run");
const outputArgument = args.find((argument) => argument.startsWith("--output="));
const seed = JSON.parse(await readFile(path.join(root, "seed/seed.json"), "utf8"));

const ENVIRONMENTS = {
  preview: { database: "woodhouse-emdash-preview", confirmation: "preview" },
  production: { database: "woodhouse-emdash", confirmation: "production" }
};
const target = ENVIRONMENTS[environment];
if (!target)
  throw new Error("Usage: pnpm run emdash:seed:remote -- preview|production [--dry-run]");

const COLLECTION_TABLES = seed.collections.map((collection) => `ec_${collection.slug}`);
// Every table whose rows come from the seed, in an order that puts a parent
// before anything that references it. The delete order is its reverse.
// `revisions` belongs here: a published entry points at the revision it was
// published from, so the revision has to travel with the entry.
const INSERT_ORDER = [
  "_emdash_block_types",
  "_emdash_block_type_versions",
  "_emdash_collections",
  "_emdash_fields",
  "_emdash_relations",
  "_emdash_sections",
  "_emdash_widget_areas",
  "_emdash_widgets",
  "_emdash_menus",
  "_emdash_menu_items",
  "_emdash_taxonomy_defs",
  "_emdash_taxonomy_def_groups",
  "taxonomies",
  "_emdash_bylines",
  "_emdash_byline_fields",
  "_emdash_byline_field_values",
  "_emdash_byline_field_group_values",
  "_emdash_redirects",
  "revisions",
  ...COLLECTION_TABLES,
  "_emdash_seo",
  "_emdash_content_bylines",
  "_emdash_content_references",
  "content_taxonomies"
];

function fail(message) {
  console.error("Content model not applied: " + message);
  process.exit(1);
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${command} ${commandArgs.slice(0, 2).join(" ")} failed.`);
  }
  return result.stdout ?? "";
}

function localQuery(database, sql) {
  const output = run("sqlite3", ["-json", database, sql], { stdio: ["ignore", "pipe", "pipe"] });
  const trimmed = output.trim();
  return trimmed ? JSON.parse(trimmed) : [];
}

function remoteQuery(database, sql) {
  const output = run("pnpm", [
    "exec",
    "wrangler",
    "d1",
    "execute",
    database,
    "--remote",
    "--json",
    "--command",
    sql
  ]);
  const offset = output.search(/[[{]/);
  if (offset < 0) throw new Error("Wrangler did not return JSON query results.");
  const parsed = JSON.parse(output.slice(offset));
  const batches = Array.isArray(parsed) ? parsed : [parsed];
  return batches.flatMap((batch) => batch.results ?? []);
}

function quoteIdentifier(value) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value))
    throw new Error(`Unexpected identifier in the content model: ${value}`);
  return `"${value}"`;
}

function quoteLiteral(value, where) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Non-finite number in ${where}.`);
    return String(value);
  }
  if (typeof value !== "string") throw new Error(`Unsupported value type in ${where}.`);
  if (value.includes("\u0000")) throw new Error(`NUL byte in ${where}.`);
  return "'" + value.replaceAll("'", "''") + "'";
}

// ---------------------------------------------------------------------------
// 1. Build the reviewed model locally with EmDash's own tooling.
// ---------------------------------------------------------------------------

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const workspace = path.join(root, ".release/content-model", `${environment}-${stamp}`);
const modelDatabase = path.join(workspace, "model.db");

await mkdir(workspace, { recursive: true, mode: 0o700 });
await chmod(workspace, 0o700);
run("pnpm", ["exec", "emdash", "init", `--database=${modelDatabase}`, "--force"], {
  stdio: ["ignore", "ignore", "inherit"]
});
run("pnpm", [
  "exec",
  "emdash",
  "seed",
  `--database=${modelDatabase}`,
  path.join(root, "seed/seed.json")
]);

const canonicalTables = new Map(
  localQuery(
    modelDatabase,
    "SELECT name, sql FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).map((row) => [row.name, row.sql])
);
for (const name of INSERT_ORDER) {
  if (!canonicalTables.has(name)) throw new Error(`EmDash did not create ${name} from the seed.`);
}
// Only collections that enable search get an index, so the set is read back from
// EmDash rather than assumed.
const FTS_TABLES = localQuery(
  modelDatabase,
  "SELECT name FROM sqlite_schema WHERE type='table' AND sql LIKE 'CREATE VIRTUAL TABLE%' " +
    "AND name LIKE '\\_emdash\\_fts\\_%' ESCAPE '\\' ORDER BY name"
).map((row) => row.name);
const SEARCHABLE = FTS_TABLES.map((table) => table.slice("_emdash_fts_".length));

// ---------------------------------------------------------------------------
// 2. Read the canonical model back and turn it into replayable statements.
// ---------------------------------------------------------------------------

const columnCache = new Map();
function columnsOf(table) {
  if (!columnCache.has(table))
    columnCache.set(
      table,
      localQuery(modelDatabase, `PRAGMA table_info(${quoteIdentifier(table)})`).map(
        (column) => column.name
      )
    );
  return columnCache.get(table);
}

function insertStatements(table, rows) {
  if (!rows.length) return [];
  const columns = columnsOf(table);
  if (!columns.length) throw new Error(`No columns for ${table}.`);
  const prefix = `INSERT INTO ${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(", ")}) VALUES `;
  return rows.map(
    (row) =>
      prefix +
      "(" +
      columns.map((column) => quoteLiteral(row[column], `${table}.${column}`)).join(", ") +
      ");"
  );
}

// FTS5 tables cannot be replayed from a dump, because the dump writes them into
// sqlite_schema directly. Replay the CREATE VIRTUAL TABLE statement EmDash wrote
// and fill the index afterwards from the content table.
function ftsCreate(table) {
  const sql = canonicalTables.get(table);
  if (!/^\s*CREATE VIRTUAL TABLE/i.test(sql)) throw new Error(`${table} is not a virtual table.`);
  return sql.replace(/^\s*CREATE VIRTUAL TABLE/i, "CREATE VIRTUAL TABLE IF NOT EXISTS") + ";";
}

// The rebuild query is read off EmDash's own insert trigger, so the indexed
// columns always match what EmDash maintains at runtime.
function ftsRebuild(slug) {
  const ftsTable = `_emdash_fts_${slug}`;
  const contentTable = `ec_${slug}`;
  const trigger = localQuery(
    modelDatabase,
    `SELECT sql FROM sqlite_schema WHERE type='trigger' AND tbl_name='ec_${slug}' ` +
      `AND instr(sql, '${ftsTable}') > 0 AND instr(sql, 'INSERT') > 0`
  )[0];
  if (!trigger) throw new Error(`EmDash created no FTS insert trigger for ${slug}.`);
  const match =
    /INSERT\s+OR\s+REPLACE\s+INTO\s+"?(\w+)"?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/is.exec(
      trigger.sql
    );
  if (!match || match[1] !== ftsTable)
    throw new Error(`Cannot read the ${ftsTable} insert trigger.`);
  const insertColumns = match[2].split(",").map((column) => column.trim().replaceAll('"', ""));
  const insertValues = match[3].split(",").map((value) => value.trim());
  const selectColumns = insertValues.map((value, index) => {
    if (index === 0) return "rowid";
    const column = /^NEW\."?(\w+)"?$/.exec(value)?.[1];
    if (!column || insertColumns[index] !== column)
      throw new Error(`Unexpected ${ftsTable} source column.`);
    return quoteIdentifier(column);
  });
  const indexed = insertColumns.map(quoteIdentifier).join(", ");
  const columns = selectColumns.join(", ");
  return [
    `DELETE FROM ${quoteIdentifier(ftsTable)};`,
    `INSERT INTO ${quoteIdentifier(ftsTable)} (${indexed}) SELECT ${columns} ` +
      `FROM ${quoteIdentifier(contentTable)} WHERE deleted_at IS NULL;`
  ];
}

function objectStatementsFor(table) {
  return localQuery(
    modelDatabase,
    "SELECT type, name, sql FROM sqlite_schema WHERE type IN ('index','trigger') " +
      `AND sql IS NOT NULL AND tbl_name='${table}' ORDER BY type, name`
  ).map((row) => row.sql + ";");
}

// A row that points outside the replayed tables cannot be delivered: its parent
// belongs to an environment, not to the content model. Catch it here, where the
// fix is still to correct the seed, rather than as a foreign-key failure halfway
// through a remote write.
const replayed = new Set(INSERT_ORDER);
for (const table of INSERT_ORDER) {
  for (const foreignKey of localQuery(
    modelDatabase,
    `PRAGMA foreign_key_list(${quoteIdentifier(table)})`
  )) {
    if (replayed.has(foreignKey.table)) continue;
    const column = foreignKey.from;
    if (!columnsOf(foreignKey.table).includes("id"))
      fail(`${table}.${column} points at ${foreignKey.table}, which this script cannot replay.`);
    const orphans = localQuery(
      modelDatabase,
      `SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)} WHERE ${quoteIdentifier(column)} IS NOT NULL ` +
        `AND NOT EXISTS (SELECT 1 FROM ${quoteIdentifier(foreignKey.table)} WHERE id = ${quoteIdentifier(table)}.${quoteIdentifier(column)})`
    );
    if (Number(orphans[0]?.count ?? 0) > 0)
      fail(
        `${table}.${column} points at ${foreignKey.table}, which this script does not replay. ` +
          "Reference an environment-owned record from an editorial field instead."
      );
  }
}

// ---------------------------------------------------------------------------
// 3. Read the remote database and decide what it actually needs.
// ---------------------------------------------------------------------------

const remoteTables = new Map(
  remoteQuery(
    target.database,
    "SELECT name, sql FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).map((row) => [row.name, row.sql])
);
const seedCollections = seed.collections.map((collection) => collection.slug);
const unknownCollections = remoteQuery(target.database, "SELECT slug FROM _emdash_collections")
  .map((row) => row.slug)
  .filter((slug) => !seedCollections.includes(slug));
if (unknownCollections.length)
  fail(
    "the database holds collections that seed/seed.json does not describe (" +
      unknownCollections.join(", ") +
      "). This script replaces the Woodhouse model; it does not delete content the seed never created."
  );

// A statement group is applied whole, so nothing EmDash relates by a foreign key
// can be split across two requests.
const groups = [];
const group = (label, statements) => {
  const kept = (Array.isArray(statements) ? statements : [statements]).filter(Boolean);
  if (kept.length) groups.push({ label, statements: kept });
};

const report = {
  createTables: [],
  replaceTables: [],
  maintainedObjects: [],
  replayedRows: [],
  rebuildIndexes: SEARCHABLE
};

// A stale table can only be replaced when it holds nothing the seed cannot
// account for. EmDash's own content tables are always safe: the rows are the
// seed's, and the script has just proved the collections all are.
for (const table of COLLECTION_TABLES) {
  const remoteSql = remoteTables.get(table);
  const canonicalSql = canonicalTables.get(table);
  if (!remoteSql) {
    report.createTables.push(table);
    group(`create ${table}`, canonicalSql + ";");
    continue;
  }
  if (remoteSql === canonicalSql) continue;
  const rows = remoteQuery(
    target.database,
    `SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`
  );
  if (Number(rows[0]?.count ?? -1) !== 0)
    fail(`${table} exists with a different layout and holds rows; nothing was changed.`);
  report.replaceTables.push(table);
  group(`replace ${table}`, [`DROP TABLE ${quoteIdentifier(table)};`, canonicalSql + ";"]);
}

// This converges an environment onto the seed, so it must never silently discard
// entries the seed does not describe. EmDash assigns its own record ids on every
// seed run, so the stable key is the slug: an environment may hold any state of a
// seeded entry, and nothing else. A draft, a schedule or a trashed entry is real
// editorial work and belongs in EmDash, not in this script.
for (const table of COLLECTION_TABLES) {
  if (!remoteTables.has(table)) continue;
  const remoteEntries = remoteQuery(
    target.database,
    `SELECT slug, status, deleted_at FROM ${quoteIdentifier(table)}`
  );
  if (!remoteEntries.length) continue;
  const seeded = new Set(
    localQuery(modelDatabase, `SELECT slug FROM ${quoteIdentifier(table)}`).map((row) => row.slug)
  );
  const unseeded = remoteEntries.filter((entry) => !seeded.has(entry.slug));
  if (unseeded.length)
    fail(
      `${table} holds ${unseeded.length} entr${unseeded.length === 1 ? "y" : "ies"} the seed does not ` +
        "describe. This script installs the reviewed model; it does not edit a live environment's content."
    );
  const unpublished = remoteEntries.filter(
    (entry) => entry.status !== "published" || entry.deleted_at !== null
  );
  if (unpublished.length)
    fail(
      `${table} holds ${unpublished.length} unpublished, scheduled or trashed ` +
        `entr${unpublished.length === 1 ? "y" : "ies"}. Publish or remove them in EmDash first; ` +
        "this script only reinstalls the published, reviewed record."
    );
}

// Recreate every search index from EmDash's own definition. Dropping the
// virtual table removes its shadow tables, so any trigger still pointing at it
// has to go first or the next content write would fail.
for (const table of FTS_TABLES) {
  const dependents = remoteQuery(
    target.database,
    `SELECT name FROM sqlite_schema WHERE type='trigger' AND instr(sql, '${table}') > 0`
  ).map((row) => row.name);
  group(`create ${table}`, [
    ...dependents.map((name) => `DROP TRIGGER IF EXISTS ${quoteIdentifier(name)};`),
    `DROP TABLE IF EXISTS ${quoteIdentifier(table)};`,
    ftsCreate(table)
  ]);
}

// Remove the rows the seed owns, newest relationship first.
for (const table of [...INSERT_ORDER].reverse()) {
  if (!remoteTables.has(table)) continue;
  group(`clear ${table}`, `DELETE FROM ${quoteIdentifier(table)};`);
}
for (const table of INSERT_ORDER) {
  const rows = localQuery(modelDatabase, `SELECT * FROM ${quoteIdentifier(table)}`);
  if (rows.length) report.replayedRows.push({ table, rows: rows.length });
  group(`replay ${table}`, insertStatements(table, rows));
}

// Site settings come from the seed, except the origin: each environment records
// its own address during setup, and `site:url` is only the seed's default.
const siteSettings = localQuery(
  modelDatabase,
  "SELECT name, value, revision FROM options WHERE name LIKE 'site:%' AND name <> 'site:url' " +
    "ORDER BY name"
).concat([{ name: "emdash:seed_complete", value: "true", revision: "content-model" }]);
group(
  "replay options",
  insertStatements("options", siteSettings).map((statement) =>
    statement.replace(/^INSERT INTO/, "INSERT OR REPLACE INTO")
  )
);
group(
  "clear superseded site settings",
  "DELETE FROM options WHERE name LIKE 'site:%' AND name <> 'site:url';"
);

// Indexes and triggers are recreated after the rows, from EmDash's definitions,
// so a search index is filled by the rebuild below rather than by trigger order.
for (const table of COLLECTION_TABLES) {
  const objects = objectStatementsFor(table);
  const existing = remoteQuery(
    target.database,
    `SELECT type, name FROM sqlite_schema WHERE type IN ('index','trigger') ` +
      `AND sql IS NOT NULL AND tbl_name='${table}' ORDER BY type, name`
  );
  // Drop every explicit object on the table first. A CREATE TRIGGER has no
  // IF NOT EXISTS, and EmDash writes its CREATE INDEX statements without one
  // either, so the create half of this group is only safe once the drop half ran.
  group(`maintain ${table}`, [
    ...existing.map(
      (object) => `DROP ${object.type.toUpperCase()} IF EXISTS ${quoteIdentifier(object.name)};`
    ),
    ...objects.map((sql) => sql.replace(/^(CREATE (?:UNIQUE )?INDEX)\s+/i, "$1 IF NOT EXISTS "))
  ]);
  report.maintainedObjects.push(...existing.map((object) => object.name));
}

for (const slug of SEARCHABLE) group(`reindex ${slug}`, ftsRebuild(slug));

// ---------------------------------------------------------------------------
// 4. Report the plan, then apply it only when it is confirmed.
// ---------------------------------------------------------------------------

const statements = groups.flatMap((entry) => entry.statements);
const script = ["PRAGMA defer_foreign_keys=on;", ...statements].join("\n");
const releaseRoot = path.join(root, ".release") + path.sep;
const sqlPath = path.resolve(
  outputArgument?.slice("--output=".length) ?? path.join(workspace, "content-model.sql")
);
if (!sqlPath.startsWith(releaseRoot))
  throw new Error("The generated SQL must be written under the ignored .release directory.");
await writeFile(sqlPath, script + "\n", { mode: 0o600 });
await chmod(sqlPath, 0o600);

const scriptDigest = createHash("sha256").update(script).digest("hex");
console.log(`Content model built from seed/seed.json for ${environment} (${target.database}).`);
console.log(`  tables created: ${report.createTables.join(", ") || "none"}`);
console.log(`  tables replaced: ${report.replaceTables.join(", ") || "none"}`);
console.log(
  `  rows replayed: ${report.replayedRows.reduce((sum, entry) => sum + entry.rows, 0)} across ${report.replayedRows.length} tables`
);
console.log(`  search indexes rebuilt: ${report.rebuildIndexes.join(", ") || "none"}`);
console.log(`  SQL: ${path.relative(root, sqlPath)} (sha256:${scriptDigest})`);

if (dryRun) {
  console.log("\nDry run: nothing was written to the remote database.");
  await rm(modelDatabase, { force: true });
  process.exit(0);
}

// Writing to a remote database is a production change, so it is never implicit.
if (process.env.WOODHOUSE_CONTENT_MODEL_CONFIRMED !== target.confirmation)
  fail(
    `set WOODHOUSE_CONTENT_MODEL_CONFIRMED=${target.confirmation} to write to ${target.database}, ` +
      "or rerun with --dry-run to inspect the plan."
  );

// Record a recovery point before writing. D1 Time Travel is the documented
// remote rollback mechanism, so the manifest carries the point the write
// started from.
const appliedAt = new Date().toISOString();
const timeTravel = (() => {
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "d1",
      "time-travel",
      "info",
      target.database,
      `--timestamp=${appliedAt}`,
      "--json"
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }
  );
  if (result.status !== 0) return null;
  try {
    const parsed = JSON.parse(result.stdout);
    return typeof parsed.bookmark === "string" ? parsed.bookmark : null;
  } catch {
    return null;
  }
})();

function requests() {
  const result = [];
  let batch = [];
  for (const entry of groups) {
    if (batch.length && batch.length + entry.statements.length > 40) {
      result.push(batch);
      batch = [];
    }
    batch.push(...entry.statements);
  }
  if (batch.length) result.push(batch);
  return result;
}

for (const [index, batch] of requests().entries()) {
  const file = path.join(workspace, `request-${String(index + 1).padStart(3, "0")}.sql`);
  await writeFile(file, ["PRAGMA defer_foreign_keys=on;", ...batch].join("\n") + "\n", {
    mode: 0o600
  });
  run("pnpm", [
    "exec",
    "wrangler",
    "d1",
    "execute",
    target.database,
    "--remote",
    "--yes",
    `--file=${file}`
  ]);
  console.log(`  applied request ${index + 1}`);
}

const readiness = verifyDatabaseReadiness(target.database, seed);
const manifestPath = path.join(workspace, "manifest.json");
await writeFile(
  manifestPath,
  JSON.stringify(
    {
      environment,
      database: target.database,
      seedSha256: createHash("sha256")
        .update(await readFile(path.join(root, "seed/seed.json")))
        .digest("hex"),
      appliedAt,
      recoveryBookmark: timeTravel,
      sqlPath: path.relative(root, sqlPath),
      sqlSha256: scriptDigest,
      statements: statements.length,
      report,
      verified: readiness
    },
    null,
    2
  ) + "\n",
  { mode: 0o600 }
);

if (!readiness.ready) {
  fail(
    "the remote database does not match the reviewed schema after the write: " +
      readiness.errors.join("; ") +
      ". Restore with the D1 Time Travel bookmark recorded in " +
      path.relative(root, manifestPath) +
      "."
  );
}
console.log(
  `Verified ${target.database}: ${readiness.collectionsVerified} collections, ` +
    `${readiness.referencesVerified} relations, published public-safe records ` +
    `${JSON.stringify(readiness.starterContent)}.`
);
if (!timeTravel)
  console.log(
    "Cloudflare returned no Time Travel bookmark; the generated SQL is the recovery record."
  );
