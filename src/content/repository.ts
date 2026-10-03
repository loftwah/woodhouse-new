import { decodeSlug, getEmDashCollection, getEmDashEntry, getMenuWithCacheHint } from "emdash";
import type { CacheHint, ContentEntry } from "emdash";
import type { Dispatch, FactorySnapshot, Project, ProjectStatuse } from "../../emdash-env";

export type WoodhouseProject = {
  slug: string;
  name: string;
  index: string;
  discipline: string;
  title: string;
  summary: string;
  why: string;
  teaches: string;
  siteUrl?: string;
  siteOgTitle?: string;
  siteOgDescription?: string;
  siteFavicon?: string;
  previewImage?: string;
  previewAlt?: string;
  previewCaption?: string;
  state: string;
  stateTone: ProjectStatuse["state_tone"] | "quiet";
  current: string;
  remaining: string;
  proofBoundary: string;
  reviewDate: string;
  snapshotSource: string;
};

export type EditorialDispatch = {
  slug: string;
  title: string;
  kind: Dispatch["kind"];
  deck: string;
  reviewDate: string;
  sourceReference: string;
  lead: string;
  lesson: string;
  content: NonNullable<Dispatch["content"]>;
  featuredImage: Dispatch["featured_image"] | null;
  publishedAt: string | null;
  updatedAt: string | null;
};

export type PublicMenuItem = {
  label: string;
  url: string;
  target?: "_blank";
};

export type PublicSearchItem = {
  title: string;
  description: string;
  href: string;
  section: string;
};

function dateToIso(value: Date | null | undefined): string | null {
  return value instanceof Date && !Number.isNaN(value.valueOf()) ? value.toISOString() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeCacheHints(...hints: Array<CacheHint | undefined>): CacheHint {
  const tags = [...new Set(hints.flatMap((hint) => hint?.tags ?? []))];
  const lastModified = hints.reduce<Date | undefined>((latest, hint) => {
    const next = hint?.lastModified;
    return next && (!latest || next > latest) ? next : latest;
  }, undefined);
  return {
    ...(tags.length ? { tags } : {}),
    ...(lastModified ? { lastModified } : {})
  };
}

function safeExternalUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function publicMenuUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  return safeExternalUrl(value);
}

function toEditorialDispatch(
  entry: ContentEntry<Dispatch>,
  allowPreview = false
): EditorialDispatch | null {
  const { data } = entry;
  const required = [
    data.title,
    data.kind,
    data.deck,
    data.review_date,
    data.source_reference,
    data.lead,
    data.lesson
  ];
  if (
    !allowPreview &&
    (!data.public_safe ||
      required.some((value) => typeof value !== "string") ||
      !Array.isArray(data.content))
  ) {
    return null;
  }

  return {
    slug: entry.id,
    title: data.title || "Untitled dispatch",
    kind: data.kind || "Doctrine",
    deck: data.deck,
    reviewDate: data.review_date || "Not reviewed",
    sourceReference: data.source_reference,
    lead: data.lead,
    lesson: data.lesson,
    content: data.content ?? [],
    featuredImage: data.featured_image ?? null,
    publishedAt: dateToIso(data.publishedAt),
    updatedAt: dateToIso(data.updatedAt)
  };
}

