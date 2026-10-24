# Architecture

Reviewed 7 October 2026.

```text
Public visitor / authenticated editor / authorised authoring agent
                            |
                Cloudflare Worker Cache
                            |
           Astro + Woodhouse presentation layer
               |                         |
        EmDash public queries        EmDash Office / MCP
               |                         |
       D1 content and history     Authenticated mutations
               |
          KV object cache

        R2 media and private backups
        Worker Loader sandboxed plugins
```

Astro owns page structure, CSS, diagrams, editorial block renderers and accessible browser behaviour. EmDash owns structured content, editorial state, authors, revisions, previews, media, taxonomy, menus, search records and scheduled publishing. The Worker serves public pages from the published read model; admin, MCP, preview and mutation responses are private. The shared navigation and search index are live CMS data, so public HTML is server-rendered while checked-in styles, diagrams, fonts and images remain static assets.

`src/content/repository.ts` is the only Woodhouse query boundary. Every public query asks for published entries and then checks the explicit `public_safe` flag; public conversations also require `source_reviewed`. CMS links and project metadata are constrained to root-relative or HTTPS URLs. A review date and proof boundary are shown with project state. The current state is a dated editorial record, never live repository telemetry.

The seeded model contains seven collections: project identity, append-only factory snapshots, reviewed project statuses, evidence records, dispatches, structured incident records and an intentionally empty conversations collection. A project status points to a snapshot; evidence records also point to a project and snapshot. Dispatches link to the project/topic context they discuss. The relation keeps historical state instead of overwriting it when a project is reviewed again.

The Cloudflare Worker binds D1 as `DB`, private R2 as `MEDIA`, KV as `CACHE` and `SESSION`, and Worker Loader as `LOADER`. A one-minute scheduled handler runs EmDash maintenance, scheduled publishing and plugin cron work. Automatic EmDash JSON backups are not yet enabled or verified. Production and preview have separate database, media and KV resources. The root Wrangler target defaults to preview; the named production environment owns the custom-domain route.

The public Agent Reception is a curated, read-only interface. It cannot call private repositories, run tools, mutate content or publish conversations. The authenticated EmDash MCP endpoint is a separate authoring interface; its token and assigned role determine what a client can do. No public agent receives write access.

Reviewed 18 October 2026: the build and page audits also guard against accidental secret publication. `scripts/check-build-privacy.mjs` runs inside `build`/`build:preview` and inspects the actual `dist` artefact — client and Worker files, hidden and nested paths, bundles, source maps and copied static assets — rejecting dangerous published filenames (`.env`, `.env.*`, `.dev.vars`, `.git`, key material, credential files) and high-confidence secret shapes without printing any matched value. `scripts/public-privacy.mjs` owns the patterns, the published-path rules and the Node runtime `.env` parser the local guard and remote checks share, including inline comments and multiline values. Credential-named values receive no `PUBLIC_*` exemption; Woodhouse has no allowlisted client-key exception. `pnpm run audit:pages` performs safe negative requests to known credential paths on a deployed origin and treats a generic 200 HTML fallback as neither exposure nor proof of safety. This is preventive: it asserts no current compromise.

`pnpm run audit:pages` audits a deployed origin for document structure, link integrity, canonical consistency, discovery, social images and privacy. `pnpm run audit` compares `pnpm audit` against a reviewed-advisory list and fails on anything without a recorded exposure and removal condition. `pnpm run smoke:preview` covers the deployed route matrix and the private EmDash response headers.

A local Astro integration stamps the build with the source fingerprint, the commit it was built from and whether that tree was clean. `/build.json` returns that identity under the factory shape `loftwah.build-identity/1`, and both deploy scripts fail unless the live origin reports the fingerprint they intended to ship. The Worker cannot learn its own Cloudflare version id, so it does not claim one; the private release receipt records the version.

Reviewed 7 October 2026: `loftwah.build-identity/1` is Woodhouse’s own release-identity shape. No other factory project has adopted it. Other projects publish their own provenance mechanisms, so this endpoint is not a shared fleet protocol. The verifier in this repository checks this site; no cross-repository integration is claimed.

The same endpoint reports a `content` fingerprint over the published read model, because code and content reach production by different mechanisms and either can be current while the other is stale. It is a SHA-256 over each record's identifier and full data, so an edit to any published record changes it, and per-collection counts are reported alongside for human sanity-checking. The content read never gates the build identity: a content failure reports `available: false` rather than turning a working identity endpoint into an error. `pnpm run verify:build -- <origin>` reads either half and fails on a mismatch, a mislabelled digest or a missing endpoint.

