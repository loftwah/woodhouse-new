import type { PublicMenuItem, WoodhouseProject } from "../content/repository";

/**
 * Public-safe, deterministic fixtures for the component workshop.
 *
 * The copy and artwork URLs below belong to the published Woodhouse record.
 * They are not a second content source: stories never write, publish or
 * mutate anything. Change them only from a reviewed public page.
 */
export const primaryNavigation: PublicMenuItem[] = [
  { label: "Projects", url: "/projects/" },
  { label: "Stories", url: "/dispatches/" },
  { label: "Analytics", url: "/activity/" },
  { label: "Leaderboards", url: "/activity/leaderboards/" },
  { label: "Share", url: "/share/" },
  { label: "About", url: "/dean/" }
];

export const houseIndexNavigation: PublicMenuItem[] = [
  { label: "Factory", url: "/factory/" },
  { label: "Exhibits", url: "/exhibits/" },
  { label: "Architecture", url: "/architecture/" },
  { label: "Doctrine", url: "/doctrine/" },
  { label: "Contact", url: "/contact/" }
];

export const bubbles: WoodhouseProject = {
  slug: "bubbles",
  name: "Bubbles",
  index: "01",
  lifecycle: "active",
  discipline: "Game systems · deterministic play",
  title: "The classic bubble shooter, in your browser.",
  summary:
    "Bubbles is an arcade bubble shooter you play in the browser or on your phone: line up a shot, match three or more and clear the board. It’s for anyone who wants a quick round that feels good on a small screen.",
  why: "Quick to learn, hard to put down. Bubbles has the shape of the original arcade game, with a roomy board and an easy first read.",
  teaches: "A familiar game, done with less friction.",
  siteUrl: "https://bubbles.loftwah.com",
  siteOgTitle: "Bubbles — One more shot. One more board.",
  siteOgDescription: "The classic bubble shooter, in your browser.",
  previewImage: "https://bubbles.loftwah.com/og-image-20261012.png",
  previewAlt:
    "Bubbles — One more shot. One more board. Bubblecap celebrates a colourful bubble match beside the cyan-and-magenta Bubbles wordmark.",
  previewWidth: 1200,
  previewHeight: 630,
  previewCaption: "Artwork from the product’s own site.",
  state: "Replay-checked competition, rebuilt presentation.",
  stateTone: "quiet",
  current: "Fewest Shots is live as a second competitive mode.",
  remaining: "The next proof is a second play-test with real players.",
  proofBoundary:
    "Reviewed 2026-10-19. This is an edited public record, not a private source transcript.",
  reviewDate: "2026-10-19",
  snapshotSource: "Operator-reviewed public summary",
  snapshotId: "bubbles-2026-10-19",
  statusId: "bubbles-status-2026-10-19"
};

export const fighter: WoodhouseProject = {
  ...bubbles,
  slug: "fighter",
  name: "Fighter",
  index: "02",
  discipline: "Game systems · authored journeys",
  title: "Collect fighters. Build a squad. Pick your fight.",
  summary:
    "Fighter is a collectible squad battler you play in the browser: collect characters, build a squad, then commit moves on a shared real-time Charge Strip. It’s for players who like turn-based combat with authored characters, story and several modes to work through.",
  siteUrl: "https://fighter.loftwah.com",
  previewImage:
    "https://fighter.loftwah.com/assets/generated/promotional/loftwah-fighter-v5-duo-2026-10.png",
  previewAlt:
    "Illustrated LOFTWAH FIGHTER poster: Dean/Loftwah reaches into a charged arena while Pippa, a stocky black bulldog, braces in front of him.",
  state: "Fight activity and optional browser returns are live",
  reviewDate: "2026-10-16",
  snapshotId: "fighter-2026-10-16",
  statusId: "fighter-status-2026-10-16"
};

export const shoalshot: WoodhouseProject = {
  ...bubbles,
  slug: "shoalshot",
  name: "SHOALSHOT",
  index: "03",
  discipline: "Game systems · mobile-first presentation",
  title: "Read the tide. Place the shot.",
  summary:
    "SHOALSHOT is a fishing game for phones and desktop: read the water, place your shot and land the catch. It’s for anyone who wants a calm, quick session, and it is designed phone-first.",
  siteUrl: "https://shoalshot.loftwah.com",
  previewImage: "https://shoalshot.loftwah.com/og-shoalshot-v6.jpg",
  previewAlt:
    "SHOALSHOT artwork: a complete star-speckled Lantern Ray on deep teal, under the SHOALSHOT wordmark.",
  state: "Card artwork in, save repair shipped, release acceptance open.",
  reviewDate: "2026-10-19",
  snapshotId: "shoalshot-2026-10-19",
  statusId: "shoalshot-status-2026-10-19"
};
