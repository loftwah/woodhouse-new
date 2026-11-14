// Git checkouts and Worker uploads reset filesystem mtimes. Record the last
// repository content change for each original so the order survives both.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const log = execFileSync(
  "git",
  ["log", "--format=@@%cI", "--name-only", "--no-renames", "--", "public/campaign", "public/share"],
  { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
);
const files = new Map();
let date;
for (const line of log.split("\n")) {
  if (line.startsWith("@@")) date = new Date(line.slice(2)).toISOString();
  else if (line.startsWith("public/") && /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(line)) {
    const path = line.slice("public".length);
    if (!files.has(path)) files.set(path, date);
  }
}
const { campaignItems } = await import("../src/data/showcase-campaign.ts");
const paths = new Set(campaignItems.map(({ original }) => original));
writeFileSync(
  "src/data/artwork-file-dates.json",
  JSON.stringify(
    Object.fromEntries(
      [...files].filter(([path]) => paths.has(path)).sort(([a], [b]) => a.localeCompare(b))
    ),
    null,
    2
  ) + "\n"
);
