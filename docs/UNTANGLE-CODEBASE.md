# Untangle pass

Reviewed 8 November 2026. #168 asked for Caldo's `untangle-codebase` skill to be adopted and
actually used. This record holds the reviewed skill, the decision log and what was implemented. It
is a bounded pass, not a finished untangle: the remaining findings are named with their call sites so
the next pass does not re-derive them.

## The skill

- Source: <https://github.com/caldoai/skills>, commit `f3cf47774975a7d9fca45730babf4ff7ad765ada`
  (5 November 2026), path `skills/untangle-codebase/SKILL.md`.
- Installed at `.agents/skills/untangle-codebase/SKILL.md`. The file is byte-identical to upstream:
  8,881 bytes, git blob `102ff57803e504876f6eb9b412e4eb0f6c576350`, which matches the GitHub content
  API's sha for that path. Verify with `git hash-object` after any re-fetch.
- Read before installing. It contains no network calls, no credentials, no install step and no
  instruction to publish repository content. It is a development-only skill: nothing in `src/` or the
  Worker imports it, and it adds no dependency.
- `disable-model-invocation: true` is upstream's own setting, so an agent runs it when asked rather
  than from a keyword. Optional Comments and Tests add-ons are **not authorised** by #168; this pass
  used neither.

## Method, and its limit

The skill's full process is one pass over the whole codebase, ending when subagents find nothing
worth fixing. That is a multi-hour exercise and was not attempted unattended. This pass used the
skill's categories on the areas #168 names — portfolio/publication model, EmDash interfaces,
evidence/analytics ingestion, privacy boundary and Cloudflare runtime modules — plus `pnpm run
deadcode` (knip) as the existing tool for surplus. The result below is what was inspected and
decided, not a claim that nothing else is wrong.

## Decision log

### Fixed — the public origin was a hidden link

`https://woodhouse.loftwah.com` was written out in the share captions, card renderers, report links,
analytics sources, sitemap, feeds, robots, the facts endpoint and the layout fallback. Changing the
domain meant editing every one, and a missed line would publish a link to the retired host with
nothing to notice.

`src/data/site-origin.ts` now holds `SITE_ORIGIN`. Pages keep their existing `Astro.site` and
`import.meta.env.SITE` precedence; the constant is the fallback those lines already had. Replaced in
`portfolio-analytics.ts`, `engagement.ts`, `portfolio-reports.ts`, `portfolio-card.ts`,
`portfolio-edition.ts`, `connected-stories.ts`, `share-browser.ts`, `share-desk.ts`,
`edition-share-kit.ts`, `site-metadata.ts`, `activity-sharing.ts`, `BaseLayout.astro`,
`projects/[slug].astro`, `index.astro`, `dean/index.astro`, `share/[slug].astro`, `share.astro`,
`connections.astro`, `activity.astro`, `activity/listening.astro`, `api/guestbook-items.json.ts`,
`sitemap.xml.ts`, `rss.xml.ts`, `robots.txt.ts`, `llms.txt.ts`, `agents/facts.json.ts` and
`build.json.ts`.

Retained literals, each for a stated reason:

| Site | Why it stays |
| --- | --- |
| `src/data/showcase-campaign.ts` | Dated campaign asset records with their own provenance URLs. They describe published bytes; rewriting them with a constant would misstate history. |
| `src/components/AudienceTelemetry.astro`, `src/pages/activity/measurement.astro` | Client-side `location.hostname` guards. They compare a hostname, not an origin, and run in browser code. |
| `wrangler.jsonc` | The deploy route and custom domain. It is configuration, not TypeScript, and cannot import the constant. |
| `scripts/*.mjs` | Release tooling aimed at explicit origins passed on the command line. |
| `docs/`, `output/` | Records of what was true at a review date. |

### Retained — repeated projection, not repeated round trips

