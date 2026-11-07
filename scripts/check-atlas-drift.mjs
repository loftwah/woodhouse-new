#!/usr/bin/env node
// Reports when a project's source has moved past the revision the atlas
// reviewed. This is the low-cost drift check #149 asks for: it reads local
// checkouts and never modifies them, calls no provider, and runs no CI job.
//
//   pnpm atlas:drift          report
//   pnpm atlas:drift --check  exit 1 when any reviewed revision has moved
//
// A drift result is a review trigger, not a build failure by default. Re-read
// the affected project's facts, update its reference and review date, then
// regenerate the plate if a relationship or status changed. Missing checkouts
// are reported separately so a fresh machine does not look like stale data.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { atlasProfiles } = await import(path.join(root, "src/data/architecture-atlas.ts"));

// Woodhouse is reviewed as part of its own releases, so its reference moves
// with this repository and is not compared against a sibling checkout.
const repositories = {
  bubbles: "/Users/deanlofts/gits/bubbles",
  fighter: "/Users/deanlofts/gits/fighter",
  shoalshot: "/Users/deanlofts/gits/fishing-diary",
  "protocol-11": "/Users/deanlofts/gits/phase-11",
  max: "/Users/deanlofts/gits/max",
  pirates: "/Users/deanlofts/gits/pirates",
  loftwahfm: "/Users/deanlofts/gits/loftwahfm",
  "social-club": "/Users/deanlofts/gits/club",
  "asset-hunter": "/Users/deanlofts/gits/asset-hunter",
  "app-composer": "/Users/deanlofts/gits/app-composer",
  liferaft: "/Users/deanlofts/gits/liferaft",
  foilbury: "/Users/deanlofts/gits/card-collector-bot"
};

function git(repository, args) {
  const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "";
}

const check = process.argv.includes("--check");
let drift = 0;
let missing = 0;

for (const profile of atlasProfiles) {
  if (profile.slug === "woodhouse") continue;
  const repository = repositories[profile.slug];
  const recorded = /([0-9a-f]{8})$/.exec(profile.reference)?.[1] ?? "";
  if (!repository) {
    console.log(`UNMAPPED  ${profile.slug}: no local repository is configured`);
    drift += 1;
    continue;
  }
  const current = git(repository, ["rev-parse", "--short=8", "HEAD"]);
  if (!current) {
    console.log(`MISSING   ${profile.slug}: ${repository} is not a readable git checkout`);
    missing += 1;
    continue;
  }
  const branch = git(repository, ["branch", "--show-current"]) || "(detached)";
  if (current === recorded) console.log(`CURRENT   ${profile.slug}: ${branch} @ ${current}`);
  else {
    console.log(
      `DRIFT     ${profile.slug}: reviewed ${profile.reference}, now ${branch} @ ${current}`
    );
    drift += 1;
  }
}

console.log(
  `\n${atlasProfiles.length - 1} project checkouts checked: ${drift} drifted, ${missing} missing. ` +
    "A drift result means re-read that profile; it does not mean the published page is wrong today."
);
if (check && (drift || missing)) process.exitCode = 1;
