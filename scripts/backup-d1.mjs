import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFile, chmod, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scriptArgs = process.argv.slice(2);
if (scriptArgs[0] === "--") scriptArgs.shift();
const [environment, ...args] = scriptArgs;
const targets = {
  preview: { database: "woodhouse-emdash-preview", id: "f5274c8f-d22e-4d63-bb0e-832e2d2b4f00" },
  production: { database: "woodhouse-emdash", id: "b62500b4-b25a-4fad-8969-eff9ba3c8efa" }
};

if (!targets[environment]) {
  throw new Error("Usage: pnpm run backup:d1 -- preview|production [--output=/path/to/backup.sql]");
}

if (
  environment === "production" &&
  process.env.WOODHOUSE_PRODUCTION_MAINTENANCE_CONFIRMED !== "yes"
) {
  throw new Error(
    "Production backup was not started. Confirm a maintenance window with WOODHOUSE_PRODUCTION_MAINTENANCE_CONFIRMED=yes after stopping writes."
  );
}

const outputArg = args.find((argument) => argument.startsWith("--output="));
const createdAt = new Date().toISOString();
const stamp = createdAt.replace(/[:.]/g, "-");
const outputPath = path.resolve(
  outputArg?.slice("--output=".length) ?? `.release/backups/${environment}/d1-${stamp}.sql`
);
const manifestPath = outputPath.replace(/\.sql$/i, ".json");
const { database, id: databaseId } = targets[environment];
if (path.extname(outputPath).toLowerCase() !== ".sql")
  throw new Error("D1 recovery dump path must end in .sql.");
const relativeOutput = path.relative(root, outputPath);
if (!relativeOutput.startsWith("..") && !relativeOutput.startsWith(`.release${path.sep}`)) {
  throw new Error(
    "D1 recovery files must be written under the ignored .release directory or outside the repository."
  );
}

function wrangler(args, { quiet = false } = {}) {
  const result = spawnSync("pnpm", ["exec", "wrangler", ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (!quiet && result.stderr) process.stderr.write(result.stderr);
    throw new Error(`Wrangler command failed: wrangler ${args.slice(0, 3).join(" ")}`);
  }
  return result.stdout;
}

function rowsFromD1(sql) {
  const output = wrangler(["d1", "execute", database, "--remote", "--json", "--command", sql]);
  const start = output.indexOf("[");
  if (start < 0) throw new Error("Wrangler did not return JSON query results.");
  const response = JSON.parse(output.slice(start));
  return response.flatMap((result) => result.results ?? []);
}

function quoteIdentifier(value) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value))
    throw new Error("Unexpected identifier in FTS metadata.");
  return `"${value.replaceAll('"', '""')}"`;
}

function valuesFromInsertTrigger(trigger) {
  const match =
    /INSERT\s+OR\s+REPLACE\s+INTO\s+"([^"]+)"\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/is.exec(
      trigger.sql
    );
  if (!match) throw new Error(`Cannot derive an FTS rebuild query for ${trigger.name}.`);
  const ftsName = match[1];
  const contentTable = trigger.tbl_name;
  if (!ftsName.startsWith("_emdash_fts_") || !contentTable.startsWith("ec_"))
    throw new Error("Unexpected EmDash FTS table mapping.");
  const insertColumns = match[2].split(",").map((column) => column.trim());
  const insertValues = match[3].split(",").map((value) => value.trim());
  if (
    insertColumns.length !== insertValues.length ||
    insertColumns[0] !== "rowid" ||
    insertValues[0] !== "NEW.rowid"
  ) {
    throw new Error(`Unexpected FTS trigger shape for ${trigger.name}.`);
  }
  const selectColumns = insertValues.map((value, index) => {
    if (index === 0) return "rowid";
    const column = /^NEW\.([A-Za-z_][A-Za-z0-9_]*)$/.exec(value)?.[1];
    if (!column || insertColumns[index] !== column)
      throw new Error(`Unexpected FTS source column in ${trigger.name}.`);
    return quoteIdentifier(column);
  });
  return {
    ftsName,
    rebuild: `INSERT INTO ${quoteIdentifier(ftsName)} (${insertColumns.map(quoteIdentifier).join(", ")}) SELECT ${selectColumns.join(", ")} FROM ${quoteIdentifier(contentTable)} WHERE deleted_at IS NULL;`
  };
}

function batches(statements, size = 40) {
  const result = [];
  let batch = "";
  for (const statement of statements) {
    if (batch.length + statement.length > size * 1024) {
      result.push(batch);
      batch = "";
    }
    batch += `${statement}\n`;
  }
  if (batch) result.push(batch);
  return result;
}

function runSql(statements) {
  for (const command of batches(statements)) {
    wrangler(["d1", "execute", database, "--remote", "--yes", "--command", command], {
      quiet: true
    });
  }
}

