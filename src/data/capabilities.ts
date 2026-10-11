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

/** Only FM's public player may be framed; optional malformed links fail closed. */
function fmPlayerUrl(value: string | null | undefined, path: string, parameter: string) {
  try {
    const url = new URL(value ?? "");
    const id = url.searchParams.get(parameter) ?? "";
    return url.origin === "https://fm.loftwah.com" &&
      !url.username &&
      !url.password &&
      url.pathname === path &&
      !url.hash &&
      [...url.searchParams].length === 1 &&
      (parameter === "edition" ? /^[a-f0-9]{64}$/.test(id) : /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function fmListening(block: CapabilityReview, showsEvidenceHref: string | null) {
  if (block.capability_key !== "loftwahfm-radio" || block.provider_key !== "loftwahfm") return null;
  const href = fmPlayerUrl(block.listen_url, "/radio", "station");
  const embed = fmPlayerUrl(block.embed_url, "/widget", "station");
  if (!href || !embed || new URL(href).search !== new URL(embed).search) return null;
  const shows = (showsEvidenceHref ? (block.published_shows ?? []) : []).flatMap((show) => {
    const url = fmPlayerUrl(show.url, "/radio", "edition");
    return url ? [{ title: show.title, href: url }] : [];
  });
  return { href, embed, summary: block.listening_summary, shows, showsEvidenceHref };
}

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
      listening: ReturnType<typeof fmListening>;
      consumers: Array<{
        project: ProjectIdentity;
        evidenceHref: string;
        stationHref: string | null;
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
      // A newer available client does not invalidate a reviewed supported pin.
      // V1 records keep their original single-version contract.
      const supported = block._version === 2 ? block.supported_clients : [];
      if (
        block._version === 2 &&
        (!supported.length ||
          new Set(supported.map((client) => client.version)).size !== supported.length ||
          !supported.every((client) => {
            const proof = proofs.get(client.evidence_key);
            return (
              /^\d+\.\d+\.\d+$/.test(client.version) &&
              safeUrl(client.package_url) &&
              /^[a-f0-9]{64}$/.test(client.package_sha256) &&
              backed(client.evidence_key, provider.slug, "production verification") &&
              !!formatReviewDate(proof?.data.reviewed_at ?? "") &&
              proof!.data.reviewed_at! <= block.reviewed_at
            );
          }) ||
          !supported.some(
            (client) =>
              client.version === block.available_version &&
              client.package_url === block.package_url &&
              client.package_sha256 === block.package_sha256 &&
              client.evidence_key === block.evidence_key
          ))
      )
        continue;
      const rows = block.consumers ?? [];
      if (new Set(rows.map((row) => row.project_key)).size !== rows.length) continue;
      const consumers = rows.flatMap((row) => {
        const project = identities.get(row.project_key);
        if (!project || !safeUrl(row.issue_url) || !backed(row.evidence_key, project.slug))
          return [];
        const installed = row.installed_version ?? "";
        const compatible =
          block._version === 2
            ? supported.some((client) => client.version === installed)
            : installed === block.available_version;
        const prefix = `${block.capability_key}-${project.slug}-client-${installed.replaceAll(".", "-")}-`;
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
          (!compatible || !stageProof(row.evidence_key, "implementation", "implementation"))
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
        return [
          {
            project,
            record: row,
            evidenceHref: `/evidence/${row.evidence_key}/`,
            stationHref:
              block.capability_key === "loftwahfm-radio" && block.provider_key === "loftwahfm"
                ? fmPlayerUrl(
                    `https://fm.loftwah.com/radio?station=${encodeURIComponent(row.station_id)}`,
                    "/radio",
                    "station"
                  )
                : null
          }
        ];
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
        listening: fmListening(
          block,
          backed(block.shows_evidence_key, provider.slug, "production verification") &&
            !!formatReviewDate(proofs.get(block.shows_evidence_key!)?.data.reviewed_at ?? "") &&
            proofs.get(block.shows_evidence_key!)!.data.reviewed_at! <= block.reviewed_at
            ? `/evidence/${block.shows_evidence_key}/`
            : null
        ),
        consumers
      });
    }
  return [...newest.values()].sort((a, b) => a.key.localeCompare(b.key));
}
export type PublicCapability = ReturnType<typeof projectCapabilities>[number];
