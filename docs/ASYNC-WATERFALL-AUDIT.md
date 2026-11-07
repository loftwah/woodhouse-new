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
