import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkBuildPrivacy } from "./check-build-privacy.mjs";
import {
  checkPublishedPaths,
  parseEnvFile,
  privateEnvValues,
  riskyPathReason,
  scanPublicText
} from "./public-privacy.mjs";

/**
 * Wholly synthetic markers. No real credential, account or private value appears
 * in this file; the strings below are invented for the test only.
 */
const CANARY = "wh-test-canary-3f9a2b7c1d4e5f608192a3b4c5d6e7f8";
const FAKE_AWS_KEY = "AKIA" + "Q".repeat(16);
const FAKE_GITHUB_TOKEN = "ghp_" + "z".repeat(36);
const FAKE_PRIVATE_KEY_HEADER = "-----BEGIN RSA PRIVATE KEY-----";

async function fixture(files) {
  const root = await mkdtemp(path.join(os.tmpdir(), "wh-secret-"));
  for (const [relative, contents] of Object.entries(files)) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  return root;
}

test("risky published paths are rejected by name, directory and extension", () => {
  for (const dangerous of [
    ".env",
    "client/.env",
    "client/assets/.env.production",
    "client/deep/nested/.env.local",
    "server/.dev.vars",
    "dist/.git/config",
    "client/id_rsa",
    "client/.npmrc",
    "client/keys/service-account.json",
    "client/certs/origin.pem",
    "client/certs/private.key"
  ])
    assert(riskyPathReason(dangerous), `expected ${dangerous} to be risky`);
  for (const safe of [
    "client/index.html",
    "client/_astro/app.js",
    "server/entry.mjs",
    "client/images/og.jpg",
    "client/.well-known/security.txt",
    "client/envoy.js"
  ])
    assert.equal(riskyPathReason(safe), null, `expected ${safe} to be safe`);
});

test("a quoted .env value is parsed identically for the local and remote checks", () => {
  const values = parseEnvFile(
    ['export TEST_API_KEY="quoted-' + CANARY + '"', "OTHER='single value'", "PLAIN=abc"].join(
      "\r\n"
    )
  );
  assert.equal(values.get("TEST_API_KEY"), `quoted-${CANARY}`);
  assert.equal(values.get("OTHER"), "single value");
  assert.equal(values.get("PLAIN"), "abc");
  assert.deepEqual(privateEnvValues(values), [`quoted-${CANARY}`]);
  // Deliberate client configuration is not a private value, but its content is
  // still scanned for high-confidence secret shapes.
  const publicOnes = parseEnvFile(`PUBLIC_TEST_KEY="${CANARY}"\nTEST_TOKEN="${CANARY}"`);
  assert.deepEqual(privateEnvValues(publicOnes), [CANARY]);
  assert.deepEqual(
    scanPublicText(`const key = "${CANARY}"`, {
      privateValues: [],
      includeMarkers: false,
      includePatterns: true
    }),
    []
  );
});

test("high-confidence secret shapes are detected without printing the value", () => {
  for (const [label, body] of [
    ["AWS access key id", `key=${FAKE_AWS_KEY}`],
    ["GitHub token", `token: ${FAKE_GITHUB_TOKEN}`],
    ["private key block", `${FAKE_PRIVATE_KEY_HEADER}\nMIIB...`]
  ]) {
    const findings = scanPublicText(body, {
      includeMarkers: false,
      includePatterns: true
    });
    assert(findings.includes(label), `expected ${label} in ${JSON.stringify(findings)}`);
    assert(!findings.join(" ").includes(FAKE_AWS_KEY), "finding text must not echo the value");
  }
  assert.deepEqual(
    scanPublicText("ordinary minified bundle with a very longIdentifier_1234567890", {
      includeMarkers: false,
      includePatterns: true
    }),
    []
  );
});

