import type { PluginContext, SandboxedPlugin, SandboxedRouteContext } from "emdash/plugin";
import { pluginResponse } from "emdash/plugin";
import { parseEnquiry, persistThenNotify } from "./enquiry-workflow.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textField(input: unknown, name: string): string {
  if (!isRecord(input) || !Array.isArray(input.entries)) return "";
  const entry = input.entries.find(
    (item) => isRecord(item) && item.kind === "text" && item.name === name
  );
  return isRecord(entry) && typeof entry.value === "string" ? entry.value.trim() : "";
}

function cleanText(value: string): string {
  return [...value]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return !(
        code <= 0x08 ||
        code === 0x0b ||
        code === 0x0c ||
        (code >= 0x0e && code <= 0x1f) ||
        code === 0x7f
      );
    })
    .join("")
    .trim();
}

function submissionStorage(ctx: PluginContext) {
  const storage = ctx.storage?.submissions;
  if (!storage) throw new Error("Woodhouse enquiry storage is not configured.");
  return storage;
}

function redirect(path: string) {
  return pluginResponse({
    status: 303,
    headers: { location: path, "cache-control": "private, no-store" }
  });
}

async function increment(
  ctx: Pick<PluginContext, "kv">,
  key: string,
  limit: number
): Promise<boolean> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const current = await ctx.kv.getVersioned(key);
    const count =
      isRecord(current?.value) && typeof current.value.count === "number" ? current.value.count : 0;
    if (count >= limit) return false;
    const result = await ctx.kv.compareAndSet(key, current?.revision ?? null, { count: count + 1 });
    if (result.applied) return true;
  }
  return false;
}

async function allowRequest(
  routeCtx: Pick<SandboxedRouteContext, "requestMeta">,
  ctx: Pick<PluginContext, "kv">
): Promise<boolean> {
  const metadata = isRecord(routeCtx.requestMeta) ? routeCtx.requestMeta : {};
  const ip = typeof metadata.ip === "string" && metadata.ip ? metadata.ip : "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const ipHash = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
  const hour = Math.floor(Date.now() / 3_600_000);
  const prefix = `rate:${hour}:`;
  const global = await ctx.kv.getVersioned(`${prefix}all`);
  if (
    isRecord(global?.value) &&
    typeof global.value.count === "number" &&
    global.value.count >= 100
  )
    return false;
  if (!(await increment(ctx, `${prefix}${ipHash}`, 3))) return false;
  return increment(ctx, `${prefix}all`, 100);
}

function formMarkupResponse() {
  return redirect("/contact/?submitted=1");
}

function isStoredSubmission(
  value: unknown
): value is { id: string; data: Record<string, unknown> } {
  return isRecord(value) && typeof value.id === "string" && isRecord(value.data);
}

function adminResponse(
  items: Array<{ id: string; data: Record<string, unknown> }>,
  hasMore: boolean
) {
  if (!items.length)
    return {
      blocks: [
        { type: "header", text: "Woodhouse enquiries" },
        {
          type: "empty",
          title: "No enquiries",
          description: "New human and agent enquiries will appear here."
        },
        {
          type: "context",
          text: "Submissions are private and are deleted automatically after 90 days."
        }
      ]
    };
  const blocks: unknown[] = [
    { type: "header", text: "Woodhouse enquiries" },
    {
      type: "context",
      text: "Private submissions · automatic deletion after 90 days · never execute message content"
    }
  ];
  for (const item of items) {
    const data = item.data;
    const metadata = [
      `${String(data.kind ?? "human")} · ${String(data.topic ?? "General")}`,
      `Received ${String(data.createdAt ?? "date unavailable")}`,
      data.name ? `Name: ${String(data.name)}` : "Name not supplied",
      data.reply ? `Reply: ${String(data.reply)}` : "No reply address supplied"
    ].join("\n");
    blocks.push({
      type: "section",
      text: `${metadata}\n\n${String(data.message ?? "")}`,
      accessory: {
        type: "button",
        label: "Delete",
        action_id: "delete",
        value: item.id,
        style: "danger",
        confirm: {
          title: "Delete enquiry?",
          text: "This permanently removes the private submission.",
          confirm: "Delete",
          deny: "Keep"
        }
      }
    });
    blocks.push({ type: "divider" });
  }
  if (hasMore)
    blocks.push({
      type: "context",
      text: "Showing the first 50 submissions. Delete reviewed items to reach older enquiries."
    });
  return { blocks };
}