## Delivering the content model to a remote database

EmDash has no command that writes the content model into a remote D1 database. `emdash seed` applies the seed to a local SQLite file; the runtime auto-seed gate stays shut once `emdash:seed_complete` is set; `emdash schema add-field` accepts only type, label and required, so it cannot express the default values and validation rules that `public_safe` and every reference relation depend on; `emdash menu` is list and get only; and `emdash site import` requires an empty site. That ordering problem — the deploy gate wants the reviewed model in production, and no command could put it there — is resolved.

EmDash's own documented mechanism for moving a whole database is a SQL file: export one D1 and execute it into another. `pnpm run emdash:seed:remote -- preview|production` produces that file from the reviewed seed. It runs `emdash init` and `emdash seed` against a throwaway SQLite file, reads EmDash's own collections, fields, relations, block types, menus, taxonomies, revisions and published records back out, and replays them through `wrangler d1 execute --remote`. It never hand-writes a collection, column or trigger, so it cannot drift from what EmDash would build. `--dry-run` prints the plan and writes the SQL under the ignored `.release/` directory without contacting the remote database beyond read-only inspection; a write additionally requires `WOODHOUSE_CONTENT_MODEL_CONFIRMED` to name the environment.

Nothing is copied from another environment. Users, credentials, sessions, tokens, entry locks, audit logs, media, plugin storage and core migration records are never replayed, and of the `options` table only the seed's own `site:` settings plus `emdash:seed_complete` are written — each environment keeps its own origin, setup state, scheduler state and email provider selection. The script refuses to run when the database holds a collection the seed does not describe, an entry whose slug the seed does not contain, or any draft, scheduled or trashed entry: it installs the reviewed model, it does not edit a live environment's content. Each statement group is applied whole, so a parent is committed before its children, and every search index is rebuilt from EmDash's own insert trigger after the rows are in place.

On 4 October 2026 the reviewed model and published starter records were installed into production D1 this way, after the same run was rehearsed against preview. `pnpm run verify:content -- preview|production` now reports ready for both, with seven collections, nine relations and every published public-safe record present and linked. Production kept its own enrolled admin account, credentials and setup state throughout. The D1 Time Travel bookmark recorded before the write, the generated SQL and a private manifest are kept under ignored `.release/content-model/`.

## Public publication and editorial activation

Reviewed 7 October 2026: the public journal was still serving its pre-CMS Worker because the original release gate coupled reader pages to all seventeen editorial acceptance checks. That gate protected real authoring, identity, delivery and recovery outcomes; those requirements still stand. It should not prevent publication of a reviewed read model when those workflows are inaccessible.

`pnpm run deploy:publication -- preview|production` is the narrow reading-only release path. It rehearses the same source in the existing isolated preview, checks the published content and exact core migration set, builds with editor UI disabled, and sets `WOODHOUSE_PUBLICATION_MODE=read-only`. The Worker refuses every CMS endpoint, request mutation, authenticated preview and edit-mode request before invoking EmDash. CMS scheduled work stays disabled: production's manifest carries only the hourly analytics report refresh, and preview carries no cron trigger. Contact uses the established public profiles and advertises no inactive form. There are no CMS-managed media files in this release; those endpoints stay unavailable too.

The production path requires clean `main` matching `origin/main`, a fresh preview receipt, the matching active preview version at 100% traffic, a passing public page audit and a D1 Time Travel recovery point. Both environments must report the intended source fingerprint and pass the reading-only boundary probes and page audit after deployment. The private `.release/publication-{environment}.json` records the exact source, Worker, content identity and checks. This is public publication acceptance; it is not editorial acceptance or a completed restore drill.

The full editorial deployment remains behind `scripts/deploy-production.mjs` and `.release/production-ready.json`. Passkey login, draft/revision/scheduling workflows, MCP authoring boundaries, enquiry delivery and backup/recovery still need their own observations before CMS authoring is enabled. No observation is recorded on MP’s behalf. Issue #10 retains the R2 restore drill. Restoring editorial mode requires the full acceptance receipt and an explicit configuration change; the public path cannot enable it.

The 7 October seed-replayed report uses a fresh read-model cache prefix. This prevents the observed out-of-band content visibility failure from serving an older snapshot under the new templates; it does not claim to solve general CMS invalidation.

## See also

See [EMDASH.md](EMDASH.md) for the content model, plugin decisions, operational workflow, privacy boundary and dated validation state.

