# WOODHOUSE × EmDash

Last reviewed 3 October 2026. Decisions and observations below carry their own dates. A passing build is not production proof.

## Purpose and boundary

EmDash is Woodhouse’s editorial office and structured public-content store. Astro remains the authored site. The public interface continues to use Woodhouse layouts, typography, diagrams and page-specific templates; EmDash is not a page builder and does not own presentation.

Private repositories, issue and pull-request bodies, operator conversations, credentials and live product telemetry stay outside public content. Every public project state has an explicit review date, source description and proof boundary. Publishing an EmDash record does not make private source data safe to publish.

## Runtime and resources

The application uses Astro server output with the Cloudflare adapter, React for the EmDash office, the EmDash D1/R2 adapters, EmDash KV object caching, Cloudflare’s response cache and the Cloudflare Worker sandbox runner. `src/worker.ts` re-exports EmDash’s plugin bridge and scheduled handler. The preview Worker is configured to run scheduled publishing and plugin jobs once per minute. D1 and media backups are separately managed; a configured cron is not evidence that backup recovery works.

| Environment | Worker                      | D1                         | R2                               | KV                                                                     | Route                   |
| ----------- | --------------------------- | -------------------------- | -------------------------------- | ---------------------------------------------------------------------- | ----------------------- |
| Production  | `woodhouse-loftwah`         | `woodhouse-emdash`         | `woodhouse-emdash-media`         | `woodhouse-loftwah-cache`, `woodhouse-loftwah-session`                 | `woodhouse.loftwah.com` |
| Preview     | `woodhouse-loftwah-preview` | `woodhouse-emdash-preview` | `woodhouse-emdash-media-preview` | `woodhouse-loftwah-cache-preview`, `woodhouse-loftwah-session-preview` | workers.dev only        |

Preview and production D1, media, cache and session bindings are isolated. The root Wrangler target now defaults to the preview Worker, so an unqualified `wrangler deploy` cannot select the production domain. `build:preview` and `build` explicitly set `CLOUDFLARE_ENV=preview` and `CLOUDFLARE_ENV=production` because Astro’s Cloudflare integration selects environment bindings at build time. Deploy uses the adapter-generated `dist/server/wrangler.json`; production commands must explicitly select the `production` environment. The release script is the supported path because direct `wrangler deploy --env production` can bypass its repository-level acceptance checks.

Public pages query published EmDash entries and the live CMS navigation/search index, so they render at request time. Static assets stay on the edge. The EmDash cache hints are forwarded into Astro’s cache; public HTML has a short 60-second edge lifetime with 60 seconds of stale revalidation. The Worker wrapper adds `private, no-store` and `noindex` headers to `/_emdash/*` responses, including the admin redirect, auth API and MCP endpoint. Preview output is not indexed as production content.

### How long an out-of-band content write stays invisible

The 60-second declaration above describes the **edge**. It does not describe how quickly a write made outside the Worker reaches a reader, because a request that refreshes the edge still re-reads a cached read model.