function restoreIndexes() {
  const existing = new Set(
    rowsFromD1(
      "SELECT name FROM sqlite_schema WHERE type='table' AND name LIKE '_emdash_fts_%' AND sql LIKE 'CREATE VIRTUAL TABLE%';"
    ).map((row) => row.name)
  );
  const create = definitions
    .filter((definition) => !existing.has(definition.name))
    .map(
      (definition) =>
        `${definition.sql.replace(/^CREATE VIRTUAL TABLE\s+/i, "CREATE VIRTUAL TABLE IF NOT EXISTS ")};`
    );
  runSql([
    ...create,
    ...definitions.map((definition) => `DELETE FROM ${quoteIdentifier(definition.name)};`),
    ...rebuilds.map((item) => item.rebuild)
  ]);
}

const definitions = rowsFromD1(
  "SELECT name, sql FROM sqlite_schema WHERE type='table' AND name LIKE '_emdash_fts_%' AND sql LIKE 'CREATE VIRTUAL TABLE%' ORDER BY name;"
);
const insertTriggers = rowsFromD1(
  "SELECT name, tbl_name, sql FROM sqlite_schema WHERE type='trigger' AND name LIKE '_emdash_fts_%_insert' ORDER BY name;"
);
const rebuilds = insertTriggers.map(valuesFromInsertTrigger);
const triggerTables = new Set(rebuilds.map((item) => item.ftsName));
if (
  definitions.some((row) => !triggerTables.has(row.name)) ||
  rebuilds.some((item) => !definitions.some((row) => row.name === item.ftsName))
) {
  throw new Error(
    "The FTS table and trigger inventory did not match; no database changes were made."
  );
}

const originalCounts = {};
for (const definition of definitions) {
  const row = rowsFromD1(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(definition.name)};`)[0];
  originalCounts[definition.name] = Number(row?.count ?? -1);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(manifestPath), { recursive: true });
if (relativeOutput.startsWith(`.release${path.sep}`)) await chmod(path.dirname(outputPath), 0o700);
let indexesDropped = false;
try {
  if (definitions.length) {
    indexesDropped = true;
    runSql(definitions.map((definition) => `DROP TABLE ${quoteIdentifier(definition.name)};`));
  }

  // Wrangler prints a one-hour signed download URL. Capture it and never echo it.
  wrangler(["d1", "export", database, "--remote", `--output=${outputPath}`], { quiet: true });
  await chmod(outputPath, 0o600);
  if ((await stat(outputPath)).size === 0) throw new Error("Wrangler produced an empty D1 export.");
} finally {
  if (indexesDropped) {
    restoreIndexes();
  }
}

const restorationSql = [
  "",
  "-- EmDash FTS5 virtual tables are omitted by Wrangler D1 export and rebuilt after import.",
  ...definitions.map((definition) => `${definition.sql};`),
  ...rebuilds.map((item) => item.rebuild)
].join("\n");
await appendFile(outputPath, `${restorationSql}\n`);

const restoredCounts = {};
for (const definition of definitions) {
  const row = rowsFromD1(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(definition.name)};`)[0];
  restoredCounts[definition.name] = Number(row?.count ?? -1);
  if (restoredCounts[definition.name] !== originalCounts[definition.name]) {
    throw new Error(
      `FTS rebuild count differs for ${definition.name}; inspect the preview before continuing.`
    );
  }
}

let timeTravelBookmark = null;
const timeTravel = spawnSync(
  "pnpm",
  ["exec", "wrangler", "d1", "time-travel", "info", database, `--timestamp=${createdAt}`, "--json"],
  {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024
  }
);
if (timeTravel.status === 0) {
  try {
    const result = JSON.parse(timeTravel.stdout);
    timeTravelBookmark = typeof result.bookmark === "string" ? result.bookmark : null;
  } catch {
    timeTravelBookmark = null;
  }
}

const sql = await readFile(outputPath);
await chmod(outputPath, 0o600);
const manifest = {
  environment,
  database,
  databaseId,
  createdAt,
  sqlDumpPath: path.relative(root, outputPath),
  bytes: sql.byteLength,
  sha256: createHash("sha256").update(sql).digest("hex"),
  ftsIndexRows: restoredCounts,
  timeTravelBookmark
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
await chmod(manifestPath, 0o600);
console.log(
  `D1 recovery dump created for ${environment}: ${manifest.sqlDumpPath} (${manifest.bytes} bytes).`
);
console.log(
  `FTS indexes were rebuilt and verified. Manifest: ${path.relative(root, manifestPath)}.`
);
if (!timeTravelBookmark)
  console.log(
    "Cloudflare did not return a Time Travel bookmark; the raw SQL dump remains available as the D1 recovery point."
  );
