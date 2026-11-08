# Async-waterfall audit

Reviewed 8 November 2026 on `b8a313d`. Issue #163 asked for a measured audit of sequential
asynchronous work in request paths, not a blanket `Promise.all`. This record is the Woodhouse
inventory: which reads are independent, which sequencing is deliberate, and what changed.

## Method and what counts as evidence

- Source inventory of every request path that awaits more than once: page frontmatter, API routes,
  the Worker wrapper, the layout, engagement ingestion and the scheduled handlers. A pair qualifies
  only when the second read does not consume the first read's result.
- Production timings come from the `server-timing: render;dur` header on cache-busted requests
  (`?audit=<nonce>` on the analytics route; `/?audit=` is accepted and ignored). These are
  uncontrolled samples over the public network, not a benchmark. They include isolate start-up and
  edge variance.
- The concurrency proof is a focused test with a gated fake D1 that records dispatch time
  (`src/data/analytics-waterfall.test.ts`). It proves which statements are issued together and that
  gating still suppresses reads that must not run. It does not model SQL, so behaviour is separately
  covered by the existing real-SQLite suite (`src/data/portfolio-analytics.test.ts`).
- No provider credits were spent, no load test was run and no production query was altered.

## Fixed

### `localAnalytics` — `/api/portfolio-analytics` and the `/activity/` report

`src/data/engagement.ts:localAnalytics` built its report from six statements that depend only on the
project and the reporting window:

| Statement | Depends on | Why independent |
| --- | --- | --- |
| `MIN(day)` for the project | project | Collection start, not derived from any other read |
| daily rows for the window | project, window | The range is computed from the window, not from `MIN(day)` |
| mode-start days (`GROUP BY metric`) | project, split modes | Only used to decide where a mode split may begin |
| browser coverage start | project | Only gates the browser pair |
| browser daily series | coverage start, window | The pair reads the same table; neither answers the other |
| browser period totals | coverage start, window | Same |
| referral rows | project, window | Same event stream, separate aggregate |

Before: these ran in up to six serialised round trips (five for Woodhouse, three for a game
project). After: one stage of at most four independent reads, then — only when coverage exists — one
stage of the two browser reads. The statements, their gating (`available`, split modes,
Woodhouse-only referrals) and the response shape are unchanged.

Measured before (origin render, ms):

| Path | Samples | Min | Median | Max |
| --- | --- | --- | --- | --- |
| `/api/portfolio-analytics?project=woodhouse&days=30` | 12 | 17 | ~50 | 251 |
| `/api/portfolio-analytics?project=protocol-11&days=30` | 8 | 12 | 22 | 66 |
| `/activity/` | 8 | 36 | ~75 | 814 |

The sample is bimodal (roughly 19 ms and roughly 80 ms for the same Woodhouse URL), which is larger
than any plausible per-statement saving. The honest reading is that the sample cannot attribute the
change to one cause; the structural proof is the dispatch test, not the timing.

Measured after the same release (same probe, same route, cache-busted):

| Path | Samples | Min | Median | Max |
| --- | --- | --- | --- | --- |
| `/api/portfolio-analytics?project=woodhouse&days=30` | 12 | 8 | ~16 | 71 |
| `/api/portfolio-analytics?project=protocol-11&days=30` | 8 | 6 | ~21 | 30 |
| `/activity/` | 8 | 41 | ~62 | 595 |

The Woodhouse median moved from ~50 ms to ~16 ms and the game project barely moved (22 → 21 ms),
which is the direction the change predicts: Woodhouse had the longest waterfall (five serialised
reads against three). It is still one uncontrolled sample on a quiet host, taken at a different time
of day, with a before distribution that was already bimodal. **Do not quote the 34 ms difference as
a guaranteed saving.** The claims that do hold are that the same six statements now occupy two
round-trip stages instead of six, and that the response body was byte-identical (apart from
`generatedAt`, `coverage.through` and `source.revision`) before and after the production deploy for
Woodhouse, Protocol 11 and SHOALSHOT.

Release: `b8d1757`, Worker `491e6651-9f1c-4bf6-8c7c-5bfc1a1d43b1` at 100%, preview
`7b2f20ec-3218-4aeb-ab95-ab365edd8e50`, scoped audit on `/activity/` (30 link targets, 9/9 credential
paths clean), build identity `sha256:bce52458c9a6…` clean tree. The audit scope covers the page;
the JSON route was verified by comparing its production body before and after, because
`audit:pages` correctly refuses to treat a JSON document as an HTML page.

## Second slice — the deferred independent pairs

