import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const seed = JSON.parse(await readFile(new URL("../seed/seed.json", import.meta.url), "utf8"));

function normalise(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function paragraphs(block) {
  return (block?.content ?? []).map((paragraph) =>
    normalise((paragraph?.children ?? []).map((child) => child?.text ?? "").join(""))
  );
}

function bodyParagraphs(entry) {
  return (entry.data.content ?? [])
    .filter((block) => block?._type === "prose")
    .flatMap(paragraphs)
    .filter(Boolean);
}

const dispatches = seed.content.dispatches ?? [];

test("the seed holds dispatches to check", () => {
  assert.ok(dispatches.length > 0, "expected the seed to describe at least one dispatch");
});

test("a dispatch body does not repeat its own standfirst", () => {
  // The template renders `lead` above the body. A body that opens with the same
  // sentence prints it twice, which is what every dispatch used to do.
  for (const dispatch of dispatches) {
    const lead = normalise(dispatch.data.lead);
    assert.notEqual(
      bodyParagraphs(dispatch)[0],
      lead,
      `${dispatch.slug} repeats its standfirst as the first body paragraph`
    );
  }
});

test("every dispatch keeps prose after its standfirst", () => {
  for (const dispatch of dispatches) assert.ok(bodyParagraphs(dispatch).length > 0, dispatch.slug);
});

test("a published dispatch states its evidence boundary", () => {
  // The verification read model treats these as required. Catching an empty one
  // here keeps a bad edit from reaching a deployed environment.
  for (const dispatch of dispatches) {
    for (const field of [
      "title",
      "kind",
      "deck",
      "lead",
      "lesson",
      "source_reference",
      "review_date"
    ])
      assert.equal(
        normalise(dispatch.data[field]).length > 0,
        true,
        `${dispatch.slug} has no ${field}`
      );
    assert.equal(dispatch.status, "published", `${dispatch.slug} is not published`);
    assert.equal(dispatch.data.public_safe, true, `${dispatch.slug} is not public_safe`);
  }
});

test("a published entry in any collection is public-safe and reviewed", () => {
  for (const [collection, entries] of Object.entries(seed.content)) {
    for (const entry of entries) {
      if (entry.status !== "published") continue;
      assert.equal(entry.data.public_safe, true, `${collection}/${entry.slug} is not public_safe`);
      if (collection === "conversations")
        assert.equal(entry.data.source_reviewed, true, `${entry.slug} is not source_reviewed`);
    }
  }
});

test("dispatch slugs are unique and URL-safe", () => {
  const slugs = dispatches.map((dispatch) => dispatch.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate dispatch slug");
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, slug);
});
