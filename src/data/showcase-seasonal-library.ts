import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-seasonal-library";
const pieces = [
  {
    id: "summer-christmas",
    project: "woodhouse",
    title: "A very Australian Christmas",
    tag: "Christmas",
    use: "seasonal",
    width: 1122,
    height: 1402,
    href: "https://woodhouse.loftwah.com/share/",
    caption: "It’s 30 degrees and the cabinet’s still on. Merry Christmas.",
    alt: "Australian summer Christmas postcard with an arcade cabinet on the beach",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "bubble-halloween",
    project: "bubbles",
    title: "One more fright",
    tag: "Halloween",
    use: "seasonal",
    width: 941,
    height: 1672,
    href: "https://bubbles.loftwah.com/",
    caption: "The cabinet gets one more credit after dark.",
    alt: "Purple arcade Halloween scene with orange bubble clusters",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "foil-halloween",
    project: "foilbury",
    title: "The midnight cabinet",
    tag: "Halloween",
    use: "seasonal",
    width: 1122,
    height: 1402,
    href: "https://foilbury.loftwah.com/",
    caption: "Something moved in the cabinet. Rhea says it wasn’t her.",
    alt: "Candlelit Foilbury cabinet with Rhea on display",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "fm-new-year",
    project: "loftwahfm",
    title: "Last track of the year",
    tag: "New Year",
    use: "seasonal",
    width: 1254,
    height: 1254,
    href: "https://fm.loftwah.com/radio",
    caption: "The last track gets the whole room. What are you playing?",
    alt: "Turquoise and yellow fireworks over a black record",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "bubble-birthday",
    project: "bubbles",
    title: "Extra life",
    tag: "Birthday",
    use: "seasonal",
    width: 1122,
    height: 1402,
    href: "https://bubbles.loftwah.com/",
    caption: "Happy birthday. The cabinet owes you an extra life.",
    alt: "Colourful arcade-themed birthday cake card",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "foil-birthday",
    project: "foilbury",
    title: "The birthday pull",
    tag: "Birthday",
    use: "seasonal",
    width: 1122,
    height: 1402,
    href: "https://foilbury.loftwah.com/",
    caption: "The one time you’re allowed to open the pack before cake.",
    alt: "Gold and lilac Foilbury birthday card with a tied collector pack",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "table-invite",
    project: "protocol-11",
    title: "Pull up a chair",
    tag: "Invitations",
    use: "feature",
    width: 1060,
    height: 1484,
    href: "https://protocol11.loftwah.com/",
    caption:
      "Print it, write a time and place, and pass it to whoever always brings their own deck.",
    alt: "Honey-and-teal game night invitation with blank date and location lines",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "arcade-invite",
    project: "bubbles",
    title: "Arcade night",
    tag: "Invitations",
    use: "feature",
    width: 1060,
    height: 1484,
    href: "https://bubbles.loftwah.com/",
    caption: "Pick a night, write the address, then put the winner on dishes.",
    alt: "Arcade night invitation with space for the time and place",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "listening-invite",
    project: "loftwahfm",
    title: "Listening party",
    tag: "Invitations",
    use: "feature",
    width: 1060,
    height: 1484,
    href: "https://fm.loftwah.com/radio",
    caption: "Bring one record. Someone else gets the aux after that.",
    alt: "Navy listening party invitation featuring a record",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "patch-print",
    project: "woodhouse",
    title: "Patch notes from the table",
    tag: "Printables",
    use: "feature",
    width: 1086,
    height: 1448,
    href: "https://woodhouse.loftwah.com/share/",
    caption: "A printable sheet for the three bits of a build worth remembering.",
    alt: "Woodhouse worksheet with three areas for build notes",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "reef-print",
    project: "shoalshot",
    title: "Reef field sheet",
    tag: "Printables",
    use: "feature",
    width: 1086,
    height: 1448,
    href: "https://shoalshot.loftwah.com/",
    caption: "A printable field sheet for the thing you saw and the spot you found it.",
    alt: "Illustrated printable reef field worksheet",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "bubble-sticker",
    project: "bubbles",
    title: "Bank shot sticker",
    tag: "Stickers",
    use: "special",
    width: 1254,
    height: 1254,
    href: "https://bubbles.loftwah.com/",
    caption: "A little bank shot for a laptop or a Discord reaction.",
    alt: "Die-cut bubble and bank-shot sticker",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "fm-sticker",
    project: "loftwahfm",
    title: "Leave it on sticker",
    tag: "Stickers",
    use: "special",
    width: 1254,
    height: 1254,
    href: "https://fm.loftwah.com/radio",
    caption: "For the radio you leave on while doing everything else.",
    alt: "Blue and yellow radio dial sticker",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "wood-sticker",
    project: "woodhouse",
    title: "Works on my machine sticker",
    tag: "Stickers",
    use: "special",
    width: 1254,
    height: 1254,
    href: "https://woodhouse.loftwah.com/share/",
    caption: "The only certification my laptop issues.",
    alt: "CRT test pattern sticker with hand-lettered text",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "rhea-card",
    project: "foilbury",
    title: "Rhea · After hours",
    tag: "Trading cards",
    use: "art",
    width: 1060,
    height: 1484,
    href: "https://foilbury.loftwah.com/",
    caption: "Rhea after hours, headphones on. A Foilbury art collectible.",
    alt: "Rhea in headphones in a collectible card frame",
    label: "ImageGen original PNG",
    stage: "Artwork collectible",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "reef-card",
    project: "shoalshot",
    title: "Lantern ray · Reef set",
    tag: "Trading cards",
    use: "art",
    width: 1060,
    height: 1484,
    href: "https://shoalshot.loftwah.com/",
    caption: "A Lantern Ray specimen plate in trading-card form.",
    alt: "Glowing Lantern Ray in an illustrated trading card",
    label: "ImageGen original PNG",
    stage: "Artwork collectible",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "bubble-card",
    project: "bubbles",
    title: "Bank shot · Cabinet set",
    tag: "Trading cards",
    use: "art",
    width: 1060,
    height: 1484,
    href: "https://bubbles.loftwah.com/",
    caption: "The shot you call out loud just before it works.",
    alt: "A bubble rebounds off the rail on a retro arcade card",
    label: "ImageGen original PNG",
    stage: "Artwork collectible",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "loom-card",
    project: "woodhouse",
    title: "Loom · Factory set",
    tag: "Trading cards",
    use: "art",
    width: 1060,
    height: 1484,
    href: "https://woodhouse.loftwah.com/share/",
    caption: "One fibre is a line. Put enough together and the loom starts to move.",
    alt: "Iridescent Woodhouse loom card",
    label: "ImageGen original PNG",
    stage: "Artwork collectible",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "prompt-rollback",
    project: "woodhouse",
    title: "The rollback card",
    tag: "Reply cards",
    use: "feature",
    width: 1122,
    height: 1402,
    href: "https://woodhouse.loftwah.com/share/",
    caption:
      "I knew we had to roll back when ____. I’ll go first. Someone said the alerts had stopped.",
    alt: "Woodhouse rollback fill-in-the-blank prompt card",
    label: "ImageGen original PNG",
    stage: "Question card",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "prompt-deck",
    project: "protocol-11",
    title: "House rule",
    tag: "Reply cards",
    use: "feature",
    width: 1122,
    height: 1402,
    href: "https://protocol11.loftwah.com/",
    caption: "What house rule would get you kicked out? The best one might be worth trying.",
    alt: "Illustrated Protocol 11 house-rule question",
    label: "ImageGen original PNG",
    stage: "Question card",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "prompt-fm",
    project: "loftwahfm",
    title: "Four bars",
    tag: "Reply cards",
    use: "feature",
    width: 1122,
    height: 1402,
    href: "https://fm.loftwah.com/radio",
    caption: "What song gets four bars before you skip? Name the track.",
    alt: "LoftwahFM question card asking which track gets skipped",
    label: "ImageGen original PNG",
    stage: "Question card",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "prompt-composer",
    project: "app-composer",
    title: "One tool left",
    tag: "Reply cards",
    use: "feature",
    width: 1122,
    height: 1402,
    href: "https://composer.loftwah.com/",
    caption:
      "If you could keep one tool, what would it be? I’m after the boring answer you use every day.",
    alt: "App Composer card asking which tool you would keep",
    label: "ImageGen original PNG",
    stage: "Question card",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "prompt-reef",
    project: "shoalshot",
    title: "Name that fish",
    tag: "Reply cards",
    use: "feature",
    width: 1122,
    height: 1402,
    href: "https://shoalshot.loftwah.com/",
    caption:
      "Name this fish. Wrong answers welcome. It looks like it has opinions about council parking.",
    alt: "Cyan and orange fish-naming question card",
    label: "ImageGen original PNG",
    stage: "Question card",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "prompt-bubble",
    project: "bubbles",
    title: "Call the shot",
    tag: "Reply cards",
    use: "feature",
    width: 1122,
    height: 1402,
    href: "https://bubbles.loftwah.com/",
    caption: "Bank it or go straight? Call your shot before you see mine.",
    alt: "Bubbles card asking readers to choose a shot",
    label: "ImageGen original PNG",
    stage: "Question card",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "avatar-studio",
    project: "woodhouse",
    title: "Dean · Studio portrait",
    tag: "Avatars",
    use: "icon",
    width: 1254,
    height: 1254,
    href: "https://woodhouse.loftwah.com/share/",
    caption: "Dean in the studio, drawn from his public Loftwah portrait.",
    alt: "Head-and-shoulders portrait of Dean in a studio",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "avatar-halftone",
    project: "woodhouse",
    title: "Dean · Two-ink avatar",
    tag: "Avatars",
    use: "icon",
    width: 1254,
    height: 1254,
    href: "https://woodhouse.loftwah.com/share/",
    caption: "Dean in two inks. The beard did most of the colour separation.",
    alt: "Two-ink portrait of Dean with glasses and a red beard",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "avatar-arcade",
    project: "woodhouse",
    title: "Dean · Arcade avatar",
    tag: "Avatars",
    use: "icon",
    width: 1254,
    height: 1254,
    href: "https://woodhouse.loftwah.com/share/",
    caption: "Dean on the character-select screen.",
    alt: "Pixel-art arcade portrait of Dean",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  },
  {
    id: "avatar-cartoon",
    project: "woodhouse",
    title: "Dean · Saturday morning avatar",
    tag: "Avatars",
    use: "icon",
    width: 1254,
    height: 1254,
    href: "https://woodhouse.loftwah.com/share/",
    caption: "Dean as an original Saturday morning cartoon portrait.",
    alt: "Hand-inked cartoon portrait of Dean",
    label: "ImageGen original PNG",
    credit: "Woodhouse · Codex ImageGen"
  }
] as const;

