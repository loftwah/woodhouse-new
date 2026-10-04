import type { APIRoute } from "astro";
import type { BuildIdentity } from "../data/build-identity";
import { listPublicContentGeneration } from "../content/repository";

// Reports exactly which source this deployed Worker was built from.
//
// The Worker cannot learn its own Cloudflare version id, so it does not claim
// one. What it can report is the source fingerprint computed during the build,
// the commit that tree sat on, and whether that tree was clean. A deploy gate
// compares the fingerprint here against the digest it intended to ship, which
// is what turns "deployed" into "verified as this exact source".
//
// The shape is shared across the factory: `loftwah.build-identity/1`.

export type { BuildIdentity };

export const prerender = false;
const siteOrigin = new URL(import.meta.env.SITE ?? "https://woodhouse.loftwah.com").origin;

export const GET: APIRoute = async ({ cache }) => {
  const identity = __WOODHOUSE_BUILD_IDENTITY__;

  // The build identity is the point of this route and never depends on the
  // content read. Code and content are delivered by different mechanisms, so a
  // content failure is reported honestly as absent rather than turning a
  // working identity endpoint into an error.
  const content = await listPublicContentGeneration().catch(() => ({
    generation: null,
    counts: null,
    reviewDate: null,
    cacheHints: [],
    error: new Error("content read unavailable")
  }));
  for (const hint of content.cacheHints ?? []) cache.set(hint);

  const body = {
    schema: identity.schema,
    name: identity.name,
    environment: identity.environment,
    sourceDigest: identity.sourceDigest,
    gitCommit: identity.gitCommit,
    gitClean: identity.gitClean,
    builtAt: identity.builtAt,
    content: content.error
      ? { available: false, generation: null, counts: null, snapshotReviewed: null }
      : {
          available: true,
          generation: content.generation,
          counts: content.counts,
          snapshotReviewed: content.reviewDate ?? null
        },
    verification: {
      method:
        "compare sourceDigest and content.generation against what the release intended to ship",
      intended:
        "The deploy gate fails if the source fingerprint differs from the one it built and deployed. The content generation is reported so a stale read model stays visible even when the code is current.",
      note: "This endpoint cannot report its own Cloudflare Worker version id; the release receipt records that."
    },
    origin: siteOrigin,
    documentation: `${siteOrigin}/architecture/`
  };

  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60"
  });
  if (new URL(siteOrigin).hostname.endsWith(".workers.dev"))
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return new Response(JSON.stringify(body, null, 2), { headers });
};
