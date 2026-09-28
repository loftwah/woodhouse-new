import { projects, reviewDate, snapshotSource } from "../../data/projects";

export const prerender = true;

export function GET() {
  const body = {
    name: "WOODHOUSE",
    description: "The Loftwah Software Factory: an evidence-led public observatory and engineering journal.",
    recordType: "operator-reviewed public snapshot",
    reviewed: reviewDate,
    source: snapshotSource,
    currentAsOf: reviewDate,
    liveTelemetry: false,
    repositoryPolicy: "Seven project repositories are private. Raw issue and pull request content is not published.",
    projectCount: projects.length,
    projects: projects.map((project) => ({
      slug: project.slug,
      name: project.name,
      discipline: project.discipline,
      state: project.state,
      summary: project.summary,
      current: project.current,
      nextProof: project.remaining,
      proofBoundary: project.proofBoundary
    })),
    knownAnswers: {
      piratesProceduralFork: {
        answer: "not approved",
        reason: "The parity gate remains locked in the reviewed snapshot.",
        project: "pirates",
        reviewed: reviewDate
      },
      bubblesExactProductionBuild: {
        answer: "not established by this public snapshot",
        reason: "No exact deployed build identity or production receipt is published here.",
        project: "bubbles",
        reviewed: reviewDate
      },
      maxPhysicalWalker: {
        answer: "not physically proven",
        reason: "The reviewed report still requires the real Pi, walker and in-situ FIND experience.",
        project: "max",
        reviewed: reviewDate
      }
    },
    contact: {
      github: "https://github.com/loftwah",
      x: "https://x.com/loftwah",
      linkedIn: "https://au.linkedin.com/in/deanlofts",
      page: "https://woodhouse.loftwah.com/contact/"
    },
    permissions: {
      read: "public curated facts",
      write: false,
      privateRepositoryAccess: false,
      conversationPublishing: false
    }
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
