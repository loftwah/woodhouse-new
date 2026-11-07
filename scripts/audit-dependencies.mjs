import { spawnSync } from "node:child_process";

// Advisories that have been examined and consciously accepted. Each entry
// must name the advisory, why the exposure is bounded here, and the condition
// that retires it. Anything not listed fails this check, so a new advisory
// still stops the release.
// The previously accepted http-cache-semantics advisory was retired on 7 October
// 2026 after updating to the patched 4.3.0 release. No current exceptions.
// Reviewed 8 November 2026 against pnpm 12.8.1 and the production Worker.
const reviewed = {
  // seroval arrives only through EmDash's admin SPA (emdash > @emdash-cms/admin >
  // @tanstack/react-router > @tanstack/router-core). Production runs
  // WOODHOUSE_PUBLICATION_MODE=read-only and the Worker refuses every /_emdash/
  // request before the EmDash handler, so the deserializer is not reachable from a
  // public request. Retires with the EmDash 1.4.x upgrade, and must be re-reviewed
  // before authoring is enabled in any environment.
  "GHSA-f86p-h4j2-7qgj": {
    package: "seroval",
    severity: "moderate",
    reviewed: "2026-11-08",
    why: "Admin-only dependency; /_emdash/ is refused by the read-only publication boundary.",
    retiredWhen: "EmDash is upgraded to a release with seroval >=1.6.11, or authoring is enabled."
  },
  "GHSA-9wx9-5pv9-3349": {
    package: "seroval",
    severity: "moderate",
    reviewed: "2026-11-08",
    why: "Admin-only dependency; /_emdash/ is refused by the read-only publication boundary.",
    retiredWhen: "EmDash is upgraded to a release with seroval >=1.6.10, or authoring is enabled."
  },
  "GHSA-97r2-qh9m-474h": {
    package: "seroval",
    severity: "high",
    reviewed: "2026-11-08",
    why: "Admin-only dependency; /_emdash/ is refused by the read-only publication boundary.",
    retiredWhen: "EmDash is upgraded to a release with seroval >=1.6.8, or authoring is enabled."
  },
  "GHSA-wp97-x4hv-qvhp": {
    package: "seroval",
    severity: "high",
    reviewed: "2026-11-08",
    why: "Admin-only dependency; /_emdash/ is refused by the read-only publication boundary.",
    retiredWhen: "EmDash is upgraded to a release with seroval >=1.6.8, or authoring is enabled."
  },
  "GHSA-7rv5-mrxv-xcr9": {
    package: "seroval",
    severity: "high",
    reviewed: "2026-11-08",
    why: "Admin-only dependency; /_emdash/ is refused by the read-only publication boundary.",
    retiredWhen: "EmDash is upgraded to a release with seroval >=1.6.8, or authoring is enabled."
  },
  // @hono/node-server is pulled in by @modelcontextprotocol/sdk inside the EmDash
  // CLI. It is a Node `serveStatic` implementation; the deployed Worker never runs
  // that adapter and the MCP server is not exposed on any public route.
  "GHSA-rmxm-3fg6-px4f": {
    package: "@hono/node-server",
    severity: "moderate",
    reviewed: "2026-11-08",
    why: "Node-only MCP/CLI adapter inside EmDash; not imported by the deployed Worker runtime.",
    retiredWhen: "EmDash ships @hono/node-server >=2.1.3."
  },
  // minimatch is a dev-time lint dependency (ESLint config matching). Its input is
  // the repository's own glob list, not request data.
  "GHSA-g3hv-75wg-m249": {
    package: "minimatch",
    severity: "moderate",
    reviewed: "2026-11-08",
    why: "Dev-only ESLint dependency over repository-controlled globs; no request path.",
    retiredWhen: "ESLint upgrades to minimatch >=11.0.1."
  }
};

const audit = spawnSync("pnpm", ["audit", "--json"], {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024
});
let parsed;
try {
  const offset = audit.stdout.search(/\{/);
  parsed = JSON.parse(offset >= 0 ? audit.stdout.slice(offset) : "{}");
} catch {
  console.error("Dependency audit returned unreadable JSON.");
  process.exit(1);
}

const advisories = Object.values(parsed.advisories ?? {});
const accepted = [];
const rejected = [];
for (const advisory of advisories) {
  const id = advisory.github_advisory_id;
  const entry = reviewed[id];
  if (entry && entry.package === advisory.module_name) accepted.push({ id, ...entry });
  else
    rejected.push(
      `${id ?? advisory.id} ${advisory.module_name} (${advisory.severity}): ${advisory.title}`
    );
}

for (const entry of accepted) {
  console.log(
    `Accepted after review: ${entry.id} ${entry.package} (${entry.severity}), reviewed ${entry.reviewed}. Retired when: ${entry.retiredWhen}`
  );
}

const counts = parsed.metadata?.vulnerabilities ?? {};
console.log(
  `Dependency audit: ${advisories.length} advisories, ${accepted.length} reviewed and accepted, ${rejected.length} not reviewed. Reported severities: ${
    Object.entries(counts)
      .filter(([, count]) => Number(count) > 0)
      .map(([severity, count]) => `${count} ${severity}`)
      .join(", ") || "none"
  }.`
);

if (rejected.length) {
  for (const entry of rejected) console.error("Unreviewed dependency advisory: " + entry);
  console.error(
    "Add a reviewed entry in scripts/audit-dependencies.mjs with its exposure and removal condition, or resolve the advisory."
  );
  process.exitCode = 1;
}