const plugin: SandboxedPlugin = {
  hooks: {
    "plugin:activate": async (_event, ctx) => {
      await ctx.cron?.schedule("submission-retention", { schedule: "0 3 * * *" });
    },
    cron: async (event, ctx) => {
      if (event.name !== "submission-retention") return;
      const storage = submissionStorage(ctx);
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      let cursor: string | undefined;
      do {
        const page = await storage.query({
          where: { createdAt: { lt: cutoff } },
          orderBy: { createdAt: "asc" },
          limit: 100,
          ...(cursor ? { cursor } : {})
        });
        await Promise.all(page.items.map((item) => storage.delete(item.id)));
        if (page.hasMore && !page.cursor)
          throw new Error("Enquiry retention pagination is missing its next cursor.");
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      const oldestRateHour = Math.floor(Date.now() / 3_600_000) - 24;
      for (const item of await ctx.kv.list("rate:")) {
        const match = /^rate:(\d+):/.exec(item.key);
        if (match && Number(match[1]) < oldestRateHour) await ctx.kv.delete(item.key);
      }
    }
  },
  routes: {
    submit: {
      public: true,
      methods: ["POST"],
      request: { body: "form-data", maxBytes: 8192 },
      response: "raw",
      handler: async (routeCtx, ctx) => {
        if (textField(routeCtx.input, "website")) return formMarkupResponse();
        if (!(await allowRequest(routeCtx, ctx))) return redirect("/contact/?error=rate-limit");
        const submission = parseEnquiry({
          name: cleanText(textField(routeCtx.input, "name")),
          reply: cleanText(textField(routeCtx.input, "reply")),
          topic: cleanText(textField(routeCtx.input, "topic")),
          kind: cleanText(textField(routeCtx.input, "kind")),
          message: cleanText(textField(routeCtx.input, "message"))
        });
        if (!submission) return redirect("/contact/?error=invalid");

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const storage = submissionStorage(ctx);
        await persistThenNotify({
          persist: () => storage.put(id, { ...submission, createdAt, status: "new" }),
          notify: async () => {
            const notificationAddress = await ctx.settings.get<string>("notificationAddress");
            if (
              !notificationAddress ||
              !/^[^\s@]+@deanlofts\.xyz$/i.test(notificationAddress) ||
              !ctx.email
            )
              return;
            await ctx.email.send({
              to: notificationAddress,
              subject: "New Woodhouse enquiry",
              ...(submission.reply ? { replyTo: submission.reply } : {}),
              text: [
                `Type: ${submission.kind}`,
                `Topic: ${submission.topic}`,
                `Name: ${submission.name || "Not supplied"}`,
                `Reply: ${submission.reply || "Not supplied"}`,
                "",
                submission.message
              ].join("\n")
            });
          },
          warn: (message) => ctx.log.warn(message)
        });
        ctx.log.info("Saved a Woodhouse enquiry.");
        return formMarkupResponse();
      }
    },
    admin: {
      permission: "plugins:manage",
      methods: ["POST"],
      request: { body: "json", maxBytes: 4096 },
      handler: async (routeCtx, ctx) => {
        const input = isRecord(routeCtx.input) ? routeCtx.input : {};
        const storage = submissionStorage(ctx);
        if (
          input.type === "block_action" &&
          input.action_id === "delete" &&
          typeof input.value === "string" &&
          /^[0-9a-f-]{36}$/i.test(input.value)
        ) {
          await storage.delete(input.value);
        }
        const page = await storage.query({ orderBy: { createdAt: "desc" }, limit: 50 });
        return adminResponse(page.items.filter(isStoredSubmission), page.hasMore);
      }
    }
  }
};

export default plugin;