Released 8 November 2026 from `23e6283`. This takes the candidate list below rather than leaving it
for a later audit, and records one correction to the first slice's reasoning.

| Call site | Pair that now runs together | Why it is independent |
| --- | --- | --- |
| `src/pages/projects/[slug].astro:64-70` | `listProjectRecords()`, optional `getEditorialDispatch()`, `listPublicCapabilities()` | Three separate reads dispatched after the dossier is resolved and the 404 decided. The capability wrapper keeps its own rules; the page does not reimplement them. |
| `src/pages/activity.astro:76-81` | `listPublicEvidence()` started before `listProjectRecords()` is awaited | The report joins both; neither narrows the other. The identity gates still decide the 503/404 first. |
| `src/pages/activity/leaderboards.astro:29-36` | `readLeaderboard()` and `listProjectRecords()` | Different stores, joined only when the snapshot is narrowed. The missing-board 404 still precedes the 503. |
| `src/pages/api/portfolio-report.json.ts:30-41` | `readPortfolioReport()` and `listProjectRecords()` | Different stores. The CMS failure still decides the 503; the report read is attributed as `report-read`/`database` only once it is awaited. |
| `src/pages/editions/one-more-round.astro:40-49` | `readPortfolioReport()` and `loadStoryDistribution()` | Both key off the edition's fixed snapshot id and read different tables. |

### Correction: EmDash already dedupes repeated collection reads

The first slice recorded that `listPublicSearchItems` and `listProjectRecords` being called twice in
one base-layout request was "duplicate work … removing it needs a request-scoped cache". That was
wrong on the database cost. EmDash's `getEmDashCollection` passes collection reads through
`requestCached()` (`node_modules/emdash/dist/query-eR_Nz70M.mjs`), so an identical collection read
inside one request is served from the request's own cache, not a second D1 round trip.

Measured evidence for the correction: `/projects/[slug]/` used to call `listProjectRecords()` twice
(once directly, once inside `listPublicCapabilities()`). Removing the second call changed the served
`db.count` from 19 to 19. The duplicate cost repeated projection CPU, not a round trip. The first
slice's other structural claims stand; this one does not.

### Before and after

Cache-busted requests, `server-timing` `render;dur` in milliseconds, eight samples per route, taken
minutes apart on the same host:

| Route | Before (median, min–max) | After (median, min–max) | `db.count` |
| --- | --- | --- | --- |
| `/projects/bubbles/` | 96 (66–443) | 85 (52–637) | 19 → 19 |
| `/activity/` | 77 (51–318) | 51 (31–107) | 9 → 9 |
| `/activity/leaderboards/` | 57 (25–106) | 29 (18–58) | 7 → 7 |
| `/editions/one-more-round/` | 135 (41–182) | 47 (34–117) | 10 → 10 |

The query count is unchanged, which is the honest expectation: overlapping independent reads removes
serial waits, not statements. The render medians moved in the predicted direction on three routes and
not on the project page, `db.total` moved both ways, and the largest before-sample outlier (637 ms
after) is a cold isolate. **This sample cannot attribute the difference to the change.** The claim
that holds is structural: five request paths that awaited independent reads one after another now
await them together, and the site's output did not change.

### Output equality

- `/projects/bubbles/`, `/projects/app-composer/`, `/activity/`, `/activity/leaderboards/` and
  `/editions/one-more-round/` were captured before the release and after it. After stripping
  Cloudflare's injected `__CF$cv$params` challenge script and `/activity/`'s per-request
  `createdAt` millisecond, all five are byte-identical.
- Capability record counts on the two project pages are unchanged (16 and 13).
- Both saved-report JSON bodies are identical before and after, excluding `generatedAt`,
  `coverage.through` and `source.revision`.
- `/projects/not-a-project/` → 404, `/api/portfolio-report.json?report=bogus` → 404, the same route
  with no parameter → 400, `/activity/leaderboards/?report=bogus` → 404.

Release: preview Worker `71a711c0-c59a-42b0-8cee-15c4ca7a771f`, production Worker
`be5bef4a-ed5f-489d-8646-5c425cc3a06c` at 100%, build identity `sha256:a2540b87b1be…` from a clean
tree, content generation unchanged at `sha256:3830ff69a537…`. Scoped audit on the five affected
pages: 111 link targets, 5 unique titles, 3 social images, 9/9 credential paths clean.

Limits: no unit test covers Astro page frontmatter or route wiring — the handlers bind to
`cloudflare:workers` and there is no injectable seam without adding a layer this issue did not ask
for. The proof is rendered-output equality plus status behaviour, not a dispatch-order test. Only
Woodhouse's own paths are covered; the project-local tickets remain with their repositories.

