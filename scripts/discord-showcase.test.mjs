import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildPayload,
  eventKey,
  notifyShowcase,
  redact,
  validateEvent,
  webhookFromEnv
} from "./discord-showcase.mjs";

// Deliberately synthetic values; these tests never contact Discord.
const fakeWebhook = "https://discord.com/api/webhooks/123/test-token-not-a-credential";
const env = { WOODHOUSE_DISCORD_CHANNEL: fakeWebhook };
const event = {
  project: "Example",
  repo: "example/project",
  outcomeId: "outcome-123",
  stage: "MERGED_TO_MAIN",
  summary: "People can inspect the updated example.",
  changed: "Added a readable example.",
  why: "Makes the next step clear.",
  how: "Open the example path after deployment.",
  verified: "Focused unit check passed; production pending.",
  issueUrls: ["https://github.com/example/project/issues/123"],
  prUrls: [
    "https://github.com/example/project/pull/124",
    "https://github.com/example/project/pull/125"
  ],
  commit: "a".repeat(40),
  evidence: { mergeCommit: "a".repeat(40) }
};
const success = () => ({
  status: 200,
  ok: true,
  json: async () => ({ id: "12345", channel_id: "67890" })
});
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), "showcase-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return { send: true, env, stateDir: join(dir, "private") };
}

test("default dry run performs no network or state IO and disables all mentions", async () => {
  const result = await notifyShowcase(event, {
    env,
    stateDir: "/must-not-be-created",
    fetchImpl: () => assert.fail("network")
  });
  assert.equal(result.status, "dry_run");
  assert.deepEqual(result.payload.allowed_mentions, {
    parse: [],
    users: [],
    roles: [],
    replied_user: false
  });
  assert.match(result.payload.embeds[0].footer.text, /production pending/);
});

test("payload has useful bounded fields, multiple PRs and Melbourne/UTC dates", () => {
  const payload = buildPayload(
    { ...event, changed: "x".repeat(10000) },
    { now: new Date("2026-11-07T14:15:16Z") }
  );
  const embed = payload.embeds[0];
  const fields = Object.fromEntries(embed.fields.map((field) => [field.name, field.value]));
  assert.equal(fields["What changed"].length, 700);
  assert.match(fields["Issue / PR"], /pull\/124/);
  assert.match(fields["Issue / PR"], /pull\/125/);
  assert.match(fields.Time, /2026\/11\/08 01:15:16 Australia\/Melbourne/);
  assert.match(fields.Time, /2026\/11\/07 14:15:16 UTC/);
  assert.ok(embed.fields.every((field) => field.value.length <= 1024));
  const total =
    embed.title.length +
    embed.description.length +
    embed.footer.text.length +
    embed.fields.reduce((n, f) => n + f.name.length + f.value.length, 0);
  assert.ok(total < 6000);
});

test("canonical webhook takes precedence; unsafe endpoints are rejected without echoing them", () => {
  assert.equal(
    webhookFromEnv({ ...env, WOODHOUSE_DISCORD_WEBHOOK_URL: "bad-alias" }),
    `${fakeWebhook}?wait=true`
  );
  assert.equal(
    webhookFromEnv({ WOODHOUSE_DISCORD_WEBHOOK_URL: fakeWebhook }),
    `${fakeWebhook}?wait=true`
  );
  for (const bad of [
    "123",
    "http://discord.com/api/webhooks/123/secret",
    "https://discord.com.evil/api/webhooks/123/secret",
    `${fakeWebhook}?thread_id=123`,
    `https://user:secret@discord.com/api/webhooks/123/token`
  ]) {
    assert.throws(
      () => webhookFromEnv({ WOODHOUSE_DISCORD_CHANNEL: bad }),
      (error) => !error.message.includes(bad)
    );
  }
  assert.equal(
    webhookFromEnv({ WOODHOUSE_DISCORD_CHANNEL: "", WOODHOUSE_DISCORD_WEBHOOK_URL: fakeWebhook }),
    null
  );
});

