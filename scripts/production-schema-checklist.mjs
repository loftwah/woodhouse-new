// Emits an exact, ordered production setup checklist from seed/seed.json.
//
// The production content model cannot be created by any available command:
// the runtime auto-seed gate is shut, `emdash schema add-field` accepts only
// --type/--label/--required, `emdash menu` is list/get only,
// `emdash seed --database` takes a local SQLite file, and `emdash site import`
// requires an empty site. So the model has to be entered by hand in EmDash
// Office. This script turns that manual work into transcription by printing
// every collection, field, relation, block type, taxonomy, menu, byline,
// setting and starter record with its exact value.
//
// It is read-only. It reads seed/seed.json and writes Markdown to stdout. It
// never contacts a Worker and never writes to the database.

import { readFile } from "node:fs/promises";
import path from "node:path";

const seed = JSON.parse(await readFile(path.join(process.cwd(), "seed/seed.json"), "utf8"));

const out = [];
const say = (line = "") => out.push(line);
const code = (value) =>
  value === undefined || value === null ? "—" : `\`${JSON.stringify(value)}\``;

// `emdash schema add-field` can set only these. Everything else has to be
// entered in Office, so the checklist calls it out separately rather than
// letting an operator believe the default CLI output is equivalent.
const CLI_EXPRESSIBLE = new Set(["slug", "label", "type", "required"]);
const DESCRIPTIVE = new Set(["id", "description", "hint", "helpText", "placeholder", "group"]);

function officeOnly(field) {
  const extras = [];
  for (const key of [
    "defaultValue",
    "validation",
    "options",
    "searchable",
    "indexed",
    "translatable",
    "unique",
    "localized",
    "widget"
  ]) {
    if (field[key] !== undefined) extras.push(`${key} \`${JSON.stringify(field[key])}\``);
  }
  const unhandled = Object.keys(field).filter(
    (key) => !CLI_EXPRESSIBLE.has(key) && !DESCRIPTIVE.has(key) && field[key] !== undefined
  );
  return { extras, unhandled };
}

say("# Woodhouse production setup checklist");
say();
say(
  `Generated from \`seed/seed.json\` — seed version ${code(seed.version)}, default locale ${code(seed.defaultLocale)}.`
);
say("Regenerate rather than editing: `pnpm run schema:checklist`.");
say();
say("Production does not hold this content model yet, and no available command");
say("can apply it: the runtime auto-seed gate is shut, `emdash schema add-field`");
say("accepts only `--type`, `--label` and `--required`, `emdash menu` is list/get");
say("only, `emdash seed --database` takes a local SQLite file, and");
say("`emdash site import` refuses a site that already has content. The model must");
say("be entered in EmDash Office.");
say();
say("**Order matters.** Block types first, because collections reference them.");
say("Then relations, then menus and taxonomies, then the starter records.");
say();
say("Two columns matter below. *CLI* is what `emdash schema add-field` can set.");
say("*Office only* is everything it cannot, which includes every default value and");
say("every validation rule. A record created with the CLI alone will not match");
say("`seed/seed.json` and `verify:content` will report the difference.");
say();

say("## 1. Block types");
say();
say(`${seed.blockTypes.length} block types. Create each with its versioned field set.`);
say();
for (const block of seed.blockTypes) {
  const current =
    (block.versions ?? []).find((version) => version.version === block.currentVersion) ??
    (block.versions ?? [])[0];
  say(`### \`${block.slug}\` — ${code(block.label)}`);
  say(`- current version: ${code(block.currentVersion ?? current?.version)}`);
  const fields = current?.fields ?? [];
  say(`- fields (${fields.length}):`);
  for (const field of fields) {
    say(
      `  - \`${field.slug}\` — ${code(field.type)}${field.required ? ", required" : ""}${field.label ? `, label ${code(field.label)}` : ""}`
    );
  }
  say();
}

