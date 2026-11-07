/**
 * The reviewed portfolio architecture atlas.
 *
 * The observed failure (#149): `/architecture/` described Woodhouse's own
 * publication pipeline while visitors expected the architecture of every
 * Loftwah project. This module is the curated, public-safe projection that
 * fixes the mismatch. It is deliberately checked in rather than scraped:
 *
 * - Every fact names the file or public observation it came from, so a later
 *   editor can re-check it instead of trusting the page.
 * - `unknowns` is part of the record, not an apology. A README ambition is
 *   never promoted to a shipped node because a field would look empty.
 * - Relationships are directional and only exist when the consumer's source
 *   or a published contract proves them. Shared brand or a footer link is not
 *   a relationship.
 *
 * Review date: 7 November 2026. A new review changes the date; it does not
 * silently inherit an older claim. Product identity and lifecycle stay with
 * the EmDash catalogue; this module never re-declares them.
 */

export type AtlasStatus = "live" | "demo" | "planned" | "unknown";

export type AtlasGroupKey = "play" | "listen" | "build" | "collect" | "everyday" | "publish";

export type AtlasFact = {
  label: string;
  value: string;
  evidence?: string;
};

export type AtlasPart = {
  label: string;
  detail: string;
  evidence?: string;
};

export type AtlasDecision = {
  title: string;
  detail: string;
};

export type AtlasRelationship = {
  id: string;
  /** The project that initiates the data flow or dependency. */
  from: string;
  /** The project that answers, provides or receives it. */
  to: string;
  /** Reader-facing verb: "uses", "reports plays to", "reads a contract from". */
  verb: string;
  /** Compact plate and ledger label. */
  short: string;
  detail: string;
  evidence: string;
  /** True when the same pair also flows the other way. */
  pair?: boolean;
  /** False for a verified relationship that would clutter the overview plate. */
  plate?: boolean;
};

export type AtlasProfile = {
  slug: string;
  name: string;
  group: AtlasGroupKey;
  /** Short verified technology tags for the register row. */
  tags: string[];
  /** One line: what the product does. */
  role: string;
  /** One line: what kind of system it is. */
  shape: string;
  summary: string;
  status: AtlasStatus;
  statusNote: string;
  reviewDate: string;
  /** The owning repository revision read for this review, e.g. `main @ 56918c90`. */
  reference: string;
  facts: AtlasFact[];
  parts: AtlasPart[];
  decisions: AtlasDecision[];
  unknowns: string[];
  publicSources: { label: string; href: string }[];
  deepDive?: string[];
  deepDiveTitle?: string;
  deepDiveReason?: string;
};

export const atlasReview = {
  date: "2026-11-07",
  display: "7 November 2026"
} as const;

export const atlasGroups: { key: AtlasGroupKey; label: string; note: string }[] = [
  {
    key: "play",
    label: "Play",
    note: "Games you can open today, or pause and keep in the record."
  },
  {
    key: "listen",
    label: "Listen",
    note: "Music, stations and the shared radio capability."
  },
  {
    key: "build",
    label: "Build",
    note: "Tools for making, finding and composing things."
  },
  {
    key: "collect",
    label: "Collect",
    note: "Personal catalogues and public showcases."
  },
  {
    key: "everyday",
    label: "Everyday",
    note: "Software that helps outside a game."
  },
  {
    key: "publish",
    label: "Publish",
    note: "The reviewed record itself."
  }
];

