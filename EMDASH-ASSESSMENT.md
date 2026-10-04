# EmDash adoption assessment

Reviewed **5 October 2026**. Machine-readable review instant: `2026-10-04T13:55:00Z`.

This is the written recommendation [issue #2](https://github.com/loftwah/woodhouse-new/issues/2) asked for. It answers the eight acceptance questions with evidence, states what was measured and what was assumed, and names what was not delivered.

Two documents are adjacent and not interchangeable. [EMDASH.md](EMDASH.md) is the engineering record of the implementation: the content model, plugins, backups, privacy boundary and dated validation state. This one is the decision.

## Verdict

**Adopted, with two named mitigations and three follow-ups.** The verdict is not a prediction. EmDash is already the CMS backend of this site: D1 holds the content model and the published read model, EmDash owns collections, fields, relations, block types, revisions, scheduled publishing, media, menus, search records and the MCP endpoint, and the live production database was verified to match the reviewed schema and content. The question this document answers is no longer "should we adopt EmDash" but "what did adopting it actually cost, and what is still unfinished".

Nothing here compares against managed WordPress or Craft hosting on price. No such client bill is known to this repository, and inventing one would make the comparison worthless.

## What is evidence and what is not

**Measured in this environment:** the content model and every published record, via `verify:content` against both live databases. The public read model, via `/build.json` and its content digest. The deployed source, via the build identity the deploy gate compares. Full-text search, via direct queries against both rebuilt indexes. Public caching, via `pnpm run measure:visibility` writing a token straight into D1 and polling the plain public URL. Backup behaviour, by creating and restoring D1 dumps on preview. Page structure, links, canonicals, discovery, social images and privacy across 49 deployed pages. Response headers and build privacy over 741 build artefacts.

**Documented, not verified here:** EmDash's own behaviour for edit locking, the MCP scope model and multi-editor concurrency. These are established from EmDash's documentation and enforced in code and tests, but the end-to-end editor journey requires an authenticated session this environment does not have.

**Not done:** the live R2 restore drill (needs scoped R2 S3 keys), and every operator acceptance item in the deploy receipt. Both are recorded in [EMDASH.md](EMDASH.md) as open, not as passed.

## The eight acceptance questions

### 1. Can EmDash replace the CMS backend, not merely serve a frontend behind Cloudflare?

Yes, and this is no longer a claim. The production D1 database holds 105 tables: seven content collections, EmDash's schema and lifecycle tables, FTS5 indexes and triggers for the five searchable collections, revision rows for every published entry, reference rows for all nine relations, three menus with seventeen items, one taxonomy with eight terms and a byline. `verify:content` compares the live field types, required flags, defaults, searchable, unique, indexed and validation rules against `seed/seed.json` and reports `ready` for both environments. Content written outside the Worker — which is how the reviewed model is installed — reaches the live site through the same read path an editor's publish would use.

### 2. Can editors do the important Craft/WordPress workflows without unacceptable regressions?

Yes for the workflows this publication actually uses, with three real constraints.

The model that matters is seven typed collections with 121 fields, nine relations and eight versioned block types. Rich text is Portable Text inside `prose` blocks; repeating structures are relations between entries rather than repeaters inside a block; media is EmDash-managed and rendered through its own image path.

The constraints, stated plainly rather than hand-waved:

- **No nested blocks.** A `prose` block cannot contain another block type. Sections are flat lists of blocks.
- **No references inside blocks.** A reference is an entry field. This is why `dispatches.projects` is a field on the dispatch and not something a block inside the body could point at.
- **A select field's options are schema, not content.** `dispatches.kind` listed six options while the seed and the published record used a seventh. That disagreement was invisible to every check and only surfaced when a ninth project forced a report to be written; it is now fixed, and it is a good illustration of what "typed" does and does not guarantee.

What could not be exercised here: the full editor draft → preview → revision → schedule → publish journey, because it needs an authenticated session. It is one of the acceptance items the deploy gate still requires.

### 3. Can multiple humans and agents safely work on the same site?

Mechanically yes, and one boundary is enforced rather than documented.

EmDash exposes an authenticated MCP endpoint at `/_emdash/api/mcp` that requires a bearer token, with role checks enforced separately from token scopes. Agent Reception remains a separate public read-only surface with no tool access. `src/plugins/woodhouse-editorial-policy.ts` refuses agent-originated publication as an allowlist — the policy is what may be published, not what may not — and the plugin's tests cover both directions. Per-entry edit locking exists upstream; reproducing its behaviour needs two authenticated sessions.

Not verified: two humans editing the same entry, and an MCP client writing while an editor holds the lock. Both belong to the acceptance receipt.

### 4. Can our structured-content patterns be represented without turning everything into unvalidated JSON?

Yes. This is the clearest result. The read model is seven collections with typed fields, explicit defaults and validation, nine relations with declared parent and child collections and per-parent limits, and FTS5 indexes EmDash created and maintains. `verify:content` fails when any field's type, required flag, default, searchable, unique, indexed or validation differs from the reviewed seed, and when any seeded reference resolves to a different target than the seed names. It found and rejected real drift on preview during this work.

The place where the discipline would break is an entry body, which is Portable Text inside a `blocks` field. Its *structure* is validated; its *prose* is not, and that is correct — it is prose.

### 5. Does published content become visible reliably and within a known freshness bound?

**It did not, and it now does. This was found by measuring rather than by reading configuration, and the fix is in this repository.**

`pnpm run measure:visibility` writes a unique token into one published record directly in D1 and polls the plain public URL — no cache-busting parameter, because a query string addresses a different cache entry and would measure nothing. Against the deployed preview before the fix, the token was **never visible within 15 minutes**. The response declared `cache-control: no-cache`, the edge stored it anyway and returned `cf-cache-status: HIT` with an `age` that grew past 17 minutes without ever revalidating, and neither the origin's nor a request's `no-cache` changed that. The same path with a cache-busting parameter returned the new content immediately, which is what identified the edge rather than the origin as the stale layer.

The cause was ours: `astro.config.mjs` asks for `maxAge: 60, swr: 60` on public routes, and that intent never reached the response, so every public page declared `no-cache` while the edge cached it with an unbounded lifetime. `src/worker.ts` now states the intended bound on public HTML only — admin, preview and edit-mode responses keep `private, no-store` and `noindex`, and a response that already declares a usable directive keeps it. After the change a freshly created entry resets `age` and expires on the declared bound.

Two honest caveats. First, **entries stored before the fix do not self-heal**: a poisoned preview entry kept its unbounded age across the redeploy, because nothing in the repository can purge a URL from the edge cache — only a Worker-side `cache.purge()`, an editor's publish, or the dashboard. It is tracked as a follow-up. Second, **production was never affected**: the live site serves `public, max-age=0, must-revalidate` with no `age` header, so it revalidates on every request.

Upstream context, verified against EmDash 1.0.1: [emdash#2435](https://github.com/emdash-cms/emdash/issues/2435) is open and describes the absence of a programmatic purge path for content written outside the Worker, which is exactly the write path this repository uses. [emdash#2883](https://github.com/emdash-cms/emdash/issues/2883) — a build-time validator that never advances, with no ETag — was closed upstream on 30 September 2026, **after** the 1.0.1 this repository pins, and 1.1.0 was released on 1 October 2026.

### 6. Can we migrate and roll back predictably?

Yes, and the migration is behind us. Rollback has three independent layers: D1 Time Travel with a recorded bookmark, Worker version rollback, and the build identity endpoint that names the exact commit a deployed origin serves. `deploy-production.mjs` refuses to proceed unless the live origin reports the source it intended to ship, and it verifies public routes and privacy afterwards.

The one thing the migration could not do on its own was install the content model into production — which is now solved, and was the reason a first production deploy was impossible. See [ARCHITECTURE.md](ARCHITECTURE.md).

### 7. Can we recover from data loss?

Partly, and the gap is named rather than implied.

Proven: `pnpm run backup:d1` produces a private SQL dump and manifest, drops EmDash's FTS5 virtual tables only for the export, then recreates and reindexes them and checks that row counts match. This was rehearsed on preview.

Not proven: a live restore into a fresh non-production D1/R2 pair. The R2 recovery tooling exists — manifest, verified archive, isolated restore into a bucket that cannot be either live bucket — but the drill needs scoped, bucket-scoped R2 S3 access keys that are not configured. It is recorded as open in [EMDASH.md](EMDASH.md) and is a genuine gap in the recovery claim.

### 8. Is the resulting system materially simpler or cheaper enough to justify the move?

On cost: the infrastructure sits at the platform floor, and the honest number is the plan minimum rather than a computed saving. Assumptions are stated explicitly below and every price was read from Cloudflare's pricing page on 2 October 2026.

| Component | Measured or assumed | Position against the included quota |
| --- | --- | --- |
| Workers | $5/month minimum per account; 10M requests and 30M CPU-ms included | A publication of this size is orders of magnitude inside it. A cache hit still bills as a request; CPU bills only on a miss. |
| D1 | **Measured**: 2.17 MB across 105 tables; 398,868 rows read and 11,246 rows written in 24 h | Inside 5 GB, 25 billion rows read and 50 million rows written, by five to six orders of magnitude. |
| R2 | **Measured**: 0 objects, 0 B | Inside the 10 GB-month, 1M Class A and 10M Class B included. |
| KV | **Measured**: 0 keys in production; 19 in preview | Inside 1 GB, 10M reads and 1M writes. |
| Egress | Free on Workers and R2 | — |

**The D1 read figure needs a caveat and it is important.** It is *not* public traffic: production currently serves the older static build, so those rows come from the deploy tooling, the maintenance cron and verification runs. It is an upper bound on operational reads, not a traffic measurement. A reader-driven estimate belongs to whoever has real traffic; this repository does not.

What replaces a managed CMS bill is not a line item. It is the absence of platform patching, plugin maintenance, backup verification, uptime responsibility and security upkeep for a system this factory operates itself. That is a real reduction in operational surface, and it is also real work — which is why the recovery drill and the acceptance receipt still matter more than the hosting price.

## Upstream issues, verified against EmDash 1.0.1

Checked on 5 October 2026 against `emdash-cms/emdash`. Version tested is the one this repository pins.

| Issue | State | Bearing on Woodhouse |
| --- | --- | --- |
| [#3670](https://github.com/emdash-cms/emdash/issues/3670) — block fields cannot be searchable | **Open** (`bot:enhancement`, awaiting approval) | **Reproduces, and is observable here.** `_emdash_fts_dispatches` indexes `title` and `deck` only; the body of a dispatch is Portable Text inside a `blocks` field and is not in the index. The site's own keyboard and phone search is generated in application code from titles, decks and summaries, so it is unaffected — but body prose is not findable. Tracked as a follow-up. |
| [#2883](https://github.com/emdash-cms/emdash/issues/2883) — build-time validator never advances, no ETag | **Closed 30 September 2026** | Fix postdates the pinned 1.0.1. Relevant to the caching work above; 1.1.0 is available. |
| [#2435](https://github.com/emdash-cms/emdash/issues/2435) — no programmatic purge for out-of-band writes | **Open** | Directly load-bearing: installing the reviewed model is an out-of-band write. This is why the measured visibility bound had to be established empirically rather than assumed. |
| [#3529](https://github.com/emdash-cms/emdash/issues/3529) — misleading "Pending changes" for never-published entries | **Open** (`bot:declined`) | Editorial UI nuisance. Does not affect the public record. |

## What was not delivered, and why

Named plainly, because a recommendation that hides its gaps is not a recommendation.

- **The real-world migration corpus** — the Wikimedia, NASAPress, Pew, News Corp, New York Post, NASA.gov and XWP dossiers, the nine/9News status check, and the 126k-content/550-user scale simulation. This is a research programme of its own, not a spike on this repository, and nothing about Woodhouse's own adoption depends on it. Not started.
- **A live R2 restore drill.** Blocked on scoped R2 S3 credentials. Recorded as an open acceptance item.
- **Multi-editor concurrency results.** Needs two authenticated sessions. Recorded as an open acceptance item.
- **An authenticated MCP role-boundary demonstration.** Needs a token issued in the admin. Recorded as an open acceptance item.
- **A published public/editorial benchmark.** The infrastructure numbers above are measured; CPU time per request and cache hit ratio for real reader traffic are not, because the site has no meaningful traffic yet.

## Recommendation

**Adopted.** EmDash is the CMS backend, the schema and content are verified in both live environments, the privacy boundary is enforced in code and checked over every build artefact and deployed page, and the one genuine architectural blocker — delivering the content model to a remote D1 — is solved by a mechanism derived from EmDash's own tooling.

Two mitigations stand against the decision:

1. **EmDash 1.0.1 is pinned behind a released fix.** #2883 closed on 30 September and 1.1.0 shipped on 1 October. Staying on 1.0.1 keeps a known cache-correctness defect that this repository now works around in its own Worker. Upgrading is a separate, reviewable change with its own migration and acceptance pass.
2. **The recovery story is half-proven.** The R2 restore drill is unrun, so "we can recover from data loss" is currently a claim about D1 only.

Three follow-ups, all with the evidence above attached: make article body text findable despite #3670; evict the cache entries stored before the caching fix; and run the R2 restore drill once credentials exist.

Revisit this assessment if EmDash changes its block or reference constraints, if the pinned version is upgraded, or if the publication's traffic grows enough that the included quotas stop being comfortable.