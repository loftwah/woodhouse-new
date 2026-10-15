---
version: 1
slug: "src-pages-activity-astro"
primary_target: "src/pages/activity.astro"
related_targets: ["src/layouts/BaseLayout.astro","src/data/analytics-workbench.ts","src/data/portfolio-analytics.ts","src/data/portfolio-reports.ts","src/data/portfolio-card.ts","src/scripts/analytics-workbench.ts","src/styles/analytics-workbench.css"]
---

# Portfolio analytics workbench

Reviewed 16 October 2026. Mode: Operate / Read. MP rejected the ledger as cheap and explicitly delegated design judgement: “You can figure it out” and “I am expecting you to carry us. Make it impeccable.” The job is to explore real project activity, choose custom dates, understand evidence and limits without analytics expertise, and share a faithful dated report. Preserve existing Woodhouse identity and every project’s release/privacy boundaries.

Surface seed `626f0487`, assigned candidate 6: analytical research workbench. Considered structures, ordered: portfolio overview; project focus; guided readout; metric drilldown; temporal story; research workbench; report stage. No reroll. This expands the established ink/Bricolage world rather than replacing the site identity. Physical scene: MP or a visitor examining a sustained dataset on desktop or phone; the established dark reading surface stays dark at every size.

## Delegated comp decision

All three compositions were generated and displayed before implementation. Chosen A: `.impeccable/mocks/analytics-workbench-20261016-a.png`; its prompt sidecar records approved=true under MP’s explicit delegation. A offers strongest task clarity and preserves DESIGN.md’s dark world. B’s panoramic plot and C’s dossier were considered; their white panels contradict established identity. Mock traces are illustrative design material, never source data. Do not literalise mixed-unit trend lines, invented metrics/totals, encouraging traction claims, unsupported avatars/settings or a business-readiness score.

## Built composition and implementation inventory

| Ingredient | Commitment and medium |
| --- | --- |
| Site navigation | Existing semantic site header; compact native page links. Preserve real navigation, omit invented account/settings. |
| Project rail | 190px desktop rail; active project has a thin cyan indicator and small source-colour dot. Semantic project links preserve the selected report/date window. Switching product families resets to the destination's default measure; switching games retains a compatible measure. Below 1000px the rail becomes a horizontally scrollable native row. |
| Heading and toolbar | Compact Bricolage heading capped at 32px with product-specific context; 7/30/90-day presets, native Custom dates disclosure and Share report link. The disclosure starts closed; its labelled native date inputs use a GET form, inclusive UTC dates and a 90-day maximum. The date/source summary remains visible outside it. |
| Measure selection | Four linked families: Gameplay, Visits & returns, App usage and Listening. A grouped native select exposes all 17 canonical measures in the portfolio view and only the selected product's supported choices in a product view, with a Show submit button. Family links and project links remain usable without chart JavaScript. Legacy `replays` URLs resolve to canonical `game_replays`; incompatible product measures normalise to the product default while preserving dates and frozen-report context. |
| Metric strip | Tight product-specific headline totals above the plot, plus the selected measure when needed, with measurement quality and legacy-in-range labels. Semantic definition lists; no combined people/engagement number. Long labels wrap; narrow screens scroll this strip within its own region. |
| Dominant plot | Broad central daily plot with one selected measure and unit; precise axes, crosshair, tooltip, named series toggles, zoom brush, reset and line/bar controls. Locally bundled modular Apache ECharts uses its SVG renderer. Missing days stay gaps. A server SVG and permanent HTML data table remain available without chart JavaScript. |
| Data inspection/export | Native Chart data & export disclosure below the chart. It contains a native range input for keyboard day inspection, a live date/value/coverage output, CSV download and the permanent daily table. Every table value carries coverage; CSV retains UTC dates, measure/unit, capture context, values and source statuses. |
| Context column | Integrated desktop reading hierarchy separated by 1px seams: selected-measure meaning, what the selected product's pattern can support, comparable-week findings when eligible, business evidence gaps, sharing and provenance. App views distinguish recorded access, viewed contributions and finished Link Checks, and name unmeasured creator outcomes. Below 720px this column follows chart/coverage/source content; the measure explanation is also visible before the phone plot. |
| Source coverage | Native HTML daily calendar for the selected measure and projects, with distinct labelled clean, partial, legacy/test, bounded/sampled and missing states. No invented hourly heatmap. The keyboard-scrollable daily values table supplies the same statuses without relying on colour or hover. |
| Share action | Header link reaches Take the evidence with you. An acid native Share report disclosure exposes frozen landscape/square/portrait PNG downloads, clipboard caption/link, supported native file sharing, permalink and public JSON. PNGs contain the actual selected daily chart, adjacent source-quality labels, UTC context and owning-origin retrieval URL. Controls remain native HTML. |
| Data register | Ruled source/metric rows, every definition, limitation, collection/comparison boundary, update and public endpoint inspectable. Native disclosures/tables. |
| Measurement choices | Existing `/activity/measurement/` page keeps anonymous-reporting control separate from optional Woodhouse browser-return consent. The latter starts off, uses this origin's retained 90-day identifier and explains revocation, storage failures and the limits of browser counts. A native button and status text expose the choice; no shared account or cross-product identity is implied. |
| Typography/material | Bricolage broad compact heading; system sans 13–16px operational copy, tabular figures; 1px navy rules, modest 4–6px control corners; no decorative shadows, glow, texture or gradients. |
| Generated raster assets | None in runtime UI. `.impeccable/analytics-assets-20261016.json` records the empty raster inventory. Comps are design studies only; precise chart geometry uses native scalable and interactive rendering. |