function toWoodhouseProject(
  entry: ContentEntry<Project>,
  status?: ContentEntry<ProjectStatuse>,
  snapshot?: ContentEntry<FactorySnapshot>
): WoodhouseProject {
  const data = entry.data;
  const currentStatus = status?.data;
  const siteUrl = safeExternalUrl(data.site_url);
  const siteOgTitle = data.site_og_title || undefined;
  const siteOgDescription = data.site_og_description || undefined;
  const siteFavicon = safeExternalUrl(data.site_favicon);
  const previewImage = safeExternalUrl(data.site_og_image);
  const previewAlt = data.preview_alt || undefined;
  const previewCaption = data.preview_caption || undefined;
  return {
    slug: entry.id,
    name: data.name,
    index: data.index,
    discipline: data.discipline,
    title: data.title,
    summary: data.summary,
    why: data.why,
    teaches: data.teaches,
    ...(siteUrl ? { siteUrl } : {}),
    ...(siteOgTitle ? { siteOgTitle } : {}),
    ...(siteOgDescription ? { siteOgDescription } : {}),
    ...(siteFavicon ? { siteFavicon } : {}),
    ...(previewImage ? { previewImage } : {}),
    ...(previewAlt ? { previewAlt } : {}),
    ...(previewCaption ? { previewCaption } : {}),
    state: currentStatus?.state ?? "Draft project",
    stateTone: currentStatus?.state_tone ?? "quiet",
    current: currentStatus?.current ?? "This preview has no published status record yet.",
    remaining: currentStatus?.next_proof ?? "Add a reviewed project status before publication.",
    proofBoundary:
      currentStatus?.proof_boundary ??
      "This is an unpublished project preview and makes no public status claim.",
    reviewDate: currentStatus?.reviewed_at ?? "Not reviewed",
    snapshotSource: snapshot?.data.source_description ?? "No published snapshot is linked yet."
  };
}

export function decodeEditorialSlug(value: string | undefined): string | null {
  return value ? (decodeSlug(value) ?? null) : null;
}

export async function listPublishedDispatches() {
  const entries: ContentEntry<Dispatch>[] = [];
  const cacheHints: CacheHint[] = [];
  let cursor: string | undefined;

  do {
    const result = await getEmDashCollection("dispatches", {
      status: "published",
      orderBy: { published_at: "desc" },
      limit: 100,
      ...(cursor ? { cursor } : {})
    });
    cacheHints.push(result.cacheHint);
    if (result.error) {
      return { dispatches: [], error: result.error, cacheHint: mergeCacheHints(...cacheHints) };
    }
    entries.push(...result.entries);
    cursor = result.nextCursor;
  } while (cursor);

  return {
    dispatches: entries.flatMap((entry) => {
      const dispatch = toEditorialDispatch(entry);
      return dispatch ? [dispatch] : [];
    }),
    error: undefined,
    cacheHint: mergeCacheHints(...cacheHints)
  };
}

export async function getEditorialDispatch(slug: string) {
  const result = await getEmDashEntry("dispatches", slug);
  return {
    dispatch: result.entry ? toEditorialDispatch(result.entry, result.isPreview) : null,
    entry: result.entry,
    isPreview: result.isPreview,
    error: result.error,
    cacheHint: result.cacheHint
  };
}

export async function getProjectRecord(slug: string) {
  const [projectResult, statusResult] = await Promise.all([
    getEmDashEntry("projects", slug),
    getEmDashCollection("project_statuses", {
      status: "published",
      where: { project_key: slug },
      orderBy: { reviewed_at: "desc" },
      limit: 100
    })
  ]);
  const projectCacheHints = [projectResult.cacheHint, statusResult.cacheHint];
  if (projectResult.error) {
    return {
      project: null,
      error: projectResult.error,
      cacheHint: projectResult.cacheHint,
      cacheHints: projectCacheHints
    };
  }
  if (statusResult.error) {
    return {
      project: null,
      error: statusResult.error,
      cacheHint: statusResult.cacheHint,
      cacheHints: projectCacheHints
    };
  }

  const entry = projectResult.entry;
  const isPreview = projectResult.isPreview;
  if (!entry || (!isPreview && !entry.data.public_safe)) {
    return {
      project: null,
      error: undefined,
      cacheHint: projectResult.cacheHint,
      cacheHints: projectCacheHints,
      isPreview
    };
  }

  const latestStatus = statusResult.entries.find((item) => item.data.public_safe);
  const snapshotResult = latestStatus
    ? await getEmDashEntry("factory_snapshots", latestStatus.data.snapshot_key)
    : null;
  if (snapshotResult?.error) {
    return {
      project: null,
      error: snapshotResult.error,
      cacheHint: snapshotResult.cacheHint,
      cacheHints: [...projectCacheHints, snapshotResult.cacheHint],
      isPreview
    };
  }

  const snapshot = snapshotResult?.entry;
  if ((!latestStatus || !snapshot || !snapshot.data.public_safe) && !isPreview) {
    return {
      project: null,
      error: undefined,
      cacheHint: statusResult.cacheHint,
      cacheHints: [...projectCacheHints, snapshotResult?.cacheHint],
      isPreview
    };
  }

  return {
    project: toWoodhouseProject(entry, latestStatus, snapshot ?? undefined),
    projectEntry: entry,
    status: latestStatus,
    snapshot,
    isPreview,
    error: undefined,
    cacheHint: projectResult.cacheHint,
    cacheHints: [...projectCacheHints, snapshotResult?.cacheHint]
  };
}

