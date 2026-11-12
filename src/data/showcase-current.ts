import type { CampaignFormat, CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261112";
const placements = {
  wide: { label: "Landscape", width: 1600, height: 900 },
  feed: { label: "Portrait feed", width: 1080, height: 1350 },
  story: { label: "Story still", width: 1080, height: 1920 },
  square: { label: "Square feed", width: 1080, height: 1080 },
  "x-header": { label: "X header", width: 1500, height: 500 },
  release: { label: "Release screenshot", width: 3000, height: 1856 }
} satisfies Record<string, Omit<CampaignFormat, "image">>;
type Placement = keyof typeof placements;
type Work = Pick<
  CampaignItem,
  "id" | "project" | "title" | "alt" | "caption" | "href" | "action"
> & {
  files: readonly [Placement, ...Placement[]];
  credit: string;
  kind?: CampaignItem["kind"];
  archived?: true;
};

const works: Work[] = [
  {
    id: "woodhouse-loom",
    project: "woodhouse",
    title: "One human. Many worlds.",
    alt: "Acid-yellow thread curves through a dark mechanical loom, with One human. Many worlds. set above it.",
    caption:
      "A strand through everything we make. Explore the browser games, software and radio at Woodhouse.",
    href: "https://woodhouse.loftwah.com/",
    action: "Explore",
    files: ["wide", "story"],
    credit: "Woodhouse campaign artwork · Codex ImageGen illustration with typeset title",
    kind: "editorial composition"
  },
  {
    id: "shoalshot",
    project: "shoalshot",
    title: "Into the Tide Pool",
    alt: "Turquoise water, reef plants and fish in SHOALSHOT's Tide Pool, with the title set over a crop of the live game.",
    caption: "Pick a line through the reef. SHOALSHOT’s Tide Pool is open for a browser dive.",
    href: "https://shoalshot.loftwah.com/",
    action: "Play",
    files: ["feed", "wide", "story"],
    credit: "Woodhouse poster from a staged production dive · landscape file is the full capture",
    kind: "editorial composition"
  },
  {
    id: "bubbles",
    project: "bubbles",
    title: "Line up the next shot",
    alt: "A Bubbles Classic opening board with rows of multicoloured symbol bubbles and an aiming line from the launcher.",
    caption:
      "Pick your bank shot. Match three and clear the Classic board in Bubbles. Captured in a staged opening round.",
    href: "https://bubbles.loftwah.com/",
    action: "Play",
    files: ["feed", "wide", "story"],
    credit: "Bubbles Classic · staged production round"
  },
  {
    id: "fighter",
    project: "fighter",
    title: "Viking meets the Reaper",
    alt: "Viking faces Grim Reaper in Fighter's Battle Blast tutorial, with their native character portraits and battle controls.",
    caption:
      "Viking meets Grim Reaper. Try Battle Blast in Fighter’s opening tutorial, then take it into a fight.",
    href: "https://fighter.loftwah.com/",
    action: "Play",
    files: ["feed", "wide", "story", "x-header"],
    credit: "Fighter production tutorial · X header uses the original roster portraits"
  },
  {
    id: "protocol-11",
    project: "protocol-11",
    title: "Your first draw",
    alt: "A teal Protocol 11 table in portrait view, showing the opening hand, draw deck, discard and opponent seats.",
    caption:
      "There’s a seat free. Draw your first card in a local Classic table in Protocol 11. This hand was staged for the capture.",
    href: "https://protocol11.loftwah.com/",
    action: "Play",
    files: ["feed", "wide", "story"],
    credit: "Protocol 11 · staged local table on production"
  },
  {
    id: "foilbury",
    archived: true,
    project: "foilbury",
    title: "Moss, in holographic",
    alt: "Foilbury's Moss card, a rabbit wearing a hood and hat, shown in the holographic finish in the public cabinet.",
    caption:
      "See how the finish changes Moss. Flip the card, choose a finish or inspect it in Foilbury’s public cabinet.",
    href: "https://foilbury.loftwah.com/cabinet/moss",
    action: "Explore",
    files: ["feed", "wide", "story"],
    credit: "Foilbury · public cabinet and original Moss render"
  },
  {
    id: "loftwahfm",
    project: "loftwahfm",
    title: "Tune to Cartridge Club",
    alt: "A square LoftwahFM design using published sleeve art above a Cartridge Club label.",
    caption:
      "Tune to Cartridge Club on LoftwahFM for the tracks that sound at home between rounds.",
    href: "https://fm.loftwah.com/radio?station=cartridge-club",
    action: "Listen",
    files: ["square", "wide", "story"],
    credit: "LoftwahFM · published sleeve artwork and production radio captures",
    kind: "editorial composition"
  },
  {
    id: "app-composer",
    project: "app-composer",
    title: "A Creator Hub you own",
    alt: "An orange App Composer poster framing the public Linkarooie demo profile for fictional ceramicist Mara Quinn.",
    caption:
      "A ceramicist’s links and guestbook, built as two apps you can own. See the live Creator Hub example and how it was made.",
    href: "https://composer.loftwah.com/creator-hub",
    action: "Try",
    files: ["feed", "story", "square"],
    credit:
      "Woodhouse poster from the live Linkarooie demo · square and story files show the native profile",
    kind: "editorial composition"
  },
  {
    id: "liferaft",
    project: "liferaft",
    title: "Find the email you kept",
    alt: "Liferaft’s blue rescue-ring icon and a desktop screenshot of the released MBOX recovery interface with synthetic mail.",
    caption:
      "Find the email you kept. Liferaft indexes an MBOX archive locally so you can search the messages and recover attachments.",
    href: "https://liferaft.loftwah.com/",
    action: "Explore",
    files: ["feed", "wide", "release"],
    credit:
      "Historical Woodhouse composition with Liferaft's v0.1.2 icon and fictional-mail Electron screenshot",
    kind: "editorial composition"
  },
  {
    id: "max",
    project: "max",
    title: "Find MAX in the simulator",
    alt: "The MAX browser demo after activating Find MAX, with the simulated sounding state and an explanation that no physical walker is connected.",
    caption:
      "Try Find MAX in the public browser simulator. The response is simulated and the demo connects to no walker.",
    href: "https://max.loftwah.com/demo",
    action: "Explore",
    files: ["wide", "story"],
    credit: "MAX · staged public browser simulation"
  },
  {
    id: "bubbles-puzzles",
    project: "bubbles",
    title: "First Spark",
    alt: "Bubbles' puzzle map at First Spark, the first level, with the route leading to the next puzzle.",
    caption:
      "First Spark starts the Bubbles puzzle route. Open Puzzles to choose a level and work towards three stars.",
    href: "https://bubbles.loftwah.com/puzzle",
    action: "Play",
    files: ["feed"],
    credit: "Bubbles · public puzzle map in a fresh browser"
  },
  {
    id: "composer-walkthrough",
    project: "app-composer",
    title: "Two apps from one brief",
    alt: "The live App Composer Creator Hub walkthrough, showing the Linkarooie profile and Here / there guestbook side by side.",
    caption:
      "Two apps from one brief. Explore the running Linkarooie profile and Here / there guestbook from the Creator Hub walkthrough.",
    href: "https://composer.loftwah.com/creator-hub",
    action: "Try",
    files: ["wide"],
    credit: "App Composer · production Creator Hub walkthrough"
  },
  {
    id: "woodhouse-live",
    project: "woodhouse",
    title: "The loom on the live site",
    alt: "Woodhouse's homepage with its live fibre sculpture and the headline One human. Many worlds.",
    caption:
      "The Woodhouse fibre sculpture runs in the browser. Open the homepage to see it move and find the work behind it.",
    href: "https://woodhouse.loftwah.com/",
    action: "Explore",
    files: ["wide", "story"],
    credit: "Woodhouse · production homepage and native fibre exhibit"
  }
];

export const currentCampaign: CampaignItem[] = works.map(({ id, files, kind, ...work }) => ({
  ...work,
  id: `november-${id}`,
  kind: kind ?? "production screenshot",
  reviewedAt: "2026-11-12",
  source: `${base}/provenance.txt`,
  image: `${base}/${id}-preview.jpg`,
  thumbnail: `${base}/${id}-thumb.jpg`,
  original: `${base}/${id}-${files[0]}.jpg`,
  width: placements[files[0]].width,
  height: placements[files[0]].height,
  caption: `${work.caption}\n${work.href}`,
  formats: files.map((file) => ({ ...placements[file], image: `${base}/${id}-${file}.jpg` }))
}));
