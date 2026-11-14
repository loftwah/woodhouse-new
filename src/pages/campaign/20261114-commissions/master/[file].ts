import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import files from "../../../../data/showcase-commission-masters.json";

export const prerender = false;
const published = new Set(files);
const prefix = "/campaign/20261114-commissions/master/";
const unavailable = (status: number) =>
  new Response(null, { status, headers: { "cache-control": "no-store" } });

export const GET: APIRoute = async ({ params, request }) => {
  const key = prefix + params.file;
  if (!published.has(key)) return unavailable(404);
  const storageKey = key.slice(1);
  const bucket = (env as unknown as { MEDIA: R2Bucket }).MEDIA;
  try {
    const object =
      request.method === "HEAD" ? await bucket.head(storageKey) : await bucket.get(storageKey);
    if (!object) return unavailable(404);
    const headers = new Headers({
      "content-type": "image/png",
      "content-length": String(object.size),
      "cache-control": "public, max-age=31536000, immutable",
      etag: object.httpEtag,
      "last-modified": object.uploaded.toUTCString()
    });
    return new Response("body" in object ? (object.body as ReadableStream) : null, { headers });
  } catch {
    return unavailable(503);
  }
};

export const HEAD = GET;
