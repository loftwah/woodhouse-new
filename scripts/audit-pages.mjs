import { readFile } from "node:fs/promises";
import path from "node:path";
import { scanPublicText } from "./public-privacy.mjs";

const args = process.argv.slice(2);
if (args[0] === "--") args.shift();
const origin = (args[0] ?? "https://woodhouse-loftwah-preview.loftwah.workers.dev").replace(
  /\/$/,
  ""
);
if (!/^https?:\/\//.test(origin))
  throw new Error(
    "Usage: pnpm run audit:pages -- [origin] (https://host or http://localhost:port)"
  );

const alwaysChecked = [
  "/",
  "/factory/",
  "/projects/",
  "/dispatches/",
  "/incidents/",
  "/evidence/",
  "/conversations/",
  "/architecture/",
  "/doctrine/",
  "/dean/",
  "/agents/",
  "/contact/"
];

function parseEnv(contents) {
  const values = new Map();
  for (const line of contents.split("\n")) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    values.set(match[1], match[2]);
  }
  return values;
}

let privateValues = [];
try {
  const contents = await readFile(path.join(process.cwd(), ".env"), "utf8");
  privateValues = [...parseEnv(contents)].flatMap(([name, value]) =>
    /(?:key|token|secret)/i.test(name) || /@deanlofts\.xyz$/i.test(value) ? [value] : []
  );
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

function attributes(tag) {
  const result = new Map();
  for (const match of tag.matchAll(/([a-zA-Z-]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
    const value = match[2] ?? "";
    result.set(match[1].toLowerCase(), value.replace(/^["']|["']$/g, ""));
  }
  return result;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map((match) => ({
    name,
    raw: match[0],
    attrs: attributes(match[1] ?? "")
  }));
}

function elements(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>([\\s\\S]*?)</${name}>`, "gi"))].map(
    (match) => ({
      name,
      raw: match[0],
      attrs: attributes(match[1] ?? ""),
      inner: match[2] ?? ""
    })
  );
}

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function accessibleName(element) {
  const aria = element.attrs.get("aria-label");
  if (aria?.trim()) return aria.trim();
  const labelledBy = element.attrs.get("aria-labelledby");
  if (labelledBy?.trim()) return labelledBy.trim();
  const own = plainText(element.inner);
  if (own) return own;
  const image = /<img\b([^>]*)>/i.exec(element.inner)?.[1];
  return image ? (attributes(image).get("alt") ?? "").trim() : "";
}

const findings = [];
function report(page, message) {
  findings.push(`${page}: ${message}`);
}

function headingLevels(html) {
  const levels = [];
  for (const match of html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    levels.push({ level: Number(match[1]), label: match[2].replace(/<[^>]+>/g, "").trim() });
  }
  return levels;
}

const socialImages = new Map();
const socialImageStatus = new Map();

function auditDocument(page, html) {
  const htmlTag = /<html\b([^>]*)>/i.exec(html)?.[1] ?? "";
  if (!/\blang="[a-zA-Z-]+"/.test(htmlTag)) report(page, "missing html lang attribute");
  if (!/<meta[^>]+name="viewport"/i.test(html)) report(page, "missing viewport meta");
  if (/<meta[^>]+name="color-scheme"[^>]+content="(?!dark)/i.test(html))
    report(page, "colour scheme is not fixed to dark");

  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((match) =>
    match[1].replace(/\s+/g, " ").trim()
  );
  if (titles.length !== 1 || !titles[0])
    report(page, `expected one non-empty title, found ${titles.length}`);

  const description = /<meta[^>]+name="description"[^>]+content="([^"]*)"/i.exec(html)?.[1] ?? "";
  if (!description.trim()) report(page, "missing non-empty description meta");

  const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(html)?.[1];
  if (!canonical) report(page, "missing canonical link");
  else {
    const pageUrl = new URL(page, origin);
    let parsed;
    try {
      parsed = new URL(canonical);
    } catch {
      report(page, "canonical link is not an absolute URL");
    }
    if (parsed && parsed.origin !== pageUrl.origin)
      report(page, `canonical points outside this origin: ${canonical}`);
    if (parsed && parsed.pathname.replace(/\/$/, "") !== pageUrl.pathname.replace(/\/$/, ""))
      report(page, `canonical path does not match the page: ${canonical}`);
  }

  for (const property of ["og:title", "og:image", "og:description"]) {
    if (!new RegExp(`<meta[^>]+property="${property}"[^>]+content="[^"]+"`, "i").test(html))
      report(page, `missing ${property} meta`);
  }

  const socialImage = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i.exec(html)?.[1];
  if (socialImage) {
    let resolved;
    try {
      resolved = new URL(socialImage, `${origin}${page}`);
    } catch {
      report(page, `og:image is not a usable URL: ${socialImage}`);
    }
    if (resolved?.origin === new URL(origin).origin) {
      for (const property of ["og:image:width", "og:image:height"])
        if (!new RegExp(`<meta[^>]+property="${property}"[^>]+content="\\d+"`, "i").test(html))
          report(page, `social image without ${property}`);
      if (!socialImages.has(resolved.pathname)) {
        socialImages.set(resolved.pathname, page);
        socialImageStatus.set(resolved.pathname, undefined);
      }
    }
  }

  const headings = headingLevels(html);
  const h1Count = headings.filter((heading) => heading.level === 1).length;
  if (h1Count !== 1) report(page, `expected exactly one h1, found ${h1Count}`);
  let previous = 0;
  for (const heading of headings) {
    if (previous && heading.level > previous + 1)
      report(
        page,
        `heading level jumps from h${previous} to h${heading.level} at "${heading.label}"`
      );
    previous = heading.level;
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const seenIds = new Set();
  for (const id of ids) {
    if (seenIds.has(id)) report(page, `duplicate id "${id}"`);
    seenIds.add(id);
  }

  for (const anchor of elements(html, "a")) {
    const href = anchor.attrs.get("href") ?? "";
    if (!anchor.attrs.has("href")) report(page, `anchor without href: ${anchor.raw.slice(0, 80)}`);
    if (anchor.attrs.get("tabindex") && Number(anchor.attrs.get("tabindex")) > 0)
      report(page, `positive tabindex on ${anchor.raw.slice(0, 80)}`);
    if (anchor.attrs.get("target") === "_blank" && !/noopener/i.test(anchor.attrs.get("rel") ?? ""))
      report(page, `target=_blank without rel=noopener: ${href}`);
    if (anchor.attrs.get("aria-hidden") === "true" && !anchor.attrs.get("tabindex"))
      report(page, `aria-hidden anchor remains focusable: ${href}`);
    if (!accessibleName(anchor))
      report(page, `link without accessible text: ${href || anchor.raw.slice(0, 80)}`);
  }

  for (const control of [...elements(html, "button"), ...elements(html, "summary")]) {
    if (!accessibleName(control))
      report(page, `control without accessible name: ${control.raw.slice(0, 80)}`);
  }

  for (const image of tags(html, "img")) {
    if (!image.attrs.has("alt"))
      report(page, `image missing alt attribute: ${image.raw.slice(0, 80)}`);
    if (!image.attrs.get("src") && !image.attrs.get("srcset"))
      report(page, `image without a source: ${image.raw.slice(0, 80)}`);
    const eager = image.attrs.get("loading") !== "lazy";
    const sized = image.attrs.get("width") && image.attrs.get("height");
    if (eager && !sized)
      report(page, `eager image without intrinsic size: ${image.raw.slice(0, 90)}`);
  }
}

// Each run reads the current deployment rather than a shared cached body, so a
// stale edge response cannot mask or invent a finding.
const stamp = Date.now().toString(36);
async function request(url) {
  const target = new URL(url);
  target.searchParams.set("audit", stamp);
  return fetch(target, { redirect: "manual", signal: AbortSignal.timeout(30000) });
}

const sitemap = await request(`${origin}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`${origin}/sitemap.xml returned HTTP ${sitemap.status}.`);
const sitemapBody = await sitemap.text();
const sitemapPages = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].replaceAll("&amp;", "&"))
  .map((location) => new URL(location));
for (const url of sitemapPages)
  if (url.origin !== origin) findings.push(`sitemap.xml points outside ${origin}: ${url}`);

const pages = [...new Set([...sitemapPages.map((url) => url.pathname), ...alwaysChecked])];
const titles = new Map();
const internalLinks = new Map();
const checked = [];

for (const page of pages) {
  const response = await request(`${origin}${page}`);
  if (response.status !== 200) {
    report(page, `returned HTTP ${response.status}`);
    continue;
  }
  const html = await response.text();
  const privacy = scanPublicText(html, { privateValues });
  if (privacy.length) report(page, `privacy scan found ${privacy.join(", ")}`);
  auditDocument(page, html);

  const title = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)][0]?.[1]
    .replace(/\s+/g, " ")
    .trim();
  if (title) {
    const previous = titles.get(title);
    if (previous) report(page, `duplicate page title, also used by ${previous}`);
    else titles.set(title, page);
  }

  const targets = new Set();
  for (const anchor of tags(html, "a")) {
    const href = anchor.attrs.get("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
      continue;
    let resolved;
    try {
      resolved = new URL(href, `${origin}${page}`);
    } catch {
      report(page, `unresolvable link ${href}`);
      continue;
    }
    if (resolved.origin !== origin) continue;
    targets.add(resolved.pathname);
  }
  internalLinks.set(page, [...targets]);
  checked.push(page);
}

const linkedFrom = new Set([...internalLinks.values()].flat());
for (const [page, targets] of internalLinks) {
  for (const target of targets) {
    if (pages.includes(target)) continue;
    const response = await request(`${origin}${target}`);
    if (response.status >= 400)
      report(page, `links to ${target}, which returned HTTP ${response.status}`);
  }
}

const orphans = pages.filter((page) => page !== "/" && !linkedFrom.has(page));
for (const orphan of orphans) report(orphan, "is listed for discovery but no page links to it");

for (const [image, page] of socialImages) {
  const response = await request(`${origin}${image}`);
  const type = response.headers.get("content-type") ?? "";
  socialImageStatus.set(image, response.status);
  if (response.status !== 200) report(page, `og:image ${image} returned HTTP ${response.status}`);
  else if (!/^image\//.test(type)) report(page, `og:image ${image} served ${type || "no type"}`);
}

console.log(
  `Audited ${checked.length} pages, ${linkedFrom.size} distinct internal link targets, ${socialImages.size} same-origin social images and ${titles.size} unique titles at ${origin}.`
);
if (findings.length) {
  for (const finding of findings) console.error("Page audit failed: " + finding);
  process.exitCode = 1;
} else {
  console.log("No broken links, private values or document-structure findings.");
}
