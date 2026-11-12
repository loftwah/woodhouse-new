import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("checks local redirect destinations, accepts aliases and leaves other origins alone", async (t) => {
  let origin;
  const links = ["/works/", "/broken/", "/loop/", "/external/", "/bad-location/"];
  const counts = new Map();
  const server = createServer((request, response) => {
    const pathname = new URL(request.url, origin).pathname;
    counts.set(pathname, (counts.get(pathname) ?? 0) + 1);
    if (pathname === "/sitemap.xml") {
      response.end(`<urlset><url><loc>${origin}/</loc></url></urlset>`);
    } else if (pathname === "/") {
      response.setHeader("Content-Type", "text/html");
      response.end(
        `<html lang="en"><head><title>Index</title><meta name="viewport" content="width=device-width">
        <meta name="description" content="Fixture"><link rel="canonical" href="${origin}/">
        <meta property="og:title" content="Index"><meta property="og:description" content="Fixture">
        <meta property="og:image" content="https://example.invalid/art.png"></head>
        <body><main><h1>Index</h1>${links.map((link) => `<a href="${link}">${link}</a>`).join("")}</main></body></html>`
      );
    } else if (pathname === "/destination/") {
      response.end("Destination");
    } else if (pathname === "/bad-location/") {
      response.writeHead(302).end();
    } else {
      const location = {
        "/works/": "/destination/",
        "/broken/": "/absent/",
        "/loop/": "/loop/",
        "/external/": "https://example.invalid/"
      }[pathname];
      if (location) response.writeHead(302, { Location: location }).end();
      else response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  origin = `http://127.0.0.1:${server.address().port}`;
  const script = fileURLToPath(new URL("./audit-pages.mjs", import.meta.url));
  const child = spawn(process.execPath, [script, origin, "--path=/", "--request-interval=5"]);
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    output += chunk;
  });
  assert.equal(await new Promise((resolve) => child.on("close", resolve)), 1);
  assert.match(
    output,
    /links to \/broken\/, which redirects to \/absent\/, which returned HTTP 404/
  );
  assert.match(output, /links to \/loop\/, which exceeded the same-origin redirect limit/);
  assert.match(output, /links to \/bad-location\/, which has an invalid redirect location/);
  assert.doesNotMatch(output, /links to \/(?:works|external)\//);
  assert.equal(counts.get("/destination/"), 1);
  assert.equal(counts.get("/loop/"), 1);
});