export const atlasProfiles: AtlasProfile[] = [
  {
    slug: "bubbles",
    name: "Bubbles",
    tags: ["Phaser 3.87", "React 19", "Cloudflare Workers"],
    group: "play",
    role: "Deterministic bubble puzzles with a shared radio",
    shape:
      "A browser game served as static assets, with a separate cloud Worker for optional profiles, high scores and sign-in.",
    summary:
      "Bubbles runs the game in the browser. One Worker serves the built assets; a second Worker at api.bubbles.loftwah.com provides optional profile sync, high scores and email magic-link sign-in. A React shell owns menus, settings and accessible controls; Phaser renders play; an Effect-based domain layer keeps the simulation deterministic. Music is delegated to LoftwahFM's pinned radio client while the game keeps its own audio graph.",
    status: "live",
    statusNote:
      "bubbles.loftwah.com answered HTTP 200 on 7 November 2026. The cloud API host is a separate Worker.",
    reviewDate: "2026-11-07",
    reference: "main @ 56918c90",
    facts: [
      {
        label: "Stack",
        value: "Phaser 3.87, React 19.3, TypeScript, Vite 5, Effect 4",
        evidence: "package.json"
      },
      {
        label: "Runtime",
        value:
          "Two Cloudflare Workers: `bubbles` serves the Vite build through ASSETS; `bubbles-cloud` serves api.bubbles.loftwah.com",
        evidence: "wrangler.jsonc; wrangler.cloud.jsonc"
      },
      {
        label: "Storage",
        value:
          "D1 `bubbles-cloud` for optional profiles and high scores; localStorage for the active save, settings and score history",
        evidence: "wrangler.cloud.jsonc; src/persistence/profile.ts; src/persistence/high-scores.ts"
      },
      {
        label: "Identity",
        value:
          "Optional email magic-link sign-in with an opaque HttpOnly `bubbles_session` cookie; the game is playable without an account.",
        evidence: "src/cloud/lib/cookies.ts; src/cloud/lib/resend.ts"
      },
      {
        label: "Delivery",
        value:
          "Cloudflare custom domain bubbles.loftwah.com for the game; scripts deploy the game and cloud Workers separately",
        evidence: "wrangler.jsonc routes; package.json scripts"
      },
      {
        label: "Integrations",
        value:
          "LoftwahFM radio client 1.2.0; Resend for magic links; a public portfolio-analytics route on the cloud Worker consumed by Woodhouse",
        evidence:
          "package.json; src/app/music-transport.ts; src/cloud/routes/portfolio-analytics.ts; Woodhouse src/data/portfolio-analytics.ts"
      }
    ],
    parts: [
      {
        label: "Game client",
        detail:
          "Phaser owns play and rendering; React owns menus, settings and the controls a keyboard can reach.",
        evidence: "src/app; src/presentation"
      },
      {
        label: "Domain",
        detail: "Effect services keep game state and rules separate from presentation.",
        evidence: "package.json (effect); src/app"
      },
      {
        label: "Optional cloud",
        detail:
          "A second Worker owns profile sync, high scores and magic-link sessions. It is not on the path to opening or playing the game.",
        evidence: "src/cloud; wrangler.cloud.jsonc"
      },
      {
        label: "Audio",
        detail:
          "The game keeps its own effects and volume. LoftwahFM's client selects stations and queue state; it does not replace the host audio graph.",
        evidence: "src/app/music-transport.ts; FM docs/radio-game-integration.md"
      }
    ],
    decisions: [
      {
        title: "Local first, with an optional account",
        detail:
          "The save exists before sign-in, so a backend outage cannot take it away. The trade-off is that browser storage limits and migrations belong to the game; the cloud profile is a convenience, not the source of truth for play."
      },
      {
        title: "Two Workers, because they have different jobs",
        detail:
          "The game Worker serves files and nothing else. The cloud Worker owns identity and sync, which keeps cookies and database writes out of the static asset path."
      },
      {
        title: "Music is a capability, not a second platform",
        detail:
          "Pinning one versioned radio client keeps station logic out of the game. The client may change station and queue state; the game still decides how loud anything is."
      }
    ],
    unknowns: [
      "This review did not test save migration across browsers or storage-pressure eviction.",
      "Profile-sync conflict handling between two signed-in devices was not exercised.",
      "The retention and aggregation rules behind the public analytics route were not re-verified beyond the endpoint itself.",
      "No physical-device or assistive-technology test was performed for this profile."
    ],
    publicSources: [{ label: "Play Bubbles", href: "https://bubbles.loftwah.com/" }],
    deepDive: [
      "Most of this portfolio's games look similar from the outside and are built differently inside. Bubbles is the clearest case of a game that keeps the server off the critical path: one Worker serves files, and everything that makes the game a game happens in the browser.",
      "The optional account is the interesting part. A second Worker owns magic-link sign-in, profile rows and high scores. Because the local save exists first, sign-in adds sync rather than unlocking play. That removes an entire class of failure from the first session — no session, no account, no database write before the game starts — and moves the hard problem to conflict handling between devices, which is the problem the product actually has.",
      "The audio split is the part worth copying. LoftwahFM's client manages which station is playing and what comes next. Bubbles keeps the Web Audio graph, effects and mute policy. Neither side needs to know the other's internals, which is why the same client also works in Fighter, SHOALSHOT and Protocol 11."
    ],
    deepDiveTitle: "A local-first game with an account that is optional.",
    deepDiveReason:
      "Two Workers with different jobs, and a save that exists before sign-in — the opposite of an account-first game."
  },
  {
    slug: "fighter",
    name: "Fighter",
    tags: ["Phaser 3.90", "React 19", "D1"],
    group: "play",
    role: "Authored character journeys with a small D1-backed service",
    shape:
      "A Phaser and React game whose Cloudflare Worker runs API routes, stores suggestions and publishes analytics.",
    summary:
      "Fighter is the game in the catalogue with a real server-side job. The built game is served as assets, but `/api/*` runs first in a Worker that writes character suggestions to D1, rate-limits them with a server-side pepper, and sends owner notifications through Resend. It also exposes a public portfolio-analytics aggregate that Woodhouse reads.",
    status: "live",
    statusNote: "fighter.loftwah.com answered HTTP 200 on 7 November 2026.",
    reviewDate: "2026-11-07",
    reference: "main @ 353c1ccf",
    facts: [
      {
        label: "Stack",
        value: "Phaser 3.90, React 19.3, TypeScript, Vite 7, Effect 4, Tailwind 4",
        evidence: "package.json"
      },
      {
        label: "Runtime",
        value:
          "Cloudflare Worker `loftwah-fighter`; static assets plus API routes that run the Worker first",
        evidence: "wrangler.json"
      },
      {
        label: "Storage",
        value: "D1 database `loftwah-fighter` for character suggestions and public analytics",
        evidence: "wrangler.json; worker/schema"
      },
      {
        label: "Identity",
        value:
          "No player sign-in in the deployed Worker. AUTH_PEPPER only salts analytics and suggestion rate-limit identifiers; legacy account tables remain in the schema without exposed routes.",
        evidence: "worker/index.ts; worker/public-analytics.ts; worker/schema/0001_accounts.sql"
      },
      {
        label: "Delivery",
        value: "Cloudflare custom domain fighter.loftwah.com with a daily cron at 17:03",
        evidence: "wrangler.json"
      },
      {
        label: "Integrations",
        value:
          "LoftwahFM radio client 1.2.0; exposes /api/portfolio-analytics for Woodhouse; anonymous analytics stay on its own database",
        evidence:
          "package.json; worker/portfolio-analytics.ts; Woodhouse src/data/portfolio-analytics.ts"
      }
    ],
    parts: [
      {
        label: "Game client",
        detail: "Phaser and React render authored journeys; no account is required to play.",
        evidence: "src"
      },
      {
        label: "Worker API",
        detail:
          "Only /api/* reaches the Worker first; everything else is served as a static asset.",
        evidence: "wrangler.json assets.run_worker_first"
      },
      {
        label: "D1",
        detail: "Suggestions and public analytics are rows, not files in a bucket.",
        evidence: "worker/schema"
      },
      {
        label: "Notification",
        detail:
          "Resend is used to tell the owner about a suggestion. The game does not depend on email to remain playable.",
        evidence: "worker/index.ts; worker/character-suggestions.ts"
      }
    ],
    decisions: [
      {
        title: "A backend only where the product needs one",
        detail:
          "Character suggestions need durable, moderated records and abuse limits. Moving the game to a static build and the suggestions to a separate service would add a deploy boundary without removing the need for either."
      },
      {
        title: "Analytics stay with the game that measured them",
        detail:
          "Fighter publishes its own aggregate; Woodhouse reads it rather than becoming the collector. The game keeps working if the hub is unavailable."
      }
    ],
    unknowns: [
      "The moderation queue's response times and retention rules were not verified in this review.",
      "The legacy account tables in worker/schema are not exposed by the current Worker, but their retirement was not confirmed.",
      "The precise effect of the rate limiter under coordinated abuse was not tested.",
      "No physical-device or assistive-technology test was performed for this profile."
    ],
    publicSources: [{ label: "Play Fighter", href: "https://fighter.loftwah.com/" }]
  },
  {
    slug: "shoalshot",
    name: "SHOALSHOT",
    tags: ["Phaser 3.86", "React 19", "Static assets"],
    group: "play",
    role: "Mobile-first fishing arcade with a shared radio",
    shape: "A static Phaser and React build on Cloudflare with no server-side game runtime.",
    summary:
      "SHOALSHOT is delivered as static assets with a single-page fallback. It has no D1, R2 or KV binding and no Worker route of its own. The game reports anonymous engagement to Woodhouse and takes music from LoftwahFM, but neither dependency is required to open it.",
    status: "live",
    statusNote: "shoalshot.loftwah.com answered HTTP 200 on 7 November 2026.",
    reviewDate: "2026-11-07",
    reference: "main @ 61a644a5",
    facts: [
      {
        label: "Stack",
        value: "Phaser 3.86, React 19.2, TypeScript, Vite 8, Tailwind 4",
        evidence: "package.json"
      },
      {
        label: "Runtime",
        value:
          "Cloudflare static assets with SPA fallback; no Worker script in the reviewed config",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Storage",
        value: "No platform bindings. Saves and preferences are browser-local.",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Identity",
        value: "No accounts or sign-in.",
        evidence: "package.json; wrangler.jsonc"
      },
      {
        label: "Delivery",
        value: "Cloudflare custom domain shoalshot.loftwah.com, preview URLs enabled",
        evidence: "wrangler.jsonc routes"
      },
      {
        label: "Integrations",
        value:
          "LoftwahFM radio client 1.2.0 with the low-tide station; consent-gated anonymous engagement posted to Woodhouse",
        evidence: "package.json; src/platform/radio.ts; src/platform/gameplay-analytics.ts"
      }
    ],
    parts: [
      {
        label: "Client",
        detail: "Phaser renders the dive; React owns routes, dialogs and settings.",
        evidence: "src/app; src/scene"
      },
      {
        label: "Audio",
        detail: "The game adapter supplies the station and the host audio graph.",
        evidence: "src/platform/radio.ts; src/platform/audio.ts"
      },
      {
        label: "Engagement",
        detail:
          "Anonymous play events use the woodhouse.engagement/1 contract and are sent without credentials.",
        evidence: "src/platform/gameplay-analytics.ts"
      }
    ],
    decisions: [
      {
        title: "Static delivery is the default for a solo game",
        detail:
          "A game that needs no server data does not need a Worker. SPA fallback is the only routing behaviour the deployment adds."
      },
      {
        title: "Mobile first is a layout constraint, not a theme",
        detail:
          "The game is designed for a phone viewport first; the desktop view expands the same play field rather than inventing a second interface."
      }
    ],
    unknowns: [
      "The engagement contract's server-side deduplication and retention were not re-verified in this review.",
      "No physical-phone performance measurement was repeated for this profile.",
      "No assistive-technology test was performed."
    ],
    publicSources: [{ label: "Play SHOALSHOT", href: "https://shoalshot.loftwah.com/" }]
  },
  {
    slug: "protocol-11",
    name: "Protocol 11",
    tags: ["React 19", "Durable Objects", "D1"],
    group: "play",
    role: "A responsive card table with rooms and matchmaking",
    shape: "A React client backed by a Cloudflare Worker, D1 and two Durable Objects.",
    summary:
      "Protocol 11 is the portfolio's stateful game. A Worker owns the API, D1 holds durable platform rows, and two Durable Objects — GameRoom and Matchmaker — coordinate live rooms. The client also runs a jukebox through LoftwahFM and reports anonymous play to Woodhouse, but the game remains playable when the hub is unavailable.",
    status: "live",
    statusNote: "protocol11.loftwah.com answered HTTP 200 on 7 November 2026.",
    reviewDate: "2026-11-07",
    reference: "main @ 4aa72ea8",
    facts: [
      {
        label: "Stack",
        value: "React 19.3, Vite 7, TypeScript, Cloudflare Workers, Durable Objects",
        evidence: "package.json; worker"
      },
      {
        label: "Runtime",
        value:
          "Worker `protocol-11` with Durable Objects GameRoom and Matchmaker, static assets and a daily cron",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Storage",
        value: "D1 `protocol-11-platform` for durable rows; live room state in Durable Objects",
        evidence: "wrangler.jsonc; worker"
      },
      {
        label: "Identity",
        value:
          "Email magic-link accounts with opaque `p11_account` and `p11_guest_session` cookies; guests can play without creating an account.",
        evidence: "worker/platform/auth.ts; worker/platform/identity.ts"
      },
      {
        label: "Delivery",
        value: "Cloudflare custom domain protocol11.loftwah.com, preview Worker and daily cron",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Integrations",
        value:
          "LoftwahFM radio client 1.2.0 with the cartridge-club station; Resend runtime email for sign-in; anonymous engagement posted to Woodhouse",
        evidence:
          "package.json; src/client/jukebox.ts; worker/platform/email.ts; src/client/gameplay-analytics.ts"
      }
    ],
    parts: [
      {
        label: "Table client",
        detail:
          "React renders the table and controls; the same layout is a legal playing surface on a phone.",
        evidence: "src/ui/GameTable.tsx"
      },
      {
        label: "Worker API",
        detail: "Authenticates room requests, routes commands and serves the built client.",
        evidence: "worker/index.ts"
      },
      {
        label: "GameRoom",
        detail:
          "One Durable Object coordinates a live room so two clients cannot disagree about whose turn it is.",
        evidence: "wrangler.jsonc durable_objects GameRoom"
      },
      {
        label: "Matchmaker",
        detail: "A second Durable Object owns public matchmaking state.",
        evidence: "wrangler.jsonc durable_objects Matchmaker"
      },
      {
        label: "Accounts",
        detail:
          "Magic-link sign-in issues opaque account and guest session cookies; a guest can take a seat without registering.",
        evidence: "worker/platform/auth.ts; worker/platform/identity.ts"
      },
      {
        label: "Jukebox",
        detail:
          "LoftwahFM's client supplies the station and queue; the table keeps its own volume and effects.",
        evidence: "src/client/jukebox.ts; src/ui/MusicControls.tsx"
      }
    ],
    decisions: [
      {
        title: "A card table needs one authority per room",
        detail:
          "D1 alone would leave two players racing to write the same turn. A Durable Object gives each room one serialised writer, which is the smallest correct shape for turn order."
      },
      {
        title: "Measurement is not on the playing path",
        detail:
          "Engagement reports are fire-and-forget and anonymous. A failed report cannot roll back a move or block a turn."
      }
    ],
    unknowns: [
      "Room capacity under concurrent load was not re-measured in this review.",
      "Durable Object storage growth and eviction behaviour were not audited.",
      "No physical-device test was repeated for the table's touch controls."
    ],
    publicSources: [
      { label: "Play Protocol 11", href: "https://protocol11.loftwah.com/" },
      {
        label: "Portfolio relationship decision record",
        href: "https://protocol11.loftwah.com/"
      }
    ],
    deepDive: [
      "Most games in this portfolio can be understood from their client alone. Protocol 11 cannot: the interesting decisions are on the server, where a table has to agree on a single turn order while two people tap at once.",
      "The Worker splits durable platform data from live room state. D1 holds the rows that should survive a room — records that belong to the platform rather than to a hand in progress. GameRoom holds the hand. Because Cloudflare routes all requests for one room to one Durable Object, the room has a serialised writer and does not need a separate lock service.",
      "Matchmaker is deliberately a second object. Public matchmaking has different contention and lifetime from a private table; folding them together would make one slow queue delay live play. The cost is a second stateful component to deploy and observe, which is a fair trade only because the game actually has two different coordination problems."
    ],
    deepDiveTitle: "Two Durable Objects for one card table.",
    deepDiveReason:
      "The only project here with live multiplayer state, and a concrete reason for each stateful component."
  },
  {
    slug: "max",
    name: "MAX",
    tags: ["Astro 7", "D1 + R2", "Device simulator"],
    group: "everyday",
    role: "A connected companion for an existing walker",
    shape:
      "An Astro web app on Cloudflare plus a local simulator, a device service and shared protocol packages. The hardware is a prototype.",
    summary:
      "MAX is a workspace rather than a single app: a public Astro site, an owner PWA, a software simulator, a device-side service, and shared protocol and SDK packages. The hosted surface runs on a Cloudflare Worker with D1 and R2. The physical walker is a prototype, and the product pages say so.",
    status: "live",
    statusNote:
      "max.loftwah.com answered HTTP 200 on 7 November 2026. The hosted site is live; the hardware is not claimed as shipped.",
    reviewDate: "2026-11-07",
    reference: "main @ ac93ce65",
    facts: [
      {
        label: "Stack",
        value: "Astro 7 web app, React, TypeScript, pnpm workspace",
        evidence: "apps/web/package.json; pnpm-workspace.yaml"
      },
      {
        label: "Runtime",
        value:
          "Worker `max-web` for the SSR site and PWA; a separate `max-gateway` Worker is configured with a Durable Object but its README claims no deployment; local Docker Compose runs the gateway and device simulator",
        evidence:
          "apps/web/wrangler.jsonc; apps/gateway/wrangler.jsonc; apps/gateway/README.md; compose.yaml"
      },
      {
        label: "Storage",
        value:
          "D1 `max-db-prod` and R2 `max-media-prod`; gateway device state would live in the MAX_DEVICE Durable Object",
        evidence: "apps/web/wrangler.jsonc; apps/gateway/wrangler.jsonc"
      },
      {
        label: "Identity",
        value:
          "Email magic-link sessions with household roles and a platform-admin flag; the public demo needs no account.",
        evidence: "apps/web/src/lib/auth.ts; apps/web/src/pages/api/auth/request.ts"
      },
      {
        label: "Delivery",
        value:
          "max.loftwah.com for the web app through `pnpm deploy`; the gateway has no deployment script",
        evidence: "apps/web/package.json; apps/gateway/README.md"
      },
      {
        label: "Integrations",
        value:
          "Resend for auth and lead email; Cloudflare Turnstile on forms; OpenAI transcription only in the local stack; ElevenLabs only in authoring scripts",
        evidence:
          "apps/web/src/lib/lead-capture.ts; apps/web/src/pages/api/max/voice.ts; scripts/audio/README.md"
      }
    ],
    parts: [
      {
        label: "Public site",
        detail: "Astro pages explain the concept, the prototype status and the owner app.",
        evidence: "apps/web/src/pages"
      },
      {
        label: "Owner app",
        detail: "The installed shortcut opens the owner route; a magic-link session is required.",
        evidence: "apps/web/src/pages/api/auth"
      },
      {
        label: "maxd",
        detail: "The device-side service owns FIND and STOP behaviour during local stack runs.",
        evidence: "apps/maxd; README.md"
      },
      {
        label: "Gateway",
        detail:
          "A configured Worker would hold device state in the MAX_DEVICE Durable Object. Its README says no gateway deployment is claimed, so the atlas marks it planned rather than live.",
        evidence: "apps/gateway/wrangler.jsonc; apps/gateway/README.md"
      },
      {
        label: "max-sim",
        detail:
          "A software simulator stands in for the walker. The demo observes adapter state rather than animating an optimistic browser result.",
        evidence: "apps/max-sim; README.md"
      },
      {
        label: "Protocol and SDK",
        detail: "Shared packages keep the web app and device service on one contract.",
        evidence: "packages/protocol; packages/max-sdk"
      }
    ],
    decisions: [
      {
        title: "The simulator is labelled, not hidden",
        detail:
          "A software demo is useful before hardware exists only if nobody mistakes it for a device. The adapter boundary keeps the simulation honest and gives the real device the same interface later."
      },
      {
        title: "One workspace, separate runtimes",
        detail:
          "Web, device service and simulator share contracts but not a deployment. A hosted outage does not stop a local stack from running."
      }
    ],
    unknowns: [
      "No physical walker was available for this review, so fit, battery, safety and real FIND/STOP behaviour are unverified.",
      "The gateway Worker is configured but its README claims no deployment; device state over the network is therefore planned, not live.",
      "Whether either speech provider is configured in the live web deployment was not verified; OpenAI is described as local-stack only and ElevenLabs as authoring tooling.",
      "Installer signing and OS coverage were not checked."
    ],
    publicSources: [{ label: "Visit MAX", href: "https://max.loftwah.com/" }],
    deepDive: [
      "MAX is the only product in this catalogue that has to be honest about two kinds of existence at once: a hosted software product that anyone can open, and a physical companion that does not yet exist outside a prototype.",
      "The workspace keeps those apart. The Astro app owns the public story, the owner PWA and the magic-link session. The simulator and the device service run locally, with a shared protocol package defining what FIND and STOP mean. The demo observes the adapter's state instead of animating a success it did not receive, which is the difference between showing a concept and faking a device.",
      "That structure also makes the review boundary clear. The web deployment can be checked from outside; the hardware cannot. Saying so on the architecture page is not a disclaimer bolted onto a finished product — it describes which half of the system has actually been built."
    ],
    deepDiveTitle: "One product, two runtimes, and a simulator that says it is one.",
    deepDiveReason:
      "Software, a device service and a physical prototype: the widest gap between what is hosted and what is claimed."
  },
  {
    slug: "pirates",
    name: "Pirates",
    tags: ["Phaser 3.90", "React 19", "Static build"],
    group: "play",
    role: "A source-first reconstruction of Master of the Secret Sea",
    shape:
      "A static Phaser and React build reconstructed from the original game; no public deployment in this review.",
    summary:
      "Pirates is a parity project. Its source tree reproduces the original game's screens, rules, saves and quirks before adding anything new. The reviewed tree contains a Phaser and React client and a local save adapter, but no Cloudflare configuration and no public route.",
    status: "unknown",
    statusNote:
      "Paused lifecycle. No public route answered on 7 November 2026; this profile is reviewed from local source only.",
    reviewDate: "2026-11-07",
    reference: "main @ 7cf87fe2",
    facts: [
      {
        label: "Stack",
        value: "Phaser 3.90, React 19.2, TypeScript, Vite 8, Effect 4",
        evidence: "package.json"
      },
      {
        label: "Runtime",
        value: "Static Vite build. No Worker or hosting configuration in the reviewed tree.",
        evidence: "package.json; repository files"
      },
      {
        label: "Storage",
        value: "A single browser save adapter for the reconstructed game state.",
        evidence: "src/domain/source/session.ts; README.md"
      },
      {
        label: "Identity",
        value: "No accounts or sign-in.",
        evidence: "package.json"
      },
      {
        label: "Delivery",
        value: "No public route observed; the game is not claimed as deployed.",
        evidence: "Public request on 7 November 2026 timed out"
      },
      {
        label: "Integrations",
        value: "None verified. No LoftwahFM client dependency in the reviewed package manifest.",
        evidence: "package.json"
      }
    ],
    parts: [
      {
        label: "Domain",
        detail:
          "Plain TypeScript state and a source-ID registry keep the reconstruction traceable.",
        evidence: "src/domain"
      },
      {
        label: "Presentation",
        detail: "Phaser renders the original logical resolution; React supplies semantic controls.",
        evidence: "src; README.md"
      },
      {
        label: "Persistence",
        detail: "One `mss` adapter owns save and resume.",
        evidence: "src/domain/source/session.ts"
      }
    ],
    decisions: [
      {
        title: "The original is the authority",
        detail:
          "The project forbids speculative modernisation until parity is accepted. That is why the architecture is deliberately plain: every abstraction has to justify itself against the source behaviour."
      }
    ],
    unknowns: [
      "The eventual deployment target is not in the reviewed tree.",
      "LoftwahFM lists a saltwater-static game profile, but no client dependency proves that Pirates consumes it.",
      "Physical-device parity and the final hosting boundary are unverified."
    ],
    publicSources: []
  },
  {
    slug: "loftwahfm",
    name: "LoftwahFM",
    tags: ["Astro 7.1", "R2 media", "Analytics Engine"],
    group: "listen",
    role: "A music platform and the portfolio's shared radio capability",
    shape:
      "An Astro site and player on Cloudflare with D1, R2 media, KV sessions, Analytics Engine and four schedules.",
    summary:
      "LoftwahFM is both a product and a capability. Listeners get a catalogue, stations and a player. Games get a versioned radio client and station programmes. The same deployment owns media, catalogue rows, anonymous listening analytics and a protected admin surface.",
    status: "live",
    statusNote: "fm.loftwah.com answered HTTP 200 on 7 November 2026.",
    reviewDate: "2026-11-07",
    reference: "main @ 166b71e1",
    facts: [
      {
        label: "Stack",
        value: "Astro 7.1, React 18.3, TypeScript, Effect 3, Tailwind 4",
        evidence: "package.json; astro.config.mjs"
      },
      {
        label: "Runtime",
        value: "Cloudflare Worker `loftwahfm` with static assets and four cron schedules",
        evidence: "wrangler.toml"
      },
      {
        label: "Storage",
        value:
          "D1 `loftwahfm`, R2 bucket `loftwahfm` for media, KV `SESSION`, Analytics Engine dataset `plays`",
        evidence: "wrangler.toml"
      },
      {
        label: "Identity",
        value:
          "First-party email/password accounts with PBKDF2-SHA256 hashes and an `lfm_session` cookie; admin pages and /api/admin/* add Basic Auth with rate limiting. Listening does not require an account.",
        evidence: "src/utils/dbAuth.mjs; src/pages/api/auth/login.ts; src/middleware.ts"
      },
      {
        label: "Delivery",
        value:
          "Cloudflare Worker `loftwahfm` with separate preview bindings; the custom domain is not declared in wrangler.toml, so its attachment is dashboard-managed and not provable from the repository",
        evidence: "wrangler.toml; public request on 7 November 2026"
      },
      {
        label: "Integrations",
        value:
          "Stripe Checkout Sessions and a signed webhook for purchases; Resend email; ElevenLabs text-to-dialogue for radio production; publishes @loftwahfm/radio-client 1.2.0; receives listening-v1 events at /api/track; exposes /api/portfolio-analytics to Woodhouse",
        evidence:
          "src/pages/checkout/[product].ts; src/pages/api/stripe-webhook.ts; src/services/radio/producer/RadioSynthesis.ts; docs/game-music-hand-off.md; packages/radio-client/src/telemetry.ts"
      }
    ],
    parts: [
      {
        label: "Site and player",
        detail: "Astro serves the public catalogue and player shell; React runs playback.",
        evidence: "src/pages; src/player"
      },
      {
        label: "Station API",
        detail:
          "Versioned station programmes and game profiles are public JSON contracts, not hidden endpoints.",
        evidence: "docs/radio-game-integration.md"
      },
      {
        label: "Media",
        detail: "Audio and artwork are served from the media bucket through the site.",
        evidence: "src/pages/media/[...key].ts; wrangler.toml r2_buckets"
      },
      {
        label: "Radio client",
        detail:
          "A zero-dependency browser package pinned by exact version, with an integrity manifest beside it.",
        evidence: "public/radio/v1/client/1.2.0/integrity.json"
      },
      {
        label: "Analytics",
        detail:
          "Anonymous listening events use the listening-v1 contract. No persistent identity, polling or retry loop.",
        evidence: "packages/radio-client/src/telemetry.ts"
      },
      {
        label: "Commerce",
        detail:
          "Stripe Checkout Sessions are created server-side and a signed webhook owns the purchase record. This is a real provider boundary, not a demo.",
        evidence: "src/pages/checkout/[product].ts; src/pages/api/stripe-webhook.ts"
      }
    ],
    decisions: [
      {
        title: "Version the client, not the integration",
        detail:
          "Games pin an exact archive URL and verify its hash. A new client version cannot silently change a shipped game, and rollback is changing one dependency back."
      },
      {
        title: "The host keeps its audio graph",
        detail:
          "The client manages stations and queues. Volume, ducking, speech and dialogue stay with the game, because only the game knows what else is making noise."
      },
      {
        title: "Listening measurement is anonymous and optional",
        detail:
          "The listening contract carries no account, only a per-play id and an origin. A game can send events without making listening a condition of play, and the site's own account system stays out of the radio client."
      },
      {
        title: "Commerce has its own trust boundary",
        detail:
          "Checkout happens in Stripe, not in the Worker. The signed webhook is the record; a browser return URL is not treated as proof of payment."
      }
    ],
    unknowns: [
      "Analytics Engine retention and the exact aggregation window were not re-derived from provider settings in this review.",
      "Stripe live-mode configuration, tax and refund handling were not exercised; this profile verifies the integration shape, not a completed purchase.",
      "No listening session was measured on a physical phone for this profile.",
      "The admin surface's operational history and the dashboard-managed custom domain were not audited."
    ],
    publicSources: [
      { label: "Listen on LoftwahFM", href: "https://fm.loftwah.com/" },
      {
        label: "Radio client integrity manifest",
        href: "https://fm.loftwah.com/radio/v1/client/1.2.0/integrity.json"
      }
    ],
    deepDive: [
      "LoftwahFM has to be two things at once: a site a listener can use, and a dependency four games can pin without inheriting its release schedule. The architecture separates those by publishing a client and a set of JSON contracts rather than offering an SDK that floats.",
      "The client is served from an immutable version directory with an integrity manifest. A game installs one exact archive, verifies the bytes and commits the lockfile entry. That is more friction than a floating script tag, and it buys the property that matters: a game release cannot change because someone deployed the radio service.",
      "The telemetry contract follows the same rule. Games send a small listening-v1 payload with a per-play id, a source and a station; there is no persistent listener identity and no retry loop. The music service learns what was audible without turning a game session into an account."
    ],
    deepDiveTitle: "A versioned client and an anonymous listening contract.",
    deepDiveReason:
      "A media service with immutable versioned consumers, four schedules and an unusually narrow telemetry contract."
  },
  {
    slug: "social-club",
    name: "Plans With You",
    tags: ["Astro 7.2", "D1 + R2", "Magic links"],
    group: "everyday",
    role: "Calendar protection that plans a cancellation",
    shape:
      "An Astro and React app on Cloudflare with magic-link accounts, a relational store and artifact storage.",
    summary:
      "Plans With You is a real account product: magic-link sign-in, a membership service, a D1 database and R2 artifact storage. The site still serves, but the reviewed lifecycle is retired, so its architecture is history rather than a current product promise.",
    status: "live",
    statusNote:
      "club.loftwah.com answered HTTP 200 on 7 November 2026. Lifecycle is retired, reviewed 26 October 2026.",
    reviewDate: "2026-11-07",
    reference: "main @ 25bd763a",
    facts: [
      {
        label: "Stack",
        value: "Astro 7.2, React 19.2, TypeScript, Tailwind 4, Three UI",
        evidence: "package.json; astro.config.mjs"
      },
      {
        label: "Runtime",
        value: "Cloudflare Worker `social-club` through the Astro Cloudflare adapter",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Storage",
        value: "D1 `social-club`, R2 `social-club-artifacts`, KV `SESSION`",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Identity",
        value:
          "Magic-link email sign-in with a `society_session` cookie backed by D1 sessions, an onboarding/member state machine and dedicated sign-in and waitlist rate limiters.",
        evidence: "src/services/magic-link.ts; src/lib/portal-auth.ts; wrangler.jsonc rate limiters"
      },
      {
        label: "Delivery",
        value:
          "Cloudflare Worker `social-club` through the Astro adapter at club.loftwah.com; no cron configured",
        evidence: "wrangler.jsonc; mise.toml deploy-production"
      },
      {
        label: "Integrations",
        value:
          "Resend for outbound email and the signed inbound email webhook; a MiniMax text/image adapter; a Stripe billing seam that is disabled/fake by default.",
        evidence:
          "src/adapters/resend-real.ts; src/adapters/minimax-real.ts; src/services/billing-service.ts"
      }
    ],
    parts: [
      {
        label: "Web app",
        detail: "Astro pages and React islands carry the product story and signed-in views.",
        evidence: "src"
      },
      {
        label: "Auth",
        detail: "Magic links are minted and verified server-side; the session lives in KV.",
        evidence: "src/services/magic-link.ts; wrangler.jsonc kv"
      },
      {
        label: "Membership",
        detail: "Membership rules are a service, not a flag copied across pages.",
        evidence: "src/services/membership-service.ts"
      },
      {
        label: "Artifacts",
        detail: "R2 stores generated artifacts separately from relational rows.",
        evidence: "wrangler.jsonc r2_buckets"
      }
    ],
    decisions: [
      {
        title: "Magic links over passwords",
        detail:
          "A product used occasionally does not need another password. Email possession is the recovery path, and the rate limiter is the abuse boundary."
      },
      {
        title: "Account deletion is a service",
        detail:
          "Deleting an account touches identity, membership and stored artifacts; keeping that in one service is what makes the promise testable."
      },
      {
        title: "Billing is a seam, not a switch",
        detail:
          "A Stripe adapter exists but is disabled by default. That lets the membership flow be built and reviewed without pretending a payment path is live."
      }
    ],
    unknowns: [
      "The retired product's data retention and deletion completion were not audited in this review.",
      "Stripe billing was disabled in the reviewed source; no real charge, refund or tax path is claimed.",
      "Commented-out queue bindings in the configuration were not treated as active infrastructure.",
      "The inbound email webhook signature path was not exercised."
    ],
    publicSources: [
      { label: "Visit Plans With You", href: "https://club.loftwah.com/" },
      { label: "Public repository", href: "https://github.com/loftwah/club" }
    ]
  },
  {
    slug: "asset-hunter",
    name: "Asset Hunter",
    tags: ["Astro 7.3", "EmDash 1.0", "D1 + R2"],
    group: "build",
    role: "A rights-aware catalogue of reusable assets",
    shape: "An Astro and EmDash content site on Cloudflare with an editor curation cockpit.",
    summary:
      "Asset Hunter is editorial infrastructure: an EmDash-backed catalogue with a public facing and a curation cockpit. Editors correct rights status and licence evidence; the code keeps the workflow and audit trail around each correction. The lifecycle is retired, so the site is a preserved record.",
    status: "live",
    statusNote:
      "assets.loftwah.com answered HTTP 200 on 7 November 2026. Lifecycle is retired, reviewed 26 October 2026.",
    reviewDate: "2026-11-07",
    reference: "main @ e7edea3e",
    facts: [
      {
        label: "Stack",
        value: "Astro 7.3, React 19.2, EmDash 1.0.1, Effect 4",
        evidence: "package.json"
      },
      {
        label: "Runtime",
        value:
          "Cloudflare Worker `asset-hunter` with EmDash content; an EmDash scheduled handler is exported but no cron trigger is configured",
        evidence: "wrangler.jsonc; src/worker.ts"
      },
      {
        label: "Storage",
        value: "D1 `asset-hunter`, R2 `asset-hunter-media`",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Identity",
        value:
          "EmDash admin auth and RBAC; rights actions require role >= editor and answer 404 below that. The production setup wizard is refused unless built with EMDASH_ALLOW_SETUP=1, and the project's security review records that production had no administrator account.",
        evidence: "src/pages/api/takedown.ts; src/middleware.ts; docs/SECURITY.md; astro.config.mjs"
      },
      {
        label: "Delivery",
        value: "Cloudflare custom domain assets.loftwah.com; lifecycle retired",
        evidence: "wrangler.jsonc; Woodhouse catalogue"
      },
      {
        label: "Integrations",
        value:
          "GitHub REST API for the hunt engine; EmDash for content. No project-to-project consumer was found.",
        evidence: "engine/src/runtime/github.ts; engine/src/runtime/config.ts"
      }
    ],
    parts: [
      {
        label: "Public catalogue",
        detail: "Astro pages present reviewed assets and their stated rights.",
        evidence: "src/pages"
      },
      {
        label: "Curation cockpit",
        detail: "Editors open, correct and close rights cases from one queue.",
        evidence: "src/pages/curate/index.astro"
      },
      {
        label: "Content",
        detail: "EmDash owns the record and revisions; the workflow writes audit rows beside it.",
        evidence: "src/pages/api/takedown.ts"
      },
      {
        label: "Media",
        detail: "Approved media is stored in R2, not in the content database.",
        evidence: "wrangler.jsonc r2_buckets"
      },
      {
        label: "Hunt engine",
        detail:
          "A separate TypeScript pipeline queries the GitHub REST API to find candidate assets before an editor reviews them.",
        evidence: "engine/src/runtime/github.ts"
      }
    ],
    decisions: [
      {
        title: "Rights are a workflow, not a label",
        detail:
          "A single rights_status field would lose why a case changed. The cockpit records the correction and the reason, and keeps both with the content revision."
      },
      {
        title: "A missing permission answers 404",
        detail:
          "A 403 on a rights queue confirms the queue exists. Answering 404 to an unauthorised role avoids turning the catalogue into a directory of unfinished cases."
      }
    ],
    unknowns: [
      "Whether any other project consumes Asset Hunter's catalogue was not verified; no consumer call was found.",
      "The project's own security review records that production had no administrator account; this review did not provision or test one.",
      "The purpose of the local data.db file was not documented in the repository.",
      "The curation cockpit and scheduled handler were not exercised."
    ],
    publicSources: [{ label: "Visit Asset Hunter", href: "https://assets.loftwah.com/" }]
  },
  {
    slug: "app-composer",
    name: "App Composer",
    tags: ["Astro 7.4", "EmDash 1.4", "Service bindings"],
    group: "build",
    role: "Agent-operated app setup and independent app composition",
    shape:
      "An Astro and EmDash app on Cloudflare with service bindings for guestbook and showcase workloads.",
    summary:
      "App Composer is a builder product with several runtimes behind one host. The main Worker serves the site and EmDash content, and calls separate guestbook and showcase services through bindings. Operator surfaces sit behind Cloudflare Access. The guestbook publishes an approved-items contract that Woodhouse reads.",
    status: "live",
    statusNote: "composer.loftwah.com answered HTTP 200 on 7 November 2026.",
    reviewDate: "2026-11-07",
    reference: "main @ 6b0b5ae9",
    facts: [
      {
        label: "Stack",
        value: "Astro 7.4, React 19.3, EmDash 1.4, TanStack Router, Tailwind 4",
        evidence: "package.json"
      },
      {
        label: "Runtime",
        value:
          "Worker `app-composer` with service bindings GUESTBOOK, SHOWCASE and GUESTBOOK_MEMBERS, an every-minute cron and Cloudflare Access",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Storage",
        value:
          "D1 `app-composer-emdash`, R2 `app-composer-media`, KV `SESSION`; guestbook state belongs to its own service",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Identity",
        value:
          "Public read; /_emdash administration is guarded by a verified Cloudflare Access JWT with subject binding. No public user login lives in the main Worker. Guest contributions are moderated by the guestbook service.",
        evidence: "src/lib/access-boundary.mjs; src/worker.ts; README.md"
      },
      {
        label: "Delivery",
        value:
          "Cloudflare custom domain composer.loftwah.com; the deploy script requires a clean pushed main and verifies the live origin",
        evidence: "wrangler.jsonc routes; scripts/deploy.mjs"
      },
      {
        label: "Integrations",
        value:
          "Resend for invited-recipient email; service bindings to the composed Guestbook and Showcase Workers; publishes the guestbook contract at guestbook.loftwah.com; exposes /api/portfolio-analytics to Woodhouse",
        evidence:
          "wrangler.jsonc services; src/lib/resend-delivery.mjs; README.md; Woodhouse src/pages/api/guestbook-items.json.ts"
      }
    ],
    parts: [
      {
        label: "Main site",
        detail: "Astro pages and EmDash records describe the builder and its documented flows.",
        evidence: "src/pages"
      },
      {
        label: "Worker",
        detail: "Routes API requests, owns the cron and binds the companion services.",
        evidence: "wrangler.jsonc; src/worker.ts"
      },
      {
        label: "Guestbook service",
        detail:
          "A separately pinned Worker owns contribution, moderation and the published contract.",
        evidence: "wrangler.jsonc services; README.md"
      },
      {
        label: "Showcase service",
        detail: "A second binding serves showcase workloads without sharing the guestbook's state.",
        evidence: "wrangler.jsonc services"
      },
      {
        label: "Access boundary",
        detail:
          "Cloudflare Access protects operator surfaces instead of inventing a second login inside the app.",
        evidence: "wrangler.jsonc vars CF_ACCESS_TEAM_DOMAIN"
      }
    ],
    decisions: [
      {
        title: "Services behind bindings, not more public APIs",
        detail:
          "The guestbook and showcase workers are reached through service bindings, so the main app does not need a public network hop or a shared secret to call them."
      },
      {
        title: "Consumers read one approved contract",
        detail:
          "Woodhouse does not read guestbook rows. It reads the published, approved-items contract, which keeps moderation and privacy in the owning service."
      }
    ],
    unknowns: [
      "The Guestbook and Showcase services are separately pinned Workers with their own upstream repositories; this review read their published contract and bindings, not their private source.",
      "The every-minute cron's work was not observed directly in this review.",
      "No contribution or moderation journey was completed for this profile.",
      "The Access tenant and its subject binding were verified from configuration, not by signing in."
    ],
    publicSources: [
      { label: "Visit App Composer", href: "https://composer.loftwah.com/" },
      { label: "Public repository", href: "https://github.com/loftwah/app-composer" },
      { label: "Published guestbook contract", href: "https://guestbook.loftwah.com/api/items" }
    ]
  },
  {
    slug: "liferaft",
    name: "Liferaft",
    tags: ["Electron 41", "SQLite FTS5", "React 19"],
    group: "everyday",
    role: "Offline desktop recovery for large .mbox archives",
    shape: "An Electron desktop application with a React interface and per-archive SQLite indexes.",
    summary:
      "Liferaft is deliberately offline. It imports one or more .mbox archives, streams them through an Electron utility process, indexes messages in SQLite FTS5 and exports attachments or selected messages. There is no account, sync, compose, send or remote access path.",
    status: "live",
    statusNote:
      "A public repository and desktop release exist. Live for this profile means released software, not a hosted web route.",
    reviewDate: "2026-11-07",
    reference: "main @ cf33b74f",
    facts: [
      {
        label: "Stack",
        value:
          "Electron 41, React 19.2, TypeScript, electron-vite 4, Tailwind 4, SQLite FTS5, better-sqlite3, mailparser",
        evidence: "package.json; README.md"
      },
      {
        label: "Runtime",
        value: "Electron main process plus a utility process for import; no server",
        evidence: "src/main/index.ts; README.md"
      },
      {
        label: "Storage",
        value:
          "One SQLite database per archive under the app's userData directory, with message byte ranges and attachment offsets",
        evidence: "src/main/index.ts; README.md"
      },
      {
        label: "Identity",
        value: "None. No login, sync or remote access path.",
        evidence: "README.md"
      },
      {
        label: "Delivery",
        value:
          "Tagged releases build macOS, Windows and Linux artifacts through electron-builder in a GitHub Actions release workflow",
        evidence: ".github/workflows/release.yml; package.json scripts"
      },
      {
        label: "Integrations",
        value: "None. The product has no network dependency.",
        evidence: "README.md"
      }
    ],
    parts: [
      {
        label: "Main process",
        detail: "Owns the window, filesystem access and the per-archive database lifecycle.",
        evidence: "src/main/index.ts"
      },
      {
        label: "Import utility",
        detail:
          "Streams the source file outside the UI process so a large archive does not freeze the window.",
        evidence: "README.md"
      },
      {
        label: "Index",
        detail: "SQLite FTS5 stores searchable message metadata and body text.",
        evidence: "README.md"
      },
      {
        label: "Renderer",
        detail:
          "React and react-virtuoso present a three-pane recovery view over large result sets.",
        evidence: "package.json; src"
      }
    ],
    decisions: [
      {
        title: "Read-only is a security boundary",
        detail:
          "No compose, send or remote path means a recovered archive cannot be modified or exfiltrated by the app itself. Export is a deliberate user action."
      },
      {
        title: "One database per archive",
        detail:
          "Separate databases keep an import failure local and let a user delete one archive without rebuilding the rest."
      }
    ],
    unknowns: [
      "The macOS signing identity is `-` (unsigned) in the reviewed build configuration; notarisation and install trust were not verified.",
      "Import performance on archives larger than the tested sizes was not measured.",
      "No recovery drill on a real mailbox was performed."
    ],
    publicSources: [{ label: "Liferaft repository", href: "https://github.com/loftwah/liferaft" }]
  },
  {
    slug: "foilbury",
    name: "Foilbury",
    tags: ["Astro 7.4", "EmDash 1.4", "Discord bot"],
    group: "collect",
    role: "A showcase for collectible cards and cabinets",
    shape:
      "An Astro and EmDash site on Cloudflare with a card catalogue, media storage and scheduled work.",
    summary:
      "Foilbury presents collectible cards and collection cabinets. A Cloudflare Worker serves an Astro and EmDash site, owns passkey and magic-link account security, and handles Discord interactions. A five-minute scheduled job runs maintenance. The production bindings are declared in a separate production configuration.",
    status: "live",
    statusNote:
      "foilbury.loftwah.com answered HTTP 200 on 7 November 2026. Production bindings are declared in wrangler.production.jsonc.",
    reviewDate: "2026-11-07",
    reference: "main @ 7b16702d",
    facts: [
      {
        label: "Stack",
        value: "Astro 7.4, React 19.3, EmDash 1.4, Cloudflare Kumo, Tailwind 4",
        evidence: "package.json"
      },
      {
        label: "Runtime",
        value:
          "Cloudflare Worker `foilbury` with Astro SSR, EmDash and a five-minute cron; a local tenant config exists for development",
        evidence: "wrangler.production.jsonc; wrangler.jsonc"
      },
      {
        label: "Storage",
        value:
          "D1 `foilbury`, R2 `foilbury-media`, KV `SESSION` in the production config; local development uses the `foilbury-local` tenant",
        evidence: "wrangler.production.jsonc; wrangler.jsonc"
      },
      {
        label: "Identity",
        value:
          "First-party `fb_session` cookies with passkeys/WebAuthn, email magic links, password login and Discord OAuth; Cloudflare Access guards admin surfaces; TOTP protects bot administration.",
        evidence:
          "src/server/modules/passkeys.ts; src/server/modules/magic-links.ts; src/server/access.ts; src/server/modules/totp.ts"
      },
      {
        label: "Delivery",
        value:
          "Production deploy script (`pnpm deploy:production`) with pull-request checks; no deploy workflow",
        evidence: "package.json; .github/workflows/check.yml"
      },
      {
        label: "Integrations",
        value:
          "Discord application interactions and webhooks; Resend email; Cloudflare Access; EmDash content",
        evidence: "src/worker.ts; src/server/discord/delivery.ts; src/server/email.ts"
      }
    ],
    parts: [
      {
        label: "Public showcase",
        detail: "Astro pages present cards, cabinets and collection views.",
        evidence: "src/pages"
      },
      {
        label: "Worker",
        detail: "Serves the site, API routes and scheduled work.",
        evidence: "src/worker.ts; wrangler.jsonc"
      },
      {
        label: "Identity",
        detail:
          "Account security covers passkeys, an authenticator and recovery codes beside Discord and email entry.",
        evidence: "src/pages/account/security.astro; src/server/modules/totp.ts"
      },
      {
        label: "Media",
        detail:
          "Card imagery is served through a media route rather than embedded in content rows.",
        evidence: "src/pages/media/asset/[id].ts"
      },
      {
        label: "Discord bot",
        detail:
          "The same Worker answers Discord interactions and delivers bot messages; the web product and bot share the catalogue.",
        evidence: "src/worker.ts; src/server/discord/delivery.ts"
      }
    ],
    decisions: [
      {
        title: "Collection actions get stronger proof than browsing",
        detail:
          "Reading a public showcase needs no account. Actions that touch a Bot, its catalogue or its economy require a passkey or authenticator step."
      },
      {
        title: "Local and production tenants are named separately",
        detail:
          "The checked-in development config describes `foilbury-local`; the production config names the real D1, R2 and KV bindings. Keeping them apart prevents a local deploy from pointing at production data."
      }
    ],
    unknowns: [
      "The five-minute cron's job was not observed or verified.",
      "The account journey was not completed in this review; passkey, magic-link and Discord paths were read from source.",
      "Discord application secrets, Resend and Access configuration are external and were not exercised.",
      "No deploy workflow exists; production deployment remains a manual script."
    ],
    publicSources: [
      { label: "Visit Foilbury", href: "https://foilbury.loftwah.com/" },
      {
        label: "Public repository",
        href: "https://github.com/loftwah/card-collector-bot"
      }
    ]
  },
  {
    slug: "woodhouse",
    name: "Woodhouse",
    tags: ["Astro 7.3", "EmDash 1.3", "D1 + KV + R2"],
    group: "publish",
    role: "The reviewed public record of the portfolio",
    shape:
      "An Astro and EmDash application on a Cloudflare Worker with D1, KV cache, R2 media and a read-only publication boundary.",
    summary:
      "Woodhouse is the publisher, not one of the twelve product dossiers. A Worker renders Astro pages from published EmDash records, with D1 for editorial rows, KV for cached reads, R2 for approved media and a publication script that keeps the editorial office closed in production. It also reads a small number of public project contracts and receives anonymous engagement events.",
    status: "live",
    statusNote: "woodhouse.loftwah.com answered HTTP 200 on 7 November 2026.",
    reviewDate: "2026-11-07",
    reference: "main @ 3fdebb4f",
    facts: [
      {
        label: "Stack",
        value: "Astro 7.3, EmDash 1.3, React 19.3, TypeScript, Effect 3",
        evidence: "package.json"
      },
      {
        label: "Runtime",
        value:
          "Cloudflare Worker `woodhouse-loftwah` with a smart placement hint and a per-minute cron",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Storage",
        value: "D1 `woodhouse-emdash`, KV `CACHE` and `SESSION`, R2 `woodhouse-emdash-media`",
        evidence: "wrangler.jsonc"
      },
      {
        label: "Identity",
        value:
          "Editorial identity belongs to EmDash sessions; production publication runs read-only, so admin, preview and mutation routes answer 404.",
        evidence: "scripts/deploy-publication.mjs; wrangler.jsonc vars"
      },
      {
        label: "Delivery",
        value:
          "Deployed by `pnpm deploy:publication`, which audits the pages accepted in preview before production; the Worker reports its source digest.",
        evidence: "scripts/deploy-publication.mjs; scripts/verify-build-identity.mjs"
      },
      {
        label: "Integrations",
        value:
          "Receives anonymous engagement from SHOALSHOT and Protocol 11; reads public analytics aggregates from Fighter, Bubbles, LoftwahFM and App Composer; reads App Composer's guestbook contract; reads LoftwahFM station manifests for the patch-bench exhibit.",
        evidence:
          "src/worker.ts; src/data/portfolio-analytics.ts; src/pages/api/guestbook-items.json.ts; src/scripts/exhibits/patch-bench.ts"
      }
    ],
    parts: [
      {
        label: "Worker",
        detail: "Routes public pages, the engagement ingress and read-only API projections.",
        evidence: "src/worker.ts"
      },
      {
        label: "EmDash content",
        detail:
          "Published projects, statuses, snapshots, dispatches and evidence are records, not template files.",
        evidence: "src/content/repository.ts"
      },
      {
        label: "Publication gate",
        detail:
          "A preview build is audited, then production is allowed to deploy the same source. Editorial routes stay closed.",
        evidence: "scripts/deploy-publication.mjs"
      },
      {
        label: "Media",
        detail:
          "Approved editorial media lives in R2; product artwork stays at its producer's URL.",
        evidence: "wrangler.jsonc; src/data/live-project-artwork.ts"
      }
    ],
    decisions: [
      {
        title: "The public record is a projection",
        detail:
          "Woodhouse does not scrape private repositories at request time. Reviewed records are published, and a review date says what was checked."
      },
      {
        title: "Read-only production is a boundary, not a setting",
        detail:
          "The publication path deploys the reading surfaces and proves that CMS, preview and mutation routes stay closed."
      }
    ],
    unknowns: [
      "Managed editorial workflows and scheduled publishing were not re-exercised in this review.",
      "Analytics aggregation windows were not re-derived from provider settings.",
      "No physical-device or assistive-technology acceptance is claimed."
    ],
    publicSources: [
      { label: "Woodhouse", href: "https://woodhouse.loftwah.com/" },
      {
        label: "Woodhouse repository",
        href: "https://github.com/loftwah/woodhouse-new"
      }
    ]
  }
];

