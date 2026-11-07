import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  atlasGroups,
  atlasProfile,
  atlasProfiles,
  atlasRelationships,
  atlasReview
} from "./architecture-atlas.ts";

const seed = JSON.parse(await readFile(new URL("../../seed/seed.json", import.meta.url), "utf8"));
const catalogueSlugs = seed.content.projects.map((project: { slug: string }) => project.slug);

test("every catalogue project has an architecture profile", () => {
  for (const slug of catalogueSlugs) {
    assert.ok(atlasProfile(slug), `${slug} is in the catalogue but has no architecture profile`);
  }
  // Woodhouse is the publisher, not one of the twelve product dossiers.
  assert.equal(atlasProfiles.length, catalogueSlugs.length + 1);
  assert.ok(atlasProfile("woodhouse"));
});

test("profiles use known groups and unique slugs", () => {
  const groupKeys = new Set(atlasGroups.map((group) => group.key));
  const slugs = new Set<string>();
  for (const profile of atlasProfiles) {
    assert.ok(groupKeys.has(profile.group), `${profile.slug} has an unknown group`);
    assert.ok(!slugs.has(profile.slug), `${profile.slug} is repeated`);
    slugs.add(profile.slug);
  }
  for (const group of atlasGroups)
    assert.ok(
      atlasProfiles.some((profile) => profile.group === group.key),
      `${group.key} has no project`
    );
});

test("every verified fact carries evidence and every profile keeps its unknowns", () => {
  for (const profile of atlasProfiles) {
    for (const fact of profile.facts) {
      assert.ok(fact.label.trim(), `${profile.slug} has a fact without a label`);
      assert.ok(fact.value.trim(), `${profile.slug} has an empty ${fact.label}`);
      assert.ok(fact.evidence?.trim(), `${profile.slug} fact ${fact.label} has no evidence`);
    }
    assert.ok(profile.tags.length >= 3, `${profile.slug} has too few register tags`);
    assert.ok(profile.unknowns.length > 0, `${profile.slug} claims no unknowns`);
    assert.ok(profile.statusNote.trim(), `${profile.slug} has no status note`);
    assert.match(profile.reviewDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(profile.reference, /^main @ [0-9a-f]{8}$/);
  }
});

test("relationships reference real projects exactly once", () => {
  const ids = new Set<string>();
  for (const relationship of atlasRelationships) {
    assert.ok(!ids.has(relationship.id), `${relationship.id} is repeated`);
    ids.add(relationship.id);
    assert.ok(atlasProfile(relationship.from), `${relationship.id} has an unknown source`);
    assert.ok(atlasProfile(relationship.to), `${relationship.id} has an unknown target`);
    assert.notEqual(
      relationship.from,
      relationship.to,
      `${relationship.id} links a project to itself`
    );
    assert.ok(relationship.detail.trim(), `${relationship.id} has no detail`);
    assert.ok(relationship.evidence.trim(), `${relationship.id} has no evidence`);
    assert.ok(relationship.verb.trim(), `${relationship.id} has no verb`);
  }
});

test("the two-way pair is represented on both sides in words", () => {
  const pairs = atlasRelationships.filter((relationship) => relationship.pair);
  assert.ok(pairs.length >= 4, "the radio capability should record each consumer");
  for (const relationship of pairs) {
    const profile = atlasProfile(relationship.to);
    assert.ok(profile);
    assert.match(relationship.detail, /listening|two-way|back to/i);
  }
});

test("review dates and public sources are real", () => {
  assert.match(atlasReview.date, /^\d{4}-\d{2}-\d{2}$/);
  for (const profile of atlasProfiles) {
    assert.equal(profile.reviewDate, atlasReview.date, `${profile.slug} has a mixed review date`);
    for (const source of profile.publicSources)
      assert.match(source.href, /^https:\/\//, `${profile.slug} has a non-https source`);
  }
});
