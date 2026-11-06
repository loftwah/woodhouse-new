# Storybook component workshop

Reviewed 6 November 2026. The workshop renders the production Astro components with the production
stylesheet in Storybook 10, using the community `@storybook-astro/framework`. It is a development
tool, not part of the Worker runtime and not deployed publicly.

## Run

```bash
pnpm install --frozen-lockfile
pnpm storybook          # http://localhost:6007
pnpm build:storybook    # static output in storybook-static/
```

The static build is for inspection and CI artefacts. It prerenders stories; live property changes
and client behaviour belong to the dev server. Do not publish a static build containing private
fixtures: the current fixtures are public-safe, but the rule still holds.

## What is real

- Every story imports the actual component from `src/components`. There is no Storybook-only copy
  of a production component.
- `src/styles/global.css` is loaded in `.storybook/preview.css`, with the real self-hosted Bricolage
  Grotesque font and `public/` served by `staticDirs`.
- Scoped Astro styles are preserved by the framework.
- Client scripts are interactive in dev mode. The exhibits are not reproduced as stories; they are
  full-page authored experiences and remain verified through the live routes.

## Catalogue

### Foundations

- `BrandMark` — the wordmark, rule and descriptor.
- `StatusStamp` — quiet, reporting, attention and stopped, each with a text label.
- `Type and colour` — the real token values from `global.css` (documentation sheet, not a component).
- `SignaturePlate` — the homepage still/live loom/fallback control.

### Navigation

- `SiteHeader` — desktop, homepage, analytics current state, phone Menu.
- `SiteFooter` — with and without a review date.
- `SiteSearch` — closed and with published results. Open the header control or press ⌘K / Ctrl+K.

### Portfolio

- `ProjectRow` — Bubbles, Fighter, SHOALSHOT, compact, long-title stress.
  Production resolves live source artwork; the story passes the already-resolved fixture so it is
  deterministic. That seam (`artwork`) is optional and production does not use it.

### Editorial

- `Callout` — plain, evidence, boundary.
- `Pull quote` — with and without attribution.
- `Evidence link` — a margin note that points to a reviewed record.
- `Project reference` — a published project link.

Portable Text and CMS image blocks are deliberately absent: they require the EmDash renderer and
would need a second content path in Storybook. They remain covered by the route and by the
publication-boundary tests.

### Media

- `Share actions` — image caption/copy/download, and the missing-image fallback.
- `Gallery pagination` — first, middle, last.
- `Game media` — a real checked-in media asset.
- `Showcase gallery` — four, two and one item from the real campaign manifest.

### Editions

- `Edition share kit` — full, compact, pack unavailable.
- `Edition share assets` — real edition images.

### Compositions

- `Projects ledger` — header, page intro, filter row, three production `ProjectRow`s and footer.
- `Article reading` — header, long-form reading measure, pull quote, boundary callout, evidence link,
  evidence rail and footer.

These compositions use real layout relationships but are not the server routes. The routes read
EmDash and live artwork; a story must never claim to be the production page.

### Not represented as stories

- EmDash admin screens and the editorial policy surfaces (owned by EmDash; see Prompt 12 for the
  small Woodhouse-owned extension designs).
- Full-page analytics/workbench charts. The chart is a client ECharts surface fed by a validated
  report; its real states are verified on `/activity/`.
- The two working exhibits. They are authored full pages with their own scripts and audio
  lifecycle; they remain verified on their live routes rather than reduced to a component story.

## Controls that are useful

| Story | Controls |
| --- | --- |
| Project row | project identity, artwork, compact, eager, heading level, long-title stress |
| Status stamp | tone, label, note |
| Site header | current path, links, house-index links |
| Site footer | review date, links |
| Share actions | caption, image, fallback image, filename, link |
| Gallery pagination | page, pages, end |
| Showcase gallery | item count (preset stories) |
| Edition kit | compact, pack available |
| Callout | kind, title, body |

## Adding a story

1. Use a real component from `src/components`.
2. Add a public-safe fixture in `src/stories/fixtures.ts` or import a checked-in public data module.
3. Keep arguments deterministic. Do not call the CMS, analytics, a product site or the network from
   a story. If a production component fetches at render, add the smallest presentation seam and
   document it, as `ProjectRow.artwork` does.
4. Check the story at 390px and 1440px, with keyboard focus and long content.
5. Run `pnpm build:storybook` before committing.

## Limitation record

- Static builds prerender Astro stories. The Controls panel can edit args in the dev server; a
  static artefact is a snapshot, not a live props playground.
- Storybook does not prove the production route's data, privacy or caching behaviour. It is a
  presentation workshop, not a second CMS or analytics implementation.
- The framework's `Meta`/`StoryObj` aliases are not re-exported by the installed version; stories use
  a local structural alias in `src/stories/types.ts` so `astro check` and `tsc` stay fast.