test("redacts configured aliases and webhook-shaped secrets in every payload field", () => {
  const configured = { ...env, WOODHOUSE_DISCORD_WEBHOOK_URL: "alias-secret" };
  assert.equal(
    redact(`${fakeWebhook} alias-secret`, configured),
    "[redacted webhook] [redacted webhook]"
  );
  const output = JSON.stringify(
    buildPayload(
      {
        ...event,
        summary: fakeWebhook,
        why: "https://discordapp.com/api/v10/webhooks/999/other-secret"
      },
      { env: configured }
    )
  );
  assert.ok(!output.includes("test-token"));
  assert.ok(!output.includes("other-secret"));
});

test("stages require evidence; production needs a bound live flow, not just merge/build", () => {
  assert.throws(() => validateEvent({ ...event, stage: "PRODUCTION_VERIFIED" }));
  assert.throws(() => validateEvent({ ...event, evidence: {} }));
  assert.throws(() => validateEvent({ ...event, stage: "DOCS_TOOLING_DONE" }));
  const docs = {
    ...event,
    stage: "DOCS_TOOLING_DONE",
    evidence: {
      ...event.evidence,
      runtimeAffected: false,
      check: { success: true, description: "Transport unit checks passed." }
    }
  };
  assert.equal(validateEvent(docs), docs);
  const production = {
    ...event,
    stage: "PRODUCTION_VERIFIED",
    deployment: { version: "release-1", url: "https://example.com/feature" },
    evidence: {
      ...event.evidence,
      production: {
        success: true,
        environment: "production",
        check: "Created an example, refreshed, and confirmed it persisted.",
        checkedAt: "2026-11-07T14:00:00Z",
        commit: event.commit,
        version: "release-1",
        url: "https://example.com/feature"
      }
    }
  };
  assert.equal(validateEvent(production), production);
  for (const patch of [
    { success: false },
    { environment: "preview" },
    { commit: "b".repeat(40) },
    { version: "old" },
    { url: "https://other.example" },
    { check: "" },
    { checkedAt: "not-a-date" }
  ]) {
    assert.throws(() =>
      validateEvent({
        ...production,
        evidence: {
          ...production.evidence,
          production: { ...production.evidence.production, ...patch }
        }
      })
    );
  }
});

test("successful send uses wait=true, stores IDs privately and dedupes across invocations", async (t) => {
  const options = await fixture(t);
  let count = 0;
  options.fetchImpl = async (url, request) => {
    count++;
    assert.equal(url, `${fakeWebhook}?wait=true`);
    assert.equal(request.redirect, "error");
    assert.deepEqual(JSON.parse(request.body).allowed_mentions.parse, []);
    return success();
  };
  assert.equal((await notifyShowcase(event, options)).status, "sent");
  assert.equal((await notifyShowcase(event, options)).status, "already_sent");
  assert.equal(count, 1);
  const file = join(options.stateDir, `${eventKey(event)}.json`);
  const stored = await readFile(file, "utf8");
  assert.equal(JSON.parse(stored).messageId, "12345");
  assert.equal(JSON.parse(stored).channelId, "67890");
  assert.ok(!stored.includes(fakeWebhook));
  assert.equal((await stat(file)).mode & 0o777, 0o600);
  assert.equal((await stat(options.stateDir)).mode & 0o777, 0o700);
});

test("outcome and stage/source identity drive dedupe, not prose or PR fragmentation", () => {
  assert.equal(eventKey(event), eventKey({ ...event, changed: "New words", prUrls: [] }));
  assert.notEqual(eventKey(event), eventKey({ ...event, outcomeId: "other" }));
  assert.notEqual(eventKey(event), eventKey({ ...event, stage: "BLOCKED" }));
  assert.notEqual(
    eventKey(event),
    eventKey({ ...event, commit: "b".repeat(40), evidence: { mergeCommit: "b".repeat(40) } })
  );
});

