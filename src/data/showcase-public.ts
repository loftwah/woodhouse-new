import { campaignItems, type CampaignItem } from "./showcase-campaign.ts";

/** A campaign never overrides the CMS publication decision, including a composite's inputs. */
export function publicCampaignItems(projectSlugs: string[]): CampaignItem[] {
  const published = new Set(projectSlugs);
  return campaignItems.filter(
    (item) =>
      (item.project === "woodhouse" || published.has(item.project)) &&
      (item.requiredProjects ?? []).every((slug) => published.has(slug))
  );
}

export function campaignCollectionPath(slug: string) {
  return `/share/${encodeURIComponent(slug)}/`;
}

/** A portrait poster remains whole in the gallery; the unfurl uses a wide composition. */
export function campaignSocial(items: CampaignItem[]) {
  const lead = items[0];
  if (lead?.landscapeImage)
    return {
      ...lead,
      image: lead.landscapeImage,
      original: lead.landscapeImage,
      width: 1200,
      height: 630
    };
  return items.find((item) => item.width > item.height) ?? items[0];
}

export function campaignSitemapEntries(projectSlugs: string[]) {
  const items = publicCampaignItems(projectSlugs);
  return [...new Set(items.map((item) => item.project))].map((slug) => {
    const collection = items.filter((item) => item.project === slug);
    return {
      path: campaignCollectionPath(slug),
      lastmod: collection
        .map((item) => item.reviewedAt)
        .sort()
        .at(-1),
      images: [
        ...new Set(
          collection.flatMap((item) => [
            item.original,
            ...(item.landscapeImage ? [item.landscapeImage] : [])
          ])
        )
      ]
    };
  });
}