export async function listProjectRecords() {
  const [projectResult, statusResult, snapshotResult] = await Promise.all([
    getEmDashCollection("projects", { status: "published", orderBy: { name: "asc" }, limit: 100 }),
    getEmDashCollection("project_statuses", {
      status: "published",
      orderBy: { reviewed_at: "desc" },
      limit: 100
    }),
    getEmDashCollection("factory_snapshots", {
      status: "published",
      orderBy: { reviewed_at: "desc" },
      limit: 100
    })
  ]);
  const cacheHints = [projectResult.cacheHint, statusResult.cacheHint, snapshotResult.cacheHint];
  const error = projectResult.error ?? statusResult.error ?? snapshotResult.error;
  if (error) return { projects: [], error, cacheHints };

  const latestByProject = new Map<string, ContentEntry<ProjectStatuse>>();
  for (const status of statusResult.entries) {
    if (!status.data.public_safe || latestByProject.has(status.data.project_key)) continue;
    latestByProject.set(status.data.project_key, status);
  }

  const snapshotBySlug = new Map(
    snapshotResult.entries
      .filter((snapshot) => snapshot.data.public_safe)
      .map((snapshot) => [snapshot.id, snapshot])
  );
  const projects: WoodhouseProject[] = [];
  for (const entry of projectResult.entries) {
    if (!entry.data.public_safe) continue;
    const status = latestByProject.get(entry.id);
    if (!status) continue;
    const snapshot = snapshotBySlug.get(status.data.snapshot_key);
    if (!snapshot) continue;
    projects.push(toWoodhouseProject(entry, status, snapshot));
  }
  projects.sort((left, right) => Number(left.index) - Number(right.index));
  return { projects, error: undefined, cacheHints };
}

export async function listPublicStatusRecords() {
  const result = await getEmDashCollection("project_statuses", {
    status: "published",
    orderBy: { reviewed_at: "desc" },
    limit: 100
  });
  return {
    statuses: result.entries.filter((item) => item.data.public_safe),
    error: result.error,
    cacheHint: result.cacheHint
  };
}

export async function listPublicSnapshots() {
  const result = await getEmDashCollection("factory_snapshots", {
    status: "published",
    orderBy: { reviewed_at: "desc" },
    limit: 100
  });
  return {
    snapshots: result.entries.filter((item) => item.data.public_safe),
    error: result.error,
    cacheHint: result.cacheHint
  };
}

export async function listPublicEvidence() {
  const result = await getEmDashCollection("evidence_records", {
    status: "published",
    orderBy: { reviewed_at: "desc" },
    limit: 100
  });
  return {
    evidence: result.entries.filter((item) => item.data.public_safe),
    error: result.error,
    cacheHint: result.cacheHint
  };
}

export async function listPublicIncidents() {
  const result = await getEmDashCollection("incidents", {
    status: "published",
    orderBy: { reviewed_at: "desc" },
    limit: 100
  });
  return {
    incidents: result.entries.filter((item) => item.data.public_safe),
    error: result.error,
    cacheHint: result.cacheHint
  };
}

export async function listPublicConversations() {
  const result = await getEmDashCollection("conversations", {
    status: "published",
    orderBy: { reviewed_at: "desc" },
    limit: 100
  });
  return {
    conversations: result.entries.filter(
      (item) => item.data.public_safe && item.data.source_reviewed
    ),
    error: result.error,
    cacheHint: result.cacheHint
  };
}

