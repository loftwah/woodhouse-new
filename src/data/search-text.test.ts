import assert from "node:assert/strict";
import test from "node:test";
import { MAX_SEARCH_TEXT, searchTextFromBlocks } from "./search-text.ts";

test("Portable Text spans are collected from a prose block", () => {
  const body = [
    {
      _type: "prose",
      _key: "intro",
      content: [
        {
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: "A distinctive phrase from the body." }]
        }
      ]
    }
  ];
  assert.equal(searchTextFromBlocks(body), "A distinctive phrase from the body.");
});

test("headings, quotes and captions are collected too", () => {
  const body = [
    { _type: "prose", content: [{ style: "h2", children: [{ text: "A heading" }] }] },
    { _type: "pull_quote", quote: "A quoted line", attribution: "Someone" },
    { _type: "image_plate", caption: "A caption" }
  ];
  const text = searchTextFromBlocks(body);
  for (const phrase of ["A heading", "A quoted line", "Someone", "A caption"])
    assert.match(text, new RegExp(phrase));
});

test("structural and machine values never reach the index", () => {
  const body = [
    {
      _type: "evidence_link",
      _key: "evidence-slug-key",
      href: "/evidence/some-slug/",
      slug: "some-slug",
      id: "01ABCDEF",
      label: "Readable label",
      title: "Readable title"
    }
  ];
  const text = searchTextFromBlocks(body);
  assert.match(text, /Readable label/);
  assert.match(text, /Readable title/);
  for (const forbidden of ["some-slug", "01ABCDEF", "evidence-slug-key", "/evidence/"])
    assert.equal(text.includes(forbidden), false, `${forbidden} must not be indexed`);
});

test("a missing or malformed body yields an empty string instead of throwing", () => {
  for (const value of [null, undefined, 0, "", {}, []])
    assert.equal(typeof searchTextFromBlocks(value), "string");
  const cyclic: Record<string, unknown> = { _type: "prose" };
  cyclic.self = cyclic;
  assert.equal(searchTextFromBlocks(cyclic), "");
});

test("a very long body is bounded", () => {
  const long = "word ".repeat(20000);
  const body = [{ _type: "prose", content: [{ children: [{ text: long }] }] }];
  assert.ok(searchTextFromBlocks(body).length <= MAX_SEARCH_TEXT);
});

test("whitespace is collapsed so matching is not defeated by formatting", () => {
  const body = [{ _type: "prose", content: [{ children: [{ text: "one\n\n  two\t\tthree" }] }] }];
  assert.equal(searchTextFromBlocks(body), "one two three");
});

test("a deeply nested body stops rather than recursing without bound", () => {
  let deep: Record<string, unknown> = { text: "bottom" };
  for (let index = 0; index < 200; index++) deep = { content: [deep] };
  assert.equal(typeof searchTextFromBlocks([deep]), "string");
});

test("capability prose and reader-visible client/station identifiers are searchable without proof keys or URLs", () => {
  const text = searchTextFromBlocks([
    {
      _type: "capability_review",
      ownership: "FM owns programming",
      package_name: "@loftwahfm/radio-client",
      available_version: "1.0.0",
      contract_version: "schema 1",
      consumers: [
        {
          scope: "Optional enhanced music",
          station_id: "low-tide",
          evidence_key: "private-proof-key",
          issue_url: "https://example.com/private"
        }
      ],
      package_sha256: "not-searchable-digest"
    }
  ]);
  assert.match(text, /FM owns programming/);
  assert.match(text, /@loftwahfm\/radio-client/);
  assert.match(text, /low-tide/);
  assert.match(text, /Optional enhanced music/);
  assert.doesNotMatch(text, /private-proof-key|example.com|not-searchable-digest/);
});
