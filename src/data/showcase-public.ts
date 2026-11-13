import type { PublicSearchItem } from "../content/repository";
import { campaignItems, type CampaignItem } from "./showcase-campaign.ts";

/** The existing renderer caps display JPEGs at 1200px on their longest edge. */
export function campaignResponsiveImage(item: CampaignItem) {
  const scale = Math.min(1, 1200 / item.width, 1200 / item.height);
  const fullWidth = Math.round(item.width * scale);
  return {
    thumbnail: item.thumbnail ?? `/campaign/20261026-previews/${item.id}.jpg`,
    thumbnailWidth: Math.min(640, fullWidth),
    fullWidth
  };
}

/** A campaign never overrides the CMS publication decision, including a composite's inputs. */
export function publicCampaignItems(projectSlugs: string[]): CampaignItem[] {
  const published = new Set(projectSlugs);
  return campaignItems
    .filter(
      (item) =>
        (item.project === "woodhouse" || published.has(item.project)) &&
        (item.requiredProjects ?? []).every((slug) => published.has(slug))
    )
    .sort((a, b) => {
      const archiveOrder = Number(Boolean(a.archived)) - Number(Boolean(b.archived));
      return archiveOrder || (b.addedAt ?? b.reviewedAt).localeCompare(a.addedAt ?? a.reviewedAt);
    });
}

export function campaignCollectionPath(slug: string) {
  return `/share/${encodeURIComponent(slug)}/`;
}

/** A portrait poster remains whole in the gallery; the unfurl uses a wide composition. */
export function campaignSocial(items: CampaignItem[]) {
  // Design studies belong in the gallery. Unfurls keep the established campaign art.
  const socialItems = items.filter(
    ({ series }) =>
      series !== "design-studies" &&
      series !== "seasonal-library" &&
      series !== "field-guide" &&
      series !== "game-rules" &&
      series !== "architecture"
  );
  const lead = socialItems[0] ?? items[0];
  if (lead?.landscapeImage)
    return {
      ...lead,
      image: lead.landscapeImage,
      original: lead.landscapeImage,
      width: 1200,
      height: 630
    };
  return socialItems.find((item) => item.width > item.height) ?? lead;
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
            ...(item.formats ?? []).map(({ image }) => image),
            ...(item.landscapeImage ? [item.landscapeImage] : [])
          ])
        )
      ]
    };
  });
}

export function campaignSearchItems(
  projects: { slug: string; name: string }[]
): PublicSearchItem[] {
  const names = new Map(projects.map(({ slug, name }) => [slug, name]));
  return publicCampaignItems([...names.keys()]).flatMap((item) => {
    if (item.archived || !item.formats?.length) return [];
    const formats = item.formats.map(({ label, width, height }) => `${label} ${width} × ${height}`);
    return [
      {
        title: `${names.get(item.project) ?? "Woodhouse"} · ${item.title}`,
        description: formats.join(" · "),
        href: `${campaignCollectionPath(item.project)}#${item.id}`,
        section: "Share artwork",
        keywords: `${formats.join(" ")} ${item.formats.map(({ width, height }) => `${width}x${height}`).join(" ")}`,
        searchText: [item.alt, ...(item.tags ?? [])].join(" ")
      }
    ];
  });
}
