import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/contact-studies";
const path = "/share/contact-studies/";
const reviewedAt = "2026-11-12";

export const contactStudies = {
  title: "Contact Studies",
  description:
    "Four material studies inspired by the games and software we make. Download the originals or take a crop for sharing.",
  path,
  pack: `${base}/contact-studies.zip`,
  source: `${base}/edition-notes.txt`
};

const studies = [
  {
    file: "surface-tension",
    project: "bubbles",
    title: "Surface Tension",
    alt: "A cobalt droplet pulls a sharp peak out of a translucent bubble rimmed in blue and orange light.",
    note: "A droplet catches a bubble at the point of contact. Inspired by the split second before a shot lands in Bubbles.",
    href: "https://bubbles.loftwah.com/",
    action: "Play"
  },
  {
    file: "crossing-threads",
    project: "protocol-11",
    title: "Crossing Threads",
    alt: "Mint, violet and apricot threads meet at the raised fold of a square of woven cloth.",
    note: "Three colours hold their own across one seam. Inspired by the overlapping runs and sets at a Protocol 11 table.",
    href: "https://protocol11.loftwah.com/",
    action: "Play"
  },
  {
    file: "dry-fit",
    project: "app-composer",
    title: "Dry Fit",
    alt: "Yellow, oxblood and chalk pieces of cut paper slot together on a cobalt surface.",
    note: "Three cut pieces meet at a single joint. Inspired by putting independent apps together in App Composer.",
    href: "https://composer.loftwah.com/creator-hub",
    action: "Try"
  },
  {
    file: "on-the-turn",
    project: "fighter",
    title: "On the Turn",
    alt: "A scarlet ribbon curls into a sharply lit loop while its tips blur into a slate background.",
    note: "A ribbon changes direction while its tail is still in motion. Inspired by timing a reversal in Fighter.",
    href: "https://fighter.loftwah.com/",
    action: "Play"
  }
] as const;

export const contactStudyWorks: CampaignItem[] = studies.map(
  ({ file, project, title, alt, note, href, action }) => ({
    id: `contact-studies-${file}`,
    project,
    title,
    alt,
    caption: `${note}\nhttps://woodhouse.loftwah.com${path}#contact-studies-${file}`,
    href,
    action,
    image: `${base}/${file}-preview.jpg`,
    thumbnail: `${base}/${file}-thumb.jpg`,
    original: `${base}/${file}.png`,
    width: 1122,
    height: 1402,
    reviewedAt,
    archived: true,
    addedAt: "2026-11-12T08:22:00Z",
    credit: "Contact Studies · original Codex ImageGen artwork",
    kind: "editorial composition",
    source: contactStudies.source,
    formats: [
      { label: "Portrait feed", width: 1080, height: 1350, image: `${base}/${file}-feed.jpg` },
      { label: "Square feed", width: 1080, height: 1080, image: `${base}/${file}-square.jpg` }
    ]
  })
);
