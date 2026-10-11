import type { APIRoute } from "astro";
import {
  listProjectRecords,
  listPublicEvidence,
  listPublicCapabilities
} from "../../content/repository";
import { portfolioReadout } from "../../data/portfolio";

export const prerender = false;
const siteOrigin = new URL(import.meta.env.SITE ?? "https://woodhouse.loftwah.com").origin;

export const GET: APIRoute = async ({ cache }) => {
  const [projectResult, evidenceResult, capabilityResult] = await Promise.all([
    listProjectRecords(),
    listPublicEvidence(),
    listPublicCapabilities()
  ]);
  if (projectResult.error || evidenceResult.error || capabilityResult.error) {
    return new Response("Unable to load the current public facts.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "private, no-store" }
    });
  }
  for (const hint of projectResult.cacheHints) cache.set(hint);
  cache.set(evidenceResult.cacheHint);
  for (const hint of capabilityResult.cacheHints) cache.set(hint);
  const projects = projectResult.projects.map((project) => {
    // A newer radio-only review must not become proof for an older gameplay state.
    const evidence = evidenceResult.evidence.find(
      (item) =>
        item.data.project_key === project.slug && item.data.snapshot_key === project.snapshotId
    );
    return {
      slug: project.slug,
      name: project.name,
      discipline: project.discipline,
      state: project.state,
      summary: project.summary,
      current: project.current,
      nextProof: project.remaining,
      proofBoundary: project.proofBoundary,
      reviewed: project.reviewDate,
      evidence: evidence
        ? {
            slug: evidence.id,
            href: `/evidence/${evidence.id}/`,
            kind: evidence.data.evidence_kind,
            state: evidence.data.evidence_state,
            summary: evidence.data.summary,
            reviewed: evidence.data.reviewed_at,
            snapshot: evidence.data.snapshot_key
          }
        : null
    };
  });
  const readout = portfolioReadout(projectResult.projects);
  const pirates = projectResult.projects.find((project) => project.slug === "pirates");
  const bubbles = projectResult.projects.find((project) => project.slug === "bubbles");
  const bubblesAdoption = capabilityResult.capabilities
    .find((capability) => capability.key === "loftwahfm-radio")
    ?.consumers.find((consumer) => consumer.project.slug === "bubbles");
  const max = projectResult.projects.find((project) => project.slug === "max");
  const body = {
    name: "WOODHOUSE",
    description: "The Loftwah Software Factory: a public observatory and engineering journal.",
    recordType: "operator-reviewed public snapshot",
    reviewed: readout.reviewDate,
    source: readout.snapshotSource ?? null,
    currentAsOf: readout.reviewDate,
    liveTelemetry: false,
    // A portfolio is reviewed project by project, so the record reports the newest
    // review and how many projects predate it rather than one date for all of them.
    portfolioReviewed: readout.reviewDate,
    projectsReviewedEarlier: readout.olderCount,
    repositoryPolicy:
      "Private repository contents are not published or connected to this endpoint. " +
      "A project whose repository is public is summarised from that repository and its published site.",
    projectCount: projects.length,
    projects,
    portfolioRole: {
      hub: "Woodhouse publishes portfolio discovery, relationships and reviewed evidence.",
      spokes: "Each project owns its product, identity and release gates.",
      workAuthority: "GitHub remains canonical for issues and pull requests.",
      futureConsumers:
        "Discover published project identities and upstream game profiles; add a reviewed capability record after checking the owning work and source. A profile alone is not adoption."
    },
    capabilities: capabilityResult.capabilities,
    knownAnswers: {
      piratesProceduralFork: {
        answer:
          pirates?.state === "Gate B locked" || pirates?.state === "Source parity before expansion"
            ? "not approved"
            : "see current reviewed project state",
        reason: pirates?.proofBoundary ?? "No public Pirates state is available.",
        project: "pirates",
        reviewed: pirates?.reviewDate ?? readout.reviewDate
      },
      bubblesExactProductionBuild: {
        answer: bubblesAdoption?.record.deployed
          ? "exact radio release recorded; owner-preview limits remain"
          : "not established by this public snapshot",
        reason: bubblesAdoption?.record.deployed
          ? bubblesAdoption.record.scope
          : "No exact deployed build identity or production receipt is published here.",
        revision: bubblesAdoption?.record.deployed_revision || null,
        project: "bubbles",
        reviewed: bubbles?.reviewDate ?? readout.reviewDate
      },
      assetHunterExternalUse: {
        answer: "not remeasured in this review",
        reason:
          "The 5 October public record reported no recorded external use. The 7 October report does not provide a fresh usage measurement.",
        project: "asset-hunter",
        reviewed: "2026-10-05"
      },
      sharedAgentSafetyLayer: {
        answer: "no shared implementation; checked and not adopted",
        reason:
          "These safety and release mechanisms share agent doctrine, not an adopted implementation. Browser contention, visual-evidence " +
          "comparison, long-run reporting and deployment verification were reviewed on 5 October 2026 and resolve to " +
          "different mechanisms with different failure modes. This dated finding concerns those safety and release mechanisms; shared music is reviewed separately in capabilities.",
        project: null,
        reviewed: "2026-10-05"
      },
      maxPhysicalWalker: {
        answer: "not physically proven",
        reason: max?.proofBoundary ?? "No public MAX state is available.",
        project: "max",
        reviewed: max?.reviewDate ?? readout.reviewDate
      }
    },
    contact: {
      github: "https://github.com/loftwah",
      x: "https://x.com/loftwah",
      linkedIn: "https://www.linkedin.com/in/deanlofts/",
      page: `${siteOrigin}/contact/`
    },
    permissions: {
      read: "public curated facts",
      write: false,
      privateRepositoryAccess: false,
      conversationPublishing: false,
      privateEmDashMcpAdvertised: false
    }
  };
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60"
  });
  if (new URL(siteOrigin).hostname.endsWith(".workers.dev"))
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return new Response(JSON.stringify(body, null, 2), { headers });
};
