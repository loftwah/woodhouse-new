/**
 * Lightweight search intent for the public index.
 *
 * The observed failure: search matched one literal substring, so "music" found
 * LoftwahFM but "music for my game" found nothing, and a project could only be
 * found by words its own record happened to use. This adds a small reviewed
 * alias list per project and token matching, without an AI search service, a new
 * index or a new dependency. It does not change project ranking by relevance:
 * the caller keeps its own order and the matches are ordered by how many query
 * tokens each entry satisfies.
 */

/**
 * The intent phrases a visitor is likely to type, per published project. These
 * describe what the product is and who it is for; they are not marketing claims
 * and they never introduce a capability the project's own record does not have.
 */
const aliases: Record<string, string> = {
  bubbles:
    "bubble shooter bubble pop puzzle arcade match three marble popper casual quick game play in browser phone",
  fighter:
    "fighting game battler collect characters squad turn based combat charge strip story modes play in browser",
  shoalshot:
    "fishing game angling cast catch tide ocean reef hunt dive explore spearfishing phone game",
  "protocol-11":
    "card game cards table trick rounds deck multiplayer two player four player board game solo house circuit",
  max: "walking frame walker mobility assistive technology accessibility elderly care locate find stop remote device",
  pirates:
    "reconstruction remake retro lost game source archaeology master of the secret sea restoration trust evidence",
  loftwahfm:
    "music radio station stream song songs album soundtrack playlist music for my game game music background music listening shows radio client audio",
  "social-club":
    "membership club hospitality restaurant venue booking private members experience prototype",
  "asset-hunter":
    "assets asset discovery rights licence licences credit attribution packs images icons fonts textures models sourcing free assets field guide",
  "app-composer":
    "build an app app builder studio mini apps make software no code website creator profile link in bio guestbook postcards deployment emdash cloudflare"
};

export function aliasesFor(slug: string): string {
  return aliases[slug] ?? "";
}

/**
 * Words that carry no search meaning on their own. Kept here so the server can
 * publish the list to the client and both sides agree on the same tokens.
 */
export const searchStopWords: readonly string[] = [
  "a",
  "about",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "do",
  "does",
  "find",
  "for",
  "from",
  "get",
  "how",
  "i",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "show",
  "that",
  "the",
  "their",
  "them",
  "there",
  "this",
  "to",
  "was",
  "what",
  "where",
  "which",
  "who",
  "with",
  "you",
  "your"
];

export function searchTokens(value: string): string[] {
  return String(value)
    .toLocaleLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

/**
 * Does this entry satisfy every meaningful token of the query? A token matches a
 * haystack word exactly, as a prefix of it, or as a prefix the word extends —
 * enough for "apps" to find "app" and "shooters" to find "shooter".
 */
export function searchMatches(haystack: string, query: string): boolean {
  const stop = new Set(searchStopWords);
  const tokens = searchTokens(query).filter((token) => !stop.has(token));
  if (!tokens.length) return true;
  const words = searchTokens(haystack);
  return tokens.every((token) =>
    words.some((word) => word.startsWith(token) || token.startsWith(word))
  );
}
