/**
 * Which dispatch social cards actually exist under `public/og/dispatches/`.
 *
 * The card set is authored, not generated from the content model, so a dispatch
 * can be published without one. Pointing `og:image` at a card that was never
 * rendered advertises a 404 to every share and to every crawler, so the
 * template asks this manifest instead of assuming.
 *
 * `scripts/social-cards.mjs` writes the list from the files on disk and
 * `pnpm run verify` fails when the two disagree.
 */
const DISPATCH_SOCIAL_CARDS: readonly string[] = [
  "a-gate-for-what-the-source-proves",
  "eight-finish-lines",
  "i-didnt-mean-to-build-a-software-factory",
  "nine-projects-and-the-first-one-you-can-check",
  "prove-which-build-is-live",
  "software-is-not-the-walker",
  "the-tests-passed"
];

export function dispatchSocialCard(slug: string | null | undefined): string {
  if (!slug) return "/og/factory.jpg";
  return DISPATCH_SOCIAL_CARDS.includes(slug) ? `/og/dispatches/${slug}.jpg` : "/og/factory.jpg";
}