`listPublicSearchItems()` calls `listProjectRecords()`, `listPublishedDispatches()` and five other
collections inside the base layout, while the page and `listPublicCapabilities()` may ask for the same
collections again. EmDash's `getEmDashCollection` routes these through `requestCached()`
(`node_modules/emdash/dist/query-eR_Nz70M.mjs`), so the second identical read inside one request does
not reach D1. Measured: removing the second `listProjectRecords()` call on `/projects/[slug]/` left
`db.count` at 19. The remaining cost is projection CPU, and removing it needs a request-scoped memo in
this repository rather than in EmDash. Not attempted; recorded in
[ASYNC-WATERFALL-AUDIT.md](ASYNC-WATERFALL-AUDIT.md).

### Retained — capability blocks re-read the wrapper per block

`src/components/blocks/CapabilityReviewBlock.astro:5` calls `listPublicCapabilities(value)` once per
capability block on a dispatch page. The reads are request-cached, so this is projection CPU again,
and the `value`-filtered call is what keeps the block's contract local. Changing it would push the
dispatch content into the block's props for an unmeasured gain. Not changed.

### Surplus — the `src/` subset removed (8 November 2026)

The first pass recorded 51 unused exports, 13 unused exported types and one unused devDependency
(`@storybook/builder-vite`) but removed none of them. This second pass took the `src/`-only subset.
`pnpm run deadcode` now reports **18 unused exports, all in `lab/` and `scripts/`**, plus that
devDependency and one configuration hint. No unused exported type remains in `src/`.

**Deleted because nothing referenced the symbol, in its module or elsewhere:**

- `searchScore`, `searchRank`, `searchMatches`, and the helpers they alone used (`searchTokens`,
  `meaningfulTokens`, `searchMatchesText`) from `search-intent.ts`. `searchStopWords` stays because
  the search UI reads it.
- `portfolioOverview` and `OverviewRow` from `analytics-workbench.ts`; the live overview builds its
  own rows in `activity.astro`.
- `atlasGroup` from `architecture-atlas.ts`; the architecture pages use `atlasGroups` directly.
- `contributionAnchors` from `contribution-flow.ts`.
- `exhibitAnchors` and `DriftCheck` from `exhibit-model.ts`.
- `isContentGeneration` from `content-generation.ts`.
- `BUILD_IDENTITY_SCHEMA` from `build-identity.ts`; the build script owns the schema string.
- `projectFixtures` from `stories/fixtures.ts` and `Meta` from `stories/types.ts`; the stories import
  the individual fixtures and the `Story` alias.

**Export removed, symbol kept because its own module uses it:**

- `cardIsPng` (`loadActivityCard`), `weekCaptionLines` (the caption builder), `benchStateToParams`
  (`benchStateLink`), `enquiryFields` (`EnquiryField`, `isEnquiryField`), `CONTENT_GENERATION_PREFIX`
  (`contentGenerationDigest`), `dispatchDate` (`byDispatchDate`), `parseSnapshot` in
  `github-leaderboards.ts` (its own row parser), `normalisePathname` and `uniqueDestinations` in
  `navigation.ts` (`isCurrentDestination`, `withActivityNavigation`), `OperationTimeoutError`
  (`withDeadline`, `clipboardProblem`), `isRasterImage` (`socialCardFor`),
  `parseDistributionMetric` (`loadStoryDistribution`), `editionPath` (`readPortfolioEdition`),
  `isActiveProject` (`activeProjects`) and `reportRouteEvent` (`logReportFailure`,
  `logReportDegraded`).
- The `reportQualifier` re-export in `portfolio-card.ts` was removed. The workbench owns the
  function; `activity.astro` imports it there, and `portfolio-card` still uses its own import.
- Type exports removed while the types still describe their module's own records:
  `AgentCapabilityOperation`, `AtlasStatus`, `AtlasFact`, `AtlasPart`, `AtlasDecision`, `MerchKind`,
  `MerchVariant`, `MerchArtwork`, `DemoOrderLine` and `DemoOrderStatus`.