The source-specific chart palette is local to this workbench: Fighter coral `#ff887e`, Bubbles cyan `#79d8ff`, Protocol 11 violet `#b99aff`, SHOALSHOT acid `#e9ff49`, App Composer blue `#7fa2ff`, LoftwahFM pink `#ff9ccd` and Woodhouse grey `#b4c0d2`. Names and text states accompany colour. These values do not replace the shared identity palette. Controls have modest 4–6px corners. Native forms, source links, series toggles and primary actions use 44px targets; compact line/bar and reset controls use 36px. The workspace is capped at 1800px. No decorative depth, glow, texture or gradients were introduced.

## Direction contract

`BaseLayout.astro` emits the analytics direction comment as the first rendered body child when `analyticsWorkbench` is set by this page. Preserve its exact contract and keep other surfaces' contracts independent:

```html
<!-- THESIS: Explore measured product activity in a chart-centred workbench; refuse a ledger masquerading as insight. OWN-WORLD: Woodhouse ink navy, porcelain, acid actions, cyan/coral data; Bricolage headings, precise native controls and one-pixel seams. STORY: Choose dates and a measure, inspect daily evidence, understand coverage and missing business proof, share a frozen report. FIRST VIEWPORT: Narrow project rail, compact heading/date toolbar, source totals, dominant chart with zoom, right interpretation column; share action in context. FORM: Analytical research workbench, grounded candidate 6, surface seed 626f0487. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->
```

## Data contract

Custom windows are inclusive UTC dates, 1–90 days, no future day. Retention differs by source; a date picker cannot create missing history. Unknown is null, reported zero is zero. Today and initial collection dates are partial. Previous production test activity is labelled legacy; comparisons require a source-declared comparableFrom and complete, exact, adjacent weeks. No fabricated retention, causal claim, revenue, valuation, unique people or cross-product identity. Browser-reported starts and completions do not form a matched completion cohort. Bounded Composer counts are not audited conversion data. FM audible time remains separate from gameplay, including its game-attributed listening measures. Woodhouse's source `active_seconds` describe site attention and are excluded from the gameplay chart rather than relabelled as play. Public-safe frozen snapshots, current CMS membership and all ordinary release gates remain authoritative.

The product profiles are grounded in the current public source fields, not a common game funnel:

| Product view | Choices and default | Headline meaning |
| --- | --- | --- |
| Games | Eight: starts (default), completions, active play time, replays, visits, engaged sessions, reporting browsers and returning browsers. | Starts, completions and active play time, with source-specific definitions and availability. |
| App Composer | Four: mini-app opens (default), Guestbook contribution opens, completed Link Checks and mixed app actions. | Access, content views and finished inspections remain separate. Contribution opens are public contribution-page HTML requests, not image downloads, submissions or publications. Mixed actions add contribution opens and completed inspections; the sum supplies no task-completion rate. |
| Woodhouse | Five: visits (default), engaged sessions, project discovery, reporting browsers and returning browsers. | Visits, attention-qualified sessions and deliberate outbound project opens. A project open does not establish downstream use. |
| LoftwahFM | Four: audible listening (default), listening starts, game-attributed listening and game-attributed listening starts. | Accepted audible time and confirmed starts; game attribution establishes neither gameplay nor distinct players. |

The app interpretation explicitly leaves creator activation, committed Guestbook submissions, successful publications and outbound Linkarooie interactions unknown. Repeated opens and completed jobs cannot establish unique users, creator adoption or a matched conversion funnel. The selected app's business readout describes bounded counters, not the whole portfolio's source coverage.