## Intentionally sequential

| Path | Sequence | Why the order carries meaning |
| --- | --- | --- |
| `src/data/engagement.ts:collectEngagement` | bucket hash → rate-limit `INSERT … RETURNING` → report validation → `db.batch` | Admission must precede storage; validating a report only after admission stops arbitrary identifiers driving report parsing. The hashes are local CPU and cheap; overlapping them would not justify reordering the gate. |
| `src/data/portfolio-reports.ts:createPortfolioReport` | recent-report lookup → per-project load → history → digest → insert | The digest binds the exact saved body; the lookup decides whether a saved report is reusable. Background/report creation, not a page read. |
| `src/data/analytics-schedule.ts` | `db.batch` rollup → report creation | Cron; a report must be built from completed rollups. |
| `src/plugins/woodhouse-enquiries.ts:allowRequest` | per-IP increment → global increment | Two counters with a rejection contract; order is the contract. |
| `src/plugins/enquiry-workflow.ts` | persist → notify | Notification of an unsaved enquiry would be false. |

## Candidate, not changed in this slice

These are real independent pairs. They are recorded with the exact call site so the next slice can
take them without re-deriving the analysis. (The first five were taken in the second slice above;
the base-layout pair is retained.)

| Call site | Pair | Why it is independent |
| --- | --- | --- |
| `src/pages/api/portfolio-report.json.ts:28,46` | `listProjectRecords()` → `readPortfolioReport()` | The identities narrow the report after both reads; the read itself does not need them. Same shape already accepted for `/api/leaderboard.json`. |
| `src/pages/activity/leaderboards.astro:28,31` | `readLeaderboard()` → `listProjectRecords()` | The snapshot is narrowed by the identities after both reads. |
| `src/pages/activity.astro:76,105` | `listProjectRecords()` → `listPublicEvidence()` | Both feed `createPortfolioReport`; neither needs the other. |
| `src/pages/projects/[slug].astro:62,103,113` | `listProjectRecords()`, `getEditorialDispatch()`, `listPublicCapabilities()` | Three independent CMS reads after the dossier record. |
| `src/pages/editions/one-more-round.astro:20,40` | dispatch/identity pair → `readPortfolioReport()` | The stored report id is fixed by the edition, not by the other reads. |
| `src/layouts/BaseLayout.astro:62,140` | `getSiteSettings()` → the five menu/search/project reads | Settings only feed metadata; they do not gate the reads. Moving them would reorder the whole metadata block for one read. |

## Not hot / no opportunity

- Single-read routes (`rss.xml`, `build.json`, `sitemap-*`, `l/[...view]`, `share/[slug]`,
  `statuses/[slug]` after its parallel pair) have nothing to overlap.
- `src/pages/api/guestbook-items.json.ts` is a deliberate provider-then-snapshot fallback: the
  second fetch exists only because the first failed.
- The Worker wrapper does no I/O of its own before delegating; its header work is synchronous.
- `listPublicSearchItems` and `listProjectRecords` are called twice in one base-layout request
  (once directly, once inside the search list). EmDash's `requestCached()` already serves the second
  identical collection read from the request cache, so this costs projection CPU rather than extra
  D1 round trips (see the correction in the second slice). Removing the projection work itself would
  need a request-scoped memo in this repository; it is not attempted here.

## Limits

- The production sample measures the whole render, so it cannot attribute time to one statement.
  D1 is single-threaded per database: overlapping statements removes client round trips, not SQL
  execution time.
- The concurrency test proves dispatch order, not latency. It would pass on a database that answers
  instantly.
- Cross-repo project-local audits and the portfolio summary remain with #163's linked tickets; this
  record covers Woodhouse only.

## Portfolio summary — reviewed 8 November 2026

This is the #163 cross-project read of the 13 linked tickets. It separates measured wins from
intentional sequencing and from tickets that still have no evidence. A ticket being closed is not by
itself evidence; the disposition below is based on what the ticket records.

### Confirmed wins with measured or structural evidence

