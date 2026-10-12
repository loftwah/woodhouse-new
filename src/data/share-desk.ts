import type { WoodhouseProject } from "../content/repository";
const sharePriorities = ["fighter", "shoalshot", "protocol-11", "bubbles", "loftwahfm"];
export function orderShareProjects(projects: WoodhouseProject[]) {
  return [...projects].sort((a, b) => {
    const rank = (id: string) => {
      const n = sharePriorities.indexOf(id);
      return n < 0 ? 100 : n;
    };
    return rank(a.slug) - rank(b.slug) || a.index.localeCompare(b.index);
  });
}
export function shareCaption(lead: string, description: string, link: string) {
  const budget = Math.max(0, 280 - lead.length - link.length - 4);
  const copy =
    description.length > budget
      ? description.slice(0, budget - 1).replace(/\s+\S*$/, "") + "…"
      : description;
  return `${lead}\n${copy}\n${link}`;
}
export function projectCaption(project: WoodhouseProject) {
  return shareCaption(
    `${project.name}, from Loftwah.`,
    project.siteOgDescription ?? project.summary,
    project.siteUrl ?? `https://woodhouse.loftwah.com/projects/${project.slug}/`
  );
}
// Only the currently reviewed public image publishers, never a caller-provided URL.
const imageHosts = new Set([
  "fighter.loftwah.com",
  "shoalshot.loftwah.com",
  "protocol11.loftwah.com",
  "bubbles.loftwah.com",
  "fm.loftwah.com",
  "max.loftwah.com",
  "club.loftwah.com",
  "assets.loftwah.com"
]);
export function approvedShareImage(source: string) {
  try {
    const url = new URL(source);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      imageHosts.has(url.hostname)
    );
  } catch {
    return false;
  }
}
export function imageKind(bytes: Uint8Array, declared: string) {
  if (declared === "image/png" && [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n))
    return { mime: declared, extension: "png" };
  if (declared === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return { mime: declared, extension: "jpg" };
  if (
    declared === "image/webp" &&
    bytes.length >= 20 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP" &&
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8 ===
      bytes.length &&
    ["VP8 ", "VP8L", "VP8X"].includes(String.fromCharCode(...bytes.slice(12, 16)))
  )
    return { mime: declared, extension: "webp" };
  if (
    declared === "image/svg+xml" &&
    /<svg(?:\s|>)/i.test(new TextDecoder().decode(bytes.slice(0, 1024)))
  )
    return { mime: declared, extension: "svg" };
  return null;
}
export async function loadShareImage(source: string, fetcher: typeof fetch = fetch) {
  if (!approvedShareImage(source)) return null;
  const maxBytes = 6 * 1024 * 1024;
  try {
    const response = await fetcher(source, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000)
    });
    const mime = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (
      !response.ok ||
      !["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(mime) ||
      Number(response.headers.get("content-length")) > maxBytes
    ) {
      await response.body?.cancel();
      return null;
    }
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.length;
      if (length > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const kind = imageKind(bytes, mime);
    return kind ? { bytes, ...kind } : null;
  } catch {
    return null;
  }
}
