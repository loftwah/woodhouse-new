// Reads a deployed origin's build identity and compares it with what the caller
// expected.
//
// Two jobs. During a deploy, the expected digest is the one this run just
// built, so a mismatch fails the release instead of being noticed later.
// Standing alone, it answers the question that is otherwise guesswork: what is
// this origin actually serving right now?
//
//   pnpm run verify:build -- https://woodhouse.loftwah.com
//   pnpm run verify:build -- https://woodhouse.loftwah.com --expect sha256:…
//
// This verifier checks Woodhouse's `loftwah.build-identity/1` endpoint.
// No other factory repository is integrated with this verifier.

export const IDENTITY_PATH = "/build.json";

function normaliseOrigin(value) {
  const raw = String(value ?? "").trim();
  if (!raw) throw new Error("An origin URL is required.");
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname))
    throw new Error("Build identity may only be read over HTTPS.");
  return url.origin;
}

/**
 * Fetches and structurally validates an origin's identity. Returns a result
 * object rather than throwing so callers can report every problem at once.
 */
/**
 * Structural checks for an identity that was read elsewhere. Exported so the
 * rules can be tested without a network round trip.
 */
export function identityProblems(identity) {
  const problems = [];
  if (
    typeof identity?.schema !== "string" ||
    !identity.schema.startsWith("loftwah.build-identity/")
  )
    problems.push(
      `schema ${JSON.stringify(identity?.schema ?? null)} is not a build-identity schema`
    );
  if (
    typeof identity?.sourceDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(identity.sourceDigest)
  )
    problems.push(
      `sourceDigest ${JSON.stringify(identity?.sourceDigest ?? null)} is not a sha256 fingerprint`
    );
  if (!Number.isFinite(Date.parse(identity?.builtAt ?? "")))
    problems.push("builtAt is missing or not a date");
  if (identity?.content && identity.content.available === true) {
    if (
      typeof identity.content.generation !== "string" ||
      !/^sha256:[a-f0-9]{64}$/.test(identity.content.generation)
    )
      problems.push(
        `content.generation ${JSON.stringify(identity.content.generation ?? null)} is not a sha256 fingerprint`
      );
    if (!identity.content.counts || typeof identity.content.counts !== "object")
      problems.push("content.counts is missing");
  }
  return problems;
}

export async function readBuildIdentity(origin, { timeoutMs = 30000 } = {}) {
  const base = normaliseOrigin(origin);
  const response = await fetch(`${base}${IDENTITY_PATH}?verify=${Date.now()}`, {
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "manual"
  }).catch((error) => ({ ok: false, status: 0, error }));
  if (!response?.ok) {
    const detail =
      response?.status === 0
        ? `could not be reached (${response.error?.message ?? "network error"})`
        : `responded HTTP ${response?.status ?? "unknown"}`;
    return { origin: base, ok: false, problems: [`${IDENTITY_PATH} ${detail}`], identity: null };
  }
  const identity = await response.json().catch(() => null);
  if (!identity || typeof identity !== "object") {
    return {
      origin: base,
      ok: false,
      problems: [`${IDENTITY_PATH} did not return a JSON object`],
      identity: null
    };
  }
  const problems = identityProblems(identity);
  return { origin: base, ok: problems.length === 0, problems, identity };
}

/**
 * Compares an identity with what the caller intended to ship.
 */
export function compareBuildIdentity(identity, { expectedDigest, expectedEnvironment } = {}) {
  const problems = [];
  if (!identity) return ["no identity was read"];
  if (expectedDigest && identity.sourceDigest !== expectedDigest)
    problems.push(
      `origin serves ${identity.sourceDigest ?? "none"} but ${expectedDigest} was expected`
    );
  if (expectedEnvironment && identity.environment !== expectedEnvironment)
    problems.push(
      `origin reports environment ${JSON.stringify(identity.environment ?? null)}; expected ${expectedEnvironment}`
    );
  return problems;
}

export function describeIdentity(identity) {
  if (!identity) return "no identity";
  const short = String(identity.sourceDigest ?? "").slice(0, 19);
  const commit = identity.gitCommit ? identity.gitCommit.slice(0, 12) : "unknown";
  const clean = identity.gitClean === true ? "clean tree" : "dirty or unreported tree";
  return `${identity.name ?? "unnamed"} ${identity.environment ?? "unknown"} · ${short}… · ${commit} · ${clean} · built ${identity.builtAt ?? "unknown"}`;
}

/**
 * Wait until an origin serves the identity the caller intended to ship.
 *
 * `readBuildIdentity` busts the edge cache with a unique query string, so it does
 * not read a stale cached response. It can still read the *previous Worker
 * version*: publishing a version propagates to Cloudflare's network over a short
 * window, and a single request immediately after a deploy can be served by the
 * version that is being replaced.
 *
 * Measured on preview: `pnpm run deploy:preview` reported
 * `origin serves sha256:07c90ac… but sha256:89fafe31… was expected` on a deploy
 * that had in fact succeeded, and the origin served the expected digest on the
 * next request. The gate was reporting a successful deploy as a failure.
 *
 * So the check retries for a bounded window and reports every attempt. A digest
 * mismatch is retried, because it may be the outgoing version; a structurally
 * invalid identity or an unreachable origin is also retried, because a freshly
 * published version can briefly fail to initialise.
 */
export async function awaitBuildIdentity(
  origin,
  {
    expectedDigest,
    expectedEnvironment,
    attempts = 12,
    intervalMs = 5000,
    timeoutMs = 30000,
    read = readBuildIdentity,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  } = {}
) {
  const seen = [];
  let last = { origin, ok: false, problems: ["no attempt was made"], identity: null };
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    last = await read(origin, { timeoutMs });
    const problems = [
      ...last.problems,
      ...compareBuildIdentity(last.identity, { expectedDigest, expectedEnvironment })
    ];
    seen.push(
      problems.length
        ? `attempt ${attempt}: ${problems.join("; ")}`
        : `attempt ${attempt}: ${describeIdentity(last.identity)}`
    );
    if (!problems.length)
      return {
        ok: true,
        identity: last.identity,
        problems: [],
        attempts: attempt,
        attempts_log: seen
      };
    if (attempt < attempts) await sleep(intervalMs);
  }
  return {
    ok: false,
    identity: last.identity,
    problems: [
      ...last.problems,
      ...compareBuildIdentity(last.identity, { expectedDigest, expectedEnvironment })
    ],
    attempts,
    attempts_log: seen
  };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const flag = (name) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const positional = args.filter(
    (value, index) =>
      !value.startsWith("--") &&
      args[index - 1] !== "--expect" &&
      args[index - 1] !== "--expect-env"
  );
  const read = await readBuildIdentity(positional[0]);
  // Only compare once an identity was actually read, so a missing endpoint
  // reports one problem rather than two for the same cause.
  const problems = read.identity
    ? [
        ...read.problems,
        ...compareBuildIdentity(read.identity, {
          expectedDigest: flag("--expect"),
          expectedEnvironment: flag("--expect-env")
        })
      ]
    : read.problems;
  console.log(`${read.origin}\n  ${describeIdentity(read.identity)}`);
  if (read.identity?.content)
    console.log(
      `  content ${read.identity.content.available ? read.identity.content.generation : "unavailable"}` +
        (read.identity.content.snapshotReviewed
          ? ` · snapshot reviewed ${read.identity.content.snapshotReviewed}`
          : "")
    );
  if (problems.length) {
    console.error(`\nBuild identity check failed:\n- ${problems.join("\n- ")}`);
    process.exitCode = 1;
  } else {
    console.log("\nBuild identity check passed.");
  }
}