test("confirmed 429 retries only within strict attempt and delay bounds", async (t) => {
  const options = await fixture(t);
  let count = 0;
  const delays = [];
  options.sleep = async (ms) => delays.push(ms);
  options.fetchImpl = async () =>
    ++count < 3 ? { status: 429, ok: false, json: async () => ({ retry_after: 0.01 }) } : success();
  assert.equal((await notifyShowcase(event, options)).status, "sent");
  assert.equal(count, 3);
  assert.deepEqual(delays, [10, 10]);
  for (const retry_after of [50, -1, "1", null]) {
    let calls = 0;
    assert.equal(
      (
        await notifyShowcase(
          { ...event, outcomeId: `delay-${retry_after}` },
          {
            ...options,
            fetchImpl: async () => {
              calls++;
              return { status: 429, ok: false, json: async () => ({ retry_after }) };
            }
          }
        )
      ).status,
      "rate_limited"
    );
    assert.equal(calls, 1);
  }
  count = 0;
  options.fetchImpl = async () => {
    count++;
    return { status: 429, ok: false, json: async () => ({ retry_after: 0 }) };
  };
  assert.equal(
    (await notifyShowcase({ ...event, outcomeId: "always-rate-limited" }, options)).status,
    "rate_limited"
  );
  assert.equal(count, 3);
});

test("timeouts, 5xx and ambiguous responses persist uncertainty and never blindly retry", async (t) => {
  const options = await fixture(t);
  const failures = [
    async () => {
      throw new Error(`network error ${fakeWebhook}`);
    },
    async () => ({ status: 500, ok: false }),
    async () => ({ status: 200, ok: true, json: async () => ({}) }),
    async () => ({
      status: 200,
      ok: true,
      json: async () => {
        throw new Error(fakeWebhook);
      }
    })
  ];
  for (const [i, fail] of failures.entries()) {
    let calls = 0;
    const input = { ...event, outcomeId: `uncertain-${i}` };
    const opts = {
      ...options,
      fetchImpl: async () => {
        calls++;
        return fail();
      }
    };
    const first = await notifyShowcase(input, opts);
    assert.equal(first.status, "uncertain");
    assert.ok(!JSON.stringify(first).includes(fakeWebhook));
    assert.equal((await notifyShowcase(input, opts)).status, "uncertain");
    assert.equal(calls, 1);
    assert.equal(
      JSON.parse(await readFile(join(options.stateDir, `${eventKey(input)}.json`), "utf8")).status,
      "uncertain"
    );
  }
});

test("concurrent attempts are locked; abandoned locks and in-flight records fail closed", async (t) => {
  const options = await fixture(t);
  let entered;
  const pending = new Promise((done) => {
    entered = done;
  });
  let finish;
  const first = notifyShowcase(event, {
    ...options,
    fetchImpl: () => {
      entered();
      return new Promise((done) => {
        finish = done;
      });
    }
  });
  await pending;
  assert.equal(
    (await notifyShowcase(event, { ...options, fetchImpl: () => assert.fail("duplicate send") }))
      .status,
    "locked"
  );
  finish(success());
  assert.equal((await first).status, "sent");
  const crashed = { ...event, outcomeId: "crashed" };
  const key = eventKey(crashed);
  await writeFile(join(options.stateDir, `${key}.json`), JSON.stringify({ status: "in_flight" }));
  assert.equal(
    (
      await notifyShowcase(crashed, {
        ...options,
        fetchImpl: () => assert.fail("uncertain resend")
      })
    ).status,
    "uncertain"
  );
  await mkdir(join(options.stateDir, `${key}.lock`));
  assert.equal((await notifyShowcase(crashed, options)).status, "locked");
});

test("configuration, malformed state, invalid evidence and rejected requests remain separate telemetry faults", async (t) => {
  const options = await fixture(t);
  assert.equal((await notifyShowcase(event, { ...options, env: {} })).status, "not_configured");
  assert.equal(
    (
      await notifyShowcase(event, {
        ...options,
        env: { WOODHOUSE_DISCORD_CHANNEL: "secret-bad-url" }
      })
    ).status,
    "notification_fault"
  );
  assert.equal(
    (await notifyShowcase({ ...event, stage: "PRODUCTION_VERIFIED" }, options)).status,
    "notification_fault"
  );
  const result = await notifyShowcase(event, {
    ...options,
    fetchImpl: async () => ({
      status: 401,
      ok: false,
      text: () => assert.fail("must not read secret response")
    })
  });
  assert.equal(result.status, "rejected");
  await writeFile(join(options.stateDir, `${eventKey(event)}.json`), "{malformed");
  assert.equal(
    (
      await notifyShowcase(event, {
        ...options,
        fetchImpl: () => assert.fail("must not send with unreadable state")
      })
    ).status,
    "notification_fault"
  );
  assert.ok((await readdir(options.stateDir)).every((name) => !name.endsWith(".lock")));
});
