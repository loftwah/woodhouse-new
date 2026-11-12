// One integration owner and one durable private state directory. This is local
// deduplication, NOT exactly-once delivery across independent hosts. Never erase
// uncertain records/abandoned locks to retry without first reconciling Discord.
import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const STAGES = [
  "MERGED_TO_MAIN",
  "PRODUCTION_VERIFIED",
  "DOCS_TOOLING_DONE",
  "BLOCKED",
  "RELEASE_FAILED",
  "PROJECT_HIGHLIGHT"
];
const invalid = () => {
  throw new Error("Invalid showcase event or evidence; see the delivery contract.");
};
const required = (value) => typeof value === "string" && value.trim().length > 0;
const sha = (value) => typeof value === "string" && /^[a-f0-9]{40}$/i.test(value);
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function webhookFromEnv(env = process.env) {
  const raw = env.WOODHOUSE_DISCORD_CHANNEL ?? env.WOODHOUSE_DISCORD_WEBHOOK_URL;
  if (!raw) return null;
  // Intentionally reject arbitrary hosts, credentials, query strings and redirects.
  if (!/^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(raw)) {
    throw new Error(
      "Invalid Discord webhook configuration. Expected a Discord webhook URL, not a channel ID."
    );
  }
  return `${raw}?wait=true`;
}

