#!/usr/bin/env node
// Run from the owning repository. Source integration is observed, never inferred
// from a PR title or supplied mergeCommit. The release owner supplies live proof.
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  buildPayload,
  notifyShowcase,
  validateEvent,
  webhookFromEnv
} from "./discord-showcase.mjs";

function git(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 30000 });
  if (result.error || result.status !== 0) throw new Error("Git source verification failed.");
  return result.stdout.trim();
}

export function repositoryFromRemote(remote) {
  const match = /^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+\/[\w.-]+?)(?:\.git)?$/.exec(
    remote
  );
  return match?.[1] ?? null;
}

export function verifyMain(event, { cwd = process.cwd(), runGit = (args) => git(args, cwd) } = {}) {
  if (repositoryFromRemote(runGit(["remote", "get-url", "origin"])) !== event.repo) {
    throw new Error("Showcase repository does not match origin.");
  }
  const main = runGit(["ls-remote", "--exit-code", "origin", "refs/heads/main"]).split(/\s/)[0];
  if (!/^[a-f0-9]{40}$/.test(main) || !/^[a-f0-9]{40}$/.test(event.commit)) {
    throw new Error("Showcase source identity is invalid.");
  }
  // Fetch only the branch needed to prove ancestry; this does not change the tree.
  runGit(["fetch", "--no-tags", "origin", "main"]);
  runGit(["merge-base", "--is-ancestor", event.commit, main]);
  return {
    ...event,
    evidence: { ...event.evidence, mergeCommit: event.commit, observedMain: main }
  };
}

export async function readBackMessage(
  event,
  result,
  { env = process.env, fetchImpl = globalThis.fetch } = {}
) {
  if (!["sent", "already_sent"].includes(result.status)) return result;
  try {
    const endpoint = webhookFromEnv(env).split("?")[0];
    const options = { redirect: "error", signal: AbortSignal.timeout(10000) };
    const response = await fetchImpl(`${endpoint}/messages/${result.messageId}`, options);
    if (!response.ok) throw new Error("Read-back failed.");
    const message = await response.json();
    const expected = buildPayload(event, { env }).embeds[0];
    const actual = message.embeds?.[0];
    // Time is the original send time, so compare semantic fields only.
    const fields = (embed) =>
      embed?.fields
        ?.filter((field) => field.name !== "Time")
        .map(({ name, value }) => ({ name, value }));
    if (
      message.id !== result.messageId ||
      message.channel_id !== result.channelId ||
      actual?.title !== expected.title ||
      actual?.description !== expected.description ||
      JSON.stringify(fields(actual)) !== JSON.stringify(fields(expected))
    ) {
      throw new Error("Read-back content mismatch.");
    }
    const metadata = await fetchImpl(endpoint, options);
    const webhook = metadata.ok ? await metadata.json() : {};
    const messageUrl =
      /^\d+$/.test(webhook.guild_id) && webhook.channel_id === result.channelId
        ? `https://discord.com/channels/${webhook.guild_id}/${result.channelId}/${result.messageId}`
        : undefined;
    return { ...result, readBackVerified: true, ...(messageUrl ? { messageUrl } : {}) };
  } catch {
    return {
      ...result,
      readBackVerified: false,
      action: "Message may be sent. Inspect it; do not resend blindly."
    };
  }
}

export async function publishDelivery(event, options = {}) {
  try {
    const checked = ["MERGED_TO_MAIN", "DOCS_TOOLING_DONE", "PRODUCTION_VERIFIED"].includes(
      event.stage
    )
      ? verifyMain(event, options)
      : event;
    validateEvent(checked);
    const result = await notifyShowcase(checked, options);
    return options.send ? await readBackMessage(checked, result, options) : result;
  } catch {
    return {
      status: "source_or_event_rejected",
      action:
        "Check origin, main ancestry and stage evidence. No notification sent; release status is unchanged."
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const files = args.filter((arg) => !["--send", "--dry-run"].includes(arg));
  if (
    files.length !== 1 ||
    files[0].startsWith("-") ||
    (args.includes("--send") && args.includes("--dry-run"))
  ) {
    console.error(
      "Usage: node /trusted/woodhouse/scripts/showcase-delivery.mjs <event.json> [--dry-run | --send]"
    );
    process.exitCode = 1;
    return;
  }
  try {
    const event = JSON.parse(await readFile(resolve(files[0]), "utf8"));
    const send = args.includes("--send");
    const result = await publishDelivery(event, { send });
    console.log(JSON.stringify(result, null, 2));
    const confirmed = send ? result.readBackVerified === true : result.status === "dry_run";
    if (!confirmed) process.exitCode = 1;
  } catch {
    console.error("Showcase input could not be read; no delivery confirmed.");
    process.exitCode = 1;
  }
}
if (import.meta.main) await main();