const seasonalArtwork: CampaignItem[] = pieces.map((piece) => ({
  id: `seasonal-library-${piece.id}`,
  series: "seasonal-library",
  project: piece.project,
  title: piece.title,
  use: piece.use,
  tags: [piece.tag],
  ...("stage" in piece ? { stage: piece.stage } : {}),
  alt: piece.alt,
  caption: `${piece.caption}\n${piece.href}`,
  href: piece.href,
  action: "Explore",
  kind: "editorial composition",
  credit: piece.credit,
  source: `${base}/provenance.txt`,
  image: `${base}/${piece.id}-preview.jpg`,
  thumbnail: `${base}/${piece.id}-thumb.jpg`,
  original: `${base}/${piece.id}.png`,
  width: piece.width,
  height: piece.height,
  reviewedAt: "2026-11-13",
  addedAt: "2026-11-13T06:02:53.123Z",
  formats: [
    {
      label: piece.label,
      image: `${base}/${piece.id}.png`,
      width: piece.width,
      height: piece.height
    }
  ]
}));

const qrProjects = [
  [
    "gallery",
    "woodhouse",
    "Share gallery QR",
    "Take something",
    "luminous Woodhouse loom fibres",
    "https://woodhouse.loftwah.com/share/"
  ],
  [
    "bubbles",
    "bubbles",
    "Play Bubbles QR",
    "One more round",
    "a neon Bubbles arcade cabinet",
    "https://bubbles.loftwah.com/"
  ],
  [
    "foilbury",
    "foilbury",
    "Open Foilbury QR",
    "The After Hours pull",
    "Rhea in an ornate Foilbury collector frame",
    "https://foilbury.loftwah.com/"
  ],
  [
    "protocol",
    "protocol-11",
    "Open Protocol 11 QR",
    "Pull up a chair",
    "a cream and teal Art Deco game-night invitation",
    "https://protocol11.loftwah.com/"
  ],
  [
    "radio",
    "loftwahfm",
    "Listen to LoftwahFM QR",
    "Leave it on",
    "a QR printed in the label of a vinyl record",
    "https://fm.loftwah.com/radio"
  ]
] as const;