export const atlasRelationships: AtlasRelationship[] = [
  {
    id: "bubbles-radio",
    from: "bubbles",
    to: "loftwahfm",
    verb: "uses the radio client from",
    short: "radio client 1.2.0",
    detail:
      "Bubbles pins @loftwahfm/radio-client 1.2.0 for station and queue state, and its host audio manager keeps effects, volume and mute. The same client sends anonymous listening-v1 events back to LoftwahFM, which makes this pair two-way without a shared account.",
    evidence:
      "Bubbles package.json dependency URL; src/app/music-transport.ts; LoftwahFM packages/radio-client/src/telemetry.ts",
    pair: true
  },
  {
    id: "fighter-radio",
    from: "fighter",
    to: "loftwahfm",
    verb: "uses the radio client from",
    short: "radio client 1.2.0",
    detail:
      "Fighter pins the same client and the pressure-system station profile. The client sends the game's anonymous listening events back to LoftwahFM; Fighter keeps its own audio graph.",
    evidence: "Fighter package.json; LoftwahFM docs/radio-game-integration.md game profile table",
    pair: true
  },
  {
    id: "shoalshot-radio",
    from: "shoalshot",
    to: "loftwahfm",
    verb: "uses the radio client from",
    short: "radio client 1.2.0",
    detail:
      "SHOALSHOT pins the same client with the low-tide station. Its adapter supplies the game id and origin, and listening-v1 events go back to LoftwahFM so the telemetry distinguishes a real deployment from a test.",
    evidence:
      "SHOALSHOT package.json; src/platform/radio.ts; LoftwahFM docs/radio-game-integration.md",
    pair: true
  },
  {
    id: "protocol-11-radio",
    from: "protocol-11",
    to: "loftwahfm",
    verb: "uses the radio client from",
    short: "radio client 1.2.0",
    detail:
      "Protocol 11's jukebox pins the same client with the cartridge-club station. The client owns station selection and queue state and sends anonymous listening events back to LoftwahFM; the table keeps volume and effects.",
    evidence:
      "Protocol 11 package.json; src/client/jukebox.ts; LoftwahFM docs/radio-game-integration.md",
    pair: true
  },
  {
    id: "protocol-11-engagement",
    from: "protocol-11",
    to: "woodhouse",
    verb: "reports anonymous play to",
    short: "engagement ingress",
    detail:
      "The client posts woodhouse.engagement/1 events to Woodhouse without credentials. A failed report cannot block a turn; the game stays playable if the hub is unavailable.",
    evidence:
      "Protocol 11 src/client/gameplay-analytics.ts; Woodhouse src/worker.ts /api/engagement; src/data/engagement.ts",
    plate: false
  },
  {
    id: "shoalshot-engagement",
    from: "shoalshot",
    to: "woodhouse",
    verb: "reports anonymous play to",
    short: "engagement ingress",
    detail:
      "SHOALSHOT posts the same woodhouse.engagement/1 contract for its dive mode only after consent. The report is fire-and-forget and carries no account.",
    evidence: "SHOALSHOT src/platform/gameplay-analytics.ts; Woodhouse src/data/engagement.ts",
    plate: false
  },
  {
    id: "woodhouse-guestbook",
    from: "woodhouse",
    to: "app-composer",
    verb: "reads the published contract from",
    short: "guestbook contract",
    detail:
      "Woodhouse reads App Composer's approved guestbook items through its own read-only pass-through and falls back to a checked-in snapshot. The Guestbook is a separately deployed app composed by App Composer; it keeps moderation and media, and Woodhouse never reads its rows.",
    evidence:
      "Woodhouse src/pages/api/guestbook-items.json.ts; App Composer README.md and wrangler.jsonc service binding",
    plate: false
  },
  {
    id: "woodhouse-analytics-fighter",
    from: "woodhouse",
    to: "fighter",
    verb: "reads the public aggregate from",
    short: "portfolio analytics",
    detail:
      "Woodhouse reads Fighter's /api/portfolio-analytics aggregate instead of collecting the game's events itself. The schema is woodhouse.portfolio-analytics/1.",
    evidence: "Woodhouse src/data/portfolio-analytics.ts; Fighter worker/portfolio-analytics.ts",
    plate: false
  },
  {
    id: "woodhouse-analytics-bubbles",
    from: "woodhouse",
    to: "bubbles",
    verb: "reads the public aggregate from",
    short: "portfolio analytics",
    detail:
      "Woodhouse reads the aggregate Bubbles serves from its cloud Worker at api.bubbles.loftwah.com; the game's cloud profile and score data stay in its own D1 database.",
    evidence:
      "Woodhouse src/data/portfolio-analytics.ts; Bubbles src/cloud/routes/portfolio-analytics.ts; wrangler.cloud.jsonc",
    plate: false
  },
  {
    id: "woodhouse-analytics-fm",
    from: "woodhouse",
    to: "loftwahfm",
    verb: "reads the public aggregate from",
    short: "portfolio analytics",
    detail:
      "Woodhouse reads LoftwahFM's portfolio-analytics aggregate for listening context, and reads station manifests for the patch-bench exhibit. It does not read the underlying listening events.",
    evidence:
      "Woodhouse src/data/portfolio-analytics.ts; src/scripts/exhibits/patch-bench.ts; LoftwahFM API",
    plate: false
  },
  {
    id: "woodhouse-analytics-composer",
    from: "woodhouse",
    to: "app-composer",
    verb: "reads the public aggregate from",
    short: "portfolio analytics",
    detail:
      "Woodhouse reads App Composer's public aggregate alongside the guestbook contract. Both are read-only consumer edges.",
    evidence: "Woodhouse src/data/portfolio-analytics.ts",
    plate: false
  }
];

export function atlasProfile(slug: string | undefined): AtlasProfile | undefined {
  if (!slug) return undefined;
  return atlasProfiles.find((profile) => profile.slug === slug);
}

export function atlasGroup(key: AtlasGroupKey) {
  return atlasGroups.find((group) => group.key === key);
}
