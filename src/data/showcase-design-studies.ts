import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-design-studies";
const studies = [
  [
    "foilbury",
    "foilbury",
    "The cabinet and the spotlight",
    "Concept mockup",
    "feature",
    "Six face-forward illustrated cards on two metal rails in a dark cabinet. Rhea’s cream card lifts forward into a pool of amber light.",
    "The cabinet study asks one question. Can Rhea come forward far enough to inspect while the shelf still feels like your collection?",
    "https://foilbury.loftwah.com/",
    1536,
    1024,
    "https://github.com/loftwah/card-collector-bot/issues/146"
  ],
  [
    "shoalshot",
    "shoalshot",
    "Three depths of reef",
    "Environment concept",
    "sketch",
    "A shadowed rock arch frames a school of fish, sunlit kelp and a distant ray above a deep blue drop-off.",
    "A dark foreground, a school in the middle and a distant drop-off give the Home aquarium three depths to work with. The open sand leaves room for the menu.",
    "https://shoalshot.loftwah.com/",
    1536,
    1024
  ],
  [
    "hyperrom",
    "woodhouse",
    "HyperROM preset workflow",
    "Workflow concept",
    "feature",
    "A cream technical manual sheet with a graphite and amber sampler concept and six boxes running from Browse to Reopen.",
    "A software instrument drawn like a hardware manual. The planned path runs from browsing a preset to reopening a sound you’ve shaped and saved.",
    "https://woodhouse.loftwah.com/",
    1536,
    1024,
    "https://github.com/loftwah/woodhouse-new/issues/232"
  ],
  [
    "liferaft",
    "liferaft",
    "Recover the attachment",
    "Workflow concept",
    "feature",
    "A two-colour print shows an archive box, a magnified message, a selected attachment and a destination folder.",
    "The proposed agent workflow makes the source message visible before anyone picks the attachment to recover.",
    "https://liferaft.loftwah.com/",
    1122,
    1402,
    "https://github.com/loftwah/liferaft/issues/9"
  ],
  [
    "loftwahfm",
    "loftwahfm",
    "Smoked acrylic, warm dial",
    "Material concept",
    "sketch",
    "An amber-lit tuning rail and brass knob on a petrol-blue radio instrument, with three close-ups of its finishes.",
    "A material study for the living station. Smoked acrylic and a warm tuning rail give quiet passages somewhere to settle.",
    "https://fm.loftwah.com/radio",
    1536,
    1024
  ],
  [
    "protocol-11",
    "protocol-11",
    "Pass the phone",
    "Interaction sketch",
    "sketch",
    "Two illustrated phone frames show a face-down card during handoff and a Reveal hand button for the next player.",
    "Keep the hand covered between turns. The next player reveals it after the phone has changed hands.",
    "https://protocol11.loftwah.com/",
    1536,
    1024
  ],
  [
    "app-composer",
    "app-composer",
    "One cover, four frames",
    "Storyboard concept",
    "feature",
    "A contact sheet follows a silver ribbon from a blue-room reference through colour variations, an amber film still and a record sleeve.",
    "The Media Studio example follows one record cover through references, variations, motion and a deliberate publication step.",
    "https://composer.loftwah.com/",
    1536,
    1024,
    "https://github.com/loftwah/app-composer/issues/459"
  ],
  [
    "bubbles",
    "bubbles",
    "The bank shot on paper",
    "Gameplay study",
    "sketch",
    "A lime line climbs from a purple bubble launcher, bounces off the right rail and reaches a cluster.",
    "The side rail gives you a line into the bubble cluster when the straight shot is blocked. An illustrated study of the existing move.",
    "https://bubbles.loftwah.com/",
    1122,
    1402
  ],
  [
    "fighter",
    "fighter",
    "Before the hit lands",
    "Animation storyboard",
    "sketch",
    "Three red-and-teal storyboard panels show two arcade fighters preparing, making contact and recoiling.",
    "The same matchup, three beats. Give the player time to see who commits, where the hit lands and who recoils.",
    "https://fighter.loftwah.com/",
    1536,
    1024
  ],
  [
    "woodhouse",
    "woodhouse",
    "One strand to the loom",
    "Shipped feature study",
    "sketch",
    "A cyan and lime etching moves from a single curved strand through an armature to a luminous woven loop.",
    "An illustrated study of the live homepage loom, starting with one fibre and ending with the crossing bundle.",
    "https://woodhouse.loftwah.com/",
    1536,
    1024
  ]
] as const;

export const designStudies: CampaignItem[] = studies.map(
  ([slug, project, title, stage, use, alt, caption, href, width, height, issue]) => ({
    id: `design-study-${slug}`,
    series: "design-studies",
    project,
    title,
    stage,
    use,
    alt,
    caption: `${caption}\n${issue ?? href}`,
    href,
    action: "Explore",
    source: `${base}/provenance.txt`,
    ...(issue ? { issue } : {}),
    image: `${base}/${slug}-preview.jpg`,
    thumbnail: `${base}/${slug}-thumb.jpg`,
    original: `${base}/${slug}.png`,
    width,
    height,
    reviewedAt: "2026-11-13",
    addedAt: "2026-11-13T05:17:59.002Z",
    credit: "Woodhouse · Codex ImageGen",
    kind: "editorial composition",
    formats: [{ label: "ImageGen original PNG", image: `${base}/${slug}.png`, width, height }]
  })
);
