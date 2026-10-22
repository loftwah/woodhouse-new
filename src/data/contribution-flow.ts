/**
 * The second source-backed flow: a guest note becomes a composed card, and a
 * source-owner decision can remove it again.
 *
 * The observed failure this prevents: treating approval, publication and
 * featuring as one step, so a pending note looks public or a featured card looks
 * like a copy. Guestbook owns the note, moderation and media. Linkarooie owns
 * curation and stores only an exact source reference. App Composer coordinates
 * the connection; it does not become a third copy of the record.
 *
 * This is a public-safe model of the published contract reviewed on 23 October
 * 2026, not a production control. No visitor record, guest code, owner
 * credential or private moderation state is used.
 */

type InvitationState = "open" | "paused" | "closed" | "full" | "unavailable";

export type FlowState = InvitationState | "pending" | "approved" | "featured" | "removed" | "none";

export type ContributionStep = {
  id: string;
  phase: "Invitation" | "Contribution" | "Review" | "Featuring" | "Revocation" | "Availability";
  /** What the visitor or owner does. */
  action: string;
  /** What the two products do in response. */
  result: string;
  /** Why the boundary is where it is. */
  because: string;
  /** The Guestbook side of the contract. */
  guestbook: string;
  /** The Linkarooie side of the contract. */
  linkarooie: string;
  state: FlowState;
  source: { label: string; url: string; note: string };
};

export const contributionReview = {
  reviewedAt: "2026-10-23",
  contractReviewedAt: "2026-10-22",
  guestbookCommit: "019ce0d117f9f89e472a5c7642d51d85301f7fcd",
  linkarooieCommit: "20ef9a50c19c7a3419dc06fdae020c6a677ed5cf",
  owner: "Guestbook owns the note; Linkarooie owns curation; Composer owns the connection.",
  boundary:
    "The local fictional run exercised submission → pending → owner approval → explicit feature → hide at source. It is not a hosted deployment, a live owner configuration or adoption evidence. No private record, guest code or credential appears here.",
  documentation: {
    label: "Maintained contribution contract",
    url: "https://github.com/loftwah/app-composer/blob/main/docs/guestbook-contributions.md"
  },
  building: {
    label: "App Composer build story",
    url: "https://composer.loftwah.com/building#result"
  }
} as const;

const guestbook = (file: string) =>
  `https://github.com/loftwah/app-composer-guestbook/blob/${contributionReview.guestbookCommit}/${file}`;
const linkarooie = (file: string) =>
  `https://github.com/loftwah/app-composer-showcase/blob/${contributionReview.linkarooieCommit}/${file}`;
const contract = contributionReview.documentation.url;

