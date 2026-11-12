import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-visual-fidelity";
const protocol = "https://protocol11.loftwah.com/";
const moss = "https://foilbury.loftwah.com/cabinet/moss";
const art = [
  {
    slug: "stock-and-discard",
    project: "protocol-11",
    use: "feature",
    title: "Stock and discard",
    alt: "An overhead still life of two upright stacks on teal felt. The left stack shows a card back and the right stack shows a blue three.",
    caption:
      "The stock sits face down. The discard is there for everyone to see. Play a hand of Protocol 11.",
    href: protocol,
    action: "Play",
    placement: "Portrait feed",
    height: 1350,
    pngWidth: 1122,
    pngHeight: 1402
  },
  {
    slug: "moss-after-dark",
    project: "foilbury",
    use: "sketch",
    title: "Moss after dark",
    alt: "Moss crouches on a rain-soaked root beside a glowing leaf lantern, hands tucked into a teal hoodie.",
    caption:
      "Moss keeps the lantern close after the rain comes in. Find the original card in the Foilbury cabinet.",
    href: moss,
    action: "Explore",
    placement: "Portrait feed",
    height: 1350,
    pngWidth: 1122,
    pngHeight: 1402
  },
  {
    slug: "last-card",
    project: "protocol-11",
    use: "art",
    title: "One card in the light",
    alt: "A lone face-down card with an amber paw and engraved border lies on deep green felt in a shaft of light.",
    caption: "One card left. A Protocol 11 deck study, drawn from the paw-back artwork.",
    href: protocol,
    action: "Play",
    placement: "Story still",
    height: 1920,
    pngWidth: 941,
    pngHeight: 1672
  }
] as const;

export const visualFidelityStudies: CampaignItem[] = art.map((work) => {
  const stem = `${base}/${work.slug}`;
  const original = `${stem}.png`;
  return {
    id: `visual-study-${work.slug}`,
    project: work.project,
    use: work.use,
    title: work.title,
    alt: work.alt,
    caption: `${work.caption}\n${work.href}`,
    image: `${stem}-preview.jpg`,
    thumbnail: `${stem}-thumb.jpg`,
    original,
    width: 1080,
    height: work.height,
    reviewedAt: "2026-11-13",
    addedAt: "2026-11-12T17:15:50Z",
    kind: "editorial composition",
    credit: "Woodhouse · Codex ImageGen",
    href: work.href,
    action: work.action,
    source: `${base}/provenance.txt`,
    formats: [
      { label: work.placement, image: `${stem}.jpg`, width: 1080, height: work.height },
      {
        label: "ImageGen original PNG",
        image: original,
        width: work.pngWidth,
        height: work.pngHeight
      }
    ]
  };
});
