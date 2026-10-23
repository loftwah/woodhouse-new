import { test } from "node:test";
import assert from "node:assert/strict";
import { workbenchView, viewForFragment, trendGeometry } from "./analytics-presentation.ts";

test("analytics opens on the chart and recognises only supported task views", () => {
  for (const query of ["", "view=garble", "view=chart"])
    assert.equal(workbenchView(new URLSearchParams(query)), "chart");
  for (const view of ["data", "share", "stories", "notes"])
    assert.equal(workbenchView(new URLSearchParams({ view })), view);
});

test("old saved fragment links reach their new view", () => {
  assert.equal(viewForFragment("#share-report"), "share");
  assert.equal(viewForFragment("#source-fighter"), "notes");
  assert.equal(viewForFragment("#sources-heading"), "notes");
  assert.equal(viewForFragment("#discovery-story"), "chart");
  assert.equal(viewForFragment("#main-content"), null);
  assert.equal(viewForFragment("#share-report", "/connections/"), null);
});

test("daily charts never bridge unavailable dates or invent measurements", () => {
  const plot = trendGeometry([4, null, 0, 2]);
  assert.equal(plot.maximum, 4);
  assert.equal(plot.points.length, 3);
  assert.equal(plot.path.match(/M/g)?.length, 2);
  assert.equal(plot.path.match(/L/g)?.length, 1);
  assert.equal(plot.points[1]?.y, 37);
  assert.deepEqual(trendGeometry([null, null]).points, []);
  assert.equal(trendGeometry([0, 0]).points.length, 2);
  assert.equal(trendGeometry([3]).points[0]?.x, 80);
});