See [PLATFORM.md](PLATFORM.md) for what the Cloudflare platform offers this factory, what is actually in use, and the recorded decision on each capability that is not. Read it before proposing a Cloudflare service; it is the map that says which question is already answered.

`lab/` holds executable experiments that stay outside the request and build paths: `lab/artifacts-lifecycle` proves the agent task-workspace lifecycle over ordinary Git, and `lab/evidence-replay` proves that one synthetic corpus replays into two independently checkpointed projections under duplicate, out-of-order, malformed, oversized, interrupted, lost-acknowledgement and expired-lease delivery. Both ran to a recorded defer decision in `lab/*/README.md`. Run them with `pnpm run lab:artifacts`, `pnpm run lab:evidence` and `pnpm run lab:test`. Nothing in `lab/` is imported by the site, and no lab artefact is published.

## Shared capability discovery — reviewed 11 October 2026

The observed gap was that FM's available music client and five planned game consumers were absent from the portfolio, while a dated safety-layer finding could be read as a permanent ban on all code reuse. A versioned `capability_review` block now lives in the existing EmDash dispatch collection. Its provider and consumers resolve to published public-safe project identities; its proof keys resolve to public-safe evidence records. No new collection, registry or service owns adoption.

`listPublicCapabilities()` in `src/content/repository.ts` reads the latest complete published review for each capability. Human views and `/agents/facts.json` share that projection. Available upstream and actually installed versions are distinct. Planned, in-progress, implemented, deployed and verified fields are independent observations, with false meaning not established in this record. Version 1 retains its historical single-client rule. Version 2 fixes the observed failure where a newer available release hid genuinely supported older consumers: it lists explicitly reviewed supported clients with immutable archive URLs, SHA-256 digests and dated provider production evidence. The available client must match one of those records. Implementation requires membership in that reviewed list and dedicated evidence keyed to the consumer’s installed version. Stage proof keys use `{capability_key}-{project_key}-client-{version with dots replaced by hyphens}-{implementation|release|interaction}-{date}`, so unrelated gameplay evidence cannot establish adoption. Deployment requires reviewed production evidence for the exact deployed revision; verification requires qualification evidence for that same revision. Every stage proof is dated no later than the capability review. An unlisted client needs a new compatibility review; matching a major version alone is insufficient. Human views label the final stage as reviewed browser evidence and retain the receipt’s physical-device, listening and release limitations. Contradictory or incomplete reviews are omitted, and the publication gate refuses missing or stale review data.

New games are discovered from current project identities, owning GitHub work and upstream profiles, then added to a reviewed block with evidence. Profiles alone do not establish adoption. Historical blocks and earlier project statuses stay dated; a capability-only review does not re-date unrelated gameplay proof. The programme and private documentation links may require GitHub access; no private bodies are copied. The public player, package and manifest endpoints remain directly discoverable.

Publication updates remote EmDash records through the established reviewed-model delivery path, after inspecting current rows and recording D1 recovery bookmarks. A new cache namespace for the reviewed release makes out-of-band content installation visible without guessing a TTL guarantee. Restore tooling, the full editorial acceptance gate and #10's non-empty R2 drill requirement remain unchanged.

The observed visitor gap was a technical adoption record without a listening path. The homepage and capability views now use FM's official public widget, framed only after a reader opens the native listening panel. FM retains its transport, station scheduling and media delivery. Changing a station reloads that frame; closing the panel or leaving the page disposes it. There is no autoplay, provider credential, generation request or new Woodhouse music owner. Without JavaScript the public FM links remain usable. Optional CMS listening URLs admit only FM's exact public player routes; show links require reviewed public publication evidence. Human views and agent facts expose the same reviewed destinations. Source implementation can be recorded for a draft PR; the record names the pending merge and cannot promote it into a deployed or verified claim.

## Public activity — reviewed 12 October 2026

`src/data/activity.ts` reads the fixed public LoftwahFM aggregate endpoint with a four-second timeout, rejects malformed/future responses and projects only allowlisted game IDs, nonnegative aggregate seconds/starts and dates. No upstream identities, URLs or raw events are forwarded. `/activity/` and `/api/activity.json` join that projection to public EmDash project membership and use five-minute edge caching. Provider failure disables caching and is unavailable, never zero. Scores are linked to Bubbles rather than mirrored: its existing per-IP read budget is unsuitable for an extra shared reader. No new resources or account bindings.