say("## 2. Collections");
say();
for (const collection of seed.collections) {
  const fields = collection.fields ?? [];
  const required = fields.filter((field) => field.required).length;
  say(`### \`${collection.slug}\` — ${collection.label}`);
  say(`- singular: ${code(collection.labelSingular)}`);
  if (collection.description) say(`- description: ${code(collection.description)}`);
  say(`- ${fields.length} fields, ${required} required`);
  say();
  say("| Field | Type | Required | Office only |");
  say("| --- | --- | --- | --- |");
  for (const field of fields) {
    const { extras } = officeOnly(field);
    say(
      `| \`${field.slug}\` | \`${field.type}\` | ${field.required ? "yes" : "no"} | ${extras.length ? extras.join("<br>") : "—"} |`
    );
  }
  say();
}

say("## 3. Relations");
say();
say(`${seed.relations.length} relations. Each names a parent and a child collection.`);
say();
say("| Relation | Parent | Child | Parent label | Child label | Max children |");
say("| --- | --- | --- | --- | --- | --- |");
for (const relation of seed.relations ?? []) {
  say(
    `| \`${relation.slug}\` | \`${relation.parentCollection}\` | \`${relation.childCollection}\` | ${code(relation.parentLabel)} | ${code(relation.childLabel)} | ${relation.maxChildrenPerParent ?? "—"} |`
  );
}
say();

say("## 4. Taxonomy");
say();
for (const taxonomy of seed.taxonomies ?? []) {
  say(`### \`${taxonomy.name}\` — ${code(taxonomy.label)}`);
  say(`- singular: ${code(taxonomy.labelSingular)}`);
  say(`- hierarchical: ${taxonomy.hierarchical === true ? "yes" : "no"}`);
  say(
    `- applies to: ${(taxonomy.collections ?? []).map((value) => `\`${value}\``).join(", ") || "—"}`
  );
  say(`- terms (${(taxonomy.terms ?? []).length}):`);
  for (const term of taxonomy.terms ?? []) say(`  - \`${term.slug}\` — ${code(term.label)}`);
  say();
}

say("## 5. Menus");
say();
say(
  `${(seed.menus ?? []).length} menus. These are Office-only; \`emdash menu\` cannot create them.`
);
say();
for (const menu of seed.menus ?? []) {
  say(`### \`${menu.name}\` — ${code(menu.label)}`);
  const items = menu.items ?? [];
  say(`${items.length} item(s):`);
  for (const item of items) {
    const target = item.url ?? `(${item.type})`;
    say(`- ${code(item.label)} → ${code(target)}`);
    for (const child of item.children ?? [])
      say(`  - ${code(child.label)} → ${code(child.url ?? child.type)}`);
  }
  say();
}

say("## 6. Bylines");
say();
for (const byline of seed.bylines ?? []) {
  say(
    `- \`${byline.slug}\` — ${code(byline.displayName)}${byline.bio ? `, bio ${code(byline.bio)}` : ""}${byline.websiteUrl ? `, ${code(byline.websiteUrl)}` : ""}`
  );
}
say();

say("## 7. Starter records");
say();
const total = Object.values(seed.content ?? {}).reduce((sum, entries) => sum + entries.length, 0);
say(
  `${total} records across ${Object.keys(seed.content ?? {}).length} collections. Each must exist in production with its reviewed values.`
);
say();
for (const [collection, entries] of Object.entries(seed.content ?? {})) {
  say(`### \`${collection}\` — ${entries.length} record(s)`);
  for (const entry of entries) {
    say(`- \`${entry.slug}\` — status ${code(entry.status)}, id ${code(entry.id)}`);
    const data = entry.data ?? {};
    const filled = Object.entries(data).filter(
      ([, value]) => value !== null && value !== undefined && value !== ""
    );
    say(
      `  - fields set: ${filled.length} (${filled.map(([key]) => `\`${key}\``).join(", ") || "none"})`
    );
  }
  say();
}

say("## 8. Site settings");
say();
for (const [key, value] of Object.entries(seed.settings ?? {})) {
  say(`- \`${key}\` = ${code(value)}`);
}
say();

say("## Verify when finished");
say();
say("```sh");
say("pnpm run verify:content -- production   # read-only; compares live D1 to seed/seed.json");
say("pnpm run release:status");
say("```");
say();
say("Production is not changed by this script or by `verify:content`. Applying");
say("the model to production is a separate, operator-authorised step.");

process.stdout.write(`${out.join("\n")}\n`);
