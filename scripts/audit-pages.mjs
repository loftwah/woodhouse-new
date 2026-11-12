import { readFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  checkPublishedPaths,
  parseEnvFile,
  privateEnvValues,
  scanPublicText
} from "./public-privacy.mjs";
import { isCloudflareHiddenContentLink, socialImageURL } from "./page-link-policy.mjs";
import { auditScopeArguments } from "./publication-audit-scope.mjs";

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
const focusedPaths = args.filter((arg) => arg.startsWith("--path=")).map((arg) => arg.slice(7));
if (focusedPaths.length) auditScopeArguments(focusedPaths);
const intervalOption = args.find((arg) => arg.startsWith("--request-interval="));
const requestInterval = Number(intervalOption?.slice("--request-interval=".length) ?? 0);
if (!Number.isInteger(requestInterval) || requestInterval < 0 || requestInterval > 1000)
  throw new Error("Request interval must be an integer from 0 to 1000 milliseconds.");

const alwaysChecked = [
  "/",
  "/factory/",
  "/connections/",
  "/share/",
  "/search/",
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

// The same parser the build guard uses, so a quoted `.env` value is compared
// identically on the local artefact and against the deployed origin.
let privateValues = [];
try {
  privateValues = privateEnvValues(
    parseEnvFile(await readFile(path.join(process.cwd(), ".env"), "utf8"))
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
      resolved = socialImageURL(socialImage, `${origin}${page}`);
    } catch {
      report(page, `og:image is not a usable URL: ${socialImage}`);
    }
    if (resolved?.origin === new URL(origin).origin) {
      for (const property of ["og:image:width", "og:image:height"])
        if (!new RegExp(`<meta[^>]+property="${property}"[^>]+content="\\d+"`, "i").test(html))
          report(page, `social image without ${property}`);
      const identity = resolved.pathname + resolved.search;
      if (!socialImages.has(identity)) {
        // Snapshot/game query fields are image identity, not disposable tracking.
        socialImages.set(identity, page);
        socialImageStatus.set(identity, undefined);
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

  // A complementary landmark inside <main> is exposed as a second page-level
  // region. Supplementary notes belong to the article, not beside it.
  const main = /<main\b[^>]*>([\s\S]*)<\/main>/i.exec(html)?.[1] ?? "";
  if (/<aside\b/i.test(main)) report(page, "has an aside landmark inside main");

  for (const anchor of elements(html, "a")) {
    const href = anchor.attrs.get("href") ?? "";
    try {
      const url = new URL(href, `${origin}${page}`);
      if (url.origin === origin && isCloudflareHiddenContentLink(anchor, url)) continue;
    } catch {
      // The navigation audit reports invalid URLs; retain accessibility checks.
    }
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
// stale edge response cannot mask or invent a finding. Public routes still
// serve through the Worker cache for up to its own TTL, which is keyed by path
// rather than by query, so a finding right after a deploy can be a pre-deploy
// body. Re-run after the route TTL (60s) to confirm.
const stamp = Date.now().toString(36);
let nextRequest = 0;
async function request(url) {
  const target = new URL(url);
  target.searchParams.set("audit", stamp);
  if (requestInterval) {
    const now = Date.now();
    const slot = Math.max(nextRequest, now);
    nextRequest = slot + requestInterval;
    if (slot > now) await delay(slot - now);
  }
  return fetch(target, { redirect: "manual", signal: AbortSignal.timeout(30000) });
}

/**
 * The audit used to wait for one request at a time: roughly six hundred
 * sequential round trips for 212 pages, their link targets, canonicals and
 * social images. That was most of a release. Six in flight keeps the same
 * requests and the same findings while removing the queueing, and every phase
 * below still processes results in a fixed order so messages stay stable.
 */
const CONCURRENCY = 6;
async function pool(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

const sitemap = await request(`${origin}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`${origin}/sitemap.xml returned HTTP ${sitemap.status}.`);
const sitemapBody = await sitemap.text();
const sitemapPages = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].replaceAll("&amp;", "&"))
  .map((location) => new URL(location));
for (const url of sitemapPages)
  if (url.origin !== origin) findings.push(`sitemap.xml points outside ${origin}: ${url}`);

const pages = focusedPaths.length
  ? [...new Set(focusedPaths)]
  : [...new Set([...sitemapPages.map((url) => url.pathname), ...alwaysChecked])];
const titles = new Map();
const internalLinks = new Map();
const checked = [];

const canonicals = new Map();

function canonicalPath(html, target) {
  const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(html)?.[1];
  if (!canonical) return null;
  try {
    return new URL(canonical).pathname.replace(/\/$/, "");
  } catch {
    if (target) report(target, "linked document has an invalid canonical URL");
    return null;
  }
}

// Fetch the documents together, then inspect them in sitemap order. Only the
// waiting changes: the findings, their order and their wording do not.
// A not-found route is supposed to answer 404. Treating it as a failed 200 page
// made a scoped audit of the real 404 unreleasable while the response was
// correct. Every other page must still answer 200.
const expectedStatus = (page) => (page === "/404/" ? 404 : 200);
const documents = await pool(pages, async (page) => {
  const response = await request(`${origin}${page}`);
  if (response.status !== expectedStatus(page)) {
    await response.body?.cancel();
    return { page, status: response.status, html: null };
  }
  return { page, status: response.status, html: await response.text() };
});

for (const document of documents) {
  const { page, status, html: body } = document;
  if (status !== expectedStatus(page) || body === null) {
    report(page, `returned HTTP ${status}; expected ${expectedStatus(page)}`);
    continue;
  }
  const html = body;
  // This document is already in hand. A second GET adds latency and can even
  // audit a different response from the one whose links and privacy we inspect.
  canonicals.set(page, canonicalPath(html));
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
  // The global search dialog links to the entire site on every page. For a
  // focused audit inspect the selected page's own main content; a full audit
  // still follows navigation and search links across the whole sitemap.
  const linkScope = focusedPaths.length
    ? (/<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] ?? html).replace(
        /<dialog\b[^>]*>[\s\S]*?<\/dialog>/gi,
        ""
      )
    : html;
  for (const anchor of elements(linkScope, "a")) {
    const href = anchor.attrs.get("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
      continue;
    let resolved;
    try {
      resolved = socialImageURL(href, `${origin}${page}`);
    } catch {
      report(page, `unresolvable link ${href}`);
      continue;
    }
    if (resolved.origin !== origin) continue;
    if (isCloudflareHiddenContentLink(anchor, resolved)) continue;
    targets.add(resolved.pathname + resolved.search);
  }
  internalLinks.set(page, [...targets]);

  // The standalone search index supplies both the dialog and native search.
  if (page === "/search/") {
    if (!/<ul[^>]*data-public-search-index/.test(html)) report(page, "search index is missing");
    const searchHrefs = new Set();
    const searchTargets = [
      ...html.matchAll(/<li[^>]*data-search-item[^>]*>[\s\S]*?href="([^"]+)"/g)
    ]
      .map((match) => match[1])
      .filter((href) => href.startsWith("/"));
    for (const href of searchTargets) {
      if (searchHrefs.has(href)) report(page, `search index lists ${href} more than once`);
      searchHrefs.add(href);
    }
    const announced = /([\d,]+) pages in the index/.exec(html)?.[1];
    if (announced && Number(announced.replaceAll(",", "")) !== searchTargets.length)
      report(page, `search page announces ${announced} pages but lists ${searchTargets.length}`);
  }
  checked.push(page);
}

const linkedFrom = new Set([...internalLinks.values()].flat());
const linkedPaths = new Set([...linkedFrom].map((link) => new URL(link, origin).pathname));
// Keep one status per exact destination while retaining a finding for every
// linking page. Shared navigation and downloads otherwise repeat the same GET.
const targetFindings = new Map();
const pageSet = new Set(pages);
const uncheckedTargets = [...linkedFrom].filter((target) => !pageSet.has(target));
const redirectStatuses = new Set([301, 302, 303, 307, 308]);
await pool(uncheckedTargets, async (target) => {
  let url = new URL(target, origin);
  const visited = new Set([url.href]);
  for (;;) {
    const response = await request(url);
    if (!redirectStatuses.has(response.status)) {
      if (response.status >= 400) {
        const detail = visited.size > 1 ? `, which redirects to ${url.pathname}` : "";
        targetFindings.set(target, `${detail}, which returned HTTP ${response.status}`);
      } else if (visited.size > 1) {
        linkedPaths.add(url.pathname);
      }
      if (
        visited.size === 1 &&
        response.status === 200 &&
        /^text\/html\b/i.test(response.headers.get("content-type") ?? "")
      ) {
        canonicals.set(target, canonicalPath(await response.text(), target));
      } else {
        await response.body?.cancel();
      }
      return;
    }
    const location = response.headers.get("location");
    await response.body?.cancel();
    try {
      if (!location) throw new Error();
      url = new URL(location, url);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
        throw new Error();
    } catch {
      targetFindings.set(target, ", which has an invalid redirect location");
      return;
    }
    if (url.origin !== origin) return;
    url.hash = "";
    url.searchParams.delete("audit");
    if (visited.has(url.href) || visited.size > 5) {
      targetFindings.set(target, ", which exceeded the same-origin redirect limit");
      return;
    }
    visited.add(url.href);
  }
});
for (const [page, targets] of internalLinks) {
  for (const target of targets) {
    const finding = targetFindings.get(target);
    if (finding) report(page, `links to ${target}${finding}`);
  }
}

const orphans = focusedPaths.length
  ? []
  : pages.filter((page) => page !== "/" && !linkedPaths.has(page));
for (const orphan of orphans) report(orphan, "is listed for discovery but no page links to it");

// An internal link must point at the page's own canonical URL. A record id
// used as a path segment resolves but splits one page across several
// crawlable addresses, which is how the dated records drifted apart before.
// Read the canonicals collected with the original status observations.
for (const [page, targets] of internalLinks) {
  for (const target of targets) {
    const canonical = canonicals.get(target);
    if (canonical && canonical !== new URL(target, origin).pathname.replace(/\/$/, ""))
      report(page, `links to ${target}, whose canonical URL is ${canonical}`);
  }
}

const socialResults = await pool([...socialImages.keys()], async (image) => {
  const response = await request(`${origin}${image}`);
  const type = response.headers.get("content-type") ?? "";
  socialImageStatus.set(image, response.status);
  const finding =
    response.status !== 200
      ? `og:image ${image} returned HTTP ${response.status}`
      : !/^image\//.test(type)
        ? `og:image ${image} served ${type || "no type"}`
        : null;
  await response.body?.cancel();
  return finding;
});
socialResults.forEach((finding, index) => {
  if (finding) report(socialImages.get([...socialImages.keys()][index]), finding);
});

// Safe negative requests to known credential paths. A missing file must not
// resolve to secret content. A generic HTML fallback is recorded but is neither
// exposure nor proof of safety; the local artefact scan remains that argument.
const riskyPaths = await checkPublishedPaths(origin, { privateValues });
let riskyAbsent = 0;
const riskyFallbacks = [];
for (const result of riskyPaths) {
  if (result.outcome === "absent") riskyAbsent += 1;
  else if (result.outcome === "exposed")
    report(result.path, `served ${result.detail} (HTTP ${result.status})`);
  else if (result.outcome === "unexpected") report(result.path, result.detail);
  else if (result.outcome === "fallback") riskyFallbacks.push(result.path);
  else report(result.path, `negative check could not complete: ${result.detail}`);
}
if (riskyFallbacks.length)
  console.log(
    `Credential paths answered with a generic HTML fallback and no secret content (neither exposure nor proof of safety): ${riskyFallbacks.join(", ")}.`
  );

console.log(
  `Audited ${checked.length} ${focusedPaths.length ? "selected" : "sitemap"} pages, ${linkedFrom.size} distinct internal link targets, ${socialImages.size} same-origin social images and ${titles.size} unique titles at ${origin}. ${riskyAbsent}/${riskyPaths.length} credential paths returned a clean 4xx.`
);
if (findings.length) {
  for (const finding of findings) console.error("Page audit failed: " + finding);
  process.exitCode = 1;
} else {
  console.log("No broken links, private values or document-structure findings.");
}