test("a build that leaks a synthetic secret fails before deploy", async () => {
  const root = await fixture({
    ".env": `TEST_API_KEY="${CANARY}"\nPUBLIC_ANALYTICS_ID="public-but-fine"\n`,
    "dist/client/index.html": "<!doctype html><title>Woodhouse</title>",
    // A configured value leaked into a client bundle.
    "dist/client/_astro/app.js": `fetch("/x",{headers:{authorization:"Bearer ${CANARY}"}})`,
    // A credential shape with no matching local value still fails.
    "dist/client/_astro/vendor.js": `window.__k="${FAKE_AWS_KEY}"`,
    // A hidden/staged environment file and a Worker runtime variables file.
    "dist/client/.env": `TEST_API_KEY=${CANARY}`,
    "dist/server/.dev.vars": `TEST_API_KEY=${CANARY}`,
    // A nested source map carrying the secret.
    "dist/server/chunks/app.mjs.map": JSON.stringify({ sourcesContent: [CANARY] }),
    "seed/seed.json": JSON.stringify({ content: { conversations: [] } })
  });
  try {
    const result = await checkBuildPrivacy({ root });
    assert.equal(result.ok, false);
    const labels = result.findings.map((f) => f.label).join(" | ");
    assert.match(labels, /configured private value/);
    assert.match(labels, /AWS access key id/);
    assert.match(labels, /published environment file/);
    assert.match(labels, /published Cloudflare local variables file/);
    const rendered = result.findings
      .map((f) => `${f.label} ${path.relative(root, f.file)}`)
      .join(" ");
    assert(!rendered.includes(CANARY), "the report must not print the secret value");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("an innocuous build passes, including deliberate server-side marker references", async () => {
  const root = await fixture({
    ".env": `TEST_API_KEY="${CANARY}"\nPUBLIC_ANALYTICS_ID="public-but-fine"\n`,
    "dist/client/index.html": "<!doctype html><title>Woodhouse</title>",
    "dist/client/_astro/app.js": "console.log('analytics workbench ready')",
    // The Worker legitimately references EmDash internals and the public config;
    // those are not private values and must not fail the guard.
    "dist/server/entry.mjs": 'const envName = "EMDASH_ENVIRONMENT"; const id = "public-but-fine";',
    "seed/seed.json": JSON.stringify({ content: { conversations: [] } })
  });
  try {
    const result = await checkBuildPrivacy({ root });
    assert.deepEqual(result.findings, []);
    assert.equal(result.ok, true);
    assert.equal(result.files, 3);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a missing build artefact fails closed", async () => {
  const root = await fixture({ ".env": `TEST_API_KEY="${CANARY}"\n` });
  try {
    const result = await checkBuildPrivacy({ root });
    assert.equal(result.ok, false);
    assert.match(result.findings.map((f) => f.label).join(" "), /no build artefact/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("deployed credential paths are checked with safe negative requests", async () => {
  const jsonResponse = (status, body, type = "text/plain") =>
    new Response(body, { status, headers: { "content-type": type } });
  const results = await checkPublishedPaths("https://example.test", {
    privateValues: [CANARY],
    fetcher: async (url) => {
      const { pathname } = new URL(url);
      if (pathname === "/.env") return jsonResponse(200, `TEST_API_KEY="${CANARY}"`);
      if (pathname === "/.git/config") return jsonResponse(200, `key=${FAKE_AWS_KEY}`);
      if (pathname === "/.npmrc")
        return jsonResponse(200, "<!doctype html><h1>Woodhouse</h1>", "text/html");
      if (pathname === "/id_rsa") return jsonResponse(200, "unexpected text", "text/plain");
      return jsonResponse(404, "Not found");
    }
  });
  const byPath = new Map(results.map((r) => [r.path, r]));
  assert.equal(byPath.get("/.env").outcome, "exposed");
  assert.equal(byPath.get("/.git/config").outcome, "exposed");
  assert.equal(byPath.get("/.npmrc").outcome, "fallback");
  assert.equal(byPath.get("/id_rsa").outcome, "unexpected");
  assert.equal(byPath.get("/.dev.vars").outcome, "absent");
  assert(!JSON.stringify(results).includes(CANARY), "the report must not print the secret value");
});

test("an unreachable origin is reported rather than passing silently", async () => {
  const results = await checkPublishedPaths("https://example.test", {
    fetcher: async () => {
      throw new Error("connect ECONNREFUSED");
    }
  });
  assert(results.every((r) => r.outcome === "unreachable"));
});
