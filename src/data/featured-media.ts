import { gameMedia } from "./share-desk.ts";

/**
 * Deliberately curated featured media, by project slug.
 *
 * The observed failure was a Composer-only assumption in the project template:
 * one slug was checked by hand, so no other project's reviewed film could ever
 * appear and the rule lived in markup rather than in content. Curation now lives
 * here, so featuring a film for another project is a data edit, and a project
 * with nothing curated simply shows its source artwork.
 */
const featured: Record<string, string> = {
  "app-composer": "app-composer-studio-film-20261014"
};

export function featuredMediaFor(slug: string) {
  const id = featured[slug];
  return id ? gameMedia.find((asset) => asset.project === slug && asset.id === id) : undefined;
}
