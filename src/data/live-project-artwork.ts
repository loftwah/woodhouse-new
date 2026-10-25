import type { WoodhouseProject } from "../content/repository.ts";
import { approvedShareImage } from "./share-desk.ts";

type Artwork = {
  image: string;
  alt: string | undefined;
  width: number | undefined;
  height: number | undefined;
};
const freshness = 5 * 60 * 1000;
const maxHeadBytes = 256 * 1024;

function decodeAttribute(value: string) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (entity) => {
    const named: Record<string, string> = {
      "&amp;": "&",
      "&quot;": '"',
      "&apos;": "'",
      "&lt;": "<",
      "&gt;": ">"
    };
    const replacement = named[entity.toLowerCase()];
    if (replacement !== undefined) return replacement;
    const hex = entity.toLowerCase().startsWith("&#x");
    const code = Number.parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
  });
}

function artworkFromHead(html: string, source: string): Artwork | null {
  const head = (html.split(/<\/head\s*>/i)[0] ?? "").replace(
    /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,
    ""
  );
  const values = new Map<string, string>();
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = new Map<string, string>();
    for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
      const name = match[1];
      if (name)
        attributes.set(name.toLowerCase(), decodeAttribute(match[2] ?? match[3] ?? match[4] ?? ""));
    }
    const key = (attributes.get("property") ?? attributes.get("name"))?.toLowerCase();
    if (key && !values.has(key) && attributes.has("content"))
      values.set(key, attributes.get("content")!);
  }
  const declared = values.get("og:image");
  if (!declared) return null;
  let image: string;
  try {
    image = new URL(declared, source).href;
  } catch {
    return null;
  }
  if (!approvedShareImage(image)) return null;
  const dimension = (key: string) => {
    const n = Number(values.get(key));
    return Number.isInteger(n) && n > 0 && n <= 16384 ? n : undefined;
  };
  return {
    image,
    alt: values.get("og:image:alt")?.slice(0, 2000),
    width: dimension("og:image:width"),
    height: dimension("og:image:height")
  };
}

async function readArtwork(source: string, fetcher: typeof fetch): Promise<Artwork | null> {
  try {
    const response = await fetcher(source, {
      redirect: "manual",
      signal: AbortSignal.timeout(3000)
    });
    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("text/html") ||
      !response.body
    ) {
      await response.body?.cancel();
      return null;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > maxHeadBytes) return null;
        html += decoder.decode(value, { stream: true });
        if (/<\/head\s*>/i.test(html)) return artworkFromHead(html, source);
      }
      return artworkFromHead(html + decoder.decode(), source);
    } finally {
      await reader.cancel();
    }
  } catch {
    return null;
  }
}

/** Live artwork is presentation, never a mutation of the reviewed CMS evidence. */
export function createProjectArtworkReader(fetcher: typeof fetch = fetch, now = Date.now) {
  // Cache resolved data only: Worker requests must own their own network I/O.
  const cache = new Map<string, { expires: number; artwork: Artwork | null }>();
  return async (project: WoodhouseProject): Promise<WoodhouseProject> => {
    if (!project.siteUrl || !approvedShareImage(project.siteUrl)) return project;
    const source = new URL(project.siteUrl);
    // The published project address is authoritative; query strings never control a fetch.
    source.search = "";
    source.hash = "";
    const key = source.href;
    let entry = cache.get(key);
    if (!entry) {
      entry = { expires: 0, artwork: null };
      cache.set(key, entry);
    }
    if (entry.expires <= now()) {
      const artwork = await readArtwork(key, fetcher);
      if (artwork) entry.artwork = artwork;
      entry.expires = now() + (artwork ? freshness : 30_000);
    }
    const artwork = entry.artwork;
    if (!artwork) return project;
    return {
      ...project,
      previewImage: artwork.image,
      previewAlt: artwork.alt || `Artwork from the ${project.name} site.`,
      previewCaption: "Artwork from the product's own site.",
      previewWidth: artwork.width ?? 1200,
      previewHeight: artwork.height ?? 630
    };
  };
}

export const liveProjectArtwork = createProjectArtworkReader();
