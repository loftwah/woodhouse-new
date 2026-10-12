import assert from "node:assert/strict";
import test from "node:test";
import { parseListeningReport, loadListeningReport, projectListeningReport } from "./activity.ts";
const now = Date.parse("2026-10-12T10:00:00Z");
const sample = () => ({
  ok: true,
  available: true,
  days: 30,
  asOf: "2026-10-12T09:00:00Z",
  from: "2026-09-13",
  to: "2026-10-12",
  collectionStarted: "2026-10-10",
  games: [{ id: "bubbles", seconds: 0, starts: 0 }]
});
test("public projection removes identities and unknown games; zero remains unranked", () => {
  const raw = {
    ...sample(),
    privateEmail: "secret@example.com",
    games: [
      { id: "bubbles", seconds: 0, starts: 0, email: "private@example.com" },
      { id: "private-project", seconds: 999, starts: 99 }
    ]
  };
  const report = parseListeningReport(raw, now)!;
  assert.deepEqual(report.games, [{ id: "bubbles", seconds: 0, starts: 0, rank: null }]);
  assert.equal(JSON.stringify(report).includes("@"), false);
});
test("ranking uses positive reported listening with ties, never upstream ranks", () => {
  const raw = {
    ...sample(),
    games: [
      { id: "bubbles", seconds: 30, starts: 1, rank: 99 },
      { id: "fighter", seconds: 30, starts: 2 },
      { id: "shoalshot", seconds: 0, starts: 3 },
      { id: "protocol-11", seconds: 5, starts: 1 }
    ]
  };
  assert.deepEqual(
    projectListeningReport(
      parseListeningReport(raw, now)!,
      new Set(raw.games.map((g) => g.id))
    ).games.map((g) => [g.id, g.rank]),
    [
      ["bubbles", 1],
      ["fighter", 1],
      ["protocol-11", 3],
      ["shoalshot", null]
    ]
  );
});
test("invalid coverage, future dates, duplicate and invalid measurements fail closed", () => {
  for (const change of [
    { available: false },
    { days: 7 },
    { asOf: "2026-10-13T00:00:00Z" },
    { from: "2026-02-30" },
    { collectionStarted: "2026-10-13" },
    { games: [{ id: "bubbles", seconds: -1, starts: 1 }] },
    {
      games: [
        { id: "bubbles", seconds: 0, starts: 0 },
        { id: "bubbles", seconds: 1, starts: 1 }
      ]
    }
  ])
    assert.equal(parseListeningReport({ ...sample(), ...change }, now), null);
  assert.equal(
    parseListeningReport(
      { ...sample(), from: "2026-09-11", to: "2026-10-10", asOf: "2026-10-10T09:00:00Z" },
      now
    )!.stale,
    true
  );
});
test("upstream failure is unavailable, never a zero report", async () => {
  assert.equal(
    await loadListeningReport(async () => {
      throw new Error("offline");
    }),
    null
  );
  assert.equal(await loadListeningReport(async () => new Response("bad", { status: 500 })), null);
  assert.equal(await loadListeningReport(async () => new Response("invalid json")), null);
});

test("public membership removes hidden leaders before ranking and retains ties", () => {
  const raw = {
    ...sample(),
    games: [
      { id: "fighter", seconds: 100, starts: 1 },
      { id: "bubbles", seconds: 50, starts: 1 },
      { id: "protocol-11", seconds: 50, starts: 1 }
    ]
  };
  const out = projectListeningReport(
    parseListeningReport(raw, now)!,
    new Set(["bubbles", "protocol-11"])
  );
  assert.deepEqual(
    out.games.map((g) => g.rank),
    [1, 1]
  );
});
test("30-day coverage must end at the snapshot day", () => {
  for (const range of [
    { from: "2026-10-12", to: "2026-10-12" },
    { from: "2026-11-01", to: "2026-11-30" }
  ])
    assert.equal(parseListeningReport({ ...sample(), ...range }, now), null);
});

test("Worker transport rejects redirects without following an unreviewed target", async () => {
  let redirect: RequestRedirect | undefined;
  const outcome = await loadListeningReport(async (_input, options) => {
    redirect = options?.redirect;
    return new Response(null, {
      status: 302,
      headers: { Location: "https://unreviewed.example/" }
    });
  });
  assert.equal(outcome, null);
  assert.equal(redirect, "manual");
});
