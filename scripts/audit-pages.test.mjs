import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("page audit deduplicates reads while retaining broken-link findings and media cleanup", () => {
  const audit = new URL("./audit-pages.mjs", import.meta.url).href;
  const fixture = `
    import assert from 'node:assert/strict';
    const origin = 'https://audit.example';
    const pages = ['/', '/factory/', '/share/', '/projects/', '/dispatches/', '/incidents/', '/evidence/', '/conversations/', '/architecture/', '/doctrine/', '/dean/', '/agents/', '/contact/'];
    const streams = [];
    const requests = new Map();
    globalThis.fetch = async (url) => {
      const path = new URL(url).pathname;
      requests.set(path, (requests.get(path) ?? 0) + 1);
      if (path === '/sitemap.xml') return new Response('<urlset>' + pages.map(p => '<url><loc>' + origin + p + '</loc></url>').join('') + '</urlset>');
      if (path === '/film.mp4' || path === '/card.png') {
        let cancelled = false;
        streams.push(() => cancelled);
        return { status: path === '/film.mp4' ? Number(process.env.AUDIT_FIXTURE_MEDIA_STATUS) : 200, headers: new Headers({'content-type': path.endsWith('.mp4') ? 'video/mp4' : 'image/png'}), body: { cancel: async () => { cancelled = true; } }, text: async () => { throw new Error('Binary asset read as HTML'); } };
      }
      return new Response('<html lang="en"><head><title>' + path + '</title><meta name="viewport" content="width=device-width"><meta name="description" content="Fixture"><link rel="canonical" href="' + origin + path + '"><meta property="og:title" content="Fixture"><meta property="og:description" content="Fixture"><meta property="og:image" content="' + origin + '/card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"></head><body><h1>Fixture</h1>' + pages.map(p => '<a href="' + p + '">Page</a>').join('') + '<a href="/film.mp4" download>Download film</a></body></html>', {headers:{'content-type':'text/html; charset=utf-8'}});
    };
    process.argv = ['node', 'audit-pages.mjs', origin];
    await import(${JSON.stringify(audit)});
    for (const page of pages) assert.equal(requests.get(page), 1, 'Read a document only once: ' + page);
    assert.equal(requests.get('/film.mp4'), 2, 'One shared status check and one canonical/media check, independent of linking-page count');
    assert.ok(streams.length > 0);
    assert.ok(streams.every(closed => closed()), 'Every header-only response must release its stream');
  `;
  for (const status of [200, 404]) {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", fixture], {
      encoding: "utf8",
      timeout: 10000,
      env: { ...process.env, AUDIT_FIXTURE_MEDIA_STATUS: String(status) }
    });
    assert.equal(result.status, status === 200 ? 0 : 1, result.stderr);
    if (status === 200) assert.match(result.stdout, /No broken links/);
    else
      assert.equal(
        (result.stderr.match(/links to \/film\.mp4, which returned HTTP 404/g) ?? []).length,
        13,
        "Retain a broken-link finding for every linking page"
      );
  }
});
