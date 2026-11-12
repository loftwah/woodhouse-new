import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-direct-social";

const art = [
  [
    "tiktok",
    "bubbles",
    "Bank the Shot",
    "Bank-shot lettering bends around bright arcade symbols and Fizz.",
    "Aim off the wall in Bubbles.",
    "https://bubbles.loftwah.com/",
    "Play",
    "Story still",
    1080,
    1920
  ],
  [
    "instagram",
    "shoalshot",
    "Dive the Tide Pool",
    "The words Dive the Tide Pool curve through light and water above a Glimmerfin.",
    "Go looking for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "Portrait feed",
    1080,
    1350
  ],
  [
    "facebook",
    "foilbury",
    "Moss at the cabinet door",
    "Moss peers from a softly lit cabinet door in a painted teal hoodie and brown cap.",
    "Meet Moss in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "Square feed",
    1080,
    1080
  ],
  [
    "linkedin",
    "app-composer",
    "Links and a Guestbook",
    "Cut-paper letters and orange blocks come together in a graphic Creator Hub poster.",
    "See how the public Creator Hub puts links and a guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "Portrait feed",
    1080,
    1350
  ],
  [
    "discord",
    "woodhouse",
    "The workshop after hours",
    "An arcade cabinet, a record deck and a reef tank sit across a warmly lit workbench.",
    "Games, music and software from the Woodhouse workshop.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "Discord banner",
    1920,
    1080
  ],
  [
    "youtube",
    "fighter",
    "Viking vs Reaper",
    "Cartoon Viking and Grim Reaper face one another around large yellow lettering.",
    "Open the Battle Blast tutorial and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "Landscape",
    1600,
    900
  ],
  [
    "x",
    "loftwahfm",
    "Night Signal header",
    "A dark tape reel and copper tape ribbon carry the Night Signal title.",
    "Put Night Signal on while you finish what you’re making.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    "X header",
    1500,
    500
  ],
  [
    "discord-bubbles",
    "bubbles",
    "Fizz after closing",
    "One-eyed violet Fizz looks up at glowing symbols in a quiet arcade cabinet.",
    "Bring the Bubbles cabinet to your server.",
    "https://bubbles.loftwah.com/",
    "Play",
    "Discord banner",
    1920,
    1080
  ],
  [
    "instagram-moss",
    "foilbury",
    "Moss fixes the lamp",
    "Moss repairs a leaf lantern at a small wooden bench in warm gouache.",
    "Moss, by the light of a leaf lantern. Open the real card in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "Portrait feed",
    1080,
    1350
  ]
] as const;

const masterDimensions = {
  "X header": [2172, 724],
  "Story still": [941, 1672],
  "Portrait feed": [1122, 1402],
  "Square feed": [1254, 1254],
  "Discord banner": [1672, 941],
  Landscape: [1672, 941]
} as const;

export const directSocial: CampaignItem[] = art.map(
  ([file, project, title, alt, caption, href, action, label, width, height]) => ({
    id: `direct-social-${file}`,
    project,
    title,
    alt,
    caption: `${caption}\n${href}`,
    image: `${base}/${file}-preview.jpg`,
    thumbnail: `${base}/${file}-thumb.jpg`,
    original: `${base}/${file}.jpg`,
    width,
    height,
    reviewedAt: "2026-11-13",
    addedAt: "2026-11-12T13:43:00Z",
    credit: "Woodhouse · direct Codex ImageGen artwork",
    kind: "editorial composition",
    href,
    action,
    source: `${base}/provenance.txt`,
    formats: [
      { label, image: `${base}/${file}.jpg`, width, height },
      {
        label: "ImageGen original PNG",
        image: `${base}/${file}.png`,
        width: masterDimensions[label][0],
        height: masterDimensions[label][1]
      }
    ]
  })
);
