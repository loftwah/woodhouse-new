/**
 * Shared public-exposure primitives.
 *
 * One module owns the patterns, the published-path rules and the `.env` parser so
 * the local build guard and the remote HTTP checks cannot drift. The observed
 * failure was a quoted `.env` value that the local check un-quoted and the remote
 * page audit did not, so a secret could pass one check and fail the other.
 *
 * Nothing here prints a matched value; findings are labels and paths only.
 */
const PRIVATE_EMAIL = /\b[A-Z0-9._%+-]+@deanlofts\.xyz\b/i;

const PUBLIC_MARKERS = [
  ["private email domain", "@deanlofts.xyz"],
  ["EmDash environment marker", "EMDASH_"],
  ["EmDash API token prefix", "ec_pat_"],
  ["Resend secret name", "RESEND_API_KEY"]
];

/**
 * High-confidence credential shapes only. A minified bundle is full of long
 * identifiers, so a broad "looks random" rule would fail every legitimate build.
 * Each pattern matches a real, documented token format.
 */
export const SECRET_PATTERNS = [
  ["AWS access key id", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ["GitHub fine-grained token", /\bgithub_pat_[A-Za-z0-9_]{20,}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ["Stripe secret key", /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Resend API key", /\bre_[A-Za-z0-9]{24,}\b/],
  ["EmDash API token", /\bec_pat_[A-Za-z0-9]{16,}\b/],
  ["JSON web token", /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/],
  ["private key block", /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/]
];

/** Directories that must never appear in a published artefact. */
const RISKY_DIRECTORIES = [".git", ".ssh", ".aws", ".gcloud"];
/** Exact file names that hold credentials or client configuration. */
const RISKY_BASENAMES = new Map([
  [".dev.vars", "Cloudflare local variables file"],
  [".npmrc", "npm client configuration with possible auth token"],
  [".netrc", "credential file"],
  [".git-credentials", "credential file"],
  [".htpasswd", "credential file"],
  ["id_rsa", "private key"],
  ["id_dsa", "private key"],
  ["id_ecdsa", "private key"],
  ["id_ed25519", "private key"],
  ["service-account.json", "service account credential"],
  ["credentials.json", "service account credential"]
]);
/** Extensions that hold key material or credential bundles. */
const RISKY_EXTENSIONS = [".pem", ".key", ".p12", ".pfx", ".keystore", ".jks", ".ppk", ".der"];

/**
 * Why a published path is dangerous, or null. Accepts a relative path with
 * either separator so it can be used for a filesystem artefact and for a URL.
 */
export function riskyPathReason(relativePath) {
  const segments = String(relativePath).replaceAll("\\", "/").split("/").filter(Boolean);
  for (const directory of RISKY_DIRECTORIES)
    if (segments.includes(directory)) return `${directory} directory`;
  const base = (segments.at(-1) ?? "").toLowerCase();
  if (base === ".env" || base.startsWith(".env.") || base.endsWith(".env"))
    return "environment file";
  if (base.startsWith(".dev.vars")) return "Cloudflare local variables file";
  const named = RISKY_BASENAMES.get(base);
  if (named) return named;
  for (const extension of RISKY_EXTENSIONS)
    if (base.endsWith(extension)) return `${extension} key material`;
  return null;
}

/** The risky request paths the remote audit asks for. Safe, non-destructive GETs. */
export const RISKY_PUBLISHED_PATHS = [
  "/.env",
  "/.env.production",
  "/.env.local",
  "/.dev.vars",
  "/.git/config",
  "/.git/HEAD",
  "/id_rsa",
  "/.npmrc",
  "/service-account.json"
];

/**
 * Parse a dotenv file the same way everywhere: strip an optional `export`, trim,
 * and remove one layer of matching surrounding quotes. Values keep their inner
 * content so a quoted secret is compared exactly as it is served.
 */
export function parseEnvFile(contents) {
  const values = new Map();
  for (const line of String(contents).split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2];
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    )
      value = value.slice(1, -1);
    values.set(match[1], value);
  }
  return values;
}

/**
 * The values that must never appear in a published artefact: anything whose name
 * implies a credential, plus the private notification address. `PUBLIC_*` names
 * are deliberate client configuration and are excluded by that naming contract,
 * not by trusting the prefix to be safe — a public value is still scanned for
 * high-confidence secret shapes.
 */
export function privateEnvValues(values) {
  const selected = [];
  for (const [name, value] of values) {
    if (typeof value !== "string" || value.length < 8) continue;
    if (/^PUBLIC_/i.test(name)) continue;
    if (
      /(?:key|token|secret|password|passwd|credential)/i.test(name) ||
      /@deanlofts\.xyz$/i.test(value)
    )
      selected.push(value);
  }
  return selected;
}

/**
 * Scan a body for private values, optional Woodhouse markers and, when asked,
 * high-confidence secret shapes. Returns labels only, never the match itself.
 */
export function scanPublicText(
  value,
  { privateValues = [], includeMarkers = true, includePatterns = false } = {}
) {
  const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
  const findings = [];
  if (PRIVATE_EMAIL.test(text)) findings.push("private email address");
  for (const privateValue of privateValues) {
    if (
      typeof privateValue === "string" &&
      privateValue.length >= 8 &&
      text.includes(privateValue)
    ) {
      findings.push("configured private value");
      break;
    }
  }
  if (includeMarkers) {
    for (const [label, marker] of PUBLIC_MARKERS) {
      if (text.includes(marker)) findings.push(label);
    }
  }
  if (includePatterns) {
    for (const [label, pattern] of SECRET_PATTERNS) {
      if (pattern.test(text)) findings.push(label);
    }
  }
  return [...new Set(findings)];
}

/**
 * Safe negative HTTP checks against a deployed origin.
 *
 * A missing file must not resolve to secret content. A generic 200 HTML fallback
 * (an SPA that answers every path with its shell) is neither exposure nor proof
 * of safety, so it is reported separately and the local artefact scan remains the
 * safety argument. A 200 with a credential shape, or an unexpected non-HTML body
 * at a credential path, fails.
 */
export async function checkPublishedPaths(
  origin,
  { fetcher = fetch, privateValues = [], timeoutMs = 15000 } = {}
) {
  const results = [];
  for (const pathname of RISKY_PUBLISHED_PATHS) {
    let response;
    try {
      response = await fetcher(new URL(pathname, origin), {
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs)
      });
    } catch (error) {
      results.push({ path: pathname, status: null, outcome: "unreachable", detail: String(error) });
      continue;
    }
    const type = response.headers.get("content-type") ?? "";
    const body = await response.text().catch(() => "");
    const findings = scanPublicText(body, {
      privateValues,
      includeMarkers: false,
      includePatterns: true
    });
    if ([403, 404, 410].includes(response.status))
      results.push({ path: pathname, status: response.status, outcome: "absent" });
    else if (findings.length)
      results.push({
        path: pathname,
        status: response.status,
        outcome: "exposed",
        detail: findings.join(", ")
      });
    else if (/^text\/html\b/i.test(type))
      results.push({
        path: pathname,
        status: response.status,
        outcome: "fallback",
        detail: "generic HTML served; not exposure and not proof of safety"
      });
    else
      results.push({
        path: pathname,
        status: response.status,
        outcome: "unexpected",
        detail: `served ${type || "no content type"} without a recognised secret`
      });
  }
  return results;
}