`projectLifecycles` was not kept as a value at all: the union type is now written directly, because
the array existed only to derive that type.

**Retained, with the reason:**

| Finding | Why it stays |
| --- | --- |
| 18 unused exports in `lab/` and `scripts/` | Separate pass. The lab is a bounded experiment and the release scripts are not imported by the Worker; deleting them needs their own run, not a mixed refactor. |
| `@storybook/builder-vite` devDependency | The Storybook build path is not part of this pass. Removing it would need a Storybook build check that this change did not run. |
| knip `cloudflare` ignore hint | `cloudflare:workers` is a workerd virtual module, not the npm `cloudflare` package. The hint is a knip configuration detail, not a code export; changing it risks a false unresolved-import finding. |

### Special cases worth naming (not changed)

- `src/pages/activity/listening.astro` and `src/pages/connections.astro` build a path by replacing the
  origin with `""`. That works because `SITE_ORIGIN` and `Astro.url.origin` agree in production; it is
  a string edit where a `URL` would state the intent.
- `src/pages/share.astro` carries several one-off caption strings with embedded links. They are copy,
  not builders; they now read the constant, but the duplication of the *sentence* across assets
  remains.
- `src/pages/api/portfolio-report.json.ts` and the other report routes each restate the
  "identities then stored report" join. Three routes doing the same join is a candidate for one
  function; not changed, because each has different failure attribution and only the waterfall was in
  scope.

## Verification of the fix

- `pnpm run typecheck` (316 files), `pnpm run lint`, `pnpm test` (197 tests) pass.
- `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/llms.txt` and `/agents/facts.json` are byte-identical
  before and after the deploy. `/share/` and `/dean/` differ only by Cloudflare's injected
  `__CF$cv$params` script and one stylesheet link ordering from the rebuild; the stylesheet set and
  the CSS bytes are the same.
- Scoped audit on `/`, `/share/`, `/activity/`, `/projects/bubbles/` and `/dean/`: 141 link targets,
  5 unique titles, 4 social images, 9/9 credential paths clean.

Release: source `a9528ac`, preview Worker `0835f58d-a995-4abd-9ce2-a89800cdd1bd`, production Worker
`e4e3be98-9825-4aa0-907b-8364ef3a2762` at 100%, build identity from a clean tree. No behaviour
changed: the constant is the value every replaced line already used.

## Verification of the surplus removal

- `pnpm run typecheck` (316 files, 0 errors), `pnpm run lint` and `pnpm test` (197 tests) pass.
- `pnpm run deadcode` reports 18 unused exports, all in `lab/` and `scripts/`, plus
  `@storybook/builder-vite` and the knip `cloudflare` hint. The `src/` unused-export and unused-type
  counts are zero.
- The production build completes and the privacy scan passes across 2,284 artifacts.
- No behaviour changed: every deleted symbol had no caller, and every de-exported symbol is still
  used by its own module. The built HTML and public JSON are compared before and after the deploy in
  the release receipt below.

Release: source, preview Worker, production Worker and the rendered-output comparison are recorded
in the #168 receipt once the deploy is verified.

## Next pass

1. Remove the 18 `lab/` and `scripts/` unused exports with their own run and verification.
2. Decide whether `@storybook/builder-vite` is still needed by the Storybook build.
3. Resolve the knip `cloudflare` configuration hint if the virtual-module handling can be stated
   without a false unresolved import.
4. Take the report-route join into one function if a fourth caller appears.
5. Re-run the pass with the skill's Comments add-on only if MP asks for comment pruning; it is
   currently unauthorised.

#168 is complete for the `src/` scope this pass took: the skill is installed and used, the hidden
origin link and the `src/` surplus are fixed, and every remaining finding is named above with a
reason. The `lab/`/`scripts/` subset remains a separate change, not a silent omission.
