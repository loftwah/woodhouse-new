import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-project-studies";

const art = [
  [
    "moss-paper",
    "foilbury",
    "A light for Moss",
    "Moss holds a leaf lantern in a relief print with rough ink and visible paper grain.",
    "Moss and the leaf lantern, printed like a little cabinet keepsake. See the card in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "Portrait feed",
    1080,
    1350,
    1122,
    1402
  ],
  [
    "bubble-bank",
    "bubbles",
    "Use the wall",
    "Hand-lettered instructions trace a bank shot past arcade bubble symbols and Fizz.",
    "Aim off the wall in Bubbles Classic. The wall gives you a route into clusters you can’t hit head-on.",
    "https://bubbles.loftwah.com/",
    "Play",
    "Story still",
    1080,
    1920,
    941,
    1670
  ],
  [
    "reef-field-guide",
    "shoalshot",
    "Glimmerfin field plate",
    "A Glimmerfin and reef forms appear in blue and copper like a specimen plate.",
    "A Glimmerfin from SHOALSHOT’s Tide Pool, drawn as a field-guide plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "Portrait feed",
    1080,
    1350,
    1122,
    1402
  ],
  [
    "guestbook",
    "app-composer",
    "Links and a guestbook",
    "Warm paper forms turn links and a guestbook into a small sculptural poster.",
    "A Creator Hub gives your links and guestbook a home of their own. Open the public example.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "Portrait feed",
    1080,
    1350,
    1122,
    1402
  ],
  [
    "workshop-cutaway",
    "woodhouse",
    "Through the workshop wall",
    "A miniature workshop contains an arcade cabinet, a reef tank and a place to play records.",
    "An arcade cabinet, a reef tank and a record deck in the same room. A cutaway of the things we make.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "Discord banner",
    1920,
    1080,
    1672,
    941
  ],
  [
    "moss-foil",
    "foilbury",
    "Moss under foil",
    "Moss sits within a copper cabinet amid pools of shifting foil colour.",
    "The light catches Moss differently across the surface. Open Foilbury to see the public holographic card.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "Square feed",
    1080,
    1080,
    1254,
    1254
  ],
  [
    "liferaft-pull",
    "liferaft",
    "The missing attachment",
    "A torn-paper composition draws a small attachment out of a stack of old conversations.",
    "A missing attachment, pulled from a stack of old conversations. Liferaft works with your local archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "Portrait feed",
    1080,
    1350,
    1122,
    1402
  ],
  [
    "battle-bill",
    "fighter",
    "Battle Blast bill",
    "A yellow and violet wrestling bill pairs stylised Viking and Grim Reaper figures.",
    "Viking and Grim Reaper get the fight-night treatment. Play the Battle Blast tutorial in Fighter.",
    "https://fighter.loftwah.com/",
    "Play",
    "Landscape",
    1600,
    900,
    1672,
    941
  ],
  [
    "classic-table",
    "protocol-11",
    "First draw at the Classic table",
    "A fan of cards and two piles sit on green felt in afternoon light.",
    "The first draw at the Classic table. Open Protocol 11 and play a local hand.",
    "https://protocol11.loftwah.com/",
    "Play",
    "Square feed",
    1080,
    1080,
    1254,
    1254
  ],
  [
    "cartridge-sleeve",
    "loftwahfm",
    "Cartridge Club sleeve",
    "Cartridge Club lettering sits on a textured sleeve with retro game imagery.",
    "A sleeve for Cartridge Club, LoftwahFM’s station for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "Square feed",
    1080,
    1080,
    1254,
    1254
  ],
  [
    "locator",
    "max",
    "Find MAX in the simulator",
    "An illustrated architectural plan shows a locator in a browser simulator.",
    "Try the locator in MAX’s public browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "Landscape",
    1600,
    900,
    1672,
    941
  ],
  [
    "bubble-cabinet",
    "bubbles",
    "Fizz in the cabinet",
    "Fizz and arcade bubbles sit inside a miniature cabinet with a dark upper edge.",
    "Fizz and the Classic cabinet, built in miniature. Play a round of Bubbles.",
    "https://bubbles.loftwah.com/",
    "Play",
    "Discord banner",
    1920,
    1080,
    1672,
    941
  ]
] as const;

export const projectStudies: CampaignItem[] = art.map(
  ([
    file,
    project,
    title,
    alt,
    caption,
    href,
    action,
    label,
    width,
    height,
    masterWidth,
    masterHeight
  ]) => ({
    id: `project-study-${file}`,
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
    addedAt: "2026-11-12T14:02:05Z",
    credit: "Woodhouse · direct Codex ImageGen artwork",
    kind: "editorial composition",
    href,
    action,
    source: `${base}/provenance.txt`,
    ...(file === "workshop-cutaway"
      ? { requiredProjects: ["bubbles", "shoalshot", "loftwahfm"] }
      : {}),
    formats: [
      { label, image: `${base}/${file}.jpg`, width, height },
      {
        label: "ImageGen original PNG",
        image: `${base}/${file}.png`,
        width: masterWidth,
        height: masterHeight
      }
    ]
  })
);
