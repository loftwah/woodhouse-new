import type { Project } from "./projects";

export type SiteMetadata = {
  title: string;
  description: string;
  image: string;
  icon: string | null;
  freshness: "live" | "fallback";
};

const requests = new Map<string, Promise<SiteMetadata>>();

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  const expression = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(expression)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function readMeta(html: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = attributes(match[0]);
    const key = (tag.property ?? tag.name)?.toLowerCase();
    if (key && tag.content) values[key] = tag.content;
  }
  return values;
}

function readIcon(html: string, siteUrl: string): string | null {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = attributes(match[0]);
    const rel = (tag.rel ?? "").toLowerCase().split(/\s+/);
    if (rel.includes("icon") && tag.href) return new URL(tag.href, siteUrl).toString();
  }
  return null;
}

async function load(project: Project): Promise<SiteMetadata> {
  const fallback: SiteMetadata = {
    title: project.siteOgTitle ?? project.name,
    description: project.siteOgDescription ?? project.summary,
    image: project.previewImage ?? `/og/projects/${project.slug}.svg`,
    icon: project.siteFavicon ? new URL(project.siteFavicon, project.siteUrl).toString() : null,
    freshness: "fallback"
  };

  if (!project.siteUrl) return fallback;

  try {
    const response = await fetch(project.siteUrl, {
      headers: { "user-agent": "Woodhouse project preview metadata refresh" },
      signal: AbortSignal.timeout(7000)
    });
    if (!response.ok) return fallback;

    const html = await response.text();
    const tags = readMeta(html);
    const image = tags["og:image"];
    if (!image) return fallback;

    const title = tags["og:title"] ?? tags.description ?? project.name;
    const description = tags["og:description"] ?? tags.description ?? project.summary;
    return {
      title,
      description,
      image: new URL(image, project.siteUrl).toString(),
      icon: readIcon(html, project.siteUrl),
      freshness: "live"
    };
  } catch {
    return fallback;
  }
}

export function getSiteMetadata(project: Project): Promise<SiteMetadata> {
  const existing = requests.get(project.slug);
  if (existing) return existing;
  const pending = load(project);
  requests.set(project.slug, pending);
  return pending;
}
