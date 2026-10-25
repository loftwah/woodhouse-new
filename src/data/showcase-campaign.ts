/** Reviewed 25 October 2026. Woodhouse editorial campaign, separate from native OG art.
 * Assets contain published artwork or staged production captures, never visitor records.
 */
export type CampaignItem = {
  id: string;
  project: string;
  title: string;
  alt: string;
  caption: string;
  image: string;
  original: string;
  width: number;
  height: number;
  reviewedAt: string;
  credit: string;
  kind: "editorial composition" | "production screenshot";
  href: string;
  action: "Play" | "Listen" | "Try" | "Explore";
  source: string;
  requiredProjects?: string[];
  landscapeImage?: string;
};
const base = "/campaign/20261025/";
const item = (
  id: string,
  project: string,
  title: string,
  alt: string,
  caption: string,
  width: number,
  height: number,
  href: string,
  action: CampaignItem["action"],
  kind: CampaignItem["kind"] = "editorial composition"
): CampaignItem => ({
  id,
  project,
  title,
  alt,
  caption: `${caption}\n${href}`,
  image: `${base}${id}.jpg`,
  original: `${base}${id}-original.png`,
  width,
  height,
  reviewedAt: "2026-10-25",
  credit:
    kind === "production screenshot"
      ? `${project === "loftwahfm" ? "LoftwahFM" : title.split(" · ")[0]} · staged production capture, 25 October 2026`
      : "Woodhouse composition · original product artwork and interfaces credited in source notes",
  kind,
  href,
  action,
  source: `https://woodhouse.loftwah.com${base}provenance.txt`,
  ...([
    "shoalshot-lantern-ray",
    "bubbles-one-more-shot",
    "fighter-first-fight",
    "fm-find-your-frequency"
  ].includes(id)
    ? { landscapeImage: `${base}${id}-landscape.jpg` }
    : {})
});
export const campaignItems: CampaignItem[] = [
  item(
    "shoalshot-lantern-ray",
    "shoalshot",
    "SHOALSHOT · Below the surface",
    "A complete star-speckled Lantern Ray from SHOALSHOT's published game artwork, on deep teal with the line Below the surface.",
    "Meet SHOALSHOT's Lantern Ray. Read the tide. Place the shot. An editorial specimen plate using the game's original artwork.",
    1080,
    1350,
    "https://shoalshot.loftwah.com/",
    "Play"
  ),
  item(
    "bubbles-one-more-shot",
    "bubbles",
    "Bubbles · One more shot",
    "Bubbles' current Classic board, colourful symbol-marked bubbles and aiming line beneath One more shot. The full playfield is retained.",
    "Match three. Clear the board. Bubbles' current Classic playfield, captured in a staged opening round.",
    1200,
    1200,
    "https://bubbles.loftwah.com/",
    "Play"
  ),
  item(
    "fighter-first-fight",
    "fighter",
    "Fighter · Your first fight",
    "A yellow and ink fight-night poster pairing the complete Viking and Grim Reaper portraits from Fighter's public roster.",
    "Viking versus Grim Reaper. Your first fight in LOFTWAH FIGHTER. Woodhouse's fight-night composition of the original roster portraits.",
    1080,
    1350,
    "https://fighter.loftwah.com/",
    "Play"
  ),
  item(
    "composer-make-something-useful",
    "app-composer",
    "App Composer · Make something useful",
    "An orange App Composer composition featuring the actual deployed Paperwork PDF editor and a clearly fictional demonstration form.",
    "Make something useful with App Composer. Paperwork is a browser PDF editor built here; this public demonstration uses a fictional document.",
    1600,
    1000,
    "https://composer.loftwah.com/",
    "Try"
  ),
  item(
    "protocol-your-next-move",
    "protocol-11",
    "Protocol 11 · Your next move",
    "Cream and green Protocol 11 poster with a large fan of cards cropped from a staged production match, with no player portraits.",
    "Your next move. Protocol 11's browser card table changes every round. This hand is a detail from a staged match, not a player achievement.",
    1600,
    1000,
    "https://protocol11.loftwah.com/",
    "Play"
  ),
  item(
    "fm-find-your-frequency",
    "loftwahfm",
    "LoftwahFM · Find your frequency",
    "A record-shop arrangement of the published Cartridge Funk, Cloud Control and Beats to Break Someone's Face To covers, each complete.",
    "Find your frequency on LoftwahFM. Original music, stations and shows. Artwork from Cartridge Funk, Cloud Control and Beats to Break Someone's Face To.",
    1200,
    1200,
    "https://fm.loftwah.com/",
    "Listen"
  ),
  {
    ...item(
      "woodhouse-play-make-listen",
      "woodhouse",
      "Woodhouse · Play. Make. Listen.",
      "A Woodhouse publisher spread: SHOALSHOT's complete Lantern Ray, App Composer's real Paperwork editor and LoftwahFM's Cartridge Funk cover in three large panels.",
      "Play. Make. Listen. Games, software and original music from Loftwah. An editorial selection of SHOALSHOT, App Composer and LoftwahFM.",
      1600,
      900,
      "https://woodhouse.loftwah.com/share/",
      "Explore"
    ),
    requiredProjects: ["shoalshot", "app-composer", "loftwahfm"]
  },
  item(
    "bubbles-play-20261025",
    "bubbles",
    "Bubbles · Classic playfield",
    "The full current Bubbles Classic interface: starting board, aiming line, shot controls and original Orbit avatar. Staged opening round.",
    "Bubbles Classic, as it appears in the browser on 25 October 2026. A staged opening board, with no earned score claimed.",
    1440,
    900,
    "https://bubbles.loftwah.com/",
    "Play",
    "production screenshot"
  ),
  item(
    "fighter-tutorial-20261025",
    "fighter",
    "Fighter · Learn the controls",
    "The current Fighter practice battle with Viking facing Grim Reaper and the tutorial's move controls. A staged tutorial, not a competitive result.",
    "Learn the controls with Viking and Grim Reaper in Fighter's practice battle. Captured from production on 25 October 2026.",
    1280,
    720,
    "https://fighter.loftwah.com/",
    "Play",
    "production screenshot"
  ),
  item(
    "shoalshot-dive-20261025",
    "shoalshot",
    "SHOALSHOT · Tide Pool dive",
    "SHOALSHOT's current Tide Pool playfield, with bright reef edges, travelling fish and the original launcher. Staged opening dive.",
    "A staged opening dive in SHOALSHOT's Tide Pool. Real production interface captured on 25 October 2026; no catch or achievement is claimed.",
    1280,
    720,
    "https://shoalshot.loftwah.com/",
    "Play",
    "production screenshot"
  ),
  item(
    "composer-home-20261025",
    "app-composer",
    "App Composer · Real apps, running now",
    "App Composer's current public homepage, with its own orange mark and actual screens from Paperwork, Link Check and Here / there.",
    "Make software. Keep it yours. App Composer's current public homepage, captured on 25 October 2026. Embedded examples are identified by the publisher.",
    1280,
    720,
    "https://composer.loftwah.com/",
    "Try",
    "production screenshot"
  ),
  item(
    "fm-radio-20261025",
    "loftwahfm",
    "LoftwahFM · Stations and shows",
    "LoftwahFM's current radio page with station choices and original cover artwork. No audio was started to make this capture.",
    "Pick a station on LoftwahFM. Current production interface captured on 25 October 2026; no listening or audience claim.",
    1280,
    720,
    "https://fm.loftwah.com/radio/",
    "Listen",
    "production screenshot"
  )
];
