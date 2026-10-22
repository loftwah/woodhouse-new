import assert from "node:assert/strict";
import test from "node:test";
import {
  contributionAnchors,
  contributionReview,
  contributionSteps,
  invitationStates
} from "./contribution-flow.ts";

test("the walkthrough keeps one step per state and the journey order", () => {
  const ids = contributionSteps.map((step) => step.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, [
    "invitation",
    "contribution",
    "review",
    "approval",
    "featuring",
    "revocation",
    "closed"
  ]);
  for (const step of contributionSteps) {
    assert.ok(step.action.trim().length > 0, `${step.id} needs an action`);
    assert.ok(step.result.trim().length > 0, `${step.id} needs a result`);
    assert.ok(step.guestbook.trim().length > 0, `${step.id} needs the Guestbook side`);
    assert.ok(step.linkarooie.trim().length > 0, `${step.id} needs the Linkarooie side`);
    assert.match(step.source.url, /^https:\/\//, `${step.id} needs a public source`);
  }
});

test("source approval publishes; featuring remains a separate Linkarooie choice", () => {
  const approval = contributionSteps.find((step) => step.id === "approval");
  const featuring = contributionSteps.find((step) => step.id === "featuring");
  assert.ok(approval && featuring);
  assert.match(
    `${approval.action} ${approval.result}`,
    /approves and publishes|makes the approved item public/i
  );
  assert.match(
    `${approval.because} ${approval.result}`,
    /Linkarooie profile is still unchanged|separate Linkarooie choice/i
  );
  assert.match(
    `${featuring.result} ${featuring.because}`,
    /exact source|does not copy|separate owner choices/i
  );
  assert.notEqual(approval.state, featuring.state);
  assert.equal(featuring.state, "featured");
  assert.equal(approval.state, "approved");
});

test("every supported invitation state is named, including unavailable and no source", () => {
  const states = new Set(invitationStates.map((entry) => entry.state));
  for (const state of ["open", "paused", "closed", "full", "unavailable", "none"])
    assert.equal(states.has(state as never), true, `${state} is missing`);
  assert.equal(invitationStates.find((entry) => entry.state === "open")?.accepts, true);
  for (const entry of invitationStates.filter((entry) => entry.state !== "open"))
    assert.equal(entry.accepts, false, `${entry.state} must not accept`);
  assert.match(
    invitationStates.find((entry) => entry.state === "full")?.boundary ?? "",
    /16 pending|200 non-deleted/
  );
});

test("the model records pinned source and the honest local boundary", () => {
  assert.match(contributionReview.guestbookCommit, /^[a-f0-9]{40}$/);
  assert.match(contributionReview.linkarooieCommit, /^[a-f0-9]{40}$/);
  assert.match(contributionReview.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(contributionReview.boundary, /local fictional run/);
  assert.match(contributionReview.boundary, /not a hosted deployment/);
  assert.match(contributionReview.boundary, /No private record, guest code or credential/);
  for (const anchor of contributionAnchors) assert.match(anchor.url, /^https:\/\//);
});

test("a source-owner hide removes the composed card rather than a copy", () => {
  const revocation = contributionSteps.find((step) => step.id === "revocation");
  assert.ok(revocation);
  assert.match(revocation.result, /404|disappears|removes/i);
  assert.match(revocation.because, /reference|rechecks|source/i);
  assert.equal(revocation.state, "removed");
});
