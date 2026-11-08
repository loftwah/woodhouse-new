import test from "node:test";
import assert from "node:assert/strict";
import { activeProjects, lifecycleLabel, projectLifecycle } from "./project-lifecycle.ts";
import { projectAction, projectActionHref } from "./project-actions.ts";

test("a reviewed Retired or Paused status is a lifecycle decision", () => {
  assert.equal(projectLifecycle("Retired"), "retired");
  assert.equal(projectLifecycle("Paused"), "paused");
  assert.equal(projectLifecycle(" Retired "), "retired");
});

test("ordinary engineering states and unknown input stay active or unknown", () => {
  assert.equal(projectLifecycle("Final convergence"), "active");
  assert.equal(projectLifecycle("A+ convergence"), "active");
  assert.equal(projectLifecycle("Hospitality prototype · delivery paused"), "active");
  assert.equal(projectLifecycle("RETIRED"), "active");
  assert.equal(projectLifecycle(undefined), "unknown");
  assert.equal(projectLifecycle(null), "unknown");
});

test("a blank status is unreviewed, not evidence of active work", () => {
  for (const value of ["", "   ", "\n\t"]) assert.equal(projectLifecycle(value), "unknown");
  assert.deepEqual(
    activeProjects([
      { slug: "blank", lifecycle: projectLifecycle("") },
      { slug: "active", lifecycle: projectLifecycle("Final convergence") }
    ]).map((project) => project.slug),
    ["active"]
  );
});

test("an unknown lifecycle never joins the active roster by default", () => {
  const projects = [
    { slug: "a", lifecycle: "active" as const },
    { slug: "b", lifecycle: "paused" as const },
    { slug: "c", lifecycle: "retired" as const },
    { slug: "d", lifecycle: "unknown" as const }
  ];
  assert.deepEqual(
    activeProjects(projects).map((project) => project.slug),
    ["a"]
  );
});

test("paused and retired projects send readers to their dossier, not a live product", () => {
  for (const lifecycle of ["paused", "retired"] as const) {
    const project = {
      slug: "asset-hunter",
      name: "Asset Hunter",
      siteUrl: "https://example.com/",
      lifecycle
    };
    assert.equal(projectAction(project).action, "See");
    assert.equal(projectActionHref(project), "/projects/asset-hunter/");
  }
  assert.match(
    projectAction({ slug: "asset-hunter", lifecycle: "retired" }).availability,
    /26 October 2026/
  );
});

test("a lifecycle change cannot inherit the other state's dated sentence", () => {
  const paused = projectAction({ slug: "asset-hunter", lifecycle: "paused" });
  assert.equal(paused.action, "See");
  assert.doesNotMatch(paused.availability, /Retired/);
  assert.match(paused.availability, /^Paused\./);

  const retired = projectAction({ slug: "pirates", lifecycle: "retired" });
  assert.equal(retired.action, "See");
  assert.doesNotMatch(retired.availability, /Paused/);
  assert.match(retired.availability, /^Retired\./);
});

test("an active project keeps its published action and destination", () => {
  const project = { slug: "bubbles", name: "Bubbles", siteUrl: "https://bubbles.loftwah.com/" };
  assert.equal(projectAction(project).action, "Play");
  assert.equal(projectActionHref(project), "https://bubbles.loftwah.com/");
});

test("lifecycle labels stay reader-facing and quiet for active work", () => {
  assert.equal(lifecycleLabel("active"), null);
  assert.equal(lifecycleLabel("paused"), "Paused");
  assert.equal(lifecycleLabel("retired"), "Retired");
  assert.equal(lifecycleLabel("unknown"), "Lifecycle unreviewed");
});
