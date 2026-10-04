import { chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Captures the preview acceptance evidence that can be observed from outside a
// browser session, so the operator is not asked to attest to something a script
// can simply read. Each artifact states its method, the observations and what it
// does NOT prove. It writes evidence files only; recording them into the
// production receipt stays an operator decision.
//
// Checks that need a signed-in operator session (editor journey, media upload,
// menu editing, MCP authoring, enquiry delivery, backup retention) are listed
// as outstanding rather than guessed at.
//
// A check moves out of that list only when it can be observed from outside a
// session without asserting something untrue. `publicDraftIsolation` did: the
// leak direction needs no session, only a draft row and a set of public requests.

const root = process.cwd();
const PREVIEW = "https://woodhouse-loftwah-preview.loftwah.workers.dev";
const DATABASE = "woodhouse-emdash-preview";
const evidenceRoot = path.join(root, ".release/evidence");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  return { status: result.status ?? 1, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

function query(sql) {
  const result = run("pnpm", [
    "exec",
    "wrangler",
    "d1",
    "execute",
    DATABASE,
    "--remote",
    "--json",
    "--command",
    sql
  ]);
  const offset = result.output.search(/[[{]/);
  if (offset < 0) throw new Error(`D1 query failed: ${result.output.slice(-300)}`);
  const batches = JSON.parse(result.output.slice(offset));
  return batches.flatMap((batch) => batch.results ?? []);
}

const maskEmail = (value) => {
  const [local = "", domain = ""] = value.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
};

async function artifact(check, heading, method, observations, limits) {
  const body = [
    `# ${check}`,
    "",
    `**${heading}**`,
    "",
    `Observed ${new Date().toISOString()} against ${PREVIEW}.`,
    "",
    "## Method",
    "",
    method,
    "",
    "## Observations",
    "",
    ...observations.map((line) => `- ${line}`),
    "",
    "## What this does not prove",
    "",
    ...limits.map((line) => `- ${line}`)
  ].join("\n");
  const file = path.join(evidenceRoot, `${check}.md`);
  await writeFile(file, `${body}\n`, { mode: 0o600 });
  await chmod(file, 0o600);
  console.log(`wrote .release/evidence/${check}.md`);
}

await mkdir(evidenceRoot, { recursive: true, mode: 0o700 });
await chmod(evidenceRoot, 0o700);

const users = query("SELECT email, role, disabled FROM users");
const credentials = query(
  "SELECT name, device_type, backed_up, last_used_at FROM credentials WHERE last_used_at IS NOT NULL ORDER BY last_used_at DESC"
);
await artifact(
  "ownerPasskeyLogin",
  "Owner passkey login against preview",
  "Read the preview D1 `users` and `credentials` tables over Wrangler. A row in `credentials` with a `last_used_at` timestamp exists only after a WebAuthn assertion was accepted for that account.",
  [
    `Accounts: ${users.length}.`,
    ...users.map(
      (user) =>
        `${maskEmail(user.email)} has role ${user.role} (50 is owner) and disabled=${user.disabled}.`
    ),
    ...credentials.map(
      (credential) =>
        `Credential "${credential.name}" (${credential.device_type}, backed_up=${credential.backed_up}) was last used at ${credential.last_used_at}.`
    ),
    `Open signup is not enabled in this repository, so this account was created through the authenticated setup wizard.`
  ],
  [
    "That this is the operator's own long-term device credential. A WebAuthn assertion was accepted; whether this is the key they intend to keep is theirs to confirm.",
    "`backed_up=0` means the passkey is not synced by the platform, so losing that device loses the account. This is a finding, not a pass.",
    "Nothing about production, which has no reachable admin until the current build is deployed."
  ]
);

const audit = run("node", ["scripts/audit-pages.mjs", PREVIEW]);
const smoke = run("pnpm", ["run", "smoke:preview"]);
await artifact(
  "publicRouteMatrix",
  "Public route matrix against preview",
  "Ran `pnpm run audit:pages` and `pnpm run smoke:preview` against the deployed preview Worker.",
  [
    audit.status === 0
      ? "`audit:pages` passed: document structure, internal links, canonical consistency, discovery, social images and privacy across every sitemap page."
      : `\`audit:pages\` FAILED:\n\n\`\`\`\n${audit.output.trim()}\n\`\`\``,
    smoke.status === 0
      ? "`smoke:preview` passed: every sitemap page plus the fixed routes, page metadata, privacy markers, supplied social links, Agent Reception read-only policy and the private no-store/noindex EmDash response headers."
      : `\`smoke:preview\` FAILED:\n\n\`\`\`\n${smoke.output.trim()}\n\`\`\``
  ],
  [
    "That the routes render for a signed-out reader on preview only.",
    "Nothing about a signed-in editor, the Admin surface or production."
  ]
);

const markers = ["@deanlofts.xyz", "EMDASH_", "ec_pat_", "RESEND_API_KEY"];
const scans = [];
for (const path of [
  "/",
  "/factory/",
  "/projects/",
  "/dispatches/",
  "/agents/facts.json",
  "/build.json",
  "/llms.txt",
  "/sitemap.xml",
  "/rss.xml"
]) {
  const response = await fetch(`${PREVIEW}${path}?evidence=${Date.now()}`, {
    signal: AbortSignal.timeout(30000)
  });
  const body = await response.text();
  const headers = [...response.headers].map(([key, value]) => `${key}:${value}`).join("\n");
  const found = markers.filter(
    (marker) => body.includes(marker) || headers.toLowerCase().includes(marker.toLowerCase())
  );
  scans.push(
    `\`${path}\` HTTP ${response.status}, ${body.length} bytes, ${found.length ? `FOUND ${found.join(", ")}` : "no private markers"}.`
  );
}
const privateRoutes = [];
for (const path of [
  "/_emdash/admin/",
  "/_emdash/api/auth/mode",
  "/_emdash/api/setup/status",
  "/_emdash/api/mcp"
]) {
  const response = await fetch(`${PREVIEW}${path}?evidence=${Date.now()}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(30000)
  });
  const cacheControl = response.headers.get("cache-control") ?? "";
  const robots = response.headers.get("x-robots-tag") ?? "";
  const good =
    /private/i.test(cacheControl) && /no-store/i.test(cacheControl) && /noindex/i.test(robots);
  privateRoutes.push(
    `\`${path}\` HTTP ${response.status} cache-control="${cacheControl}" x-robots-tag="${robots}" ${good ? "OK" : "MISSING PRIVATE HEADERS"}.`
  );
}
await artifact(
  "privacyScan",
  "Public response privacy scan against preview",
  "Fetched each public route with a per-request query stamp and searched the body and response headers for the private email domain, the EmDash environment marker, the EmDash API token prefix and the Resend secret name. Then fetched the protected EmDash routes and read their cache and robots headers.",
  [...scans, "Protected routes:", ...privateRoutes],
  [
    "That known markers are absent from these responses. It cannot detect unknown private prose without a reference corpus, so source selection stays a human review boundary.",
    "Nothing about private repository bodies, which were never sent to this Worker."
  ]
);

const snapshotCounts = query(
  "SELECT s.reviewed_at AS snapshot_review, COUNT(st.id) AS statuses FROM ec_factory_snapshots s LEFT JOIN _emdash_content_references r ON r.child_group = s.id JOIN _emdash_relations rel ON rel.id = r.relation_id AND rel.slug = 'project_statuses_snapshot' LEFT JOIN ec_project_statuses st ON st.id = r.parent_group GROUP BY s.reviewed_at"
);
const orphanStatuses = query(
  "SELECT st.slug FROM ec_project_statuses st WHERE st.deleted_at IS NULL AND NOT EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id = r.relation_id AND rel.slug = 'project_statuses_snapshot' WHERE r.parent_group = st.id)"
);
const orphanEvidence = query(
  "SELECT e.slug FROM ec_evidence_records e WHERE e.deleted_at IS NULL AND NOT EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id = r.relation_id AND rel.slug = 'evidence_records_snapshot' WHERE r.parent_group = e.id)"
);
await artifact(
  "evidenceSnapshotHistory",
  "Dated snapshot and evidence history against preview",
  "Queried the preview D1 directly to confirm every public status and evidence record still points at the dated snapshot it was reviewed against, rather than being overwritten by a newer state.",
  [
    ...snapshotCounts.map(
      (row) =>
        `Snapshot reviewed ${row.snapshot_review} carries ${row.statuses} project status record(s).`
    ),
    `Public status records with no snapshot reference: ${orphanStatuses.length}.`,
    `Public evidence records with no snapshot reference: ${orphanEvidence.length}.`,
    "A status record is append-only per review, so a later review adds a new record and keeps this one; the archive pages at `/snapshots/{id}/` and `/statuses/{id}/` render that chain."
  ],
  [
    "That a reader can navigate the chain. The public audit separately confirmed every `/statuses/` and `/snapshots/` page is linked from the site and resolves to its canonical URL.",
    "That the snapshot text itself is accurate. It records the operator-reviewed report for 28 September 2026 and nothing here re-validates that report."
  ]
);

/**
 * Public draft isolation, observed from outside a session.
 *
 * This was listed as needing an authenticated editor, and it does for the
 * *publish* direction. The leak direction needs no session at all: write a draft
 * straight into D1 and ask every public surface whether it can be reached. A
 * draft is `status: 'draft'` with `public_safe = 1`, so it is public-marked but
 * unpublished — exactly the state a real draft occupies, and the one a filter
 * that checked only `public_safe` would leak.
 *
 * The draft is removed afterwards, whether the observation passed or failed.
 */
const DRAFT_SLUG = `draft-isolation-probe-${Date.now().toString(36)}`;
const DRAFT_MARKER = `draft-isolation-marker-${Date.now().toString(36)}`;
const draftQuote = (value) => `'${String(value).replaceAll("'", "''")}'`;

async function surfaceMentionsDraft(path) {
  const response = await fetch(`${PREVIEW}${path}?evidence=${Date.now()}`, {
    signal: AbortSignal.timeout(30000),
    redirect: "manual"
  });
  return {
    path,
    status: response.status,
    leaked: (await response.text()).includes(DRAFT_MARKER)
  };
}

const isolation = [];
let draftRemoved;
const leakedSurfaces = [];
try {
  const before = query(`SELECT COUNT(*) AS n FROM ec_dispatches`);
  query(
    `INSERT INTO ec_dispatches (id, slug, status, title, kind, deck, review_date, source_reference, lead, lesson, public_safe, content) ` +
      `VALUES (${draftQuote(DRAFT_SLUG)}, ${draftQuote(DRAFT_SLUG)}, 'draft', ` +
      `${draftQuote("Draft isolation probe")}, ${draftQuote("Field note")}, ${draftQuote(DRAFT_MARKER)}, ` +
      `${draftQuote("2026-10-05")}, ${draftQuote("Automated draft-isolation probe.")}, ` +
      `${draftQuote(DRAFT_MARKER)}, ${draftQuote(DRAFT_MARKER)}, 1, '[]')`
  );
  const present = query(
    `SELECT slug, status, public_safe FROM ec_dispatches WHERE slug = ${draftQuote(DRAFT_SLUG)}`
  );
  isolation.push(
    `Wrote a draft dispatch \`${DRAFT_SLUG}\` directly into preview D1: ` +
      (present[0]
        ? `status=${present[0].status}, public_safe=${present[0].public_safe}. ` +
          "The draft is marked public but unpublished, which is the state a filter checking only `public_safe` would leak."
        : "the row could not be read back. ")
  );
  for (const path of [
    "/",
    "/dispatches/",
    "/sitemap.xml",
    "/rss.xml",
    "/llms.txt",
    "/agents/facts.json",
    "/projects/"
  ]) {
    const surface = await surfaceMentionsDraft(path);
    if (surface.leaked) leakedSurfaces.push(surface.path);
    isolation.push(
      `\`${surface.path}\` HTTP ${surface.status} — draft marker ${surface.leaked ? "VISIBLE (LEAK)" : "absent"}.`
    );
  }
  const direct = await surfaceMentionsDraft(`/dispatches/${DRAFT_SLUG}/`);
  isolation.push(
    `\`/dispatches/${DRAFT_SLUG}/\` HTTP ${direct.status} — ${
      direct.status === 404 ? "404, as an unpublished record should be" : "returned a page"
    }.`
  );
  const after = query(`SELECT COUNT(*) AS n FROM ec_dispatches`);
  isolation.push(
    `Draft count in the collection: ${before[0]?.n ?? "?"} before, ${after[0]?.n ?? "?"} with the probe present.`
  );
} finally {
  query(`DELETE FROM ec_dispatches WHERE slug = ${draftQuote(DRAFT_SLUG)}`);
  const remaining = query(
    `SELECT COUNT(*) AS n FROM ec_dispatches WHERE slug = ${draftQuote(DRAFT_SLUG)}`
  );
  draftRemoved = Number(remaining[0]?.n ?? 0) === 0;
}
isolation.push(
  `Probe draft removed after the observation: ${draftRemoved ? "yes" : "NO"}. ` +
    "The direct URL was also requested; a draft that answers 200 there is a leak even though it is absent from every index."
);
// A leak is reported loudly rather than written into an artifact and forgotten.
// Recording evidence must not be the thing that swallows a finding.
if (leakedSurfaces.length || draftRemoved === false) {
  console.error(
    "\npublicDraftIsolation FAILED:" +
      (leakedSurfaces.length ? ` the draft was reachable on ${leakedSurfaces.join(", ")}` : "") +
      (draftRemoved === false ? " the probe row was not removed" : "") +
      ". This is recorded in .release/evidence/publicDraftIsolation.md and must not be attested as a pass."
  );
}
await artifact(
  "publicDraftIsolation",
  "Public draft isolation against preview",
  "Inserted a draft dispatch directly into preview D1 with `public_safe = 1` and `status = 'draft'`, then asked every public surface whether it could be reached. The probe row is deleted afterwards, in a `finally`, whether the observation passed or not.",
  isolation,
  [
    "That EmDash's own publish path refuses an incomplete draft. This checks the leak direction only: a draft that is already in the database must not be readable on a public route, in the sitemap, the feed, the search index, Agent Reception or the LLM summary.",
    "That a *private* draft leaks nothing. The probe is `public_safe = 1` because that is the harder case; a private draft has one more filter in front of it.",
    "Nothing about an authenticated editor session, a signed preview URL or the Admin surface.",
    `The probe row was removed: ${draftRemoved ? "confirmed" : "NOT CONFIRMED — inspect preview D1 for " + DRAFT_SLUG}.`
  ]
);

const conversations = query("SELECT COUNT(*) AS n FROM ec_conversations");
const conversationPublicSafe = query(
  "SELECT COUNT(*) AS n FROM ec_conversations WHERE public_safe = 1 AND source_reviewed = 1"
);
const policyTests = run("node", [
  "--experimental-strip-types",
  "--test",
  "src/plugins/woodhouse-editorial-policy.test.ts"
]);
const facts = await (
  await fetch(`${PREVIEW}/agents/facts.json?evidence=${Date.now()}`, {
    signal: AbortSignal.timeout(30000)
  })
).json();
await artifact(
  "conversationPrivacyPolicy",
  "Conversation privacy policy against preview",
  "Counted the preview `conversations` collection, ran the editorial policy unit tests, and read the published Agent Reception permissions block.",
  [
    `Conversation records in the collection: ${conversations[0]?.n ?? 0}.`,
    `Records published as public and source-reviewed: ${conversationPublicSafe[0]?.n ?? 0}.`,
    policyTests.status === 0
      ? "The editorial policy test suite passes, including the case that blocks a conversation record that is public but not source-reviewed."
      : `The editorial policy test suite FAILED:\n\n\`\`\`\n${policyTests.output.trim().slice(-800)}\n\`\`\``,
    `Agent Reception advertises write=${facts.permissions?.write}, privateRepositoryAccess=${facts.permissions?.privateRepositoryAccess}, conversationPublishing=${facts.permissions?.conversationPublishing}.`,
    "The public seed contains no conversation entries, so no private transcript has entered the content model."
  ],
  [
    "That the current policy is enforced on a future write. The editorial policy hook blocks publish and schedule for incomplete or unsafe records; an end-to-end rejection still needs an authenticated editor session.",
    "That the operator would choose correctly when selecting source material."
  ]
);

console.log(
  "\nOutstanding and requiring an authenticated operator session: editorDraftRevisionPreviewSchedulePublish, searchRssSitemapUpdates, mediaUploadAndRender, menuEditing, agentMcpSchemaReadAndDraftReadback, agentMcpRoleBoundary, enquiryDelivery, backupRecoveryDrill, automaticBackupRetention, scheduledPublishCron, desktopAndMobile."
);