export async function getPublicMenu(name: string) {
  const result = await getMenuWithCacheHint(name);
  const rawItems: unknown = result.data?.items;
  const items: PublicMenuItem[] = Array.isArray(rawItems)
    ? rawItems.flatMap((item: unknown) => {
        if (!isRecord(item) || typeof item.label !== "string") return [];
        const url = publicMenuUrl(item.url);
        if (!url) return [];
        return [
          {
            label: item.label,
            url,
            ...(item.target === "_blank" && url.startsWith("https:") ? { target: "_blank" } : {})
          }
        ];
      })
    : [];
  const menu = result.data ? { ...result.data, items } : null;
  return { menu, cacheHint: result.cacheHint };
}

export async function listPublicSearchItems() {
  const [projectResult, dispatchResult, incidentResult, evidenceResult, conversationResult] =
    await Promise.all([
      listProjectRecords(),
      listPublishedDispatches(),
      listPublicIncidents(),
      listPublicEvidence(),
      listPublicConversations()
    ]);
  const pages: PublicSearchItem[] = [
    ...[
      {
        title: "The factory floor",
        description: "Current reviewed project snapshot and next proof.",
        href: "/factory/",
        section: "Factory"
      },
      {
        title: "Project dossiers",
        description: "Eight project dossiers from the Loftwah Software Factory.",
        href: "/projects/",
        section: "Projects"
      },
      {
        title: "Dispatches",
        description: "Edited essays and engineering case studies.",
        href: "/dispatches/",
        section: "Dispatches"
      },
      {
        title: "Incidents",
        description: "What failed, what the evidence showed and which control changed.",
        href: "/incidents/",
        section: "Incidents"
      },
      {
        title: "Evidence records",
        description: "Reviewed public claims and the limits of their evidence.",
        href: "/evidence/",
        section: "Evidence"
      },
      {
        title: "Conversations",
        description: "The boundary between private conversations and edited public material.",
        href: "/conversations/",
        section: "Conversations"
      },
      {
        title: "Architecture",
        description: "The system behind the Loftwah Software Factory.",
        href: "/architecture/",
        section: "Architecture"
      },
      {
        title: "Factory doctrine",
        description: "How the factory directs work and judges evidence.",
        href: "/doctrine/",
        section: "Doctrine"
      },
      {
        title: "Dean Lofts",
        description: "The operator of the Loftwah Software Factory.",
        href: "/dean/",
        section: "People"
      },
      {
        title: "Agent Reception",
        description: "Curated public facts for people and software agents.",
        href: "/agents/",
        section: "Agents"
      },
      {
        title: "Contact",
        description: "Public contact routes and a private Woodhouse enquiry form.",
        href: "/contact/",
        section: "Contact"
      }
    ],
    ...projectResult.projects.map((project) => ({
      title: project.name,
      description: `${project.discipline}. ${project.summary}`,
      href: `/projects/${project.slug}/`,
      section: "Projects"
    })),
    ...dispatchResult.dispatches.map((dispatch) => ({
      title: dispatch.title,
      description: `${dispatch.kind}. ${dispatch.deck}`,
      href: `/dispatches/${dispatch.slug}/`,
      section: dispatch.kind
    })),
    ...incidentResult.incidents.map((item) => ({
      title: item.data.title,
      description: item.data.what_happened,
      href: `/incidents/${item.id}/`,
      section: "Incidents"
    })),
    ...evidenceResult.evidence.map((item) => ({
      title: item.data.title,
      description: item.data.summary || item.data.claim,
      href: `/evidence/${item.id}/`,
      section: "Evidence"
    })),
    ...conversationResult.conversations.map((item) => ({
      title: item.data.title,
      description: item.data.edited_summary,
      href: `/conversations/${item.id}/`,
      section: "Conversations"
    }))
  ];
  return {
    pages,
    cacheHints: [
      ...projectResult.cacheHints,
      dispatchResult.cacheHint,
      incidentResult.cacheHint,
      evidenceResult.cacheHint,
      conversationResult.cacheHint
    ],
    error:
      projectResult.error ??
      dispatchResult.error ??
      incidentResult.error ??
      evidenceResult.error ??
      conversationResult.error
  };
}

export function asText<T extends object, K extends keyof T>(data: T, key: K): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}