| Ticket | Evidence | Limit |
| --- | --- | --- |
| [App Composer #407](https://github.com/loftwah/app-composer/issues/407) | `readResourceInventory` moved from three serial D1 statements to one concurrent stage: **126.5 → 42.2 ms median** with a fake D1 adding 40 ms per read (3.0×). Overview scope reads, `/api/composition.json` sources/releases and the published-stack card identity also overlapped. Release PR #413, main `703a8fc5`, Worker `3b263d3c`. | Local Node harness, not a production p95. |
| [Fighter #410](https://github.com/loftwah/fighter/issues/410) | Portfolio-analytics manifest read now starts with three independent D1 aggregates. Synthetic fixed-delay span: **p50 44.5 → 22.4 ms, p95 53.6 → 23.7 ms**. Production-verified SHA `97cd2871`, live smoke 130 ms TTFB. | Synthetic spans, not production percentiles. Player-facing paths were an evidence-backed no-op. |
| [SHOALSHOT #711](https://github.com/loftwah/shoalshot/issues/711) | Phaser boot stopped fetching every launcher rig and 18 specimens while Home was DOM-owned. Production first load **8,578 → 2,501 KB**, **74 → 29 requests**; Home interactive on 1.6 Mbps/4× CPU **5,351 → 1,987 KB**. | Bounded device/throttle sample, not field data. |
| [Protocol 11 #422](https://github.com/loftwah/protocol-11/issues/422) | Seven serial table stylesheet imports replaced by one ordered `table-app.css` chunk (75,675 bytes), with the cascade guarded by a test. Fresh lab sample: LCP 2,036 ms, CLS 0, INP 56 ms. | Lab sample, not field percentiles; no further waterfall justified. |
| [Bubbles #1581](https://github.com/loftwah/bubbles/issues/1581) | Leaderboard top page and total now start together (`Promise.all`), with a barrier test proving both statements are in flight and the existing 29 cloud leaderboard tests green. | No real-provider p50/p95; the ticket’s own last comment says the measured outcome report remains open. Closed with that gap stated. |
| [Foilbury #3](https://github.com/loftwah/card-collector-bot/issues/3) | Local Chromium and route measurements: `/play` images **6.9 MB → 0.9 MB**, a fully derived collection **1.36 MB → 94 KB**, showcase videos no longer preload 3.7 MB, serial collection progress loop removed. Deployed with the 2026/11/04 release (Worker `4da539c4`). | Production percentile/field monitoring is not claimed; the ticket remains open for that residual. |
| [Woodhouse #163](https://github.com/loftwah/woodhouse-new/issues/163) | `localAnalytics` six-statement stage plus five independent request pairs; dispatch-order test and rendered-output equality recorded above. | One uncontrolled latency sample; no p95 or load claim. |
| [LoftwahFM #328](https://github.com/loftwah/loftwahfm/issues/328) | `/radio/` read every edition manifest twice and in series: `RadioEditions.library` (12 serial R2 reads) and the page's per-edition `version()` (12 serial D1 + 12 R2). `/api/radio/v1/stations` read both editorial stations twice, once for the list and once for the All Stations mix. Both are now one bounded stage, with the page order, cursor and per-show failure shape preserved. Controlled 40 ms/read span: library **492.7 → 41.5 ms**, station registry **328.4 → 83.0 ms**. Production: `/radio/` **2,059 → 571 ms** median, `/api/radio/v1/stations` **432 → 171 ms** median; stations JSON byte-identical; page HTML identical apart from build hashes. Release `af01a0d`, Worker `b2fb1955`, 27/27 HTTP and 8/8 browser smoke. | Uncontrolled public-network medians, not p95 or field data. `/radio/` still reads each edition manifest twice per request; the pair is now concurrent, so it costs reads rather than latency. |
| [MAX #141](https://github.com/loftwah/max/issues/141) | `/settings` awaited five independent reads about one identity one after another. They are one `readSettingsOverview` set now. Controlled 40 ms/read span: **212.5 → 42.2 ms** median. Release `718a39c`, Worker `64bec3f2`, receipt-matched production build, 13-check local release gate. | Authenticated route, so the changed path was not driven on production; the unauthenticated boundary and build identity were. |

### Intentionally sequential

| Project | Sequence retained | Why |
| --- | --- | --- |
| App Composer | release/promotion/migrations/provider mutations; dependent readiness probes; sitemap cursor pagination; four Overview problem-source reads with the inventory read | Mutations and gates are ordered; the four extra reads could exceed D1’s six simultaneous connections. |
| Bubbles | rate limit before leaderboard reads; auth/session checks and result-publication writes | Admission and publication ordering are part of the contract. |
| Fighter | fight-start art wait; analytics event POST; character suggestions | Product-authorised asset wait; event order; rate-limit → reserve → email → confirm is transactional. |
| Protocol 11 | single ordered `table-app.css` import before React render; synchronous session/local-save restore | The stylesheet is required before render; restoration is not asynchronous. |
| Woodhouse | engagement admission → storage, report digest → insert, cron rollup → report, per-IP → global enquiry counters, persist → notify | Recorded with call sites in the section above. |
| Pirates #495 | all optimisation | The ticket is explicitly parity-gated/deferred; source parity and qualification override opportunistic speedups. |
| LoftwahFM | station/album access gate → playlist read, audio admission → `head` → media serve, publication validate → store → generation check, rate-limit check → album access decision | Publication, economy and playback ordering are the contract; each call site is recorded in #328's inventory. |
| MAX | Turnstile → abuse limits → digest → store → delivery → unsubscribe token (waitlist); authorise → dispatch → gateway exchange → mark applied → audit (device command); voice transcribe → command | Consent/suppression/storage ordering, permission and audit ordering, and a command derived from a paid transcript. |
| Liferaft | one MBOX stream → per-message parse → synchronous inserts; single-message preview stream; manual attachment export loop; renderer startup `refreshArchives → refreshStorageInfo → runSearch` | Bounded memory, progress accuracy and deterministic recovery; search consumes the archive filter the previous call narrows. |

### Evidence-backed no-ops

These tickets found no independent asynchronous pair whose overlap reduces a person's wait. The
conclusion is the deliverable, and each ticket records the inventory that supports it:

- [Liferaft #4](https://github.com/loftwah/liferaft/issues/4) — the only long path is one sequential
  MBOX stream whose per-message parse is CPU-bound and whose inserts are synchronous
  `better-sqlite3`; `Promise.all` cannot overlap either. Search and preview are single synchronous
  or single-stream reads. The renderer's startup chain is ordered because search consumes the
  archive filter `refreshArchives` has just narrowed. No patch.
- [Bogan Hustler #19](https://github.com/loftwah/bogan_hustler/issues/19) — the app makes zero remote
  calls. Persistence is `localStorage`, the "async" thunks are synchronous payload creators, and the
  only awaited browser promise is `HTMLMediaElement.play()` under a single audio owner. No patch.

### Parked by the owner — archived repositories

MP parked both of these deliberately. Archiving makes `main` read-only, so a change cannot be
integrated and an issue comment or close cannot be posted; the tickets stay open as the record of
work that is finished but cannot land while the projects are parked. **This is a decision, not an
outstanding task.** The work is preserved so that resuming either project costs a push, a deploy and
a verification — not another audit.

| Ticket | Local state | Resuming costs |
| --- | --- | --- |
| [Asset Hunter #124](https://github.com/loftwah/asset-hunter/issues/124) | Branch `perf/124-page-reads` at `8edfa35` in `/Users/deanlofts/gits/asset-hunter`. The finding is real: **Effect 4's `Effect.all` defaults to concurrency 1**, so every "parallel" read set in the repo (wall, collections index, possibility page, `/api/catalogue.json`, both curator pages) was sequential. Fixed with explicit concurrency plus `src/lib/page-reads.ts` and `tests/page-reads.test.ts`; `npm run verify` 1,154/1,154 passed locally. One deploy was made and then **rolled back** to Worker `8372bf85` because production must not run a commit that is not on `main`. Controlled span: wall **83.5 → 42.3 ms**, possibility page **167.7 → 41.6 ms**. | Unarchive, push `perf/124-page-reads`, deploy, `npm run verify:prod`, post the evidence. |
| [Social Club #44](https://github.com/loftwah/club/issues/44) | Branch `perf/44-portal-reads` at `f4a1db8` in `/Users/deanlofts/gits/club`. The portal home awaited eight independent reads and read `member_facts` twice; `readPortalHome` now reads them in one stage and `usableFacts` keeps the single "safe to use in copy" rule. `node scripts/acceptance.mjs` passed; unit 65/65 and integration 74/74 passed; typecheck and lint clean. Not deployed. | Unarchive, push the branch, deploy the built Worker, post the evidence. |

### Portfolio position

Four of the six blockers now have evidence and are closed: two production-verified (LoftwahFM #328,
MAX #141) and two explicit no-ops their tickets allow (Liferaft #4, Bogan Hustler #19). Two are parked
with their work finished and preserved (Asset Hunter #124, Social Club #44).

#163 stays open on those two. That is the honest state rather than a completed portfolio: the audits
were done and the patches exist, but two repositories are deliberately not accepting changes. If MP
would rather the tracker reflect "portfolio audited, two projects parked" than "six of six landed",
closing #163 is a one-line decision — the evidence for the four delivered tickets is already on each
ticket.

Pirates #495 is not counted as a blocker because its own ticket explicitly defers the work behind
source parity. Bubbles #1581 and Foilbury #3 have evidence but retain stated measurement limits;
those limits are recorded above rather than converted into a claim of a production speedup.
