import assert from "node:assert/strict";
import { test } from "node:test";
import { benchStateFromParams, benchStateLink, benchStateToParams } from "./bench-state.ts";

test("a resting bench has no shareable parameters", () => {
  const state = benchStateFromParams(new URLSearchParams());
  assert.equal(state.open, false);
  assert.equal(state.layer, null);
  assert.equal(state.music, true);
  assert.equal(benchStateToParams(state).toString(), "");
});

test("a shared link reopens the bench in the state it describes", () => {
  const state = benchStateFromParams(
    new URLSearchParams("bench=open&layer=music&music=off&station=low-tide")
  );
  assert.equal(state.open, true);
  assert.equal(state.layer, "music");
  assert.equal(state.music, false);
  assert.equal(state.station, "low-tide");
});

test("an unknown layer or station is dropped rather than shown as a state", () => {
  const state = benchStateFromParams(
    new URLSearchParams("layer=everything&station=../../etc/passwd")
  );
  assert.equal(state.layer, null);
  assert.equal(state.station, null);
});

test("an out-of-range separation is clamped", () => {
  assert.equal(benchStateFromParams(new URLSearchParams("apart=4")).apart, 1);
  assert.equal(benchStateFromParams(new URLSearchParams("apart=-2")).apart, 0);
  assert.equal(benchStateFromParams(new URLSearchParams("apart=nope")).apart, 0.72);
});

test("an absent separation means the open bench, not a closed one", () => {
  assert.equal(benchStateFromParams(new URLSearchParams("bench=open")).apart, 0.72);
  assert.equal(benchStateFromParams(new URLSearchParams()).apart, 0.72);
});

test("the separation survives a round trip", () => {
  const state = benchStateFromParams(new URLSearchParams("bench=open&apart=1"));
  assert.equal(state.apart, 1);
  const params = benchStateToParams(state);
  assert.equal(params.get("apart"), "1.00");
  assert.equal(benchStateFromParams(params).apart, 1);
});

test("a closed bench does not carry a separation", () => {
  const params = benchStateToParams({
    open: true,
    apart: 0,
    layer: null,
    music: true,
    station: null
  });
  assert.equal(params.get("apart"), "0.00");
  assert.equal(benchStateFromParams(params).apart, 0);
});

test("a layer or separation implies the bench is open", () => {
  assert.equal(benchStateFromParams(new URLSearchParams("layer=run")).open, true);
  assert.equal(benchStateFromParams(new URLSearchParams("apart=1")).open, true);
  assert.equal(benchStateFromParams(new URLSearchParams("bench=open")).open, true);
});

test("only the differences from the resting bench are shared", () => {
  const params = benchStateToParams({
    open: true,
    apart: 1,
    layer: "effects",
    music: true,
    station: null
  });
  assert.equal(params.get("bench"), "open");
  assert.equal(params.get("layer"), "effects");
  assert.equal(params.get("apart"), "1.00");
  assert.equal(params.get("music"), null);
  const link = benchStateLink("/exhibits/patch-bench/", {
    open: true,
    apart: 1,
    layer: "effects",
    music: true,
    station: null
  });
  assert.match(link, /bench=open/);
  assert.match(link, /layer=effects/);
  assert.match(link, /apart=1\.00/);
});

test("a disconnected music link is shared as a state, not as an interaction", () => {
  const params = benchStateToParams({
    open: true,
    apart: 0.72,
    layer: null,
    music: false,
    station: null
  });
  assert.equal(params.get("music"), "off");
  assert.equal(params.get("bench"), "open");
});

test("a shared link keeps the parameters the visitor arrived with", () => {
  const link = benchStateLink(
    "/exhibits/patch-bench/",
    { open: true, apart: 0.72, layer: "run", music: true, station: null },
    new URLSearchParams("utm_source=newsletter&ref=abc")
  );
  assert.match(link, /utm_source=newsletter/);
  assert.match(link, /ref=abc/);
  assert.match(link, /bench=open/);
  assert.match(link, /layer=run/);
});

test("a shared link does not keep a bench parameter that no longer applies", () => {
  const link = benchStateLink(
    "/exhibits/patch-bench/",
    { open: false, apart: 0, layer: null, music: true, station: null },
    new URLSearchParams("bench=open&layer=music&music=off")
  );
  assert.equal(link, "/exhibits/patch-bench/?apart=0.00");
});
