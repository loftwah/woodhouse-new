import { boundedJson, isObject } from "./portfolio-analytics.ts";

const repository = "https://github.com/loftwah/liferaft";
const releasesEndpoint = "https://api.github.com/repos/loftwah/liferaft/releases?per_page=10";

export type InstallerRelease = { tag: string; url: string; downloads: number };

export async function loadLiferaftDownloads(fetcher: typeof fetch = fetch) {
  try {
    const response = await fetcher(releasesEndpoint, {
      headers: { accept: "application/vnd.github+json", "user-agent": "Woodhouse Analytics" },
      redirect: "manual",
      signal: AbortSignal.timeout(4000),
      cf: { cacheTtlByStatus: { "200": 900, "400-599": 0 } }
    });
    const data = await boundedJson(response);
    if (!Array.isArray(data)) return null;
    const releases: InstallerRelease[] = [];
    for (const release of data) {
      if (
        !isObject(release) ||
        release.draft !== false ||
        release.prerelease !== false ||
        typeof release.tag_name !== "string" ||
        !/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(release.tag_name) ||
        !Array.isArray(release.assets)
      )
        continue;
      const tag = release.tag_name;
      const installers = release.assets.filter(
        (asset) =>
          isObject(asset) &&
          asset.state === "uploaded" &&
          typeof asset.name === "string" &&
          /^Liferaft-[\w.-]+\.dmg$/.test(asset.name)
      );
      if (installers.length === 0) continue;
      let downloads = 0;
      for (const installer of installers) {
        const count = installer.download_count;
        if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) return null;
        downloads += count;
      }
      if (!Number.isSafeInteger(downloads)) return null;
      releases.push({ tag, url: `${repository}/releases/tag/${tag}`, downloads });
    }
    return releases;
  } catch {
    return null;
  }
}
