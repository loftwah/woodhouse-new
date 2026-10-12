import assert from "node:assert/strict";
import test from "node:test";
import { approvedShareImage, imageKind, loadShareImage, projectCaption } from "./share-desk.ts";
import type { WoodhouseProject } from "../content/repository.ts";
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
test("image downloads reject unreviewed hosts, credentials, insecure URLs and ports", () => {
  assert.equal(approvedShareImage("https://bubbles.loftwah.com/og-image.png"), true);
  for (const url of [
    "http://bubbles.loftwah.com/x",
    "https://bubbles.loftwah.com.evil/x",
    "https://127.0.0.1/x",
    "https://user:secret@bubbles.loftwah.com/x",
    "https://bubbles.loftwah.com:8443/x",
    "https://private.loftwah.com/x",
    "bad"
  ])
    assert.equal(approvedShareImage(url), false);
});
test("downloads reject redirects and disguised non-image responses", async () => {
  let requested = "",
    redirect: RequestRedirect | undefined;
  const result = await loadShareImage(
    "https://bubbles.loftwah.com/og-image.png",
    async (url, options) => {
      requested = String(url);
      redirect = options?.redirect;
      return new Response(png, { headers: { "content-type": "image/png" } });
    }
  );
  assert.equal(requested, "https://bubbles.loftwah.com/og-image.png");
  assert.equal(redirect, "manual");
  assert.equal(result?.extension, "png");
  assert.equal(
    await loadShareImage(
      "https://bubbles.loftwah.com/og-image.png",
      async () => new Response(null, { status: 302 })
    ),
    null
  );
  assert.equal(
    await loadShareImage(
      "https://bubbles.loftwah.com/og-image.png",
      async () => new Response("<html>private</html>", { headers: { "content-type": "image/png" } })
    ),
    null
  );
  assert.equal(imageKind(png, "text/html"), null);
});
test("download transfer bounds cancel both declared and streamed oversized bodies", async () => {
  let cancelled = false;
  const body = () =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(6 * 1024 * 1024 + 1));
      },
      cancel() {
        cancelled = true;
      }
    });
  const source = "https://bubbles.loftwah.com/og-image.png";
  assert.equal(
    await loadShareImage(
      source,
      async () =>
        new Response(body(), {
          headers: { "content-type": "image/png", "content-length": String(6 * 1024 * 1024 + 1) }
        })
    ),
    null
  );
  assert.equal(cancelled, true);
  cancelled = false;
  assert.equal(
    await loadShareImage(
      source,
      async () => new Response(body(), { headers: { "content-type": "image/png" } })
    ),
    null
  );
  assert.equal(cancelled, true);
  assert.equal(
    await loadShareImage(source, async () => {
      throw new Error("offline");
    }),
    null
  );
});
test("ready posts fit 280 characters and keep the canonical public destination", () => {
  const project = {
    name: "Fighter",
    slug: "fighter",
    siteUrl: "https://fighter.loftwah.com/",
    siteOgDescription: "A long public description. ".repeat(40)
  } as WoodhouseProject;
  const caption = projectCaption(project);
  assert.ok(caption.length <= 280);
  assert.ok(caption.endsWith(project.siteUrl!));
  assert.ok(!caption.includes("reported listening"));
  const localProject = { ...project };
  delete localProject.siteUrl;
  const local = projectCaption(localProject);
  assert.ok(local.endsWith("https://woodhouse.loftwah.com/projects/fighter/"));
});
