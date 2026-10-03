import { spawnSync } from "node:child_process";

// Advisories that have been examined and consciously accepted. Each entry
// must name the advisory, why the exposure is bounded here, and the condition
// that retires it. Anything not listed fails this check, so a new advisory
// still stops the release.
const reviewed = {
  "GHSA-ch52-4w7c-c8xp": {
    package: "http-cache-semantics",
    severity: "high",
    reviewed: "2026-10-03",
    reason:
      "Astro depends on http-cache-semantics only in its build-time remote image fetcher (astro/dist/assets/build/remote.js). The deployed Worker bundle contains neither the module nor satisfiesWithoutRevalidation, so no request served to a visitor is parsed by this code. No patched release exists upstream; Astro pins ^4.2.0.",
    retiredWhen:
      "A patched http-cache-semantics is published and adopted by Astro, or Woodhouse starts serving remote images through Astro's image pipeline."
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
