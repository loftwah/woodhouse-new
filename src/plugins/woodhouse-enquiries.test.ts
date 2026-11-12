import assert from "node:assert/strict";
import test from "node:test";
import type { PluginContext, SandboxedRouteContext } from "emdash/plugin";
import enquiries from "./woodhouse-enquiries.ts";

const hourMs = 3_600_000;

test("a complete multibyte enquiry fits the multipart route limit and is saved", async () => {
  const message = "話".repeat(3_000);
  const form = new FormData();
  form.set("website", "");
  form.set("name", "名".repeat(80));
  form.set("reply", `${"a".repeat(188)}@example.com`);
  form.set("topic", "Woodhouse");
  form.set("kind", "human");
  form.set("message", message);

  const request = new Request("https://example.invalid/submit", { method: "POST", body: form });
  const bytes = (await request.clone().arrayBuffer()).byteLength;
  assert.ok(bytes > 8 * 1024);
  assert.ok(bytes <= enquiries.routes.submit.request.maxBytes);
  const entries = Array.from(await request.formData(), ([name, value]) => ({
    name,
    kind: "text",
    value
  }));

  let saved: Record<string, unknown> | undefined;
  const ctx = {
    kv: {
      getVersioned: async () => null,
      compareAndSet: async () => ({ applied: true })
    },
    storage: {
      submissions: {
        put: async (_id: string, value: Record<string, unknown>) => {
          saved = value;
        }
      }
    },
    settings: { get: async () => undefined },
    log: { info: () => {}, warn: () => {} }
  } as unknown as PluginContext;
  const result = await enquiries.routes.submit.handler(
    { input: { entries }, requestMeta: {} } as unknown as SandboxedRouteContext,
    ctx
  );
  assert.equal(result.status, 303);
  assert.ok(
    result.headers.some(([name, value]) => name === "location" && value === "/contact/?submitted=1")
  );
  assert.equal(saved?.message, message);
});

test("retention replaces the daily job and drains only expired data within the bridge budget", async (t) => {
  const now = Date.UTC(2026, 10, 12, 1);
  t.mock.method(Date, "now", () => now);
  const cutoff = now - 90 * 24 * hourMs;
  const cutoffText = new Date(cutoff).toISOString();
  const hour = now / hourMs;
  const expiredRatePrefix = `rate:${hour - 25}:`;
  const cutoffRateKey = `rate:${hour - 24}:all`;
  const freshRateKey = `rate:${hour}:all`;
  const unrelatedKey = `${expiredRatePrefix}other`;
  const rates = new Set([
    ...Array.from(
      { length: 45 },
      (_, index) => `${expiredRatePrefix}${index.toString(16).padStart(24, "0")}`
    ),
    cutoffRateKey,
    freshRateKey,
    unrelatedKey
  ]);
  const submissions = new Map([
    ...Array.from(
      { length: 315 },
      (_, index) => [`expired-${index}`, new Date(cutoff - 1).toISOString()] as const
    ),
    ["cutoff", cutoffText],
    ["fresh", new Date(now).toISOString()]
  ]);

  let calls = 0;
  const jobs: string[] = [];
  const ctx = {
    cron: {
      schedule: async (name: string, options: { schedule: string }) => {
        calls += 1;
        jobs.push(`add ${name} ${options.schedule}`);
      },
      cancel: async (name: string) => {
        calls += 1;
        jobs.push(`remove ${name}`);
      }
    },
    storage: {
      submissions: {
        query: async (options: { where: { createdAt: { lt: string } }; limit: number }) => {
          calls += 1;
          assert.equal(options.where.createdAt.lt, cutoffText);
          assert.ok(!("cursor" in options));
          const eligible = [...submissions].filter(([, date]) => date < cutoffText);
          return {
            items: eligible.slice(0, options.limit).map(([id]) => ({ id })),
            hasMore: eligible.length > options.limit
          };
        },
        deleteMany: async (ids: string[]) => {
          calls += 1;
          for (const id of ids) assert.ok(submissions.delete(id));
          return ids.length;
        }
      }
    },
    kv: {
      list: async (prefix: string) => {
        calls += 1;
        assert.equal(prefix, "rate:");
        return [...rates].map((key) => ({ key }));
      },
      delete: async (key: string) => {
        calls += 1;
        assert.ok(rates.delete(key));
      }
    }
  } as unknown as PluginContext;
  const scheduledAt = new Date(now).toISOString();

  await enquiries.hooks.cron({ name: "submission-retention", scheduledAt }, ctx);
  assert.deepEqual(jobs, ["add enquiry-retention */10 * * * *", "remove submission-retention"]);
  assert.ok(calls < 30);
  assert.equal(submissions.size, 17);
  assert.equal(rates.size, 28);

  for (let run = 0; run < 2; run += 1) {
    calls = 0;
    await enquiries.hooks.cron({ name: "enquiry-retention", scheduledAt }, ctx);
    assert.ok(calls < 30);
  }
  assert.deepEqual([...submissions.keys()], ["cutoff", "fresh"]);
  assert.deepEqual([...rates], [cutoffRateKey, freshRateKey, unrelatedKey]);
});
