import type { EvidenceRecord, DispatchContentBlock } from "../../emdash-env";
import { formatReviewDate } from "./review-date.ts";

export type CapabilityReview = Extract<DispatchContentBlock, { _type: "capability_review" }>;
type ProjectIdentity = { slug: string; name: string };
type Evidence = {
  id: string;
  data: Pick<EvidenceRecord, "public_safe" | "project_key" | "evidence_state" | "evidence_kind"> &
    Partial<Pick<EvidenceRecord, "revision" | "reviewed_at">>;
};
type ReviewedDispatch = { slug: string; reviewDate: string; content: DispatchContentBlock[] };

/** Project and evidence membership is checked here; a CMS checkbox alone cannot prove adoption. */
export function projectCapabilities(
  dispatches: ReviewedDispatch[],
  projects: ProjectIdentity[],
  evidence: Evidence[]
) {
  const identities = new Map(projects.map((p) => [p.slug, p]));
  const proofs = new Map(evidence.map((e) => [e.id, e]));
  const safeUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  };
  const backed = (key: string | null | undefined, project: string, kind?: string) => {
    const proof = key ? proofs.get(key) : undefined;
    return (
      !!proof &&
      proof.data.public_safe === true &&
      proof.data.project_key === project &&
      proof.data.evidence_state === "reviewed" &&
      (!kind || proof.data.evidence_kind === kind)
    );
  };
  const newest = new Map<
    string,
    {
      key: string;
      provider: ProjectIdentity;
      href: string;
      review: CapabilityReview;
      consumers: Array<{
        project: ProjectIdentity;
        evidenceHref: string;
        record: NonNullable<CapabilityReview["consumers"]>[number];
      }>;
    }
  >();
  for (const dispatch of dispatches)
    for (const block of dispatch.content) {
      if (
        block._type !== "capability_review" ||
        !formatReviewDate(block.reviewed_at) ||
        block.reviewed_at > dispatch.reviewDate
      )
        continue;
      const provider = identities.get(block.provider_key);
      if (
        !provider ||
        !backed(block.evidence_key, provider.slug) ||
        !/^[a-f0-9]{64}$/.test(block.package_sha256) ||
        ![
          block.package_url,
          block.programme_url,
          block.documentation_url,
          block.stations_url,
          block.profiles_url
        ].every(safeUrl)
      )
        continue;
      const rows = block.consumers ?? [];
      if (new Set(rows.map((row) => row.project_key)).size !== rows.length) continue;
      const consumers = rows.flatMap((row) => {
        const project = identities.get(row.project_key);
        if (!project || !safeUrl(row.issue_url) || !backed(row.evidence_key, project.slug))
          return [];
        const prefix = `${block.capability_key}-${project.slug}-client-${block.available_version.replaceAll(".", "-")}-`;
        const stageProof = (
          key: string | null | undefined,
          stage: string,
          kind: string,
          revision?: string | null
        ) => {
          const proof = key ? proofs.get(key) : undefined;
          return (
            !!key &&
            key.startsWith(prefix + stage + "-") &&
            backed(key, project.slug, kind) &&
            !!proof &&
            !!formatReviewDate(proof.data.reviewed_at ?? "") &&
            proof.data.reviewed_at! <= block.reviewed_at &&
            (!revision || proof.data.revision === revision)
          );
        };
        if (
          row.implemented &&
          (row.installed_version !== block.available_version ||
            !stageProof(row.evidence_key, "implementation", "implementation"))
        )
          return [];
        if (
          row.deployed &&
          (!row.implemented ||
            !row.deployed_revision ||
            !stageProof(
              row.release_evidence_key,
              "release",
              "production verification",
              row.deployed_revision
            ))
        )
          return [];
        if (
          row.verified &&
          (!row.deployed ||
            !stageProof(
              row.interaction_evidence_key,
              "interaction",
              "qualification",
              row.deployed_revision
            ))
        )
          return [];
        return [{ project, record: row, evidenceHref: `/evidence/${row.evidence_key}/` }];
      });
      // Partial or impossible records are not a public adoption claim.
      if (consumers.length !== rows.length) continue;
      const previous = newest.get(block.capability_key);
      if (previous && previous.review.reviewed_at >= block.reviewed_at) continue;
      newest.set(block.capability_key, {
        key: block.capability_key,
        provider,
        href: `/dispatches/${dispatch.slug}/`,
        review: block,
        consumers
      });
    }
  return [...newest.values()].sort((a, b) => a.key.localeCompare(b.key));
}
export type PublicCapability = ReturnType<typeof projectCapabilities>[number];
