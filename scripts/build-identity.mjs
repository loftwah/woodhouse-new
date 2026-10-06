// Stamps the deployed Worker with the identity of the source it was built
// from, so a deployed origin can report exactly what is running.
//
// The Worker cannot learn its own Cloudflare version id at runtime, so this
// deliberately reports only what the build genuinely knows: the source
// fingerprint, when the build ran, and which environment it was built for.
// The deploy scripts own the Cloudflare version and record it in the private
// release receipt. Claiming more here would be exactly the false production
// claim this project forbids.

import { computeSourceDigest } from "./source-digest.mjs";
import { spawnSync } from "node:child_process";

// Woodhouse's release-identity shape. Reviewed 7 October 2026: it has no
// adopters elsewhere in the factory and does not describe a fleet integration.
export const BUILD_IDENTITY_SCHEMA = "loftwah.build-identity/1";

export const BUILD_IDENTITY_GLOBAL = "__WOODHOUSE_BUILD_IDENTITY__";

/**
 * Builds the identity object. Kept separate from the integration so it can be
 * unit tested without running an Astro build.
 */
export function buildIdentity({ sourceDigest, builtAt, environment, gitCommit, gitClean }) {
  return {
    schema: BUILD_IDENTITY_SCHEMA,
    name: "WOODHOUSE",
    environment,
    sourceDigest,
    builtAt,
    gitCommit: gitCommit ?? null,
    gitClean: gitClean === true
  };
}

/**
 * Reports the commit the build tree sat on, and whether that tree was clean.
 * A build from a dirty tree has no reviewable commit, so the flag has to
 * travel with the commit rather than being implied.
 */
export function readGitProvenance(root = process.cwd()) {
  const run = (args) => {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    if (result.error || result.status !== 0) return null;
    return (result.stdout ?? "").trim();
  };
  const commit = run(["rev-parse", "HEAD"]);
  const status = run(["status", "--porcelain"]);
  return {
    gitCommit: commit && /^[a-f0-9]{40}$/.test(commit) ? commit : null,
    gitClean: status === ""
  };
}

export function validateIdentity(identity) {
  const problems = [];
  if (identity?.schema !== BUILD_IDENTITY_SCHEMA) problems.push("unexpected schema");
  if (typeof identity?.name !== "string" || !identity.name) problems.push("name is missing");
  if (identity?.environment !== "production" && identity?.environment !== "preview")
    problems.push("environment must be production or preview");
  if (
    typeof identity?.sourceDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(identity.sourceDigest)
  )
    problems.push("sourceDigest must be a sha256: fingerprint");
  if (!Number.isFinite(Date.parse(identity?.builtAt ?? "")))
    problems.push("builtAt must be a date");
  return problems;
}

/**
 * Astro integration. Computes the fingerprint during `astro:config:setup` and
 * replaces the identity global at build time, so nothing is written into the
 * source tree and the deployed bundle carries no extra file.
 */
export function buildIdentityIntegration() {
  return {
    name: "woodhouse-build-identity",
    hooks: {
      "astro:config:setup": async ({ updateConfig, logger }) => {
        const environment = process.env.CLOUDFLARE_ENV === "preview" ? "preview" : "production";
        const sourceDigest = await computeSourceDigest(process.cwd());
        const identity = buildIdentity({
          sourceDigest,
          builtAt: new Date().toISOString(),
          environment,
          ...readGitProvenance(process.cwd())
        });
        const problems = validateIdentity(identity);
        if (problems.length)
          throw new Error(
            "Refusing to build without a valid build identity: " + problems.join("; ") + "."
          );
        logger.info(`Build identity ${identity.sourceDigest.slice(0, 19)}… for ${environment}.`);
        updateConfig({
          vite: {
            define: {
              [BUILD_IDENTITY_GLOBAL]: JSON.stringify(identity)
            }
          }
        });
      }
    }
  };
}
