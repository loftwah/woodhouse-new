# Architecture

## Current release

Reviewed public-safe factory report
                 |
                 v
       Typed snapshot in src/data
                 |
                 +-- Astro pages and dossiers
                 +-- Agent Reception JSON
                 +-- sitemap, robots and llms.txt
                 +-- page-specific social cards
                 |
                 v
     Static HTML, CSS, SVG and images
                 |
                 v
     Cloudflare Worker Static Assets
                 |
                 v
      woodhouse.loftwah.com

Astro generates static pages. Wrangler publishes the built dist directory as Worker Static Assets and attaches the Worker to the custom domain.

## Data boundary

GitHub remains authoritative for repository state. Seven project repositories are private. This release therefore consumes the human-reviewed, shareable report rather than scraping and republishing private data. The snapshot has an explicit date and is not represented as real-time telemetry.

Agent Reception serves curated JSON that is safe to publish. It cannot execute tools, modify repositories, receive private context or publish a conversation.

## Later collector boundary

A future collector may observe GitHub events, but it must normalise them, retain source links and timestamps, separate raw events from interpretation, and require publication review before content appears publicly. Public site requests must never contain repository credentials.

If the product later stores event history, content drafts or approval state, add a Cloudflare data service only for that concrete need. Public static content remains cacheable; editorial drafts and authenticated office data must not share a public cache path.
