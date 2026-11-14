import commissionManifest from "../../public/campaign/20261114-commissions/manifest.json";
import { listProjectRecords } from "../content/repository";
import type { CampaignItem } from "./showcase-campaign";
import { publicOriginalArtwork } from "./showcase-originals";
import { campaignCollectionPath, publicCampaignItems } from "./showcase-public";
import { SITE_ORIGIN } from "./site-origin";

const absolute = (path: string) => new URL(path, SITE_ORIGIN).href;
const commissions = new Map(commissionManifest.artwork.map((entry) => [entry.original, entry]));
const identifier = /^[a-z0-9][a-z0-9-]{0,127}$/;
const filters = ["project", "kind", "orientation", "q", "limit", "after"];
const kinds = ["editorial composition", "production screenshot", "published product artwork"];

function file(url: string, width?: number, height?: number) {
  return {
    url: absolute(url),
    format: new URL(url, SITE_ORIGIN).pathname.split(".").at(-1),
    ...(width && height ? { width, height } : {})
  };
}

function record(item: CampaignItem) {
  const master = item.formats?.find((format) => format.image === item.original);
  const commission = commissions.get(item.original);
  return {
    id: item.id,
    project: item.project,
    title: item.title,
    alt: item.alt,
    description: item.caption,
    kind: item.kind,
    stage: item.stage ?? null,
    use: item.use ?? null,
    reviewedAt: item.reviewedAt,
    credit: item.credit,
    visibility: "public",
    reuse: "unconfirmed",
    shareUrl: absolute(campaignCollectionPath(item.project)),
    projectUrl: absolute(item.href),
    previewUrl: absolute(item.image),
    thumbnailUrl: absolute(item.thumbnail ?? item.image),
    sourceUrl: absolute(item.source),
    original: {
      ...file(
        item.original,
        master?.width ?? commission?.width,
        master?.height ?? commission?.height
      ),
      sha256: commission?.sha256 ?? null,
      version: commission?.version ?? null,
      parent: commission?.parent ?? null
    },
    formats: (item.formats ?? []).map(({ label, image, width, height }) => ({
      label,
      ...file(image, width, height)
    })),
    versions: (item.versions ?? []).map(
      ({ id, parent, note, source, label, image, width, height }) => ({
        id,
        parent,
        note,
        sourceUrl: absolute(source),
        label,
        ...file(image, width, height)
      })
    ),
    kitUrl: item.socialPack ? absolute(item.socialPack) : null
  };
}

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function shareCatalogue(params: URLSearchParams, id?: string) {
  const project = params.get("project");
  const kind = params.get("kind");
  const orientation = params.get("orientation");
  const after = params.get("after");
  const q = params.get("q")?.trim().toLowerCase();
  const limit = params.get("limit") ?? "24";
  if (
    (id !== undefined && (!identifier.test(id) || params.size > 0)) ||
    [...params.keys()].some((key) => !filters.includes(key) || params.getAll(key).length !== 1) ||
    (project !== null && !identifier.test(project)) ||
    (after !== null && !identifier.test(after)) ||
    (kind !== null && !kinds.includes(kind)) ||
    (orientation !== null && !["landscape", "portrait", "square"].includes(orientation)) ||
    (q?.length ?? 0) > 100 ||
    !/^(?:[1-9]|[1-4][0-9]|50)$/.test(limit)
  )
    return reply({ error: "Invalid catalogue request." }, 400);

  const result = await listProjectRecords();
  if (result.error) return reply({ error: "The catalogue is unavailable." }, 503);
  const slugs = result.projects.map(({ slug }) => slug);
  const items: CampaignItem[] = [
    ...publicCampaignItems(slugs),
    ...publicOriginalArtwork(new Set(slugs)).map(({ item }) => item)
  ];
  if (id !== undefined) {
    const item = items.find((entry) => entry.id === id);
    return item
      ? reply({ version: 1, asset: record(item) })
      : reply({ error: "Asset not found." }, 404);
  }

  const matches = items.filter(
    (item) =>
      (!after || item.id > after) &&
      (!project || item.project === project) &&
      (!kind || item.kind === kind) &&
      (!orientation ||
        orientation ===
          (item.width === item.height
            ? "square"
            : item.width > item.height
              ? "landscape"
              : "portrait")) &&
      (!q ||
        [item.title, item.alt, item.caption, item.use, item.subject, ...(item.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q))
  );
  const byId = new Map(matches.map((item) => [item.id, item]));
  const ids = [...byId.keys()].sort();
  const page = ids.slice(0, Number(limit));
  return reply({
    version: 1,
    assets: page.map((key) => record(byId.get(key)!)),
    nextAfter: ids.length > page.length ? page.at(-1) : null
  });
}
