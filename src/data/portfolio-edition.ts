import type { EditorialDispatch } from "../content/repository.ts";
import { isObject, type PortfolioReport } from "./portfolio-analytics.ts";
import { outcomeStories, outcomeEvidence, storyLink } from "./connected-stories.ts";

/** Publication authority and frozen identity live in the existing EmDash dispatch. */
export function portfolioEdition(dispatches: EditorialDispatch[]) {
  const dispatch = dispatches.find(
    (d) => d.slug === "one-more-round" && d.kind === "Portfolio report"
  );
  if (!dispatch) return null;
  for (const block of dispatch.content) {
    if (block._type !== "prose" || !Array.isArray(block.content)) continue;
    for (const paragraph of block.content) {
      for (const mark of Array.isArray(paragraph.markDefs) ? paragraph.markDefs : []) {
        if (!isObject(mark)) continue;
        if (mark._type !== "link" || typeof mark.href !== "string") continue;
        const match = /^\/editions\/one-more-round\/\?report=([a-f0-9]{24})$/.exec(mark.href);
        if (match) return { ...dispatch, reportId: match[1]!, href: mark.href };
      }
    }
  }
  return null;
}
export type PortfolioEdition = NonNullable<ReturnType<typeof portfolioEdition>>;
const editionStories = [
  "protocol-11",
  "shoalshot",
  "bubbles",
  "fighter",
  "music",
  "link-check"
] as const;
export function editionSelections(report: PortfolioReport, publicIds?: ReadonlySet<string>) {
  return editionStories.flatMap((key) => {
    const story = outcomeStories.find((s) => s.key === key);
    return story && report.period && (!publicIds || publicIds.has(story.project))
      ? [
          {
            story,
            evidence: outcomeEvidence(report, story, report.period),
            href: storyLink(story, report.id)
          }
        ]
      : [];
  });
}
export function editionCaption(
  edition: PortfolioEdition,
  report: PortfolioReport,
  origin = "https://woodhouse.loftwah.com",
  publicIds?: ReadonlySet<string>
) {
  if (report.id !== edition.reportId) throw new Error("Edition snapshot mismatch");
  return `${edition.title}\n${edition.deck}\nEditorial review: ${edition.reviewDate}. Observations: ${report.period!.from} to ${report.period!.to} UTC. Partial source coverage; no weekly record or causal claim.\n${editionSelections(
    report,
    publicIds
  )
    .map(
      ({ story, evidence }) =>
        `${story.name}: ${evidence.display} · ${story.label} · ${evidence.coverage}`
    )
    .join(
      "\n"
    )}\nSeparate source measures, not unique people or a ranked competition. Definitions and limits accompany each story.\nSnapshot ${report.id}\n${new URL(edition.href, origin).href}`;
}
