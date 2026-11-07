// Optional publication adapter. The release remains successful if reporting fails.
// Only bounded, explicitly prepared public HTTP checks can qualify this automatic
// path. UI, authenticated and physical journeys still need their actual operator.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { publishDelivery } from "./showcase-delivery.mjs";

export async function showcasePublication(
  receipt,
  {
    env = process.env,
    fetchImpl = globalThis.fetch,
    publish = publishDelivery,
    readEvent = async () =>
      JSON.parse(
        await readFile(
          resolve(env.WOODHOUSE_SHOWCASE_EVENT || ".release/showcase-event.json"),
          "utf8"
        )
      )
  } = {}
) {
  if (receipt.environment !== "production") return { status: "not_production" };
  let event;
  try {
    event = await readEvent();
  } catch (error) {
    return { status: error.code === "ENOENT" ? "not_prepared" : "event_unreadable" };
  }
  try {
    // Bind prepared content to the exact candidate so an old description cannot
    // announce a new release. Worker version comes from the successful deploy.
    if (event.commit !== receipt.gitCommit || event.repo !== "loftwah/woodhouse-new")
      return { status: "stale_event" };
    const checks = event.productionChecks;
    if (
      event.verificationScope !== "public-http-content" ||
      !Array.isArray(checks) ||
      checks.length < 1 ||
      checks.length > 5
    ) {
      return {
        status: "awaiting_affected_flow",
        action:
          "Run the affected journey and publish its source-bound event with showcase-delivery.mjs."
      };
    }
    const descriptions = [];
    for (const check of checks) {
      if (
        typeof check.path !== "string" ||
        !check.path.startsWith("/") ||
        check.path.startsWith("//") ||
        typeof check.contains !== "string" ||
        !check.contains.trim() ||
        check.contains.length > 500
      )
        return { status: "invalid_live_check" };
      const url = new URL(check.path, receipt.origin);
      if (url.origin !== new URL(receipt.origin).origin) return { status: "invalid_live_check" };
      const response = await fetchImpl(url, {
        redirect: "error",
        signal: AbortSignal.timeout(10000)
      });
      const body = await response.text();
      if (!response.ok || body.length > 2_000_000 || !body.includes(check.contains))
        return {
          status: "affected_flow_failed",
          action:
            "Production changed; the prepared HTTP content check failed. No production showcase sent."
        };
      descriptions.push(
        `HTTP ${response.status}: ${check.path} contains the expected public content`
      );
    }
    const proof = descriptions.join("; ");
    const common = {
      ...event,
      deployment: { version: receipt.workerVersion, url: receipt.origin },
      verified: `${event.verified}. Automatic live evidence: ${proof}. Rendered, authenticated and physical journeys are not established by these HTTP checks.`
    };
    const merged = await publish(
      { ...common, stage: "MERGED_TO_MAIN" },
      { send: true, env, fetchImpl }
    );
    const production = await publish(
      {
        ...common,
        stage: "PRODUCTION_VERIFIED",
        evidence: {
          ...event.evidence,
          production: {
            success: true,
            environment: "production",
            commit: receipt.gitCommit,
            version: receipt.workerVersion,
            url: receipt.origin,
            check: proof,
            checkedAt: new Date().toISOString()
          }
        }
      },
      { send: true, env, fetchImpl }
    );
    return { status: "publication_reporting", merged, production };
  } catch {
    return {
      status: "notification_fault",
      action: "Release status is unchanged; inspect the private event and delivery state."
    };
  }
}