Optional Woodhouse browser recognition is a separate, default-off choice; anonymous reporting works without it. Distinct retained browser identifiers and earlier different tab sessions can establish a limited return signal, including same-day returns. Daily distinct counts are not additive period people. Clearing or rotating storage, other profiles/devices, consent choices and expired history hide returns. Revocation stops future associations and attempts local-token removal; it does not erase previously accepted private associations or frozen aggregate reports. No person, cohort or cross-product identity claim follows.

## Original reviewed build and finish boundary

Reviewed 16 October 2026 against source `44c6183` and preview Worker `520cec52`. The supplied finish review disposition is SHIP after resolving three material findings: frozen links use the serving origin; exported figures retain adjacent source quality; the phone opening keeps custom dates and chart-data tools closed so the plot begins within the first viewport. This is the visual/preview disposition; guarded merge, production release and final interaction qualification remain the root task's separate work.

Inspected built-world opening captures: `.impeccable/screenshots/workbench-desktop-review-fixed.png` (1536×1024) and `.impeccable/screenshots/workbench-phone-review-fixed.png` (390×844, scrollY 0, plot top 706px). Supplied full-phone evidence is `.impeccable/screenshots/workbench-phone-full-review-fixed.png`; coverage/interpretation region captures remain `.impeccable/screenshots/workbench-coverage.png` and `.impeccable/screenshots/workbench-interpretation.png`. The supplied phone review reports no page overflow. Supplied served preview PNGs for that build are `.release/workbench-exports/preview/landscape.png`, `square.png` and `portrait.png`; these are historical preview export evidence, not production export evidence for a later source.

The single detector pass returned `[]` in `/tmp/woodhouse-workbench-detector.json`. This documentation pass inspected source, the approved comp sidecar and the desktop/phone opening captures; it did not rerun a browser, build, detector or deployment. Preview/source/visual SHIP does not establish production release, genuine audience/adoption, physical iPhone sharing or human listening. A browser capture cannot supply those claims.

## Product-specific refinement — reviewed 16 October 2026

Current source is `b484e6266311fc248bc92bdc306279b5c50a6ff9`; supplied preview identity is Worker `b9582bd3-1568-40e9-83a6-01765ab88a74`, source digest `sha256:7587bc870dbe1054aab613138143fbc3f45d341155319bdfc78609fe9580d5fa`. This refinement preserves the approved composition and visual world while correcting product meanings, defaults, navigation and small-count server-chart axes.

The supplied coupled browser checks at earlier source `e7ab657` cover 390px and 1440px App Composer opens, completed inspections, optional measurement choice and native keyboard operation. Their flow log, before/after build identities and captures are retained privately at `/Users/deanlofts/gits/app-composer/.private/woodhouse-app-checks/`. They establish that source's interactions; they are not final-source CSS proof. The later source changes server-rendered integer axes, native cross-family link measures and metric-label wrapping, with unchanged workbench client JavaScript. In particular, the old site-to-game measure carry-over defect is not counted as a passed final-source browser check.

Supplied actual served final-source exports are `.release/workbench-exports/product-preview-final/app-inspections-landscape.png`, `app-inspections-square.png` and `app-inspections-portrait.png`. They retain the same frozen four bounded Link Check completions in the closed 13–14 October UTC window and deterministic export bytes; they establish preview output, not production activity or release.

Final-source captures are `.impeccable/screenshots/product-final-390.png` and `product-final-1440.png`, taken at 390×900 and 1440×900 on the closed 13–14 October App Composer inspection view. The supplied browser geometry receipt, `.release/workbench-exports/product-preview-final/browser-final-geometry.txt`, records no page overflow at either width. All three headline labels fit their columns (92px on phone, 265px on desktop), with the values aligned at the same vertical position. Native App Composer → Woodhouse → Fighter clicks reach `game_starts` while retaining the date window. The post-check build receipt, `.release/workbench-exports/product-preview-final/browser-build-after.json`, retains the exact `b484e626` source and preview digest above.

A fresh independent finish review on 16 October 2026 returned **SHIP**, with no material fixes remaining. Resolved findings are phone headline-label overlap, stale 13-measure documentation and missing product profiles, rounded small-count server-chart axes, and cross-family measure carry-over. This disposition covers the reviewed preview, its final phone/desktop presentation, native navigation and served exports. The original review and earlier interaction captures remain tied to their own sources.

This documentation update performs no browser, build, detector or deployment. Guarded merge and production verification remain separate release steps. Neither preview SHIP nor the observed bounded counts establishes genuine audience, creator adoption, investment readiness, physical iPhone sharing or human listening.
