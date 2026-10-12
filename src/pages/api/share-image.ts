import type { APIRoute } from "astro";
import { listProjectRecords } from "../../content/repository";
import { loadShareImage } from "../../data/share-desk";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const slug = url.searchParams.get("project") ?? "";
  if (
    !/^[a-z0-9-]{1,64}$/.test(slug) ||
    (url.searchParams.get("audit")?.length ?? 0) > 128 ||
    [...url.searchParams.keys()].some((key) => !["project", "audit"].includes(key))
  )
    return new Response("Invalid image request.", {
      status: 400,
      headers: { "cache-control": "no-store" }
    });
  const result = await listProjectRecords();
  if (result.error)
    return new Response("Projects unavailable.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  const project = result.projects.find((p) => p.slug === slug);
  if (!project?.previewImage)
    return new Response("Image not found.", {
      status: 404,
      headers: { "cache-control": "no-store" }
    });
  const image = await loadShareImage(project.previewImage);
  if (!image)
    return new Response("Image unavailable. Open the original project image.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  return new Response(image.bytes.buffer as ArrayBuffer, {
    headers: {
      "content-type": image.mime,
      "content-disposition": `attachment; filename="${slug}-social.${image.extension}"`,
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; sandbox"
    }
  });
};
