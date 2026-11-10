# Design to production map

Reviewed 6 November 2026. One row per significant screen. `Stitch` is a screen in the Woodhouse
Stitch project or a prompt in the pack. `Workshop` is a Storybook story. `Live` is the authoritative
production page. A design or a story never overrides the live route.

| Screen | Route | Stitch | Production component(s) | Storybook | Live |
| --- | --- | --- | --- | --- | --- |
| Homepage | `/` | 01, 08 (historical); 0.security quality reference, 2026/11/10 | `BaseLayout` (home shell), `SiteHeader`, `SignaturePlate` (immersive variant), homepage product spreads, `EditionInvitation`, `FMListening`, `ProjectNetwork`, `SiteFooter` | `Foundations/Signature plate`, `Compositions/Projects ledger` | https://woodhouse.loftwah.com/ |
| Projects catalogue | `/projects/` | 02 | `ProjectRow`, `EditionInvitation`, `StatusStamp` | `Portfolio/Project row`, `Compositions/Projects ledger` | https://woodhouse.loftwah.com/projects/ |
| Project record | `/projects/[slug]/` | 03 | `ProjectRow`, `StatusStamp`, `CapabilityRecord`, `GameMedia`, `EditorialBlocks`, `D2Diagram` | `Portfolio/Project row`, `Editorial/*` | https://woodhouse.loftwah.com/projects/bubbles/ |
| Stories index | `/dispatches/` | 04 | edition callout, dispatch ledger | `Compositions/Article reading` | https://woodhouse.loftwah.com/dispatches/ |
| Dispatch article | `/dispatches/[slug]/` | 04 | `EditorialBlocks`, `PullQuote`, `Callout`, `TechnicalPlateBlock`, `DiagramPlateBlock`, `ImagePlateBlock`, `EvidenceLinkBlock` | `Editorial/Callout`, `Editorial/Pull quote`, `Editorial/Evidence link`, `Compositions/Article reading` | https://woodhouse.loftwah.com/dispatches/a-better-second-attempt/ |
| Incidents | `/incidents/`, `/incidents/[slug]/` | 04 | editorial blocks, status stamps | `Editorial/*` | https://woodhouse.loftwah.com/incidents/ |
| Portfolio edition | `/editions/one-more-round/` | 05 | `PortfolioEdition`, `EditionShareKit`, `EditionShareAssets`, `ShowcaseGallery` | `Editions/Edition share kit`, `Editions/Edition share assets` | https://woodhouse.loftwah.com/editions/one-more-round/ |
| Evidence index/detail | `/evidence/`, `/evidence/[slug]/` | 09 | `EditorialBlocks`, `CapabilityRecord` | `Editorial/*` | https://woodhouse.loftwah.com/evidence/ |
| Analytics overview | `/activity/` | 06 | `MeasurementNavigation`, `OutcomeFindings`, `ActivitySharing`, ECharts client | `Media/Share actions` (share boundary) | https://woodhouse.loftwah.com/activity/ |
| Leaderboards | `/activity/leaderboards/` | 07 | leaderboard markup, `MeasurementNavigation` | — | https://woodhouse.loftwah.com/activity/leaderboards/ |
| Listening | `/activity/listening/` | 07 | `MeasurementNavigation`, `FMListening` | — | https://woodhouse.loftwah.com/activity/listening/ |
| Measurement choices | `/activity/measurement/` | 06/07 | consent and definition markup | — | https://woodhouse.loftwah.com/activity/measurement/ |
| Share gallery | `/share/` | 06 | `ShowcaseGallery`, `GameMedia`, `ShareActions`, `GalleryPagination` | `Media/Showcase gallery`, `Media/Game media`, `Media/Share actions`, `Media/Gallery pagination` | https://woodhouse.loftwah.com/share/ |
| Project share collection | `/share/[slug]/` | 06 | `ShowcaseGallery` for a multi-work collection; one reviewed work renders as a share card (artwork, visible caption, `ShareActions`, product link preview) with `SITE_METADATA` | same as gallery | https://woodhouse.loftwah.com/share/bubbles/ |
| Exhibits index | `/exhibits/` | 10 | `FactoryPlate` | — | https://woodhouse.loftwah.com/exhibits/ |
| Patch bench | `/exhibits/patch-bench/` | 10 | exhibit scripts, `FMListening` | — | https://woodhouse.loftwah.com/exhibits/patch-bench/ |
| Source plate | `/exhibits/source-plate/` | 10 | exhibit scripts, `D2Diagram` | — | https://woodhouse.loftwah.com/exhibits/source-plate/ |
| Factory | `/factory/` | 11 | `FactoryPlate`, `ProjectNetwork`, `D2Diagram` | — | https://woodhouse.loftwah.com/factory/ |
| Architecture | `/architecture/` | 09/11 | `D2Diagram`, editorial blocks | — | https://woodhouse.loftwah.com/architecture/ |
| Agent Reception | `/agents/` | 11 | editorial blocks, `/agents/facts.json` | — | https://woodhouse.loftwah.com/agents/ |
| Connections | `/connections/` | 11 | `ProjectNetwork`, `CapabilityRecord` | — | https://woodhouse.loftwah.com/connections/ |
| Dean | `/dean/` | 11 | editorial blocks | — | https://woodhouse.loftwah.com/dean/ |
| Contact | `/contact/` | 11 | form, `contact-feedback` | — | https://woodhouse.loftwah.com/contact/ |
| Doctrine | `/doctrine/` | 11 | editorial blocks, `D2Diagram` | — | https://woodhouse.loftwah.com/doctrine/ |
| Not found | `/404/` | 14 | `BaseLayout`, `SiteSearch` | — | https://woodhouse.loftwah.com/404/ |

## Using the map

1. Inspect the live page first.
2. Inspect the Stitch reference. Treat it as a direction, not a specification; production content
   and evidence win.
3. Open the Storybook component or composition and reuse it.
4. Change the production component, not a story-only copy.
5. Verify in Storybook at 390px and 1440px, then in the complete route.
6. Run the focused checks, integrate and verify production for user-facing changes.

## Maintenance

- Add a row when a route or significant component family changes.
- Update the Stitch screen ID when a screen is superseded; keep the old ID in
  [`stitch/README.md`](stitch/README.md) as rejected work.
- Do not turn this into a registry, a service or a generated dashboard. It is a reading aid.

Homepage composition revised 2026/11/10 (Australia/Melbourne and UTC): full-width living artwork,
semantic display headline, product-first editorial spreads and chapter rhythm. The existing
signature renderer and public content boundaries are unchanged. See the dated homepage section in
[DESIGN.md](../DESIGN.md). Source presence is not production verification.
