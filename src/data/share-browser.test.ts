import assert from "node:assert/strict";
import test from "node:test";
import { gameMedia } from "./share-desk.ts";
import {
  galleryMedia,
  galleryPage,
  galleryURL,
  availableProjectTypes,
  defaultProjectType,
  projectActionLabel,
  projectViewRedirect
} from "./share-browser.ts";
const projects = [...new Set(gameMedia.map((asset) => asset.project))];
const priorityProjects = ["fighter", "shoalshot", "protocol-11", "bubbles", "loftwahfm"];

test("bounded gallery pages keep all reviewed media reachable exactly once", () => {
  const found: string[] = [];
  for (const type of ["images", "clips", "artwork"] as const) {
    const media = galleryMedia(projects, undefined, type);
    const first = galleryPage(media);
    for (let n = 1; n <= first.pages; n++) {
      const page = galleryPage(media, n);
      assert.ok(page.items.length <= 6);
      found.push(...page.items.map((asset) => asset.id));
    }
  }
  assert.equal(new Set(found).size, found.length);
  assert.deepEqual([...found].sort(), gameMedia.map((asset) => asset.id).sort());
});

test("overview presents all five projects before repeating a project", () => {
  const page = galleryPage(galleryMedia(priorityProjects, undefined, "images"));
  assert.deepEqual(
    page.items.slice(0, 5).map((asset) => asset.project),
    priorityProjects
  );
});

test("project and format views preserve selection across native page URLs", () => {
  const media = galleryMedia(projects, "fighter", "clips");
  assert.ok(media.length > 6);
  assert.ok(media.every((asset) => asset.project === "fighter" && asset.kind === "video"));
  assert.equal(galleryURL("fighter", "clips", 2), "/share/?project=fighter&type=clips&page=2");
  assert.equal(galleryURL(), "/share/");
  assert.equal(galleryPage(media, Number.NaN).page, 1);
  assert.equal(galleryPage(media, -3).page, 1);
  assert.equal(galleryPage(media, 1000000).page, 2);
  assert.equal(galleryMedia(["fighter"], "shoalshot", "images").length, 0);
});

test("a project without game media opens on a category it actually has", () => {
  // App Composer has reviewed media (its studio film) but no screenshots; opening
  // it on "Images & screenshots" was the reported empty-grid defect.
  assert.deepEqual(availableProjectTypes("app-composer"), ["clips", "cards"]);
  assert.equal(defaultProjectType("app-composer"), "clips");
  assert.notEqual(defaultProjectType("app-composer"), "images");
  // Every published project has a link card, so cards is the floor and no project
  // lands on an empty grid by default.
  for (const slug of ["woodhouse", "asset-hunter", "pirates"]) {
    assert.deepEqual(availableProjectTypes(slug), ["cards"]);
    assert.equal(defaultProjectType(slug), "cards");
  }
  // A game with screenshots leads on images; the categories follow the reviewed
  // media rather than a fixed list.
  assert.equal(defaultProjectType("fighter"), "images");
  assert.ok(availableProjectTypes("fighter").includes("clips"));
  assert.ok(availableProjectTypes("shoalshot").includes("artwork"));
  assert.ok(availableProjectTypes("loftwahfm").includes("artwork"));
  // The action label matches the product, so an app is never offered "Play".
  assert.equal(projectActionLabel("fighter"), "Play");
  assert.equal(projectActionLabel("bubbles"), "Play");
  assert.equal(projectActionLabel("loftwahfm"), "Listen");
  for (const slug of ["app-composer", "woodhouse", "asset-hunter", "max", "club"])
    assert.equal(projectActionLabel(slug), "Open project");
  // A project with no screenshots moves a bare link to a category it has, while
  // an explicit empty category keeps its address for the empty state.
  assert.equal(projectViewRedirect("app-composer", "images", false), "clips");
  assert.equal(projectViewRedirect("app-composer", "cards", false), null);
  assert.equal(projectViewRedirect("app-composer", "images", true), null);
  assert.equal(projectViewRedirect("fighter", "images", false), null);
  assert.equal(projectViewRedirect("woodhouse", "clips", false), "cards");
  // A global (site-wide) category is not a project category and is never moved.
  assert.equal(projectViewRedirect("app-composer", "radio", false), null);
});