const qrCards: CampaignItem[] = qrProjects.flatMap(
  ([key, project, title, posterTitle, artwork, href]) =>
    (["poster", "branded"] as const).map((style) => {
      const poster = style === "poster";
      const id = `qr-${key}-${poster ? "imagegen" : style}`;
      const width = poster ? 1122 : 1200;
      const height = poster ? 1402 : 1200;
      const original = `${base}/${id}.png`;
      return {
        id: `seasonal-library-qr-${key}${poster ? "-poster" : ""}`,
        series: "seasonal-library",
        project,
        title: poster ? `${posterTitle} · QR poster` : title,
        use: "feature",
        tags: ["QR codes"],
        alt: poster
          ? `Poster featuring ${artwork}, a QR code and the address ${href}`
          : `Branded square QR card with the address ${href}`,
        caption: `Scan to open ${href}`,
        href,
        action: "Explore",
        kind: "editorial composition",
        credit: poster
          ? "Woodhouse · Codex ImageGen with a QR reference"
          : "Woodhouse · brand artwork and encoded QR",
        source: `${base}/provenance.txt`,
        image: `${base}/${id}-preview.jpg`,
        thumbnail: `${base}/${id}-thumb.jpg`,
        original,
        width,
        height,
        reviewedAt: "2026-11-13",
        addedAt: poster ? "2026-11-13T07:46:57.514Z" : "2026-11-13T06:02:53.123Z",
        formats: [
          {
            label: poster ? "QR poster PNG" : "Branded QR card PNG",
            image: original,
            width,
            height
          },
          { label: "QR code PNG", image: `${base}/qr-${key}.png`, width: 1184, height: 1184 }
        ]
      };
    })
);

export const seasonalLibrary = [...seasonalArtwork, ...qrCards];
