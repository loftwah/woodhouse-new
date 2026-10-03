import { definePlugin } from "emdash";
import type { PluginContext, ResolvedPlugin } from "emdash";
import type { EmailDeliverEvent } from "emdash/plugin";
import { createResendPayload, isEmailAddress, sendResendRequest } from "./resend-email-core.js";

type ResendEmailConfig = {
  from: string;
};

type CloudflareEnv = {
  RESEND_API_KEY?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function loadWorkerEnv(): Promise<CloudflareEnv> {
  try {
    const { env } = await import("./resend-email-env.js");
    return isRecord(env) && typeof env.RESEND_API_KEY === "string"
      ? { RESEND_API_KEY: env.RESEND_API_KEY }
      : {};
  } catch {
    throw new Error("[woodhouse-resend-email] Cloudflare Worker environment is unavailable.");
  }
}

async function deliverWithResend(
  config: ResendEmailConfig,
  event: EmailDeliverEvent,
  ctx: PluginContext
): Promise<void> {
  const payload = createResendPayload(config.from, event.message);
  const { RESEND_API_KEY: apiKey } = await loadWorkerEnv();
  if (!apiKey) {
    throw new Error("[woodhouse-resend-email] RESEND_API_KEY is missing from the Worker secrets.");
  }

  const messageId = await sendResendRequest(apiKey, payload);
  ctx.log.info("EmDash email delivered via Resend", { messageId });
}

export function createPlugin(config: ResendEmailConfig): ResolvedPlugin {
  if (!isEmailAddress(config.from)) {
    throw new Error("[woodhouse-resend-email] A valid sender address is required.");
  }

  return definePlugin({
    id: "woodhouse-resend-email",
    version: "1.0.0",
    capabilities: ["hooks.email-transport:register"],
    hooks: {
      "email:deliver": {
        exclusive: true,
        handler: async (event, ctx) => deliverWithResend(config, event, ctx)
      }
    }
  });
}