export const contributionSteps: ContributionStep[] = [
  {
    id: "invitation",
    phase: "Invitation",
    action: "The visitor meets the guestbook invitation",
    result:
      "Linkarooie reads the exact Guestbook resource and shows “Leave a note” only when the invitation says open.",
    because:
      "Guestbook owns acceptance. Linkarooie owns the public invitation, and a malformed, redirected, foreign or partial answer becomes unavailable — never open.",
    guestbook: "Publishes the active invitation state, form path and limits.",
    linkarooie: "Renders a send action only for a validated open state.",
    state: "open",
    source: {
      label: "Guestbook manifest · Linkarooie invitation reader",
      url: linkarooie("src/guestbook-invitation.ts"),
      note: "Contract version 1, five states, exact resource and configuration."
    }
  },
  {
    id: "contribution",
    phase: "Contribution",
    action: "A visitor sends a short note",
    result:
      "Guestbook accepts a text postcard and generates its PNG. The new record is pending and private, not a public item.",
    because:
      "The visitor's words and media belong to Guestbook. Linkarooie never receives the guest code and never keeps a copy of the note.",
    guestbook: "Stores a pending private record and its generated media.",
    linkarooie: "Shows the invitation only; it has no pending record to feature.",
    state: "pending",
    source: {
      label: "Guestbook submission path",
      url: guestbook("src/guest.ts"),
      note: "Closed and full intake are refused; accepted postcards start pending."
    }
  },
  {
    id: "review",
    phase: "Review",
    action: "The pending note waits for the source owner",
    result:
      "The pending item and its media are not public. A curator cannot turn a pending note into a card, because there is no public source item to reference.",
    because:
      "Approval is an owner decision at the source. Featuring is a separate curation decision later; neither is a side effect of submission.",
    guestbook: "Keeps the pending record and media private.",
    linkarooie: "Cannot feature an item it cannot read from the public contract.",
    state: "pending",
    source: {
      label: "Guestbook public resource",
      url: guestbook("src/resource-public.ts"),
      note: "Public item and media follow the source's current visibility."
    }
  },
  {
    id: "approval",
    phase: "Review",
    action: "The source owner approves it",
    result:
      "Guestbook publishes the approved item at its own address. Approval makes the source eligible; it does not put anything on the Linkarooie profile.",
    because:
      "Guestbook owns moderation, the item revision and the media. The approved item can now be collected, but curation is still a separate choice.",
    guestbook: "Publishes the approved item and serves its media.",
    linkarooie: "Sees an eligible source item; the profile is unchanged.",
    state: "approved",
    source: {
      label: "Guestbook public resource",
      url: guestbook("src/resource-public.ts"),
      note: "Approved public item; no automatic publication downstream."
    }
  },
  {
    id: "featuring",
    phase: "Featuring",
    action: "The curator features that exact source item",
    result:
      "Linkarooie collects the approved source into the profile's featured section. The card references the item; it does not copy the text or media.",
    because:
      "Curation belongs to Linkarooie. The saved reference is the exact resource and configuration, so a later reviewable configuration advance does not silently point at another note.",
    guestbook: "Serves the approved item and its media at the source.",
    linkarooie: "Stores the exact reference and composes the public card.",
    state: "featured",
    source: {
      label: "Linkarooie explicit collection",
      url: linkarooie("src/resource-collection.ts"),
      note: "Collects a currently approved public item; never a pending one."
    }
  },
  {
    id: "revocation",
    phase: "Revocation",
    action: "The source owner hides it",
    result:
      "The item API and media return 404. The composed card disappears on the next public render, and no stale copy remains in Linkarooie.",
    because:
      "Visibility is resolved at the source on every request. The card is a reference, so hiding or deleting at the source is enough; a downloaded copy cannot be recalled.",
    guestbook: "Revokes the item and media.",
    linkarooie: "Rechecks the source and removes the dependent card.",
    state: "removed",
    source: {
      label: "Linkarooie curated profile",
      url: linkarooie("src/creator-profile.ts"),
      note: "Featured cards are a view over currently eligible source items."
    }
  },
  {
    id: "closed",
    phase: "Availability",
    action: "The invitation closes or fills",
    result:
      "The panel explains the state and keeps a link to approved notes. No send action is rendered, and an already-public featured card is unaffected.",
    because:
      "Acceptance and publication are different questions. Closing intake does not hide approved notes, and a full queue must not offer a form that would fail.",
    guestbook: "Reports paused, closed or full for the active configuration.",
    linkarooie: "Explains the state without a dead form; approved notes stay reachable.",
    state: "closed",
    source: {
      label: "Maintained contribution contract",
      url: contract,
      note: "Open, paused, closed and full; only open accepts a postcard."
    }
  }
];

export const invitationStates: {
  state: FlowState;
  label: string;
  accepts: boolean;
  panel: string;
  boundary: string;
}[] = [
  {
    state: "open",
    label: "Open",
    accepts: true,
    panel: "Leave a note, using Guestbook's real form.",
    boundary:
      "The guest code is shared by the owner separately; the note stays private until approval."
  },
  {
    state: "paused",
    label: "Paused",
    accepts: false,
    panel: "Postcards are paused; approved notes remain linked.",
    boundary: "No send action is rendered while acceptance is paused."
  },
  {
    state: "closed",
    label: "Closed",
    accepts: false,
    panel: "Postcards are closed; approved notes remain linked.",
    boundary: "Closing intake does not remove an already-approved public note."
  },
  {
    state: "full",
    label: "Full",
    accepts: false,
    panel: "The review queue is full; approved notes remain linked.",
    boundary: "The limit covers 16 pending notes or 200 non-deleted items."
  },
  {
    state: "unavailable",
    label: "Unavailable",
    accepts: false,
    panel: "The invitation could not be verified; no form or media link is shown.",
    boundary: "A malformed, redirected, foreign or partial response never becomes open."
  },
  {
    state: "none",
    label: "No linked source",
    accepts: false,
    panel: "No contribution panel is shown.",
    boundary: "Without an exact saved source and configuration there is nothing to ask."
  }
];

export const contributionAnchors = [
  ...contributionSteps.map((step) => ({ url: step.source.url, note: step.source.note })),
  { url: contract, note: "the maintained contract note" },
  { url: guestbook("app.manifest.json"), note: "the guest invitation descriptor" }
];
