// Records which dispatch social cards exist under public/og/dispatches.
//
// The cards are authored images, so a published dispatch can have no card. The
// dispatch template needs to know which ones exist to avoid advertising a 404
// as a page's social image, and this manifest is what it reads. Run with
// --check to fail when the list no longer matches the files on disk.

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const check = process.argv.includes("--check");
const cardsDirectory = path.join(root, "public/og/dispatches");
const manifestPath = path.join(root, "src/data/social-cards.ts");

const files = await readdir(cardsDirectory).catch(() => {
  throw new Error(`No dispatch social cards at ${path.relative(root, cardsDirectory)}.`);
});
const slugs = files
  .filter((file) => file.endsWith(".jpg"))
  .map((file) => file.slice(0, -".jpg".length))
  .sort();

if (!slugs.length) throw new Error("No dispatch social cards were found to record.");

const list = slugs.map((slug) => `  ${JSON.stringify(slug)}`).join(",\n");
const source = `/**
 * Which dispatch social cards actually exist under \`public/og/dispatches/\`.
 *
 * The card set is authored, not generated from the content model, so a dispatch
 * can be published without one. Pointing \`og:image\` at a card that was never
 * rendered advertises a 404 to every share and to every crawler, so the
 * template asks this manifest instead of assuming.
 *
 * \`scripts/social-cards.mjs\` writes the list from the files on disk and
 * \`pnpm run verify\` fails when the two disagree.
 */
const DISPATCH_SOCIAL_CARDS: readonly string[] = [
${list}
];

export function dispatchSocialCard(slug: string | null | undefined): string {
  if (!slug) return "/og/factory.jpg";
  return DISPATCH_SOCIAL_CARDS.includes(slug) ? \`/og/dispatches/\${slug}.jpg\` : "/og/factory.jpg";
}
`;

if (check) {
  const existing = await readFile(manifestPath, "utf8").catch(() => null);
  if (existing !== source) {
    console.error(
      "Dispatch social card list is stale. Run pnpm run social-cards:record and review the diff."
    );
    process.exit(1);
  }
  console.log(`Dispatch social card list matches ${slugs.length} rendered cards.`);
} else {
  await writeFile(manifestPath, source);
  console.log(`Recorded ${slugs.length} dispatch social cards.`);
}