export function redact(value, env = process.env) {
  let text = String(value);
  for (const secret of [env.WOODHOUSE_DISCORD_CHANNEL, env.WOODHOUSE_DISCORD_WEBHOOK_URL]) {
    if (secret) text = text.split(secret).join("[redacted webhook]");
  }
  return text.replace(
    /https?:\/\/(?:[\w-]+\.)?discord(?:app)?\.com\/api\/(?:v\d+\/)?webhooks\/[^\s<>"']+/gi,
    "[redacted webhook]"
  );
}

function publicUrl(value) {
  if (!required(value)) invalid();
  let url;
  try {
    url = new URL(value);
  } catch {
    invalid();
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    /\/api\/(?:v\d+\/)?webhooks\//.test(url.pathname)
  )
    invalid();
  return value;
}

export function validateEvent(event) {
  if (!event || !STAGES.includes(event.stage)) invalid();
  for (const name of [
    "project",
    "repo",
    "outcomeId",
    "summary",
    "changed",
    "why",
    "how",
    "verified"
  ]) {
    if (!required(event[name])) invalid();
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(event.repo) || !sha(event.commit)) invalid();
  for (const name of ["issueUrls", "prUrls"]) {
    if (event[name] !== undefined && (!Array.isArray(event[name]) || event[name].length > 10))
      invalid();
  }
  const links = [
    ...(event.issueUrls || []),
    ...(event.prUrls || []),
    event.issueUrl,
    event.prUrl
  ].filter(Boolean);
  if (!links.length) invalid();
  for (const link of links) publicUrl(link);
  if (event.deployment?.url) publicUrl(event.deployment.url);
  if (event.demoUrl) publicUrl(event.demoUrl);
  if (
    ["MERGED_TO_MAIN", "DOCS_TOOLING_DONE", "PRODUCTION_VERIFIED"].includes(event.stage) &&
    event.evidence?.mergeCommit !== event.commit
  )
    invalid();
  if (
    event.stage === "DOCS_TOOLING_DONE" &&
    (event.evidence?.runtimeAffected !== false ||
      event.evidence?.check?.success !== true ||
      !required(event.evidence?.check?.description))
  )
    invalid();
  if (event.stage === "PRODUCTION_VERIFIED") {
    const proof = event.evidence?.production;
    if (
      proof?.success !== true ||
      proof?.environment !== "production" ||
      !required(proof?.check) ||
      !required(proof?.checkedAt) ||
      !Number.isFinite(Date.parse(proof.checkedAt)) ||
      proof.commit !== event.commit ||
      !required(event.deployment?.version) ||
      proof.version !== event.deployment.version ||
      !required(event.deployment?.url) ||
      proof.url !== event.deployment.url
    )
      invalid();
  }
  return event;
}

export function eventKey(event) {
  validateEvent(event);
  return hash([
    event.repo.toLowerCase(),
    event.outcomeId,
    event.stage,
    event.commit,
    event.deployment?.version || null,
    event.deployment?.url || null
  ]);
}

function localTime(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}/${values.month}/${values.day} ${values.hour}:${values.minute}:${values.second} ${timeZone}`;
}

export function buildPayload(event, { now = new Date(), env = process.env } = {}) {
  validateEvent(event);
  const clip = (value, limit) => redact(value, env).slice(0, limit);
  const fields = [
    [
      "Project / repository / outcome",
      `${event.project} | ${event.repo} | ${event.outcomeId}`,
      300
    ],
    ["What changed", event.changed, 700],
    ["Why it matters", event.why, 700],
    ["How MP can see/use it now", event.how, 700],
    ["What was verified", event.verified, 700],
    [
      "Issue / PR",
      [...(event.issueUrls || []), ...(event.prUrls || []), event.issueUrl, event.prUrl]
        .filter(Boolean)
        .join("\n"),
      800
    ],
    [
      "Source / deployment",
      `Commit: ${event.commit}\nVersion: ${event.deployment?.version || "not deployed"}\n${event.deployment?.url || "Production pending / not applicable"}`,
      500
    ],
    ["Time", `${localTime(now, "Australia/Melbourne")}\n${localTime(now, "UTC")}`, 150]
  ];
  if (event.demoUrl) fields.push(["See it", event.demoUrl, 300]);
  return {
    allowed_mentions: { parse: [], users: [], roles: [], replied_user: false },
    embeds: [
      {
        title: clip(`${event.stage} — ${event.project}`, 256),
        description: clip(event.summary, 256),
        fields: fields.map(([name, value, limit]) => ({ name, value: clip(value, limit) })),
        footer: {
          text:
            event.stage === "MERGED_TO_MAIN"
              ? "Integrated on main; production pending."
              : "Woodhouse delivery showcase"
        }
      }
    ]
  };
}

async function save(path, record) {
  const temp = `${path}.${randomUUID()}.tmp`;
  const file = await open(temp, "wx", 0o600);
  try {
    await file.writeFile(JSON.stringify(record));
    await file.sync();
  } finally {
    await file.close();
  }
  await rename(temp, path);
  const directory = await open(dirname(path), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}

// Best effort: notification faults return a safe status; callers must preserve
// their release result and surface this separate delivery telemetry fault.
export async function notifyShowcase(
  event,
  {
    send = false,
    env = process.env,
    stateDir = env.WOODHOUSE_DISCORD_STATE_DIR ||
      join(homedir(), ".local", "state", "woodhouse-discord-showcase"),
    fetchImpl = globalThis.fetch,
    sleep = (ms) => new Promise((done) => setTimeout(done, ms)),
    timeoutMs = 10000
  } = {}
) {
  let lock;
  let recordPath;
  let inFlight = false;
  try {
    const payload = buildPayload(event, { env });
    const key = eventKey(event);
    if (!send) return { status: "dry_run", key, payload };
    const webhook = webhookFromEnv(env);
    if (!webhook) return { status: "not_configured", key };
    await mkdir(stateDir, { recursive: true, mode: 0o700 });
    recordPath = join(stateDir, `${key}.json`);
    lock = join(stateDir, `${key}.lock`);
    try {
      await mkdir(lock, { mode: 0o700 });
    } catch {
      lock = null;
      return {
        status: "locked",
        key,
        action: "Reconcile any abandoned in-flight send before removing its lock."
      };
    }
    let prior;
    try {
      prior = JSON.parse(await readFile(recordPath, "utf8"));
      if (!prior || typeof prior !== "object") throw new Error("Invalid delivery state.");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (
      prior &&
      !["sent", "in_flight", "uncertain", "rate_limited", "rejected"].includes(prior.status)
    )
      throw new Error("Unrecognized delivery state.");
    if (prior?.status === "sent")
      return {
        status: "already_sent",
        key,
        messageId: prior.messageId,
        channelId: prior.channelId
      };
    if (prior && ["in_flight", "uncertain"].includes(prior.status))
      return {
        status: "uncertain",
        key,
        action: "Reconcile with Discord before any retransmission."
      };
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await save(recordPath, { status: "in_flight", at: new Date().toISOString() });
      inFlight = true;
      const response = await fetchImpl(webhook, {
        method: "POST",
        redirect: "error",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (response.status === 429) {
        const body = await response.json();
        const delay = body.retry_after;
        await save(recordPath, { status: "rate_limited", at: new Date().toISOString() });
        inFlight = false;
        if (
          attempt < 2 &&
          typeof delay === "number" &&
          Number.isFinite(delay) &&
          delay >= 0 &&
          delay <= 10
        ) {
          await sleep(Math.ceil(delay * 1000));
          continue;
        }
        return { status: "rate_limited", key };
      }
      if (!response.ok) {
        const status = response.status >= 400 && response.status < 500 ? "rejected" : "uncertain";
        await save(recordPath, { status, at: new Date().toISOString() });
        inFlight = false;
        return { status, key };
      }
      const message = await response.json();
      if (!/^\d+$/.test(message?.id) || !/^\d+$/.test(message?.channel_id))
        throw new Error("Unconfirmed Discord response.");
      await save(recordPath, {
        status: "sent",
        messageId: message.id,
        channelId: message.channel_id,
        at: new Date().toISOString()
      });
      inFlight = false;
      return { status: "sent", key, messageId: message.id, channelId: message.channel_id };
    }
  } catch {
    if (inFlight && recordPath) {
      try {
        await save(recordPath, { status: "uncertain", at: new Date().toISOString() });
      } catch {
        /* Existing in_flight marker still prevents retry. */
      }
    }
    return {
      status: inFlight ? "uncertain" : "notification_fault",
      action: "Check event/configuration and private delivery state; release status is unchanged."
    };
  } finally {
    if (lock) {
      try {
        await rm(lock, { recursive: true });
      } catch {
        /* An abandoned lock fails closed. */
      }
    }
  }
}
