import test from "node:test";
import assert from "node:assert/strict";

import {
  editionEntries,
  editionSections,
  editionMethod,
  editionLearning,
  editionReviewDate
} from "./what-we-built.ts";

// The published portfolio is fixed in the CMS; a new project must be added to the
// edition deliberately rather than appearing as an unexplained absence. If this
// list changes, change it here and write the entry — that is the point.
const published = [
  "app-composer",
  "asset-hunter",
  "bubbles",
  "fighter",
  "loftwahfm",
  "max",
  "pirates",
  "protocol-11",
  "shoalshot",
  "social-club"
];

test("the edition covers every published project exactly once", () => {
  const slugs = editionEntries.map((entry) => entry.slug);
  assert.equal(new Set(slugs).size, slugs.length, "a project appears twice");
  assert.deepEqual([...slugs].sort(), published);
});

test("every entry belongs to a real section and says what its state rests on", () => {
  const keys = new Set(editionSections.map((section) => section.key));
  for (const entry of editionEntries) {
    assert.ok(keys.has(entry.section), `${entry.slug} has no section`);
    assert.ok(entry.headline.length > 20, `${entry.slug} has no headline`);
    assert.ok(entry.body.length > 80, `${entry.slug} has no body`);
    assert.ok(entry.basis.length > 10, `${entry.slug} has no basis`);
    assert.ok(entry.invitation.length > 10, `${entry.slug} has no invitation`);
  }
});

test("each section has at least one project and a plain-language state", () => {
  for (const section of editionSections) {
    assert.ok(
      editionEntries.some((entry) => entry.section === section.key),
      `${section.key} is empty`
    );
    assert.ok(section.state.length > 3);
  }
});

test("the public copy stays out of operator vocabulary", () => {
  const text = [
    ...editionEntries.flatMap((entry) => [
      entry.headline,
      entry.body,
      entry.basis,
      entry.invitation
    ]),
    editionLearning.title,
    editionLearning.body,
    editionLearning.closing,
    ...editionMethod
  ].join(" ");
  assert.doesNotMatch(
    text,
    /dossier|qualification|proof boundary|admitted project|SHA|pull request|merge commit|issue #/i
  );
  assert.match(editionReviewDate, /^\d{1,2} [A-Z][a-z]+ 2026$/);
});
