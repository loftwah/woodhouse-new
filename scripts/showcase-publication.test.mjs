import test from "node:test";
import assert from "node:assert/strict";
import { showcasePublication } from "./showcase-publication.mjs";
const receipt = {
  environment: "production",
  gitCommit: "a".repeat(40),
  workerVersion: "version-1",
  origin: "https://woodhouse.loftwah.com"
};
const event = {
  repo: "loftwah/woodhouse-new",
  commit: receipt.gitCommit,
  verified: "Source identity checked",
  verificationScope: "public-http-content",
  productionChecks: [{ path: "/dispatches/example/", contains: "New public feature" }]
};
const readEvent = async () => event;
test("preview and absent event do not announce", async () => {
  assert.equal(
    (await showcasePublication({ ...receipt, environment: "preview" })).status,
    "not_production"
  );
  assert.equal(
    (
      await showcasePublication(receipt, {
        readEvent: async () => {
          throw Object.assign(Error(), { code: "ENOENT" });
        }
      })
    ).status,
    "not_prepared"
  );
});
test("stale source and missing real checks cannot become production", async () => {
  assert.equal(
    (await showcasePublication({ ...receipt, gitCommit: "b".repeat(40) }, { readEvent })).status,
    "stale_event"
  );
  assert.equal(
    (
      await showcasePublication(receipt, {
        readEvent: async () => ({ ...event, productionChecks: [] })
      })
    ).status,
    "awaiting_affected_flow"
  );
});
test("live checks cannot fetch another origin or claim failed content", async () => {
  assert.equal(
    (
      await showcasePublication(receipt, {
        readEvent: async () => ({
          ...event,
          productionChecks: [{ path: "//other.example/", contains: "x" }]
        })
      })
    ).status,
    "invalid_live_check"
  );
  assert.equal(
    (
      await showcasePublication(receipt, {
        readEvent,
        fetchImpl: async () => ({ ok: true, status: 200, text: async () => "Old content" })
      })
    ).status,
    "affected_flow_failed"
  );
});
test("successful content check binds production to actual receipt and records limits", async () => {
  const sent = [];
  const result = await showcasePublication(receipt, {
    readEvent,
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => "New public feature" }),
    publish: async (value) => {
      sent.push(value);
      return { status: "sent" };
    }
  });
  assert.equal(result.status, "publication_reporting");
  assert.deepEqual(
    sent.map((value) => value.stage),
    ["MERGED_TO_MAIN", "PRODUCTION_VERIFIED"]
  );
  assert.equal(sent[1].evidence.production.version, receipt.workerVersion);
  assert.equal(sent[1].evidence.production.commit, receipt.gitCommit);
  assert.match(sent[1].verified, /not established/);
});
test("notification errors remain separate from the release", async () => {
  assert.equal(
    (
      await showcasePublication(receipt, {
        readEvent,
        fetchImpl: async () => {
          throw Error("private details");
        }
      })
    ).status,
    "notification_fault"
  );
});
