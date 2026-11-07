/**
 * The public origin this build serves.
 *
 * Pages use `Astro.site` when it is configured; this is the fallback for the
 * builders that run outside a request (share captions, card renderers, report
 * endpoints, analytics sources). Changing the domain is one edit here plus the
 * Wrangler route, which cannot import TypeScript. The dated campaign records in
 * `showcase-campaign.ts` keep their original bytes: they describe published
 * assets, so they are history rather than defaults.
 */
export const SITE_ORIGIN = "https://woodhouse.loftwah.com";
