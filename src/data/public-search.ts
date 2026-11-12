import type { PublicSearchItem } from "../content/repository";
import { searchStopWords } from "./search-intent.ts";

const destinationPages: PublicSearchItem[] = [
  {
    title: "Home",
    description: "The Loftwah Software Factory and its projects.",
    href: "/",
    section: "Start here"
  },
  {
    title: "The factory floor",
    description: "Project order, current state and the next proof each project needs.",
    href: "/factory/",
    section: "Factory"
  },
  {
    title: "Projects",
    description: "Games, music, tools and experiments you can play, listen to or try.",
    href: "/projects/",
    section: "Projects"
  },
  {
    title: "Stories",
    description: "Field notes, incidents and the engineering journal.",
    href: "/dispatches/",
    section: "Writing"
  },
  {
    title: "Incidents",
    description: "What failed, what changed and which control came next.",
    href: "/incidents/",
    section: "Writing"
  },
  {
    title: "Working exhibits",
    description: "Try the Patch Bench music and game demo and the Source Plate composition demo.",
    href: "/exhibits/",
    section: "Factory"
  },
  {
    title: "House identity",
    description: "Loom Display, the Woodhouse seal, colour and downloadable brand artwork.",
    href: "/brand/",
    section: "Factory"
  },
  {
    title: "Factory doctrine",
    description: "Value, autonomy, commercial controls and physical work.",
    keywords:
      "payments payment Printful fulfilment fulfillment order orders Stripe webhooks idempotency scheduled agent approval approve reject return artwork rights budget walker physical",
    href: "/doctrine/",
    section: "Factory"
  },
  {
    title: "Architecture",
    description: "How the public record is built and what stays private.",
    href: "/architecture/",
    section: "Factory"
  },
  {
    title: "Agent Reception",
    description: "The dated, machine-readable public project record.",
    href: "/agents/",
    section: "For agents"
  },
  {
    title: "Dean Lofts",
    description: "The operator behind the factory.",
    href: "/dean/",
    section: "People"
  },
  {
    title: "Contact",
    description: "Public ways to reach Dean.",
    href: "/contact/",
    section: "People"
  },
  {
    title: "Conversations",
    description: "What Woodhouse publishes and what remains private.",
    href: "/conversations/",
    section: "About this record"
  }
];

export const publicSearchPath = "/search/";
const stopWords = new Set(searchStopWords);

export function publicSearchPages(contentPages: PublicSearchItem[]): PublicSearchItem[] {
  const contentHrefs = new Set(contentPages.map((page) => page.href));
  const keywords = new Map(destinationPages.map((page) => [page.href, page.keywords]));
  return [
    ...destinationPages.filter((page) => !contentHrefs.has(page.href)),
    ...contentPages.map((page) => {
      const destinationKeywords = keywords.get(page.href);
      return destinationKeywords ? { ...page, keywords: destinationKeywords } : page;
    })
  ];
}

export function publicSearchTokens(query: string): string[] {
  const normalized = query.toLocaleLowerCase().replace(/(\d+)\s*[x×]\s*(\d+)/g, "$1x$2");
  return (normalized.match(/[a-z0-9]+/g) ?? []).filter(
    (word) => word.length > 1 && !stopWords.has(word)
  );
}

function searchWords(value: string) {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 1)
  );
}

export function publicSearchWords(
  title: string,
  description: string,
  section: string,
  keywords = "",
  searchText = ""
) {
  return {
    intentWords: searchWords(`${title} ${section} ${keywords}`),
    words: searchWords(`${title} ${section} ${description} ${keywords} ${searchText}`)
  };
}

export function rankPublicSearch<T extends ReturnType<typeof publicSearchWords>>(
  entries: T[],
  tokens: string[]
): T[] {
  if (!tokens.length) return entries;
  const matches = (words: Set<string>) =>
    tokens.filter((token) =>
      /^\d+x\d+$/.test(token)
        ? words.has(token)
        : [...words].some(
            (word) => word.startsWith(token) || (word.length >= 3 && token.startsWith(word))
          )
    ).length;
  return entries
    .map((entry, order) => ({
      entry,
      order,
      score: matches(entry.intentWords) + matches(entry.words)
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((row) => row.entry);
}
