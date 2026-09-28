# WOODHOUSE

The Loftwah Software Factory.

Woodhouse is an evidence-led public observatory, engineering journal, project portfolio and professional record for the software factory operated by Dean Lofts.

## Product surface

- The factory floor presents an explicitly dated portfolio snapshot.
- Project dossiers explain what each product does, why it matters and what it teaches the factory.
- Dispatches, conversations and incidents turn engineering work into readable case studies.
- Agent Reception publishes a bounded, machine-readable summary without exposing private repository contents.
- Architecture and doctrine explain the operating model.

The repositories behind seven of the eight projects are private. Public copy comes from the shareable factory report supplied for this site. Woodhouse does not call a snapshot live telemetry, and does not publish private issue text or credentials.

## Local work

Use Node 22 and pnpm.

- Install dependencies with pnpm install --frozen-lockfile.
- Start the local site with pnpm dev.
- Build with pnpm build.
- Deploy with pnpm run deploy.

The static Astro output is served by a Cloudflare Worker with Static Assets. The Wrangler configuration is the deployment source of truth.

## Refreshing the public snapshot

The current portfolio snapshot is dated 28 September 2026. Update src/data/projects.ts from a reviewed, public-safe report before changing its review date. Do not copy private issue or pull request bodies into public data.

The social-card script regenerates the page-specific raster previews from the shared artwork. It requires ImageMagick on the machine running it.
