import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import files from "../../../../data/showcase-asset-library-files.json";
import bundles from "../../../../data/showcase-asset-library-bundles.json";

export const prerender = false;
const published = new Set(files);
const bundleFiles: Record<string, [string, number, number]> = bundles as unknown as Record<string, [string, number, number]>;
const contentTypes = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
const prefix = "/campaign/20261114-asset-library/file/";
const unavailable = (status: number) =>
  new Response(null, { status, headers: { "cache-control": "no-store" } });

export const GET: APIRoute = async ({ params, request }) => {
  const key = prefix + params.file;
  const extension = key.split(".").at(-1) as keyof typeof contentTypes;
  const contentType = contentTypes[extension];
  if (!published.has(key) || !contentType) return unavailable(404);
  const packed = bundleFiles[key];
  const storageKey = packed?.[0] ?? key.slice(1);
  const bucket = (env as unknown as { MEDIA: R2Bucket }).MEDIA;
  try {
    const object =
      request.method === "HEAD"
        ? await bucket.head(storageKey)
        : await bucket.get(
            storageKey,
            packed ? { range: { offset: packed[1], length: packed[2] } } : undefined
          );
    if (!object) return unavailable(404);
    const headers = new Headers({
      "content-type": contentType,
      "content-length": String(packed?.[2] ?? object.size),
      "cache-control": "public, max-age=31536000, immutable",
      etag: packed ? `"${params.file}"` : object.httpEtag,
      "last-modified": object.uploaded.toUTCString()
    });
    return new Response("body" in object ? (object.body as ReadableStream) : null, { headers });
  } catch {
    return unavailable(503);
  }
};

export const HEAD = GET;
