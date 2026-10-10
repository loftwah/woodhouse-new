/**
 * Plain-text projection of an editorial block body, for search only.
 *
 * EmDash cannot index a body: upstream issue
 * https://github.com/emdash-cms/emdash/issues/3670 records that a block field
 * cannot be marked searchable, so `_emdash_fts_dispatches` indexes `title` and
 * `deck` and nothing else. A reader who remembers a phrase from the middle of an
 * article would otherwise find nothing.
 *
 * This is the application-side workaround: flatten the Portable Text and block
 * fields into one bounded string used only for matching. It is never rendered,
 * never shown in a result list, and it cannot widen what is published — it only
 * makes published text findable.
 *
 * The walk is deliberately generic rather than a block-by-block switch, so a new
 * block type becomes searchable the day it is added instead of the day someone
 * remembers to extend this file. Only known text-bearing keys are collected, so
 * an id, a URL or a `_key` cannot leak into the index.
 */

/** Field names whose values are reader-visible prose. */
const TEXT_KEYS = new Set([
  "text",
  "title",
  "label",
  "quote",
  "attribution",
  "caption",
  "alt",
  "summary",
  "description",
  "lead",
  "lesson",
  "content",
  "details",
  "note",
  "ownership",
  "boundary",
  "scope",
  "station_id",
  "package_name",
  "available_version",
  "installed_version",
  "contract_version"
]);

/** Keys that are structural or machine values and must never reach the index. */
const SKIPPED_KEYS = new Set([
  "_key",
  "_type",
  "_version",
  "id",
  "slug",
  "href",
  "url",
  "key",
  "ref",
  "image",
  "src",
  "slug_key"
]);

/** Per-entry ceiling, so a long dispatch cannot make the index payload unbounded. */
export const MAX_SEARCH_TEXT = 4000;

function collect(value: unknown, into: string[], depth: number) {
  if (depth > 12 || into.join(" ").length >= MAX_SEARCH_TEXT) return;
  if (Array.isArray(value)) {
    for (const item of value) collect(item, into, depth + 1);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    if (SKIPPED_KEYS.has(key)) continue;
    if (TEXT_KEYS.has(key)) {
      // A text field holds prose, or a container of prose.
      if (typeof nested === "string") {
        const trimmed = nested.trim();
        if (trimmed) into.push(trimmed);
      } else collect(nested, into, depth + 1);
      continue;
    }
    // A non-text key still has to be walked when it holds a container, or the
    // Portable Text nesting (`content` → block → `children` → span) would stop
    // at the first structural key. A string under such a key — a block style, a
    // variant name — is not prose and is left alone.
    if (nested && typeof nested === "object") collect(nested, into, depth + 1);
  }
}

/**
 * Return the searchable body text of a block body, whitespace-collapsed and
 * bounded. Returns an empty string for a missing or unreadable body rather than
 * throwing, because search must never be the reason a page fails to render.
 */
export function searchTextFromBlocks(blocks: unknown): string {
  if (!blocks) return "";
  const parts: string[] = [];
  try {
    collect(blocks, parts, 0);
  } catch {
    return "";
  }
  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, MAX_SEARCH_TEXT);
}