Preview proved that the fixed FM endpoint was reachable from Node but unavailable from the Worker. A minimal local Worker reproduction identified an unsupported `redirect: "error"` option. The read now uses `manual` and rejects redirect responses; bounded failure class/status is logged without the upstream payload. The official [Worker-to-Worker fetch contract](https://developers.cloudflare.com/workers/runtime-apis/fetch/) also requires `global_fetch_strictly_public` for this public same-zone read; Wrangler enables it without a new binding. Provider-unavailable HTML declares private no-store even when Astro caching is disabled so the existing Worker wrapper cannot recache its empty state.


Reviewed 12 October 2026: `/activity/` accepts a bounded retained FM hour snapshot and selected priority game. The same snapshot supplies the report, image, caption and share link. `/api/activity-card.png` reads only the fixed public FM renderer, accepts the four known priority games or its public composite, rejects arbitrary URLs/query fields/redirects, bounds the response to 1 MiB/10 seconds and checks PNG headers plus the supported 1200×630 dimensions. It passes through the publisher's image without transformation/storage, with safe filenames and explicit dimensions. Every read requires current public EmDash membership; a composite requires all contributing games to remain public. Successful activity HTML and JSON include the report date in its cache validator, and dated game variants retain their canonical identity. The publication audit preserves and decodes social-image query strings to check the actual selected artwork. Declared success cache bounds are 60 seconds for the moving default and one hour for a pinned snapshot; failures are no-store. Astro's route cache is disabled for the image to preserve attachment/query variants. Device file sharing prepares the image before the click, tests support, treats cancellation silently and retains native download/clipboard/link fallbacks. No new binding or resource.

Reviewed 12 October 2026: `/share/` reads the existing public EmDash projects/menu plus FM's bounded aggregate. It orders presentation priorities rather than maintaining a second identity catalogue. Project posts derive from the published description and canonical destination. `/api/share-image?project=<published-slug>` supplies original bytes as attachments from an explicit set of reviewed public project hosts only, rejects redirects/unsupported bodies, limits transfers to 6 MiB/10 seconds and rechecks current public membership. SVGs are download attachments with sandbox/nosniff; no image is transformed or stored. Native FM attachment links expose the three already verified official formats directly on the desk. The page shares public membership, dates and cache hints with existing readers; missing radio does not suppress project resources. Global navigation/search extend the existing presentation, with no CMS schema, resource or account changes.

The share desk declares a 60-second edge lifetime plus 60-second revalidation. A missing radio report keeps project resources usable with private/no-store HTML. BaseLayout preserves route/private failure policy and skips cache hints that would re-enable the provider. Page audits retain link query parameters so a real image download is checked rather than a missing-selector request.

Reviewed 12 October 2026: the gallery retains original assets and short project captions; story captions use the same bounded post formatter. Image clipboard writes are initiated during the user click, with PNG encoding performed locally for JPEG/SVG clipboard compatibility; original downloads are unchanged. Native file-share preparation occurs only for visible controls. The existing fixed FM image reader now admits the three reviewed shapes and verifies the corresponding PNG dimensions, retaining its 1 MiB/time/redirect/public-membership guards and landscape default. No new service, collector or resource.

Reviewed 12 October 2026: the approved SHOALSHOT brand originals are lossless WebP. The existing bounded image reader accepts WebP only with its RIFF/WEBP container identity and declared file length, retaining reviewed-host, membership, redirect and transfer limits. The fixed brand paths select the dated approved originals. Native file sharing keeps the WebP extension, while the existing local canvas path supplies PNG clipboard compatibility. The original finished-dive evidence remains dated separately from the brand repair.


Reviewed 12 October 2026: the existing share presentation data includes specifically reviewed public-safe media files, gated in the gallery by existing published project identities. Curated screenshots, source illustrations and approved promo files are copied into Worker static assets; the earlier no-storage statement applied to the OG proxy. Fighter web exports retain the original resolution, duration and authored audio while fitting the existing 25 MiB static asset file limit. Original masters and private provenance remain with the source projects. Supporting artwork follows the five priority media sections; public FM album covers derive from the anonymous published catalogue with canonical album destinations. Image packs contain approved images and public captions, never private handoff manifests, source paths or conversations. No CMS schema, collector, provider, paid resource, account or auto-posting integration is added. Video previews use native controls, sound-description caption tracks, no autoplay and no preloading; image clipboard conversion retains its existing bounds.


Reviewed 12 October 2026: `/share/` renders six resources per native URL view, varying by `project`, `type` and `page`. Project, format and pagination links preserve browsing state and work without client JavaScript; phone selects progressively submit the same GET form. The previous path-only Astro route cache is removed from this query-varying surface so one selection cannot replace another. Public CMS query caching, media provenance and the existing read-only Worker boundary remain unchanged.

Reviewed 17 October 2026: the share desk now opens each project on a category it actually has. A project link with no explicit `type` redirects to its first available category (screenshots, otherwise artwork or clips, otherwise its link card), while an explicit empty category keeps its address and shows a clear empty state listing what the project does have. `projectActionLabel` derives Play, Listen or Open project once for every entry point. `composer.loftwah.com` joins the reviewed image-proxy hosts. Gallery previews are width-bounded WebP files under `public/share/previews/`, generated by `scripts/render-share-previews.mjs` and recorded in `src/data/share-previews.ts`; the original remains the download and full-size target, and `pnpm run verify` fails when the recorded set and the files disagree.

## Portfolio analytics — reviewed 15 October 2026

The existing hourly snapshot path derives versioned weekly analysis from sanitized aggregates. It requires exact metric quality, complete adjacent calendar weeks, at least 25% movement, a prior baseline of 20 counts or 600 seconds, and an absolute change of 10 counts or 300 seconds. An otherwise partial project report may still contain an exact durable counter; sampled, capped or unavailable source coverage cannot qualify. One finding per project limits noise. Zero latest-week totals can report a decline; a zero baseline cannot produce an invented percentage. Analysis carries the metric, week, values and source identity, with an investigation suggestion and no causal attribution. Readers reconstruct admitted analysis from the frozen source figures and reapply current public membership, so stored prose or withdrawn projects cannot leak through the findings. The Worker does not write GitHub issues or receive GitHub credentials; actionable findings enter the existing agent SITREP review.

Observed failure: the activity hub could describe game radio listening but could not answer whether products were used. #34 now owns seven-project measurement and reporting, explicitly including App Composer. This extends the earlier #18 discovery boundary; it does not centralise game saves, accounts, competitive result validation or releases.

`woodhouse.portfolio-analytics/1` is an aggregate-only source contract with UTC periods, source timestamps, collection dates, metric definitions, units, quality and daily history. Fixed production URLs, five-second reads, 192 KiB limits, redirect refusal and strict field projection prevent arbitrary fetches or upstream private fields. Source membership remains the existing published public-safe EmDash portfolio, plus Woodhouse itself. Missing data is unavailable, never zero. Sampled and capped metrics cannot earn exact records.

The existing D1 `DB` gains separately prefixed `wh_analytics_*` application tables from `migrations/0001-portfolio-analytics.sql`; EmDash core schema/migration records are untouched. `/api/engagement` is the sole fixed mutation handled before the CMS publication boundary. It admits exact production origins/project modes for Woodhouse, SHOALSHOT and Protocol 11; bodies are bounded to 2 KiB and allowlisted fields, session/event identifiers are hashed, and IP-derived minute buckets limit requests. DNT/GPC, designated QA and obvious automation are ignored. Event IDs deduplicate for 90 days; visit/engaged markers deduplicate by tab session. Atomic SQLite triggers preserve daily counts after private event/session expiry. Active increments cannot exceed session wall time. These are browser reports, not proof against determined fabrication. The original anonymous path requires no persistent browser identity; the optional browser-return extension below is separate and default-off.

`/api/portfolio-analytics?project=...&days=7|30|90` publishes those local aggregates. Other projects own their own collectors and public adapters. `wh_analytics_reports` freezes sanitized report snapshots; `/api/portfolio-report.json?report=<id>` and `/api/portfolio-card.png?report=<id>&project=<slug>&format=landscape|square|portrait` recheck current public membership. resvg renders local SVG with the existing OFL Bricolage typeface into PNG inside the Worker, with no external image service. The three layouts share numbers and provenance, not crops. Daily details have a semantic table; records compare only complete Monday–Sunday UTC weeks. No current week, short history or capped/sampled series earns a record.

The main activity route disables path-only Astro response caching because project, period and pinned reports differ by query. Existing listening report URLs redirect to the retained listening experience. `/activity/measurement/` describes collection, exclusions, retention and Woodhouse's browser opt-out. The site typecheck excludes ignored `output/` video workbenches: those generated reference sources are not deployed site code and previously produced unrelated type errors; the files themselves are untouched.

### Chart workbench and custom windows — reviewed 16 October 2026

Observed failure: the first ledger required MP to interpret numbers without sufficient context and could promote historical production verification into an apparent growth comparison. `/activity/` now centres a locally bundled modular Apache ECharts SVG plot, native UTC date inputs, source-specific measures, a day inspector, chart CSV and an explicit daily coverage calendar. Server SVG and semantic tables remain available without chart JavaScript. No third-party analytics service, remotely loaded chart script or new Cloudflare resource is introduced. The published source register and investor readout distinguish recorded activity, comparable history, returning browsers, cohort retention and commercial evidence.

The aggregate APIs accept either preset `days=7|30|90` or inclusive `from=YYYY-MM-DD&to=YYYY-MM-DD`, with real ordered UTC dates, no future endpoint and 1–90 days per window. A selected historical endpoint constrains actual source queries; missing/expired history stays null. Snapshot cache keys and content identity include the entire window, including the closed-calendar flag. Existing saved preset reports remain readable. Source coverage may declare `comparableFrom`; absent or null boundaries cannot earn a weekly record, and the first boundary day is conservatively excluded. Legacy historical counts are retained and labelled, never guessed away. Closed calendar dates alone cannot establish source completeness.

Frozen PNG layouts accept the same allowlisted `measure` as the chart and render actual daily series with explicit dates and limitations. Landscape, square and portrait are authored independently. The default portfolio view does not sum game starts, bounded app opens or music seconds into a common engagement score. Browser distincts remain period-owned measures rather than sums of daily distincts.


### Optional Woodhouse browser returns — reviewed 16 October 2026

Observed failure: tab visits could not distinguish a consenting browser returning in a different session. The existing collector accepts an optional validated random UUIDv4 `browserToken` without changing anonymous event counting. Woodhouse's existing measurement-choices page offers separate explicit, default-off consent; the same telemetry script saves a per-origin token only after that choice and rotates it after 90 days. DNT/GPC, QA, preview, global opt-out and each-send privacy checks dominate consent. Revocation latches in memory before independent consent-write/token-removal attempts, so readable stale storage cannot re-enable a queued active-time report. Storage failures have visible page-scoped versus future-page wording.

`migrations/0002-analytics-browser-returns.sql` adds two prefixed application tables and indexes to the existing D1 database. Apply the reviewed forward SQL directly after recovery bookmarks in each environment, before deploying the new code; do not use the EmDash core migration ledger. It is idempotent and does not alter existing event rollups. `wh_analytics_browser_visits` pins a project-domain-separated hash to one accepted visit per tab session; associations expire after 90 days during collection and hourly refresh. `wh_analytics_browser_coverage` retains only the first accepted consent timestamp. No raw token, session ID or cross-project identity appears in public aggregates.

Browser totals count distinct retained identifiers over the selected window, never sums of daily distincts. Returning browsers require an earlier different accepted tab session, including same-day returns; earlier retained visits may precede the selected window. Opt-in counts remain partial, precollection periods and windows intersecting expired identity history remain unavailable, and these metrics cannot earn exact weekly growth records. They establish neither unique people nor cohort retention. The first consent day remains partial. Only Woodhouse currently stores browser associations and advertises support. Optional tokens from Protocol 11 or SHOALSHOT are ignored while their ordinary anonymous events continue counting; wire compatibility cannot establish pre-adoption identity history. Their own reviewed consent-client release must precede enabling identity storage and those reports. Existing anonymous daily counters survive raw expiry.

### Protocol 11 mode subtotals — reviewed 18 October 2026

Observed failure: accepted gameplay events already carried the mode that was played, but `wh_analytics_rollup` stored only the event kind, and the 90-day raw-event retention then deleted the only other copy. Local play (Classic, Journey) and online play (private room, public matchmaking) could not be separated in durable history or in the public report.

`migrations/0003-analytics-mode-rollup.sql` adds `wh_analytics_mode_rollup`, a second `AFTER INSERT` trigger on `wh_analytics_events` that writes the same accepted event under its kind plus its mode (`game_start_classic`, `active_time_public_matchmaking`). The existing rollup is untouched: both triggers fire on the same accepted insert and an ignored duplicate fires neither, so an overall counter and its subtotals can only move together. Only the additive gameplay kinds are split. Visits and engaged sessions are tab-session markers, and one tab session can span several modes, so a per-mode session count would overlap and double-count; those measures stay whole and the report says why.

The same file backfills the split from retained raw events with a replace-style (`excluded.value`) upsert, so re-applying the forward SQL is idempotent rather than additive, and records only UTC days strictly after the 90-day retention floor. A boundary day that retention has already trimmed stays a gap: the durable overall counter outlives its events, and no earlier split can be reconstructed, guessed or interpolated.

The endpoint publishes mode measures only for a product whose client reports more than one mode. Each mode metric's definition states what it counts, the exact event kind and mode included, that it is additive with its parent measure, and what it does not mean. The reader computes the split's own coverage start, so days before the split exists are gaps rather than zeroes, and the page groups the measures as Local play and Online play beside the detailed per-mode measures instead of asking a reader to assume the arithmetic. `scripts/deploy-publication.mjs` requires `wh_analytics_mode_rollup` to exist before publication, so a release cannot ship gameplay reporting without its durable split.

Official D1 [SQLite support](https://developers.cloudflare.com/d1/sql-api/sql-statements/), [atomic sequential batches](https://developers.cloudflare.com/d1/worker-api/d1-database/) and [pricing](https://developers.cloudflare.com/d1/platform/pricing/) were rechecked on the review date. This uses existing bindings, bounded ingestion and indexed queries; it adds no resource, provider, credential or paid commitment. Source tests are local qualification, not a production or physical-device claim.

## Public builder examples — reviewed 18 October 2026

The Factory page now explains useful connections rather than repeating the project directory. Its music and app examples are gated by existing published project identities. Two EmDash field notes retain the explanation and source boundaries for human readers and agent search. The project pages expose the same direct examples.

`public/lab/game-music.html` is a dated copy of FM’s already public standalone fixture, pinned to its 1.2.0 browser client. Woodhouse provides the independent serving origin; FM retains the catalogue, client, quick-start and canonical audio implementation. The copy changes only public presentation and links, and must be compared with FM’s source when refreshing. It introduces no audio service, credential or application storage. Gameplay and generated local effects stay independent of SDK, station and media availability. Browser playback progression is distinct from human listening and physical-device acceptance.

The evergreen social artwork now uses a checked-in generated illustration master with editable type in the existing renderer. New metadata uses dated JPEG paths; retained legacy image paths still resolve. Historical cards keep their original content. The read-model cache prefix changes for this reviewed content installation so an older out-of-band CMS projection cannot hide the new stories.

### Illustrated technical plates — reviewed 18 October 2026

Observed failure: treating D2 exports as finished artwork missed MP's visual brief; generated phone lettering then failed at reading size. The retained PNG masters and exact prompts in `scripts/assets/technical-plates/` provide the landscape illustrations. `scripts/phone-technical-plates.mjs` composes phone editions with native SVG lettering, exact paths and clipped illustration details. The editable `diagrams/*.d2` files remain system models and public downloads, explicitly labelled as such. Per-plate descriptors bind the actual master and model hashes so a changed model cannot silently publish its former picture. `pnpm diagrams` validates those models and reproduces both published editions using the existing tools and fonts. Native descriptions and transcripts remain in the reading surface. These sources and checks establish reproducibility and system meaning; MP's taste acceptance remains separate.

## Working exhibits — reviewed 20 October 2026

An exhibit is a bounded interactive island that runs on this site and shows a real capability with its parts left visible. Two exist, each with its own visual language and its own subject matter. They add no collection, service, registry or paid commitment, and they reuse the existing Astro, EmDash and Cloudflare arrangement.

`src/scripts/exhibits/patch-bench.ts` drives **the patch bench**. The scene is real HTML inside a CSS 3D space, so focus, text and controls stay usable and only the run is drawn on a canvas. The scene is composed in projected screen space and converted back to world space, so a module can never drift away from the place the cable that reaches it was drawn. Every position is a damped spring: a visitor who reverses a pull halfway through sees the scene follow the new intention rather than finish an obsolete animation. Reduced motion snaps the springs and keeps every function.

Audio has one owner. The page creates one `AudioContext`, one effects bus and one music bus, and routes LoftwahFM's stream through the published host-gain transport so the run can duck the music by moving one gain without ever pausing or resuming it. The client is loaded from `public/exhibits/fm-sdk-loader.js` at runtime rather than bundled, so the pinned 1.2.0 module is fetched from LoftwahFM's own origin exactly as a game would import it. Disconnecting the music stops the stream through that same client and reconnects on the same transport: one engine, no lost run state. Nothing starts sound before a deliberate gesture.

`src/scripts/exhibits/source-plate.ts` drives **the source plate**. It reads the published Here / there contract through `src/pages/api/guestbook-items.json.ts`, a read-only pass-through that normalises the provider's response and falls back to the checked-in copy in `public/exhibits/guestbook-items.json` when the provider cannot be reached. The route exists because the provider publishes its contract without permissive CORS headers, so a browser on another origin cannot read it directly. It stores nothing, accepts no writes and creates no account. The rule the exhibit demonstrates — a contribution that is not public produces no composed card — is written down in `src/data/guestbook-contract.ts` and tested. The visibility switch changes the demonstration only; nothing is sent to the provider.

Both exhibits keep their shareable state in the address bar through `src/data/bench-state.ts`, which is tested. A shared link reopens an exhibit in the state it describes and never claims an interaction that did not happen. The game-music dispatch carries the bench with a "Show me" control that asks the bench for a particular state, so a reader can stop at the decisive moment and change the condition being explained.

`src/components/exhibits/PatchBench.astro` and `src/components/exhibits/SourcePlate.astro` hold the markup and the scene styles. The exhibits are pages under `/exhibits/`, discovered from Home, Factory and the relevant dispatch.

## Portfolio edition and prospective discovery — reviewed 23 October 2026

The published `one-more-round` EmDash dispatch binds its edition route to an
existing immutable public report through a validated internal link. No new CMS
collection or analytics store is added. The edition and image endpoint reject
alternate snapshots; current public project admission still controls projections.
Existing outcome stories now include all four priority games, including a
Protocol 11 Classic subtotal. Producer units govern duration formatting.

Resolved public pages supply only an allowlisted edition/story and stored report
identity to the existing anonymous event client. The collector validates that
report before accepting context and uses existing event/rollup storage and
retention. Story arrivals and ten-second active exploration deduplicate within
an anonymous tab session and context; native openings remain repeatable deliberate
activations. Separate aggregate reads cannot establish a sequence or rate.
No raw URL, referrer, cross-site identity or downstream-use observation is added.
The first accepted attribution day remains partial and older attribution stays
unavailable. The existing opt-out, DNT/GPC, preview and verification exclusions
apply before collection. Returning from a native tab resumes the same page's
active-time timer without inventing another session.

## GitHub project leaderboards — reviewed 24 October 2026

`/activity/leaderboards/` reads saved GitHub counts from the existing
`wh_analytics_reports` table (`days=0`, separate schema). The explicitly reviewed
identity/repository list is in `src/data/github-leaderboards.ts`; token access
never expands it. The existing hourly production handler checks the installed
credential and collects one 180-day history per completed UTC day. The 7/28/90-day
views compare equal preceding periods; raw issues, PRs, event bodies, authors,
branches and repository paths are never persisted. Bounded pagination (100 pages
per source, 850 requests overall) excludes PRs from issue creation and closure,
counts merges by `merged_at`, and deduplicates IDs. Missing/incomplete history
earns no rank. Closures include repeat closures; net issue movement subtracts
new and reopened issues. Transfers/deleted records are not reconstructible and
are explicitly excluded from an audited historical-backlog claim.

A failed collection retains the dated last successful report. Reports have
content-derived IDs; saved views, captions, ranking/project PNGs and OG previews
retain the same period, lens and selection. Daily counts remain inspectable from
`/api/leaderboard.json`. A private `days=-2` permission receipt records only read
successes, time and conditional-request ETags; no public route reads it.

Reviewed 24 October 2026 after MP's X composer rejection: `/l/` losslessly encodes
the existing report ID and preserves nondefault period, measure and project in
its path, redirecting to the same saved view without another alias store.
Caption text is editable and copied separately from the link; native image
sharing sends only a file. Current PNGs request `v=2`; the original image URLs
keep their previous lettering and figures.

The approved optional local secret is `WOODHOUSE_GITHUB_TOKEN`. The release
scripts accept it when present and preserve an existing remote installation when
omitted, following [Cloudflare's secret rules](https://developers.cloudflare.com/workers/configuration/secrets/).
Production publication verifies its secret name before and after deploy. Preview
can use a reviewed saved report without a GitHub credential. The existing
`collect-leaderboards.mjs` backfill path uses the local configured token or the
authenticated GitHub CLI; it writes only approved counts under ignored output.
It is separate from the production Worker's credential check. The intended PAT
is fine-grained: Issues, Pull requests and Metadata read-only for the selected
repositories. Missing/expired credentials leave the last successful report dated;
rotation replaces the same Worker secret through the guarded release path, never
through public chat or committed files. #124 remains outside this work.
