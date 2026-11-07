# Search visibility audit

Dated production audit for [issue #154](https://github.com/loftwah/woodhouse-new/issues/154). Read-only
against the live origin; no crawler, no Search Console, no new dependency.

## Run

**8 November 2026, 10:35–10:45 UTC** (21:35–21:45 Australia/Melbourne), source `063e24e`.
Fetch `robots.txt`, `sitemap.xml`, `llms.txt`, then every sitemap URL with redirects disabled, and
compare status, `rel=canonical`, `X-Robots-Tag`/`meta robots`, title, description, Open Graph image
and JSON-LD `@type`s.

| Surface | Result |
| --- | --- |
| `robots.txt` | 200. `Disallow: /_emdash/`, `Allow: /`, one sitemap declaration. |
| `sitemap.xml` | 200, **246 URLs**. |
| `llms.txt` | 200, agent-readable index of the same record. |
| URLs returning non-200, a canonical mismatch, or `noindex` | **0** after the two fixes below. |
| Missing title or description | 0. |
| Missing `lastmod` | 18 entries. |
| Pages with no JSON-LD | 17. |

Schema in use, by count across the sitemap set: `Person` 218, `Organization` 204, `BlogPosting`
204, `WebPage` 204, `SoftwareApplication` 12, `CollectionPage` 11, `ImageObject` 11, `WebSite` 1.
No reviews, offers or publication dates are invented.

## Two real defects found and fixed

Both were canonical/sitemap disagreements — the page said one URL was the document and the sitemap or
the canonical tag said another. Both were fixed, previewed and released, then re-measured.

1. **A canonical built from view state.** `/connections/` and `/activity/leaderboards/` put the
   selected report, window and measure into the canonical tag, because the canonical was derived from
   the request path including its query. The plain sitemap URL therefore declared a *different*
   canonical than the one submitted. `BaseLayout` now canonicalises the pathname and keeps the
   parameterised URL shareable. Re-measured: both routes report the clean canonical, with and without
   parameters.

2. **A sitemap entry carrying a report id.** The portfolio edition was submitted as
   `/editions/one-more-round/?report=8496128e...`, the URL it was published from. Its own canonical is
   the clean path, so the sitemap advertised a URL the page disclaims — and the id is data-specific and
   would drift. Entries are now normalised to their pathname before de-duplicating, so a future
   parameterised collection cannot reintroduce it.

## Release identity

| Step | Worker version | Scope |
| --- | --- | --- |
| Preview | `74f2e2b5-5d0c-4a80-86fc-ecd7c1a0eb37` | `/connections/`, `/activity/leaderboards/` |
| Production | `59822522-a94e-4b47-8f2a-9fcbb3e145ff` | same scope |
| Preview | `5d0b2d27-ae77-4a1e-adff-4e3499662627` | `/editions/one-more-round/`, `/connections/` |
| Production | `2eb1fab8-38bd-42ce-95d0-3105e5e2ee66` | same scope |

Each release ran the scoped page audit: 2 pages, 39–44 internal link targets, 9/9 credential paths
returning a clean 4xx, no broken links or private values.

## What is still open

- **17 pages have no structured data**: `/factory/`, `/connections/`, `/activity/` and its
  sub-routes, and the exhibit and utility pages. Adding schema there is only worth it where a real
  entity exists; `WebPage` boilerplate across 17 routes would be noise, not a signal. Left explicit
  rather than blanket-filled.
- **18 sitemap entries carry no `lastmod`.** These are static routes whose review date is not a
  property of a record. A fabricated date is worse than none.
- **Search indexing is not measured here.** This audit proves crawlability, canonical agreement and
  metadata on the live origin. It does not prove Google or Bing have indexed anything, and it does not
  prove ranking. Search Console and Bing Webmaster Tools remain unconnected; that requires MP's
  account authorisation and is recorded as not connected rather than assumed.
- **No new regression gate was added.** `pnpm run audit:pages` already proves structure, links, privacy
  and credential-path behaviour on every publication, and the sitemap comparison above is a five-second
  read any agent can repeat. Adding a second gate that duplicates the first is the process bloat this
  brief argues against.

## Repeat it

```bash
curl -s https://woodhouse.loftwah.com/sitemap.xml -o /tmp/sitemap.xml
node .release/seo-154/audit.mjs   # or the four steps inline: status, canonical, robots, title
```

The audit script lives in the ignored `.release/` directory because it is a research harness, not a
product tool. The four checks it automates are short enough to reproduce by hand.
