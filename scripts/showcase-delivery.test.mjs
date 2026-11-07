import test from "node:test";
import assert from "node:assert/strict";
import {
  repositoryFromRemote,
  verifyMain,
  publishDelivery,
  readBackMessage
} from "./showcase-delivery.mjs";
import { buildPayload } from "./discord-showcase.mjs";

const commit = "a".repeat(40);
const event = {
  project: "Woodhouse",
  repo: "loftwah/woodhouse-new",
  outcomeId: "171",
  stage: "DOCS_TOOLING_DONE",
  summary: "Delivery reporting",
  changed: "Added source checks",
  why: "Keep claims accurate",
  how: "Read the issue",
  verified: "Focused tests",
  commit,
  issueUrl: "https://github.com/loftwah/woodhouse-new/issues/171",
  evidence: { runtimeAffected: false, check: { success: true, description: "Focused tests" } }
};
const runGit = (args) =>
  args[0] === "remote"
    ? "https://github.com/loftwah/woodhouse-new.git"
    : args[0] === "ls-remote"
      ? `${commit}\trefs/heads/main`
      : "";

test("remote identity excludes credentials and unrelated hosts", () => {
  assert.equal(repositoryFromRemote("git@github.com:loftwah/woodhouse-new.git"), event.repo);
  assert.equal(repositoryFromRemote("https://github.com/loftwah/woodhouse-new"), event.repo);
  assert.equal(repositoryFromRemote("https://secret@github.com/loftwah/woodhouse-new.git"), null);
  assert.equal(repositoryFromRemote("https://example.com/loftwah/woodhouse-new.git"), null);
});
test("main evidence must pass remote identity and ancestry", () => {
  assert.equal(verifyMain(event, { runGit }).evidence.mergeCommit, commit);
  assert.throws(() => verifyMain({ ...event, repo: "loftwah/other" }, { runGit }));
  assert.throws(() =>
    verifyMain(event, {
      runGit: (args) => {
        if (args[0] === "merge-base") throw Error("not integrated");
        return runGit(args);
      }
    })
  );
});
test("unintegrated event never reaches transport", async () => {
  let sent = false;
  const result = await publishDelivery(event, {
    send: true,
    runGit: () => {
      throw Error("private details");
    },
    fetchImpl: () => {
      sent = true;
    }
  });
  assert.equal(result.status, "source_or_event_rejected");
  assert.equal(sent, false);
});
test("dry run verifies main and emits no external request", async () => {
  const result = await publishDelivery(event, {
    runGit,
    fetchImpl: () => {
      throw Error("must not call");
    }
  });
  assert.equal(result.status, "dry_run");
});
test("read-back confirms exact message and safe Discord link", async () => {
  const checked = verifyMain(event, { runGit });
  const env = { WOODHOUSE_DISCORD_CHANNEL: "https://discord.com/api/webhooks/123/test-token" };
  const result = await readBackMessage(
    checked,
    { status: "sent", messageId: "456", channelId: "789" },
    {
      env,
      fetchImpl: async (url) => ({
        ok: true,
        json: async () =>
          url.includes("/messages/")
            ? { id: "456", channel_id: "789", embeds: buildPayload(checked).embeds }
            : { guild_id: "101", channel_id: "789" }
      })
    }
  );
  assert.equal(result.readBackVerified, true);
  assert.equal(result.messageUrl, "https://discord.com/channels/101/789/456");
});
test("read-back failure preserves sent state and never resends", async () => {
  const checked = verifyMain(event, { runGit });
  const result = await readBackMessage(
    checked,
    { status: "sent", messageId: "456", channelId: "789" },
    {
      env: {},
      fetchImpl: () => {
        throw Error("secret");
      }
    }
  );
  assert.equal(result.status, "sent");
  assert.equal(result.readBackVerified, false);
  assert.ok(!JSON.stringify(result).includes("secret"));
});
