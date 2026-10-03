import { readFile } from "node:fs/promises";
import path from "node:path";
import { scanPublicText } from "./public-privacy.mjs";

const root = process.cwd();
const origin = "https://woodhouse-loftwah-preview.loftwah.workers.dev";
const fixedPaths = [
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
  "/contact/",
  "/llms.txt",
  "/robots.txt",
  "/rss.xml",
  "/sitemap.xml",
  "/agents/facts.json"
];

function fail(message) {
  console.error("Preview smoke check failed: " + message);
  process.exit(1);
}

function parseEnv(contents) {
  const values = new Map();
  for (const line of contents.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    if (
      value.length >= 8 &&
      (/(?:key|token|secret)/i.test(match[1]) || /@deanlofts\.xyz$/i.test(value))
    )
      values.set(match[1], value);
  }
  return [...values.values()];
}

let privateValues = [];
try {
  privateValues = parseEnv(await readFile(path.join(root, ".env"), "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

async function get(pathname, { publicResponse = true } = {}) {
  const response = await fetch(new URL(pathname, origin), {
    redirect: "manual",
    signal: AbortSignal.timeout(30000)
  });
  if (publicResponse) {
    const body = await response.text();
    const findings = scanPublicText(body, { privateValues });
    if (findings.length) fail(`${pathname} contains ${findings.join(", ")}.`);
    const headers = [...response.headers].map(([key, value]) => `${key}: ${value}`).join("\n");
    const headerFindings = scanPublicText(headers, { privateValues });
    if (headerFindings.length)
      fail(`${pathname} response headers contain ${headerFindings.join(", ")}.`);
    return { response, body };
  }
  return { response, body: "" };
}

const routeResults = new Map();
for (const pathname of fixedPaths) {
  const result = await get(pathname);
  if (result.response.status !== 200) fail(`${pathname} returned HTTP ${result.response.status}.`);
  routeResults.set(pathname, result);
}

const sitemap = routeResults.get("/sitemap.xml").body;
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  match[1].replaceAll("&amp;", "&")
);
if (!sitemapUrls.length) fail("sitemap.xml contains no page URLs.");
for (const location of sitemapUrls) {
  let url;
  try {
    url = new URL(location);
  } catch {
    fail("sitemap.xml contains an invalid URL.");
  }
  if (url.origin !== origin) fail("sitemap.xml points outside the isolated preview hostname.");
  const pathname = url.pathname;
  const result = await get(pathname);
  if (result.response.status !== 200)
    fail(`${pathname} from sitemap.xml returned HTTP ${result.response.status}.`);
  const html = result.body;
  for (const marker of [
    "<title>",
    'name="description"',
    'rel="canonical"',
    'property="og:title"'
  ]) {
    if (!html.includes(marker)) fail(`${pathname} is missing page-specific metadata (${marker}).`);
  }
}

const deanPage = routeResults.get("/dean/").body;
for (const social of ["https://x.com/loftwah", "https://www.linkedin.com/in/deanlofts/"]) {
  if (!deanPage.includes(social)) fail("Dean's page is missing a supplied social profile link.");
}

const facts = JSON.parse(routeResults.get("/agents/facts.json").body);
if (
  facts.liveTelemetry !== false ||
  facts.permissions?.write !== false ||
  facts.permissions?.privateRepositoryAccess !== false ||
  facts.permissions?.conversationPublishing !== false
) {
  fail("Agent Reception does not state its read-only public-data boundary.");
}
if (!routeResults.get("/robots.txt").body.includes("Disallow: /"))
  fail("Preview robots.txt does not disallow indexing.");
if (!routeResults.get("/rss.xml").body.includes("<rss "))
  fail("RSS did not return an RSS document.");
if (!routeResults.get("/").body.includes("data-search-item"))
  fail("The public search index did not render on the homepage.");

for (const pathname of [
  "/_emdash/admin/",
  "/_emdash/api/auth/mode",
  "/_emdash/api/setup/status",
  "/_emdash/api/mcp"
]) {
  const { response } = await get(pathname, { publicResponse: false });
  const cacheControl = response.headers.get("cache-control") ?? "";
  const robots = response.headers.get("x-robots-tag") ?? "";
  if (
    !response.headers.has("x-robots-tag") ||
    !/noindex/i.test(robots) ||
    !/private/i.test(cacheControl) ||
    !/no-store/i.test(cacheControl)
  ) {
    fail(`${pathname} is missing private, no-store and noindex response headers.`);
  }
}

console.log(
  `Preview public routes, ${sitemapUrls.length} sitemap pages, supplied social links, Agent Reception policy, privacy markers and private EmDash headers passed.`
);
