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
const refined = (entry: CampaignItem, file: string): CampaignItem => ({
  ...entry,
  image: `/campaign/20261025-v2/${file}.jpg`,
  original: `/campaign/20261025-v2/${file}-original.png`,
  landscapeImage: `/campaign/20261025-v2/${file}-landscape.jpg`,
  source: "https://woodhouse.loftwah.com/campaign/20261025-v2/provenance.txt"
});
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
  refined(
    item(
      "bubbles-one-more-shot",
      "bubbles",
      "Bubbles · Make the next shot",
      "An enlarged detail of Bubbles' actual Classic board: symbol bubbles, aiming line and launcher, beneath Make the next shot. Side panels are cropped; the playing area is complete.",
      "Make the next shot. Match three and clear the board in Bubbles. A staged opening round, with no earned record claimed.",
      1200,
      1500,
      "https://bubbles.loftwah.com/",
      "Play"
    ),
    "bubbles-next-shot"
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
  refined(
    item(
      "composer-make-something-useful",
      "app-composer",
      "App Composer · A PDF. Your mark.",
      "A large close view of the real Paperwork PDF editor beside App Composer orange and A PDF. Your mark. The fictional form, text, ink and signature remain visibly native.",
      "A PDF. Your mark. Paperwork is an independent browser editor built with App Composer. Open its fictional sample, edit a form and export the result.",
      1600,
      1000,
      "https://composer.loftwah.com/paperwork",
      "Try"
    ),
    "composer-paperwork-close"
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
  refined(
    item(
      "woodhouse-play-make-listen",
      "woodhouse",
      "Woodhouse · The things we make",
      "Woodhouse's own flowing fibre artwork fills the right of an ink and acid publisher cover: The things we make. Games, software and original music.",
      "The things we make. Games to play, software to try and original music from Loftwah. Explore the work at Woodhouse.",
      1600,
      1000,
      "https://woodhouse.loftwah.com/share/",
      "Explore"
    ),
    "woodhouse-made-here"
  ),
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
  ),
  {
    id: "plans-with-you-evening-returned",
    project: "social-club",
    title: "Plans With You · Evening returned",
    alt: "A new conceptual still-life: a cream invitation on a cobalt envelope, stamped CANCELLED, with Evening returned embossed beside a clock. Waitlist open; paid membership closed.",
    caption:
      "Evening returned. New generated campaign artwork for Plans With You, the planned-cancellation concept. Waitlist only; paid membership remains closed.\nhttps://club.loftwah.com/",
    image: "/campaign/20261025/plans-with-you-evening-returned.jpg",
    original: "/campaign/20261025/plans-with-you-evening-returned-original.png",
    width: 1200,
    height: 1200,
    reviewedAt: "2026-10-25",
    credit:
      "Woodhouse · new generated promotional illustration; built-in Codex image_gen; concept, not a real invitation",
    kind: "editorial composition",
    href: "https://club.loftwah.com/",
    action: "Explore",
    source: "https://woodhouse.loftwah.com/campaign/20261025/provenance-secondary.txt",
    landscapeImage: "/campaign/20261025/plans-with-you-evening-returned-landscape.jpg"
  },
  {
    id: "asset-hunter-discover-possibilities",
    project: "asset-hunter",
    title: "Asset Hunter · Find a possibility",
    alt: "New conceptual artwork of an orange optical discovery instrument revealing folded paper, with a blue letterform and miniature terrain. It illustrates creative discovery, not an actual machine.",
    caption:
      "Find a possibility. See how it works. New generated conceptual artwork for Asset Hunter, with its real public catalogue linked separately. The instrument is an illustration.\nhttps://assets.loftwah.com/",
    image: "/campaign/20261025/asset-hunter-discover-possibilities.jpg",
    original: "/campaign/20261025/asset-hunter-discover-possibilities-original.png",
    width: 1200,
    height: 1200,
    reviewedAt: "2026-10-25",
    credit:
      "Woodhouse · new generated promotional illustration; built-in Codex image_gen; conceptual discovery instrument",
    kind: "editorial composition",
    href: "https://assets.loftwah.com/",
    action: "Explore",
    source: "https://woodhouse.loftwah.com/campaign/20261025/provenance-secondary.txt",
    landscapeImage: "/campaign/20261025/asset-hunter-discover-possibilities-landscape.jpg"
  },
  refined(
    {
      id: "max-a-little-help",
      project: "max",
      title: "MAX · Try the simulator",
      alt: "The real MAX browser simulator responding to a deliberate Find Max tap: Max is sounding, STOP, flashing light and simulated speech. The poster explicitly says no physical walker is connected.",
      caption:
        "Try MAX's browser simulator. Tap Find Max and see the virtual locator respond. Voice and device responses are simulated; no physical walker is connected.\nhttps://max.loftwah.com/demo",
      image: "/campaign/20261025/max-a-little-help.jpg",
      original: "/campaign/20261025/max-a-little-help-original.png",
      width: 1200,
      height: 1200,
      reviewedAt: "2026-10-25",
      credit:
        "Woodhouse composition · real MAX simulator interaction, 25 October 2026; simulated device",
      kind: "editorial composition",
      href: "https://max.loftwah.com/demo",
      action: "Explore",
      source: "https://woodhouse.loftwah.com/campaign/20261025/provenance-secondary.txt",
      landscapeImage: "/campaign/20261025/max-a-little-help-landscape.jpg"
    },
    "max-try-the-simulator"
  ),
  {
    id: "max-demo-20261025",
    project: "max",
    title: "MAX · Public simulator",
    alt: "The actual public MAX demo with FIND MAX, a virtual prototype view and the visible explanation that no physical walker is connected.",
    caption:
      "MAX’s public browser simulator, captured 25 October 2026. Its voice and device responses are simulated; no physical walker is connected.\nhttps://max.loftwah.com/demo",
    image: "/campaign/20261025/max-demo-20261025.jpg",
    original: "/campaign/20261025/max-demo-20261025-original.png",
    width: 1440,
    height: 900,
    reviewedAt: "2026-10-25",
    credit: "MAX · public simulator capture, 25 October 2026; simulated device",
    kind: "production screenshot",
    href: "https://max.loftwah.com/demo",
    action: "Explore",
    source: "https://woodhouse.loftwah.com/campaign/20261025/provenance-secondary.txt"
  },
  {
    id: "plans-with-you-home-20261025",
    project: "social-club",
    title: "Plans With You · Waitlist introduction",
    alt: "Current Plans With You public homepage showing its planned-cancellation explanation, illustrative ordinary plan and explicit waitlist status.",
    caption:
      "Plans With You’s public introduction, captured 25 October 2026. Waitlist open; paid membership remains closed. No signup was performed.\nhttps://club.loftwah.com/",
    image: "/campaign/20261025/plans-with-you-home-20261025.jpg",
    original: "/campaign/20261025/plans-with-you-home-20261025-original.png",
    width: 1440,
    height: 900,
    reviewedAt: "2026-10-25",
    credit: "Plans With You · public homepage capture, 25 October 2026",
    kind: "production screenshot",
    href: "https://club.loftwah.com/",
    action: "Explore",
    source: "https://woodhouse.loftwah.com/campaign/20261025/provenance-secondary.txt"
  },
  {
    id: "asset-hunter-catalogue-20261025",
    project: "asset-hunter",
    title: "Asset Hunter · Catalogue",
    alt: "Current Asset Hunter catalogue showing creative possibility plates and their explicit Reference only and Generated labels. The screenshot does not clear reuse rights.",
    caption:
      "Explore the technique and check the rights. Asset Hunter’s actual public catalogue, captured 25 October 2026. Reference only material is not cleared for reuse.\nhttps://assets.loftwah.com/",
    image: "/campaign/20261025/asset-hunter-catalogue-20261025.jpg",
    original: "/campaign/20261025/asset-hunter-catalogue-20261025-original.png",
    width: 1440,
    height: 900,
    reviewedAt: "2026-10-25",
    credit:
      "Asset Hunter · public catalogue capture, 25 October 2026; native rights labels retained",
    kind: "production screenshot",
    href: "https://assets.loftwah.com/",
    action: "Explore",
    source: "https://woodhouse.loftwah.com/campaign/20261025/provenance-secondary.txt"
  },
  {
    id: "pirates-original-voyage",
    project: "pirates",
    title: "Pirates · An original prelaunch concept",
    alt: "Master of the Secret Sea title beside an original cream-sailed vessel leaving an imagined dawn harbour. Labelled In reconstruction and Original prelaunch concept; not original-game artwork or a gameplay capture.",
    caption:
      "A voyage still taking shape. Original prelaunch concept for the source-first reconstruction of Master of the Secret Sea. No public game launch is claimed.\nhttps://woodhouse.loftwah.com/projects/pirates/",
    image: "/campaign/20261025-v2/pirates-original-voyage.jpg",
    original: "/campaign/20261025-v2/pirates-original-voyage-original.jpg",
    width: 1200,
    height: 630,
    reviewedAt: "2026-10-25",
    credit:
      "Pirates promotional preparation · original OpenAI image_gen illustration and editable typography; not original-game art",
    kind: "editorial composition",
    href: "https://woodhouse.loftwah.com/projects/pirates/",
    action: "Explore",
    source: "https://woodhouse.loftwah.com/campaign/20261025-v2/provenance.txt"
  }
];
