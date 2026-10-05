import type { APIRoute } from "astro";
import { listProjectRecords, listPublicEvidence } from "../../content/repository";
import { portfolioReadout } from "../../data/portfolio";

export const prerender = false;
const siteOrigin = new URL(import.meta.env.SITE ?? "https://woodhouse.loftwah.com").origin;

export const GET: APIRoute = async ({ cache }) => {
  const [projectResult, evidenceResult] = await Promise.all([
    listProjectRecords(),
    listPublicEvidence()
  ]);
  if (projectResult.error || evidenceResult.error) {
    return new Response("Unable to load the current public facts.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "private, no-store" }
    });
  }
  for (const hint of projectResult.cacheHints) cache.set(hint);
  cache.set(evidenceResult.cacheHint);
  const evidenceByProject = new Map(
    evidenceResult.evidence.map((item) => [String(item.data.project_key), item])
  );
  const projects = projectResult.projects.map((project) => {
    const evidence = evidenceByProject.get(project.slug);
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
            summary: evidence.data.summary
          }
        : null
    };
  });
  const readout = portfolioReadout(projectResult.projects);
  const pirates = projectResult.projects.find((project) => project.slug === "pirates");
  const bubbles = projectResult.projects.find((project) => project.slug === "bubbles");
  const max = projectResult.projects.find((project) => project.slug === "max");
  const assetHunter = projectResult.projects.find((project) => project.slug === "asset-hunter");
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
    knownAnswers: {
      piratesProceduralFork: {
        answer:
          pirates?.state === "Gate B locked"
            ? "not approved"
            : "see current reviewed project state",
        reason: pirates?.proofBoundary ?? "No public Pirates state is available.",
        project: "pirates",
        reviewed: pirates?.reviewDate ?? readout.reviewDate
      },
      bubblesExactProductionBuild: {
        answer: "not established by this public snapshot",
        reason: "No exact deployed build identity or production receipt is published here.",
        project: "bubbles",
        reviewed: bubbles?.reviewDate ?? readout.reviewDate
      },
      assetHunterExternalUse: {
        answer: "no recorded external use",
        reason: assetHunter?.proofBoundary ?? "No public Asset Hunter state is available.",
        project: "asset-hunter",
        reviewed: assetHunter?.reviewDate ?? readout.reviewDate
      },
      sharedAgentSafetyLayer: {
        answer: "no shared implementation; checked and not adopted",
        reason:
          "The factory's interactive products share agent doctrine, not code. Browser contention, visual-evidence " +
          "comparison, long-run reporting and deployment verification were reviewed on 5 October 2026 and resolve to " +
          "different mechanisms with different failure modes. No product imports another. Nothing is being extracted.",
        project: null,
        reviewed: readout.reviewDate
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