Woodhouse installs its reviewed model by replaying SQL, and upstream EmDash has no programmatic purge path for content written that way ([issue 2435](https://github.com/emdash-cms/emdash/issues/2435)). Three layers therefore compose the real bound: the KV object cache (`defaultTtl: 300`), the edge lifetime (60s) and its stale window (60s). A public page reads seven collections, and each query carries its own cache key, so the last key to expire gates visibility.

**Measured on preview, 5 October 2026: 864 seconds** (14m 24s) from a direct D1 write to the token appearing on the plain public URL, polled every 5 seconds. The record was reverted afterwards.

Two things follow, and both matter more than the number:

- **The edge cache is not poisoned.** Entries created before the `Cache-Control` fix did expire on their own. An earlier belief that they would not self-heal, and that a dashboard purge was needed, was wrong — the write did become visible, just slowly.
- **The declared edge lifetime overstates end-to-end freshness.** A page can be revalidated from the edge every 60 seconds and still serve up to a stale read model for roughly a quarter of an hour. The header is not lying about the edge; it is simply not the whole bound.

This only affects writes made outside the Worker. EmDash invalidates the Astro cache by tag when a record is published through it, so an editor publishing in the Admin is not waiting on this window; an operator who installs the content model with `pnpm run emdash:seed:remote` is. `pnpm run measure:visibility` measures the number rather than assuming it, and its probe reverts the record it writes.

A deploy must not be judged on a single read either. Publishing a Worker version propagates over a short window, so the first request after a deploy can be answered by the version being replaced. `awaitBuildIdentity` in `scripts/verify-build-identity.mjs` retries within a bounded window and reports every attempt; before that, a successful preview deploy was reported as a failure.

Both live D1 databases report Cloudflare region `OC` and read replication `disabled` in `wrangler d1 info` (30 September 2026). EmDash D1 sessions are also explicitly disabled. Wrangler uses Smart Placement in the preview and production manifests because D1 reports only this coarse Cloudflare region, while Worker placement hints require a cloud-provider region; no AWS, GCP or Azure region is inferred. [D1 location](https://developers.cloudflare.com/d1/configuration/data-location/) · [Worker placement](https://developers.cloudflare.com/workers/configuration/placement/). The latest preview deployment includes Smart Placement; a cache-miss response reported `cf-placement: local-MEL`, so that request ran near the visitor. Cloudflare may take up to 15 minutes and consistent multi-region traffic to analyse placement; no latency improvement is claimed. Production remains on its previous Worker version and has not received this configuration. Static assets remain edge-served.

## Content model

The validated seed is `seed/seed.json`. Its source-backed starter records are two dated factory snapshots, nine project identities, nine linked project states, nine evidence records, six edited dispatches and one public incident. The conversations collection is empty by design. Those values come from the reviewed public-safe source snapshot, not a live query.

### Which date a dispatch is filed under

EmDash sets `published_at` when a record is published. Because the reviewed model is installed by replaying SQL rather than through EmDash, every seeded dispatch received the **same** `published_at` — the instant the replay ran. Measured on preview, all seven fell inside a 30-millisecond window on 4 October 2026, including dispatches whose evidence was reviewed on 28 September.

Left alone that produced three false claims a reader could see: `/dispatches/` ordered the journal by delivery instead of chronology, every dispatch printed "Published 4 October 2026", and the sitemap and RSS feed reported the install day as `lastmod` and `pubDate` for the entire journal.

The review date decides all three. It is the operator's own decision, it is what the product promises, and it is the only one of the two that is a fact about the writing rather than about the deployment. `published_at` is still read where a record has no usable review date — an editor publishing through EmDash sets a real one. `src/data/dispatch-dates.ts` holds the rule; its test records the install-window measurement that motivated it.

| Collection          | Role                                                                            | Required editorial controls                                                                  |
| ------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `projects`          | Stable identity, authored dossier, approved site metadata and presentation copy | `public_safe`; external URLs must be HTTPS; state is read from a dated status record         |
| `factory_snapshots` | Append-only reviewed portfolio snapshot and its source/scope                    | Explicit review date, source description and `public_safe`                                   |
| `project_statuses`  | A dated state attached to a project and snapshot                                | State, current evidence, next proof, proof boundary, review date and `public_safe`           |
| `evidence_records`  | Claims and links that describe what a source supports                           | Project/snapshot link, evidence kind, scope, review date, proof boundary and `public_safe`   |
| `dispatches`        | Edited essays, field notes, incidents and case studies                          | Title, deck, source reference, review date, editorial blocks and `public_safe`               |
| `incidents`         | Structured account of belief, event, evidence, cause and factory change         | Project/snapshot/dispatch links, reviewed date and explicit proof boundary                   |
| `conversations`     | A possible future home for deliberately edited public conversation records      | Empty by default; requires `public_safe` and `source_reviewed`; never imported automatically |

The `topic` taxonomy categorises dispatches. Reference fields attach statuses and evidence to projects/snapshots and incidents to their related records. `dean-lofts` is the public byline. Site settings use the EmDash `twitter`, `github` and `linkedin` handle fields, canonical public profiles and the `—` title separator; the locale seed is `en-AU`. The byline links to `/dean/` through its public HTTPS profile URL. There is no public email setting. A reusable `proof-boundary` section repeats the distinction between a test, merge, deployment, production observation and physical use.

Project status and factory snapshot records have real `/statuses/{slug}/` and `/snapshots/{slug}/` Woodhouse routes. Snapshot pages retain the dated project-state chain, and status records remain individually inspectable. Those routes are reachable from the pages that state the record: the factory readout links its snapshot archive, and each dossier links its own status record and snapshot. Both record types are in the search index with their project, state and review date. Public URLs use the CMS entry id, which is the canonical address; the underlying D1 row id is not a public path. The `conversations` collection also has a rendered detail route; public listing, search and sitemap require both `public_safe` and `source_reviewed`. Signed EmDash previews for all routable records render through these authored templates with `private, no-store` and `noindex` headers.

The eight dispatch blocks are `prose`, `pull_quote`, `callout`, `technical_plate`, `diagram_plate`, `image_plate`, `evidence_link` and `project_reference`. Renderers live in `src/components/blocks/`; unknown block types fail visibly instead of disappearing. Diagram plates select only checked-in diagrams, and external links accept HTTPS URLs. Media blocks use EmDash-managed images. Project-reference blocks validate their slug locally and do not query EmDash once per block. This keeps editorial choices constrained to the Woodhouse visual vocabulary.

Three menus are seeded: primary navigation, footer navigation and House Index. Menu URLs are filtered before rendering. There is one reusable proof-boundary section and no widget area; widgets would add a second presentation system without a current product need.

## Editorial workflow and content migration

The local seed carries the founding essay, existing field notes, the public incident, project identities, dated states and evidence into EmDash. Public page templates continue to be authored Astro. `src/data/projects.ts` and `src/data/field-notes.ts` were removed after confirming no imports remained. The old static project-image metadata fetch was also removed: an editor now maintains approved title, description, image URL and favicon fields, so public requests cannot SSRF arbitrary source sites and do not depend on live external HTML.

In EmDash Office, an editor can create a dispatch draft, set title/deck/source/review date, add Woodhouse blocks, select approved media, attach project/topic context, preview it through the public template, revise it, inspect the revision history and schedule or publish it. The publish/schedule policy plugin blocks incomplete or non-public-safe records in the seven Woodhouse collections. The policy passes unrelated collections through unchanged. Each `public_safe` boolean has an explicit `false` default so an untouched required checkbox can be saved safely as a draft; preview D1 metadata was updated and read back after the first editor attempt exposed this failure.

EmDash’s visual editing toolbar uses client mode so a public cached response remains the same for readers and editors until the editor explicitly enters edit mode. Project and dispatch templates include entry- and field-level edit annotations. Edit-cookie requests, signed previews and admin/API/MCP responses bypass shared caching and receive `noindex`. `EmDashHead` owns the rendered description, canonical, Open Graph, Twitter and SEO-panel output while Astro owns the visible `<title>` and Woodhouse composition. RSS and the curated root sitemap include only published, public-safe records; conversation rows also require source review. EmDash’s generic per-collection sitemap endpoints are blocked because they do not apply Woodhouse’s additional publication filters. Search includes the static destination pages plus the same curated published records.

`pnpm run emdash:types` regenerates `emdash-env.d.ts` and typed block interfaces from the validated seed schema using EmDash’s own generator. `pnpm run emdash:doctor` creates and removes a unique temporary SQLite database, applies the current migrations and seed, then verifies database and scheduler wiring. `pnpm run verify` runs seed validation, type generation, format, lint, dead code, the diagram-size manifest, the reviewed dependency audit, Doctor, tests, typecheck and the production build/privacy scan. `pnpm run audit:pages` runs against a deployed origin rather than in this chain, because it needs a live Worker. `pnpm run emdash:migrate:status` and `pnpm run emdash:migrate:check` are read-only against preview. `pnpm run emdash:site:export` writes a private `.emdash` transfer package under ignored `.release/` and requires an authenticated local EmDash instance.

## Token authority and agent-session boundary — 3 October 2026

Read from the installed EmDash 1.0.1 bundle and confirmed by live requests against the isolated preview. Nothing here changes production.

A personal access token is enforced in two independent layers, and only the first is controlled by the token's scopes:

- **Edge gate.** `enforceTokenScope` matches request path and method against an ordered rule table and defaults to `admin` when nothing matches, so unlisted paths fail closed. Session-authenticated requests are exempt entirely. `/_emdash/api/mcp` is exempt from this gate too and relies on per-tool `mcp:tools` checks instead.
- **Route gate.** Handlers call `requirePerm` / `requireOwnerPerm` / `hasPermission` against `locals.user`, which for a token request is the **token's owning account**. These resolve from the account's role, not from the token's scopes.

The consequence is that **token scope selects which endpoints a token may touch; the owning account's role selects which actions it may perform.** Publishing is decided by `hasPermission(user, "content:publish_any")`, and draft visibility by `hasPermission(user, "content:read_drafts")`, which switches list queries to `status: "published"`. A token owned by an owner account can therefore publish and read drafts no matter how narrow its scopes are, and a token owned by a non-author cannot author at all. `agentMcpRoleBoundary` is only meaningful if the token belongs to an account whose role is deliberately below owner.

`VALID_SCOPES` accepts exactly twelve values — `content:read`, `content:write`, `media:read`, `media:write`, `schema:read`, `schema:write`, `taxonomies:manage`, `menus:manage`, `settings:read`, `settings:manage`, `mcp:tools`, `admin` — plus a plugin-scoped `mcp:tools:<plugin>` pattern. `content:create`, `content:edit_own`/`_any`, `content:publish_own`/`_any`, `content:read_drafts`, `content:delete_*`, `media:upload` and `search:read` are rejected at token creation. These remain real permission strings in route handlers, so the vocabulary a token can be granted is strictly narrower than the set the application checks. A rejected scope returns `VALIDATION_ERROR` naming only the failing array index, not the scope.

`content:write` implicitly grants `menus:manage` and `taxonomies:manage`, deliberately, to keep tokens issued before those scopes were split working. Grants do not chain. Nothing else is implicit.

Two access-control details were checked and found sound rather than assumed. The `media/file` prefix carries a `*` → `media:read` rule that would allow writes on a read scope, but `api/media/file/[...key]` exports only `GET`, so the exposure does not exist. The `taxonomies/bulk-tag` rule is ordered after the `taxonomies` `GET` rule but before the `taxonomies` `WRITE` rule; first-match-wins still resolves bulk-tag writes to `content:write` as intended.

## Agent publication authority — 3 October 2026

A live test on preview established that an MCP token **can publish**, and that `woodhouse-editorial-policy` as originally written did not stop it. The chain was observed end to end with a token holding only `content:read`, `content:write`, `media:read`, `media:write`, `schema:read` and `mcp:tools` — no `admin`, no publish-related scope:

1. `content_publish` requires `content:write`, plus `requireRole(Role.AUTHOR)` and `requireOwnership(..., "content:publish_own", "content:publish_any")`. There is no scope that distinguishes drafting from publishing, so a drafting token reaches publication.
2. The owning account is an owner, so `content:publish_any` is satisfied and the ownership check passes.
3. `woodhouse-editorial-policy` then evaluated the record's **field values**: `public_safe === true`, a non-empty `deck`, and at least one editorial block. The agent set all three on its own draft, each rule was satisfied in turn, and the publish succeeded.
4. The record went public: HTTP 200 at its dispatch route, and present in both `rss.xml` and `sitemap.xml`.

The lesson is that the plugin was a **content-quality gate, not an authorisation gate**. It asks whether required fields are filled in, never who filled them in, and `public_safe` is a field the agent controls. An agent that satisfies every declared rule publishes. The probe record was soft-deleted and permanently deleted in the same session and is absent from the dispatch route, the dispatch listing, `rss.xml` and `sitemap.xml`.

The fix uses the actor information EmDash already supplies. `ContentPolicyEvent` carries `origin: ContentActionOrigin` and `actor?: ActorInfo`, and `ActorInfo.source` is `"api" | "mcp" | "visual-editor"`. `publicationBlock` now refuses any controlled-collection publish or schedule whose `origin.source` is `mcp`, before the field checks run, so the refusal cannot be satisfied by setting more fields. Publishing from the Admin (`api`) and the visual editor is unaffected. Four tests in `woodhouse-editorial-policy.test.ts` cover the agent publish refusal, the agent schedule refusal, the unaffected human paths, and the fact that the refusal precedes and outranks the field checks.

A second consequence of the implicit grants was observed and needs stating plainly: **`content:write` implicitly grants `menus:manage` and `taxonomies:manage`**, so a drafting token can create and delete menus and taxonomies. A probe menu and taxonomy were created this way and deleted again; preview returned to its prior menu and taxonomy set. An agent token that should not alter site navigation must not be issued `content:write`.

Both the fix and the human path were then verified live against preview Workers `41dcfe87-a832-4566-8bda-db7dc392b5a2` and, after the rule was tightened to an allowlist, `cd66bc9c-3673-43af-914f-27251de8c9de`. An MCP publish was refused with `PUBLISH_REJECTED` and an MCP schedule with `SCHEDULE_REJECTED`, on a record that already carried `public_safe: true` and a populated prose block — the exact record that had published before the fix. It stayed `draft`, its route returned 404, and it was absent from `rss.xml` and `sitemap.xml`. Publishing the equivalent record through the Admin's own REST API returned HTTP 200 with `status: published` and appeared publicly and in `rss.xml`.

The rule is an **allowlist** of human surfaces — `api` and `visual-editor` — rather than a refusal of `mcp`, so a missing or unrecognised `origin.source` fails closed. A caller that forgets to declare an origin, and any source EmDash adds later, are both refused until someone confirms the source is human. That direction is deliberate: a blocked publish is visible and recoverable, a leaked one is not. The refusal is scoped to the seven controlled collections; collections outside the editorial contract are untouched. Six tests cover the agent publish refusal, the agent schedule refusal, the unaffected human paths, the precedence of the refusal over the field checks, the fail-closed behaviour for a missing or unknown origin, and that unrelated collections stay unpoliced.

Every probe record and token was removed afterwards; `pnpm run verify:content -- preview` reports `ready: true`, seven collections, nine references, zero field mismatches and every starter count matching, and the API token table is empty.

## Administrative session boundary — 3 October 2026

The operator's authenticated Admin session lives in the same browser profile the agent drives through the Playwright extension. The agent therefore holds a working owner session on preview while working, and **any acceptance evidence captured through the Admin UI is not independent of the operator.** Agent-driven checks must be recorded as operator-session checks, not as independent verification, and the `desktopAndMobile` and `ownerPasskeyLogin` checks cannot be satisfied by an agent at all.

Two credentials were created and removed during this investigation, both on preview:

- A sandbox owner account and a virtual-authenticator credential, inserted directly into preview D1 to avoid touching the operator's session. EmDash stores ES256 credentials as 65-byte SEC1 uncompressed points (`0x04 || X || Y`), not DER SPKI; the account and its credential were deleted and `sandbox:remove` confirmed zero matching rows. The tooling that created it was not kept, because bypassing the application to mint an account is not a capability Woodhouse should retain.
- A personal access token named `probe-2`, created with `content:read` and `content:write`. Its raw value is returned exactly once and appeared in agent working notes, so it was revoked immediately; the token list returned to empty. **Treat any token raw value as a secret that must never reach a transcript, log or evidence file.** `scripts/record-evidence.mjs` and the acceptance gate scan for private material and should be extended to include token prefixes before a scoped author token is minted for real.

EmDash's credential verification also explains a detail worth keeping: the registration path stores `encodeSEC1Uncompressed`, and the authentication path decodes with `decodeSEC1PublicKey`, so a credential written as DER SPKI can never verify even with the correct private key.

## Authentication and agent authoring

The selected login is EmDash’s native passkey flow. The first Admin must be created from EmDash Office using the private tagged address supplied for Woodhouse; the address belongs in the authenticated account and, for enquiry notification, an encrypted plugin setting only. It must not appear in templates, source bundles, Agent Reception, RSS, sitemap, media metadata or public API responses. Open signup is not enabled.

Cloudflare Access is deferred. It is an exclusive auth mode for protected EmDash routes and needs a compatibility test with the intended MCP client; there is no reason to displace passkeys before that test. OAuth login providers are not added without an operator need.

The authenticated MCP endpoint is `/_emdash/api/mcp`. A normal authoring agent should use a dedicated non-admin account/token with the narrowest content read/write scopes: inspect schema and published records, create/update drafts, select permitted media and leave the record for human review. It must not receive schema mutation, protected settings, secret, repository, enquiry or automatic-publish authority. The MCP URL is not advertised as a public tool. Agent Reception remains read-only. The 3 October 2026 review below establishes that the token's **scopes cannot express that boundary** — the account's role can, so the agent account's role is the control that matters and token scope is only an endpoint gate.

The endpoint and role boundary are wired in the application. Open signup remains disabled. On 3 October 2026 the operator completed the preview setup wizard and enrolled the first Admin, `dean@deanlofts.xyz`, with an owner passkey; `emdash:setup_complete` and `emdash:seed_complete` are both `true` and `needsSetup` is `false`. The enrolled credential reports `singleDevice` with `backed_up = 0`, meaning the passkey is not synced to a second device and a loss of that device would lock the owner out of preview; syncing it is outstanding.

The scoped-token model does **not** supply the boundary this section originally described, and the earlier statement here was wrong. It was corrected after live testing on 3 October 2026; see “Agent publication authority” below for the observation and the fix. An MCP token can only belong to an owner account, because only an admin may mint one and only for itself. The agent boundary is therefore enforced by `woodhouse-editorial-policy`, which refuses any publish or schedule whose `origin.source` is `mcp`. The agent leaves drafts; a human publishes them in the Admin. Do not claim the agent acceptance test until the resulting record and revision are read back by a human.

Removing that test Admin left preview unable to complete setup. EmDash's setup `POST` returns `409 Setup has already been completed` whenever `emdash:setup_complete` is `true`, while `GET /_emdash/api/setup/status` derives `needsSetup` independently from the absence of an Admin. Preview therefore reported `needsSetup: true, step: "admin"` while refusing every submission, so the wizard looked ready and was not. On 3 October 2026 `emdash:setup_complete` was set to `false` on preview after recording a preview D1 Time Travel bookmark, and `emdash:seed_complete` was deliberately left `true` so the runtime auto-seed gate, which needs both flags unset, stayed shut. `verify:content -- preview` re-passed immediately afterwards with seven collections, nine relations and every starter count unchanged. **Whenever a user is removed from an environment, reset `emdash:setup_complete` to `false` in the same step**, or the wizard will refuse to run again.

The setup `POST` re-applies the site seed with `onConflict: "skip"`, and `applySeed` never deletes, so completing the wizard on preview cannot remove the reviewed collections or content.

## Plugins and permissions

| Plugin                               | Mode and authority                                                                                                                                            | Decision                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `woodhouse-editorial-policy`         | Sandboxed; `hooks.content-policy:register`; refuses agent-originated publish/schedule, then required fields and review-boundary checks                                                                 | Use, and it carries the agent publication boundary. The agent-origin refusal is load-bearing: token scopes cannot express it. Field checks alone are a quality gate an agent can satisfy itself. |
| `woodhouse-enquiries`                | Sandboxed public POST route; bounded multipart body; private plugin storage; rate-limit KV; admin delete route requires `plugins:manage`; optional email send | Use. Validates and stores the message as inert data, limits submissions, and purges stored submissions after 90 days. It never executes message text. |
| `woodhouse-resend-email`             | Native site plugin; exclusive EmDash email delivery using the runtime `RESEND_API_KEY` secret                                                                 | Use because Resend is the existing provider and the verified sender is `woodhouse@loftwah.com`. The provider reads the secret at runtime.             |
| `@emdash-cms/plugin-audit-log` 0.2.3 | Sandboxed registry package; reads content/media and records before/after content snapshots in private plugin storage                                          | Use for operator history. Draft bodies are retained in the private audit log; this is an audit trail, not tamper-proof provenance.                    |

The enquiry form does not display Dean’s email. A secret plugin setting holds the optional notification recipient. The form accepts an optional reply address, validates it, enforces a small payload and field limits, rejects filled honeypots, rate-limits by hashed client IP and global hourly count, and stores records privately. Daily maintenance removes submissions older than 90 days and old rate keys. A failed Resend notification does not discard the saved submission. The single Resend boundary validates sender/recipient/reply-to addresses, caps the message at 50 recipients and 100,000 combined body characters, blocks subject-header injection, uses a fixed HTTPS endpoint and eight-second timeout, and requires the documented message ID on success. CAPTCHA is deferred to avoid adding a third-party flow until abuse evidence or operator preference justifies it.

## Email and secrets

`RESEND_API_KEY` and `EMDASH_ENCRYPTION_KEY` belong in ignored local `.env` for local development and as separate Cloudflare Worker secrets in preview and production. The encryption key protects secret plugin settings and must have a separate recovery copy; it is not in D1 backups. Never place secret values in Wrangler configuration, Astro build variables, public assets or logs. `.env.example` lists names only. `pnpm run secrets:production` publishes exactly those two names to the production Worker from the operator's ignored local `.env`, through a temporary owner-only file that is removed afterwards. It refuses any other credential-shaped variable in `.env`, validates both key formats, never prints a value, and writes only names, a timestamp and a recovery note to `.release/production-secrets.json`.

The same `EMDASH_ENCRYPTION_KEY` now protects preview and production encrypted settings, because both Workers are seeded from one operator-owned `.env`. One copy of that file is therefore the recovery path for both, at the cost of a preview compromise exposing production's encrypted plugin settings. A distinct production key would remove the coupling.

The sender is `woodhouse@loftwah.com`. Resend has a verified sender domain. The private recipient is set only in EmDash’s encrypted plugin setting. A contact-form test on the isolated preview produced a Resend `delivered` event; the saved test enquiry was then deleted from the admin inbox. This proves provider delivery status for that test, not that a human opened or saw the message. The public address is not present in site content or the built public assets.

## Security and privacy review

Reviewed 30 September 2026 against the source and the previously inspected preview. CMS text is rendered through Astro/Portable Text escaping; generated JSON-LD uses `toJsonLd`, which escapes script-breaking characters before `set:html`; generated SVG text is XML-escaped; external links/images require HTTPS; and diagrams come from a fixed local allowlist. A source scan found no `innerHTML`, `eval`, `document.write` or `javascript:` sinks. Only the public enquiry route accepts anonymous writes, with an 8 KiB request cap, field validation, honeypot, hashed-IP/global rate limits, inert storage and automatic expiry. Other `/_emdash/*` requests are private, uncached and noindex. The Worker now applies `nosniff`, same-origin framing, a strict referrer policy and a permissions policy disabling camera, geolocation and microphone access to every response.

The build privacy check scans every build artifact for private Dean-domain email addresses and configured local secret values. It checks public client assets and public responses for `EMDASH_`, `ec_pat_` and `RESEND_API_KEY`; the seed check also rejects those markers and unreviewed conversation-derived entries. The reviewed seed contains no conversation entries, private email or secret markers; no private repository bodies or conversation excerpts were imported. This scanner cannot identify unknown private prose without a known comparison corpus, so source selection remains an explicit human review boundary. Miniflare’s affected `undici` dependency stays pinned to patched `7.30.0` through the workspace override.

`pnpm run audit` compares `pnpm audit` against a reviewed-advisory list rather than ignoring findings. Each accepted advisory must name the package, its exposure here, its review date and the condition that retires it; any advisory without such a record fails the check. One advisory is currently accepted: `GHSA-ch52-4w7c-c8xp` in `http-cache-semantics`, reached only through Astro's build-time remote image fetcher. The module and its `satisfiesWithoutRevalidation` helper are absent from the deployed Worker bundle, and no patched release exists upstream. Revisit if Astro adopts a patch or if Woodhouse begins serving remote images through Astro's image pipeline.

The repository Worker does not set a Content-Security-Policy header. EmDash Office uses framework-generated scripts and inline setup, so a CSP needs a nonce/hash-compatible passkey/editor test before deployment; this source does not claim CSP protection. The response-header middleware passed the production build and a local Wrangler request check for both a public route and a protected EmDash API response; it has not been deployed or rechecked against preview. The repository deploy script is a workflow gate, not an account authorization boundary: anyone with Cloudflare production deploy credentials can directly deploy the generated production config. Unqualified Wrangler commands are pinned to the preview-default config to reduce accidental production deploys. Production deployment remains blocked, and the current preview still awaits the owner’s first Admin/passkey and full authenticated editor/MCP acceptance.

See [EMDASH-ASSESSMENT.md](EMDASH-ASSESSMENT.md) for the adoption decision this record supports: the eight acceptance questions answered with evidence, the verified upstream issue states against EmDash 1.0.1, the measured cost position, and the parts that are still unfinished.

## Backups, recovery and schema evolution

The R2 bucket is private and stores media. EmDash’s optional daily JSON backup can retain 1–30 copies and is useful for inspection; EmDash cannot restore that JSON. Automatic JSON backup is not enabled or verified on preview. After the owner passkey is enrolled, sign into EmDash Office → Settings → Backups, enable daily backups, set retention to 30, save, and verify objects appear under the private `backups/` prefix after the maintenance cron runs. Record that verification in `.release/evidence/backup-retention.md`; do not claim it from the presence of a setting alone. The app cannot set this permissioned setting before the owner authenticates, and it has not been changed by seed or SQL.

A complete recovery point also needs a D1 Time Travel bookmark or raw SQL export, a separate R2 object backup, the full `EMDASH_ENCRYPTION_KEY` rotation list and the matching application version. Recovery must be rehearsed with a fresh non-production D1/R2 pair before production relies on it. Do not expose the bucket through a public domain while it contains backups.

Preview can use EmDash’s automatic seed because its D1 has no prior site setup. Production D1 already contains an EmDash site and existing operator data. Do not run the seed as if production were empty, replace the production D1, delete existing users or import a whole-site package into it. A read-only core migration check was clean during this review. Evolve production schema through the authenticated EmDash Office/CLI workflow after a restorable backup and after preview acceptance, using `--wrangler-config wrangler.jsonc --wrangler-env production` to target the named environment.

On 3 October 2026 the production schema question was settled by reading EmDash 1.0.1 rather than by assumption. The runtime seeds a database with `applySeed(db, seed, { onConflict: "skip" })` only when `seedCollectionsReadable && !seedComplete && !setupDone`, where the two flags are the `emdash:seed_complete` and `emdash:setup_complete` options. Preview has both set to `true` because it seeded once. Production also has both set to `true`, so deploying the current build will **not** create the Woodhouse collections there. No CLI path reproduces the reviewed schema either: `emdash schema add-field` accepts only type, label and required, so it cannot express `defaultValue` or `validation`, which is where `public_safe`'s `false` default and every reference relation live, and `verify:content` checks exactly those properties; `emdash menu` offers only list and get; `emdash seed --database` takes a local SQLite file rather than remote D1; and `emdash site import` requires an empty site, which production is not. The only faithful mechanical route is the vendor's own `applySeed`, and reaching it means clearing a safety flag on a populated production database.

Production D1 as read on 3 October 2026: one enabled admin, `dean@deanlofts.xyz`; core migrations `001`–`089` applied with nothing pending; nine `emdash:*` and `site:*` options including both seed flags; the default `category` and `tag` taxonomies; no menus; and a single legacy `dispatches` collection with **zero rows** whose field set lacks `projects` and `public_safe`. That missing `public_safe` control is why the legacy collection must not survive: with `onConflict: "skip"` the seed would keep the old schema and production would gain a dispatch collection with no public-safety field. Any seed-based route must drop that empty collection first so the reviewed schema is applied. A production D1 Time Travel bookmark was recorded before this inspection.

`pnpm run backup:d1 -- preview` creates a private SQL dump and manifest, drops EmDash FTS5 virtual tables only for the export, then recreates and reindexes them in `finally` and checks that row counts match. The SQL artifact includes the FTS virtual-table definitions and rebuild statements omitted by Wrangler’s D1 export. This workflow was rehearsed on preview and the resulting SQL ran against local SQLite with FTS search restored. A current preview dump and manifest are retained under ignored `.release/backups/preview/`; the latest manifest has a D1 Time Travel bookmark. This is not a remote restore drill into a fresh D1. `pnpm run backup:d1:bookmark -- production` records a production recovery point without changing D1; the production SQL-export command remains behind an explicit maintenance-window setting because it temporarily rebuilds FTS tables. `pnpm run backup:r2 -- preview|production` records a private recovery manifest. Without R2 S3 credentials it only accepts an empty bucket verified by Wrangler. With a scoped R2 S3 token it enumerates and downloads every object into content-addressed private files, preserves HTTP and custom metadata, hashes each object, and checks that the inventory stayed stable during export. `pnpm run verify:r2 -- <manifest>` checks the local archive. `pnpm run restore:r2 -- <manifest> --target-bucket=woodhouse-emdash-recovery-<name>` requires an existing empty isolated bucket, refuses either live Woodhouse media bucket, restores metadata and content, reads every restored object back, and writes a private verification report. Create a bucket-scoped R2 S3 token using Cloudflare’s [R2 token guide](https://developers.cloudflare.com/r2/api/tokens/) and [S3 endpoint guide](https://developers.cloudflare.com/r2/get-started/s3/); scope it to the source media bucket and the separate recovery bucket. The live restore drill has not been run because no R2 S3 access key is configured.

`pnpm run verify:content -- preview|production` is a read-only live check against the reviewed seed. It compares the collection fields and relation map, then checks that every seeded public record is published, explicitly safe, complete and linked to the exact project, snapshot and dispatch targets in the seed, including the dispatch-to-project many-to-many links. That check found four missing status-to-project/snapshot reference pairs in preview; the pairs were repaired from the existing typed reference keys. Preview passes the full check and verifies all seeded relations. The same read-only check finds that the Woodhouse collection model has not been migrated into production; production data was left unchanged. `pnpm run smoke:preview` rechecks the public sitemap routes, metadata, privacy markers, X/LinkedIn links, Agent Reception policy, preview `robots.txt` and private/no-store/noindex EmDash response headers.

### Resolved 4 October 2026: the model is deliverable to a remote D1

The two paragraphs above recorded, as of 3 October 2026, that no command could put the reviewed schema into a remote D1 database and that production therefore still held only the legacy empty `dispatches` collection. That conclusion was correct about EmDash's commands and wrong about the consequence: EmDash's documented mechanism for moving a whole database is a SQL file, exported from one D1 and executed into another, and nothing about that is EmDash-version-specific.

`pnpm run emdash:seed:remote -- preview|production` now does exactly that, from `seed/seed.json` rather than from another environment. It runs `emdash init` and `emdash seed` against a throwaway SQLite file, reads EmDash's own collections, fields, relations, block types, menus, taxonomies, revisions and published records back out, and replays them through `wrangler d1 execute --remote`. Because the schema is EmDash's own output, no collection, column, index or trigger is hand-written and the replay cannot drift from what `emdash seed` produces locally. `--dry-run` inspects the remote database read-only and writes the generated SQL under ignored `.release/content-model/`; writing additionally requires `WOODHOUSE_CONTENT_MODEL_CONFIRMED` to name the environment, and records the D1 Time Travel bookmark from before the write.

The replay is environment-blind by construction: users, credentials, sessions, API and OAuth tokens, entry locks, audit logs, media, plugin storage and core migration records are never written, and of `options` only the seed's own `site:` settings plus `emdash:seed_complete` are — each environment keeps its own origin, setup state, scheduler state and selected email provider. That is why this is not the "run the seed as if production were empty" that line 158 forbids: production keeps its enrolled admin, its credentials and `emdash:setup_complete`, and only the Woodhouse model and published record are installed. The script also refuses outright when the target holds a collection the seed does not describe, an entry whose slug the seed does not contain, or any draft, scheduled or trashed entry, so it cannot silently discard editorial work. Statement groups are applied whole so a parent is committed before its children, and each search index is rebuilt from EmDash's own insert trigger after the rows land rather than relying on trigger ordering.

Rehearsed against preview on 4 October 2026, then applied to production. Preview had drifted from the seed by two dispatches (`eight-finish-lines`, `prove-which-build-is-live`) and its content-model check was failing; both environments now report ready with seven collections, nine relations and `projects 8, snapshots 1, statuses 8, evidence 8, dispatches 6, incidents 1`. EmDash assigns fresh record ids on every seed run, so the stable key for "is this entry in the seed" is the slug, not the id; that was learned from a first attempt that wrongly compared ids. Full-text search was verified afterwards against the rebuilt `_emdash_fts_*` indexes in both databases, and the preview site serves all six dispatches.

`scripts/production-schema-checklist.mjs` and `pnpm run schema:checklist` are deleted. That script transcribed the seed into an operator's manual EmDash Office entry, and existed only because the model was undeliverable. It protected against a transcription that could not match the seed's default values and validation rules; `verify:content` now checks the same properties against a database the script itself installed, which is a stronger check than a printed checklist.

What still blocks `pnpm run deploy` is unchanged and is not a content problem: `.release/production-ready.json` must name the accepted preview Worker version and carry one recorded operator observation per preview acceptance check. Six of the seventeen checks hold evidence; the remainder need an authenticated EmDash session, an inbox and a physical review, so production deploy is correctly still refused.

`pnpm run audit:pages -- [origin]` audits a deployed origin. It reads the sitemap plus the always-checked routes and, for each page, checks the language and viewport declarations, a single `h1` and unbroken heading order, one non-empty title with no duplicates across the site, description/canonical/Open Graph metadata with the canonical matching the page, unique element ids, no positive tabindex, `rel="noopener"` on new-tab links, accessible names on links and controls, `alt` on images, intrinsic size on eager images, and the privacy scan. It then follows every internal link, requires each to return 200, requires each to match its own target's canonical URL, requires every same-origin social image to resolve as an image, and reports any listed page that nothing links to. Each run stamps its requests with a unique query so a shared cached body cannot hide or invent a finding; public routes still serve through the Worker cache for up to 60 seconds, so a finding immediately after a deploy should be re-run to confirm. The check found and now guards against a duplicate document title, eager diagrams without intrinsic size, a heading-level jump on the projects ledger, internal record ids used as public URLs, dead social-image references, and complementary landmarks nested inside `main`.

Supplementary notes inside an article are plain elements or labelled `section` regions, never `aside` landmarks: a `complementary` landmark inside `main` is exposed as a second page-level region. The note rails on dossiers keep their accessible names as `section` regions.

`pnpm run deploy` is guarded. It requires `.release/production-ready.json` to identify the accepted preview URL, exact active Cloudflare Worker version and current source fingerprint. Each acceptance check must point to a fresh, non-empty, owner-only evidence file under `.release/`, with a recorded timestamp and matching SHA-256 digest. The required preview checks cover the public route matrix; privacy; desktop and phone layouts; owner passkey login; the full editor draft/preview/revision/schedule/publish journey; search/RSS/sitemap updates; media upload/render; public draft isolation; menu editing; MCP read/draft/readback and role boundary; snapshot/evidence history; conversation privacy; enquiry delivery; a recovery drill; automatic backup retention; and scheduled publishing. Before building, the script checks the live production schema and starter content with `verify:content`, verifies the D1 bookmark or private SQL dump, verifies the production R2 archive file hashes and compares its object keys, sizes, ETags, timestamps and HTTP/custom metadata with the live bucket, and reads production secret names only. A non-empty bucket is supported by the archive workflow, but still requires a recent verified backup and a separate non-production restore drill in the acceptance evidence. The script then builds the production config, validates the Worker/D1/R2/domain targets, deploys and checks public routes and privacy. Receipt paths and backup artifacts live under ignored `.release/` and must never contain the encryption key itself. Production is currently missing the Woodhouse content model and the operator acceptance receipt; the production gate correctly refuses deployment until those items and owner acceptance are complete.

`pnpm run release:status` reports the same posture without attempting a deploy: whether the recorded preview matches the current source fingerprint, whether that Worker is the active 100% deployment, the read-only production migration, content and secret-name results, and for every required acceptance check whether its artifact exists, is owner-only, is under 30 days old and matches its SHA-256. It exits non-zero while anything is blocked, so it works as a release gate in its own right. On 3 October 2026 it reported the preview as ready and production as blocked on the content model, both secret names, and the acceptance receipt itself.

`pnpm run evidence:capture` writes the acceptance evidence that can be observed without a browser session into `.release/evidence/`, and lists the checks that genuinely need a signed-in operator. It currently covers five: owner passkey login, evidenced by a WebAuthn assertion arriving in the preview `credentials` table with a `last_used_at` stamp rather than by an operator claim; the public route matrix, from `audit:pages` and `smoke:preview`; the privacy scan, from per-request stamped fetches of the public and protected routes; the dated snapshot and evidence history, from direct D1 queries; and the conversation privacy policy, from the collection counts, the editorial policy tests and the published Agent Reception permissions. Each artifact states its method and an explicit list of what it does not prove, and the `ownerPasskeyLogin` artifact records that `backed_up=0` leaves the account un-synced rather than reading that as a pass.

`pnpm run evidence:record -- <check> <artifact-under-.release>` writes one acceptance entry into the private receipt. It validates that the check name is required, that the artifact exists under ignored `.release` and is non-empty and owner-only, then records the artifact's SHA-256 and the observation time. It refuses to overwrite an existing entry without `--replace`, refuses an artifact outside `.release`, refuses a world-readable artifact, refuses an unknown check name, and refuses to create a receipt at all unless the operator passes `--confirm-hostname woodhouse.loftwah.com`. It does not decide that a check passed and it cannot invent an observation: the operator supplies the artifact and asserts it. Use it so nobody has to hand-edit a digest or a file mode in a security-relevant file.

The readiness receipt is a private operator record, not an approval switch. Its shape is:

```json
{
  "operatorConfirmed": "woodhouse.loftwah.com",
  "preview": {
    "url": "https://woodhouse-loftwah-preview.loftwah.workers.dev",
    "workerVersion": "<accepted version id>",
    "sourceDigest": "<current sha256 fingerprint>",
    "checks": {
      "publicRouteMatrix": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/routes.json",
        "sha256": "<64 lowercase hex characters>"
      },
      "privacyScan": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/privacy.txt",
        "sha256": "<64 lowercase hex characters>"
      },
      "desktopAndMobile": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/responsive-check.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "ownerPasskeyLogin": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/owner-login.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "editorDraftRevisionPreviewSchedulePublish": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/editor-lifecycle.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "searchRssSitemapUpdates": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/discovery.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "mediaUploadAndRender": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/media.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "publicDraftIsolation": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/draft-isolation.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "menuEditing": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/menus.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "agentMcpSchemaReadAndDraftReadback": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/mcp-draft.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "agentMcpRoleBoundary": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/mcp-role.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "evidenceSnapshotHistory": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/evidence-history.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "conversationPrivacyPolicy": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/conversation-policy.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "enquiryDelivery": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/enquiry-delivery.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "backupRecoveryDrill": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/recovery-drill.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "automaticBackupRetention": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/backup-retention.md",
        "sha256": "<64 lowercase hex characters>"
      },
      "scheduledPublishCron": {
        "passed": true,
        "observedAt": "<ISO timestamp>",
        "artifactPath": ".release/evidence/scheduled-publish.md",
        "sha256": "<64 lowercase hex characters>"
      }
    }
  },
  "production": {
    "contentModelMigrated": true,
    "starterContentVerified": true,
    "backup": {
      "d1ManifestPath": ".release/backups/production/d1-time-travel.json",
      "mediaManifestPath": ".release/backups/production/r2-manifest.json",
      "encryptionKeyBackupReference": "<external secret-manager item reference>"
    }
  }
}
```

Write the file with owner-only permissions after those observations actually pass. The script checks evidence-file privacy, hashes and freshness, queries Cloudflare for the currently active preview version, and checks the deployment manifest and live databases independently. Setting a receipt field does not bypass those checks.

## Capability decisions

| EmDash area                                                                  | Decision                                   | Reason                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| D1 content model, revisions, drafts, signed preview and scheduled publishing | Use                                        | Needed for a real editorial office while preserving the Woodhouse front end.                           |
| R2 media library                                                             | Use                                        | Approved authored imagery needs durable private storage and media metadata.                            |
| Site settings, menus, bylines, taxonomy, references and reusable sections    | Use                                        | These represent Woodhouse identity, navigation, topic assignment and evidence lineage.                 |
| Search, SEO records, canonical/Open Graph metadata, RSS and sitemap          | Use                                        | Public discovery reflects only published reviewed records.                                             |
| Admin visual editor                                                          | Use in client mode                         | Supports click-to-edit while avoiding editor-specific public HTML in shared caches.                    |
| Authenticated MCP                                                            | Use, constrained by a non-admin role/token | Agents can draft and revise content without publishing private inputs or changing schema/settings.     |
| Plugin sandbox and Worker Loader                                             | Use                                        | Local editorial/form hooks run in isolation with declared capabilities.                                |
| Comments and reactions                                                       | Reject for this release                    | No public discussion product is requested; comments are disabled in every collection.                  |
| Open signup and Cloudflare Access                                            | Reject open signup; defer Access           | Single-operator passkeys are the chosen mode; Access/MCP compatibility is unproven.                    |
| AI search and automatic conversation ingestion                               | Reject                                     | Public content is curated and small; private conversations are not a publication source.               |
| Internationalisation                                                         | Defer                                      | The publication is Australian English and has no translation requirement.                              |
| Generic page builder, widgets and public mutation tools                      | Reject                                     | They conflict with authored Woodhouse layouts and the read-only public boundary.                       |
| Remote project metadata scraping                                             | Reject                                     | Source pages are untrusted; approved metadata is editorially maintained.                               |
| CAPTCHA                                                                      | Defer                                      | Bounded payloads, honeypot and rate limits are implemented; add a challenge only if abuse warrants it. |

## Validation record

On 3 October 2026, against the current source and the deployed isolated preview:

- `pnpm run verify` passes end to end on Node `v22.23.1` with pnpm `12.8.1`: seed validation, generated types, format, lint, dead code, the diagram-size manifest, the reviewed dependency audit, EmDash Doctor, 15 tests, Astro and TypeScript with no diagnostics, and the production build with its privacy scan across 736 artifacts.
- `pnpm run deploy:preview` published preview Worker version `3514d936-3e48-4a9a-81fc-108d4e7bc3dd`; the hostname responded HTTP 200 and the private manifest recorded the source fingerprint. `pnpm run smoke:preview` passed all 42 sitemap pages, the supplied social links, the Agent Reception read-only policy, the privacy markers and the private EmDash response headers.
- `pnpm run audit:pages` audited the same deployment: 42 pages, 54 distinct internal link targets, 9 same-origin social images and 42 unique titles, with no findings. It reports the previous defects it now prevents: a shared document title between an incident and its dispatch, eager diagrams with no reserved size, an `h1`→`h3` jump on the projects ledger, internal record ids used as public status URLs, a dead social-image reference, and a complementary landmark nested inside `main`.
- An axe-core 4.10.2 pass over 19 preview routes, at 1440 and 390 CSS pixels, reported no violations under the WCAG 2.0/2.1 A and AA rules plus axe best practice after the landmark change, and no horizontal overflow at either width. This is a browser observation against the deployed preview, not part of `pnpm run verify`; the repository has no browser dependency, so the audit's own structural checks are the automated guard.
- `pnpm run verify:content -- preview` passed with seven collections, nine relations and exact starter counts (8 projects, 1 snapshot, 8 statuses, 8 evidence records, 4 dispatches, 1 incident). `pnpm run emdash:migrate:check -- preview` and the same read-only check against production both report no pending or unknown core migrations.
- `pnpm run verify:content -- production` still reports that the Woodhouse collections and public-safe starter records are absent from production, so production D1 content is unchanged by this review.
- On 3 October 2026 the operator created the first preview Admin through the setup wizard with a passkey. Preview now reports one account at role 50, enabled, and one credential whose `last_used_at` records the accepted assertion. `emdash:setup_complete` returned to `true` and `needsSetup` is `false`; `verify:content -- preview` re-passed with all starter counts intact. The passkey is `singleDevice` with `backed_up=0`, so it is not synced and losing that device would lose the account. Production still holds a separate single-use "Setup passkey" from the 29 September browser test that nobody should rely on; it should be removed once the operator has a production credential of their own.
- On 3 October 2026 the production Worker held no secret names at all, contradicting the 30 September note that an email secret existed. `pnpm run secrets:production` published `RESEND_API_KEY` and `EMDASH_ENCRYPTION_KEY` from the operator's ignored local `.env`; `wrangler secret list` now reports both names. A production D1 Time Travel recovery bookmark was recorded first, at `.release/backups/production/d1-time-travel.json`. Secret values were never printed or logged. The production content model still requires an authenticated EmDash session, and `pnpm run deploy` continues to refuse.
- `llms.txt` is now generated from the published read model and lists the current dispatches, projects, incidents and evidence records with their review dates, rather than a checked-in file that could drift.
- Every diagram now reserves its exact box before load from `src/data/diagram-sizes.json`, which `pnpm run diagrams:sizes` regenerates and `verify` checks against all 22 rendered SVGs.

Earlier, as reviewed across 29–30 September 2026:

- Installed EmDash and Cloudflare adapter are both current at 1.0.1; the audit-log plugin is 0.2.3.
- The production `pnpm run build` and isolated `pnpm run deploy:preview` completed successfully; Cloudflare reports preview Worker version `04152ec0-7ef3-4ebb-8c4a-a94a5123a0ac` active at 100%.
- `pnpm exec tsc --noEmit`, `pnpm audit --prod`, `pnpm exec emdash seed seed/seed.json --validate` and `pnpm run test:r2` pass. The R2 tests cover streamed archive integrity, metadata restore/readback, tamper rejection and refusal to target live buckets.
- `pnpm run smoke:preview` checked all 33 sitemap pages for status and page metadata, the supplied social links, Agent Reception read-only policy, noindex/private response headers, and public privacy markers. `pnpm run verify:content -- preview` verified all seven collections and nine seeded relations with exact starter record counts.
- Public preview pages were checked at desktop, phone and narrow-phone widths; the preview response has `noindex`, the public privacy scan found no tagged email or Resend secret, and the X, LinkedIn and GitHub links point to the supplied profiles.
- The public contact form saved an enquiry and Resend returned a delivered event. The temporary enquiry was removed; the admin inbox was empty afterward.
- The preview Enquiries sidebar and private recipient setting were verified after correcting plugin metadata to EmDash’s root `adminPages` and `settingsSchema` shape. The recipient setting API reports only whether its encrypted secret is set.
- The admin redirect, auth-mode endpoint and unauthenticated MCP endpoint all returned `private, no-store` and `noindex` headers after adding the Worker privacy wrapper.
- The D1 SQL export/FTS rebuild was rehearsed against preview; all five FTS indexes retained their row counts, and a local SQLite restore verified search. The R2 archive/restore logic passes mocked byte, metadata, tamper and protected-target checks. Neither result establishes a remote fresh-D1/R2 restore or Time Travel recovery.
- Preview's current public-safe seed and its content links pass `pnpm run verify:content -- preview`. The D1 backup, production D1 Time Travel bookmark and R2 recovery manifests are private files under ignored `.release/backups/`.
- `emdash doctor` confirmed the scheduled handler is wired to the one-minute Cron Trigger. The default local database file is absent; the existing Wrangler local state reports all critical doctor checks passing, with setup still awaiting an Admin.
- The preview editor exposed a missing default on required `public_safe` fields; all seven preview D1 defaults are now `false`. The editor workflow has not been retested because the owner passkey has not yet been enrolled. EmDash now reports the first-Admin setup stage, ready for the owner to enroll.
- A live preview cron event was observed with the deployed version and sandboxed plugins loaded without exceptions. This confirms the schedule fires; it does not prove every scheduled publishing or retention scenario.
- The preview MCP authoring workflow, media upload/render and fresh-D1/R2 recovery drill remain unaccepted. Full R2 archive/restore code is implemented, but remote object transfer still needs a scoped R2 S3 token and an isolated live recovery bucket. Production content verification was run read-only and confirms the Woodhouse collection schema, editorial defaults, references and starter records are absent there. Production was not changed.
- On 30 September, both live media buckets were confirmed empty with Wrangler. Private preview and production R2 manifests were written and passed `pnpm run verify:r2` integrity checks. The production Worker remained at version `ef5f562b-6bef-4ed8-97f9-2c5edb47a1a1` during this work. The read-only command `pnpm exec emdash migrate --check --wrangler-config wrangler.jsonc --wrangler-env production --json` reports no pending or unknown core migrations, but the Woodhouse collection schema and public-safe starter records are not in production. The production email provider secret exists; `EMDASH_ENCRYPTION_KEY` does not. Secret values were not read.
- Production has not been changed. Its existing Worker, D1 site and operator data are preserved.
- Follow-up on 30 September: `pnpm run emdash:seed:validate` passes; applying the seed to a unique temporary SQLite D1-compatible database creates all seven collections, 85 fields, three menus, one taxonomy with eight terms, one byline and 30 entries. `pnpm run emdash:doctor` then reports database, migrations, collections, datetime storage and scheduler wiring pass; “no users” is the expected warning for an isolated temporary database. The temp directory is removed by the script.
- Follow-up on 30 September: EmDash-generated types now describe all seven collections, the eight editorial block types, and reference targets. `pnpm run typecheck` passes. The public `emdash types` CLI cannot access preview because Dean has not enrolled an authenticated Admin; the checked-in types are generated offline from the exact validated seed schema using EmDash’s generator.
- Follow-up on 30 September: the read-only `pnpm exec emdash migrate --check --wrangler-config wrangler.jsonc --wrangler-env preview --json` check reports no pending or unknown core migrations. Read-only `wrangler d1 info` reports both preview and production D1 in region `OC`, with replication disabled. At this observation Smart Placement had been added to Wrangler but had not yet been deployed; the later preview deployment and its `cf-placement` observation are recorded above and below.
- Follow-up on 30 September: `pnpm run verify` passes after removing duplicate search destinations and restoring keyboard focus when the search dialog closes. The isolated preview was deployed as Worker version `0bbefa0b-ed15-4f4b-ab21-6fbba4e0af6c`, confirmed active at 100%, and `pnpm run smoke:preview` passed all 42 sitemap pages, metadata, privacy markers, supplied social links and EmDash private-response headers. The preview content gate verified seven collections, nine references and all expected starter records; the read-only migration check has no pending or unknown migrations. Cloudflare lists both expected preview secret names, `RESEND_API_KEY` and `EMDASH_ENCRYPTION_KEY`; values were not read or logged, and the production Worker and secrets were not changed.
- Follow-up on 30 September: browser checks of the deployed preview found no horizontal overflow at 320, 390 or 1440 CSS pixels. `⌘K` opens the Woodhouse search, the “Bubbles” query returns its project and reviewed evidence, and Escape closes the dialog and restores focus to its trigger. The cache-busted search index contains 33 unique destinations. Reduced-motion emulation is recognized by the browser, and the stylesheet has a corresponding media query. The browser reported one non-blocking font-preload timing warning and no JavaScript errors.

## Code-quality review — 30 September 2026

This pass reviews the current local source. It does not record a new preview or production deployment. Node `v22.23.1`, pnpm `12.8.1`; `pnpm install --frozen-lockfile`, `pnpm run verify`, `pnpm peers check`, `pnpm dedupe --check` and `pnpm audit` pass. `pnpm outdated --recursive` reports only TypeScript 7.0.2. TypeScript remains on 6.0.3 because `@astrojs/check@0.9.10` declares support for TypeScript `^5 || ^6`; move to 7 when that checker supports it and the full verify passes.

The production build privacy scan passes. Wrangler's `--dry-run` bundled 619 Worker modules at 17,445.48 KiB uncompressed (4,394.61 KiB gzip) and resolved the expected D1, R2, KV, Images, static-assets and Worker Loader bindings. Cloudflare currently allows 64 MiB uncompressed Worker bundles ([limits](https://developers.cloudflare.com/workers/platform/limits/)). Vite still warns about chunks over 500 KiB; the largest client output is EmDash's generated `PluginRegistry` asset at 8,308,979 bytes. The public home page did not request that asset in the browser check; it belongs to the Admin route. Keep the warning visible and revisit when EmDash supports smaller Admin/plugin chunks.

Compatibility exceptions and their removal conditions:

| Package or range                                        | Reason                                                                                                                                     | Remove when                                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `pnpm@12.8.1` (`packageManager`)                        | Fixes the package-manager release that interprets and verifies this lockfile.                                                              | Update this declaration together with a deliberate pnpm upgrade after frozen install and full verification pass. |
| `astro@7.3.5`                                           | Exact Astro release used with the current Cloudflare adapter; the full build and binding dry-run pass.                                     | A later stable Astro release passes frozen install, `pnpm run verify` and the Wrangler binding dry-run.          |
| `wrangler@4.143.1`                                      | Exact CLI release used to generate and inspect the Worker bundle.                                                                          | A later stable release passes the same checks and produces the expected bindings.                                |
| `typescript@^6.0.3`                                     | Astro's current checker does not yet accept stable TypeScript 7.                                                                           | The checker adds TypeScript 7 support and the full verify passes.                                                |
| `undici@7.29.0 → 7.30.0` workspace override             | The resolved `7.29.0` was flagged by `pnpm audit`; `7.30.0` is the current compatible release in major 7 and the audit is clear.           | All dependency paths resolve to a patched version without the override.                                          |
| Miniflare `5.20260926.0-alpha` and `5.20260926.1-alpha` | Stable Cloudflare Astro/Vite and Wrangler packages currently depend on these prereleases; Woodhouse does not depend on Miniflare directly. | The Cloudflare toolchain moves to stable Miniflare packages and local Worker checks pass.                        |

The workspace also carries exact `minimumReleaseAgeExclude` entries for `@aws-sdk/client-s3@3.1142.0`, `@modelcontextprotocol/sdk@1.31.0`, `@cloudflare/workers-types@5.20260929.1`, `miniflare@5.20260926.1-alpha` and `wrangler@4.143.1`. Keep this list exact; remove each entry when its selected version no longer needs the release-age exception. Nine deprecated packages remain transitive through EmDash: `@oslojs/asn1`, `@oslojs/binary`, `@oslojs/cbor`, `@oslojs/crypto` (two versions), `@oslojs/jwt`, `@oslojs/webauthn`, `arctic` and `node-domexception`. The Oslo and Arctic packages are in EmDash's passkey/OAuth dependencies; `node-domexception` is under its LibSQL fallback. Reassess them when EmDash updates those dependencies; none of them carries an advisory. The production license inventory reports metadata for all 495 packages and identifies `@wordpress/block-serialization-default-parser@5.56.0` (`GPL-2.0-or-later`) through EmDash's Gutenberg-to-Portable-Text converter.

| Advisory                                                  | Exposure here                                                                                                     | Retired when                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `GHSA-ch52-4w7c-c8xp` `http-cache-semantics` 4.2.0 (high) | Reached only through Astro's build-time remote image fetcher. The module is absent from the deployed Worker bundle. | Astro adopts a patched release, or Woodhouse serves remote images through Astro's image pipeline. |

This is the only advisory `pnpm audit` reports, and `pnpm run audit` records it with the reason above rather than suppressing it. Re-derive that reasoning if the Astro image pipeline is ever enabled.

The local browser check rendered the home, Factory, project index, dispatch index, doctrine, Dean, Agent Reception, incidents, conversations, architecture, contact and evidence routes. The nonexistent route returned 404; the Admin opened EmDash's first-Admin setup screen. The local EmDash database was empty, so dynamic project and dispatch entries returned 404 and the home page displayed the empty-data state. No seed was applied to the existing Wrangler local state. At 390 and 1440 CSS pixels the home page had no horizontal overflow; search opened, Escape closed it and restored focus, and the public home produced no browser errors or warnings. The contact form and private social links rendered; no enquiry was submitted and no Resend email was sent. The unauthenticated Admin's two `/_emdash/api/manifest` responses were expected `401`s. EmDash also logs its zero-issue datetime migration summary with `console.error`; the observed report was `0 noncanonical values (0 naive)`.

`pnpm run verify` reports no Astro or TypeScript diagnostics and all 14 tests pass. The local Doctor's “no users” warning is expected for its isolated temporary database. Production remains unchanged. The Worker dry-run and local browser review are not deployment or live-content proof.

Update this record only with direct observations, and distinguish local test evidence from preview and production observations.
