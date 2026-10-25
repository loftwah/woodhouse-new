/**
 * The edited 25 October 2026 portfolio edition.
 *
 * The observed failure this prevents: turning a three-day engineering report into
 * public copy by pasting its audit trail. A reader arriving here wants to know
 * what exists, what is new, and what they can open. Release gates, branch names
 * and issue numbers are operator material, so they stay out.
 *
 * Every entry is bound to a published project record; the page refuses to render
 * an entry for a project that is no longer public. The section a project sits in
 * is an editorial judgement about the state of the *product*, not a ranking, and
 * each one says what that state rests on.
 */

export const editionReviewDate = "25 October 2026";

export type EditionSectionKey = "shipped" | "improving" | "waiting";

export type EditionEntry = {
  slug: string;
  section: EditionSectionKey;
  headline: string;
  body: string;
  /** What the state rests on, in the reader's terms. */
  basis: string;
  /** What happens when the reader follows the product action. */
  invitation: string;
  /** A dated Woodhouse story or evidence page, when one exists. */
  readMore?: { label: string; href: string };
};

export const editionSections: {
  key: EditionSectionKey;
  title: string;
  deck: string;
  state: string;
}[] = [
  {
    key: "shipped",
    title: "Just shipped",
    deck: "Live now, and you can use it today.",
    state: "Shipped"
  },
  {
    key: "improving",
    title: "Getting better",
    deck: "Real releases, with the next limit named rather than hidden.",
    state: "Improving"
  },
  {
    key: "waiting",
    title: "Still building",
    deck: "Honest work in progress. A prototype is not a launch, and this edition does not pretend otherwise.",
    state: "In progress"
  }
];

export const editionEntries: EditionEntry[] = [
  {
    slug: "protocol-11",
    section: "shipped",
    headline: "The table now answers when a move is refused",
    body: "An illegal desktop drop used to do nothing at all. Now the destination answers, the card stays yours and the turn does not move. The same delivery reworked Wild placement and hand sorting, gave Journey stages their own identity, and released three short films of the game being played.",
    basis: "The refusal, the reworked placement and the films are live on the Protocol 11 site.",
    invitation:
      "Opens Protocol 11. Play Classic for a full table, or Quick Start to choose the mode and length."
  },
  {
    slug: "bubbles",
    section: "shipped",
    headline: "A clear is now about efficiency, not just points",
    body: "Fewest Shots gives you one board and no shot limit. The server replays a submitted clear before it counts, so a record cannot come from a browser's unverified claim, and a patient, awkward clear still gets in. The same release rebuilt the presentation and promoted Bubblecap.",
    basis: "The mode and the replay check are live on the Bubbles site.",
    invitation:
      "Opens Bubbles. Choose Fewest Shots for the new board, or Classic for the original.",
    readMore: {
      label: "Why a second attempt matters",
      href: "/dispatches/a-better-second-attempt/"
    }
  },
  {
    slug: "loftwahfm",
    section: "shipped",
    headline: "Three game soundtracks have their own albums",
    body: "Protocol 11's twelve Jukebox tracks, the Loftwah Fighter soundtrack and the SHOALSHOT soundtrack are public albums with their own covers. A game builder can drop in the same browser player, so a small game gets a real station instead of a loop with no home.",
    basis: "The albums, covers and player are live on LoftwahFM.",
    invitation: "Opens LoftwahFM. Press play, change station, or read the notes beside each album."
  },
  {
    slug: "app-composer",
    section: "shipped",
    headline: "A build story you can follow, and a contribution rule you can check",
    body: "The public story follows one brief from a plain sentence to a running app, including the parts that stayed local. Guestbook publishes the versioned invitation that Linkarooie validates: open, paused, closed or full, with approval and featuring kept separate. The hosted demonstration is explicitly fictional traffic, and it says so.",
    basis: "The build story, contribution contract and hosted demo are live on App Composer.",
    invitation: "Opens App Composer. Try the working composition, or read the build story first."
  },
  {
    slug: "fighter",
    section: "improving",
    headline: "You can see fights finish, not only start",
    body: "Fighter's own report now separates fight starts, terminal results and time actually played, and a deliberate same-tab Quick Fight replay has its own definition. Settings offers returning-browser recognition as a separate choice, off by default, with revocation when storage fails.",
    basis: "The measurement release is live; phone play and audio balance are still open.",
    invitation:
      "Opens Fighter. Choose Quick Fight for a standalone match, or Story for the longer path."
  },
  {
    slug: "shoalshot",
    section: "improving",
    headline: "Ten achievement cards have their own artwork",
    body: "Each card front is original art, joined by an earned-card receipt and an ordered reveal after a catch. Two new encounter patterns and launcher-specific fire signatures landed in the same window. The multi-tab save-revert repair has shipped; what remains is release acceptance and real phone play.",
    basis:
      "The artwork and the save repair are merged and deployed; the release is still being accepted.",
    invitation: "Opens SHOALSHOT. Choose Dive to enter the Tide Pool slice."
  },
  {
    slug: "asset-hunter",
    section: "improving",
    headline: "A pack checks rights before it fetches anything",
    body: "The pack builder reads redistribution rights first, carries recorded provenance and attribution, verifies manifested bytes and produces a reproducible ZIP. Review-required and reference-only resources remain records without redistributed payloads. Independent use by someone outside the factory is not yet proven.",
    basis: "The pack builder is reviewed and implemented; adoption is not claimed.",
    invitation: "Opens Asset Hunter. Search the catalogue, or build a small pack."
  },
  {
    slug: "pirates",
    section: "waiting",
    headline: "A playable sequence rebuilt from the original's own evidence",
    body: "Free Mode, the Moostyn port and economy, sailing, encounters, naval combat and save/load now run connected. Every claim is anchored to decoded source geometry and records rather than memory. What the source cannot prove stays out of the build, which is slower and more honest than filling the gaps.",
    basis: "A source-backed slice is playable; full parity gates remain closed.",
    invitation:
      "Opens the Pirates record, which explains what the current build does and does not reconstruct."
  },
  {
    slug: "max",
    section: "waiting",
    headline: "The software is substantial; the walker is not proven",
    body: "MAX pairs a companion app with a small computer on a wheeled walker and a gateway that can find it, hear it and stop it. The software platform exists. Finding the real walker, mounting the hardware and testing voice behaviour are physical questions, and a passing test cannot answer them.",
    basis: "No new delivery in this window; the physical questions remain open.",
    invitation: "Opens the MAX record. It is a product description, not a purchase page."
  },
  {
    slug: "social-club",
    section: "waiting",
    headline: "A working foundation for a private club",
    body: "Joining, membership and what members see have a working software direction, built as a prototype rather than a pitch. Delivery is paused. The next move is product work, not another round of review.",
    basis: "No new product movement in this window.",
    invitation: "Opens the Social Club record."
  }
];

/** The one cross-project lesson this edition earns, in ordinary language. */
export const editionLearning = {
  title: "The waiting was the slow part",
  body: "A small change used to queue behind every check the whole project could run, even the ones that had nothing to do with it. Nothing was unsafe about that, it was just slow, and slow releases are the ones people skip. The fix was not fewer checks. A small edit now runs the focused checks first, the independent stages run beside each other, and one full pass still has to pass before a release goes out.",
  closing: "That is the test for any delivery change here: it has to remove waiting, not evidence."
};

/** How the edition was made, and the limits a reader should know. */
export const editionMethod = [
  `Reviewed ${editionReviewDate}. Every project's state was read from its own published site and Woodhouse's reviewed records, not from a private report.`,
  "The three sections describe the product, not a ranking: a project with less news is not a worse project.",
  "A merge is not a deployment, and a deployment is not a person using the thing. Where a physical device, a real player or a customer would be needed to prove more, this edition says so.",
  "No private issue text, local path, credential or internal release gate appears here. The full operator report stays private."
];
