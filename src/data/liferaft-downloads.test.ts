import test from "node:test";
import assert from "node:assert/strict";
import { loadLiferaftDownloads } from "./liferaft-downloads.ts";

test("release totals include zero-count DMGs and exclude checksum files and prereleases", async () => {
  const asset = (name: string, download_count: number) => ({
    name,
    download_count,
    state: "uploaded"
  });
  const releases = [
    {
      tag_name: "v0.3.1",
      draft: false,
      prerelease: false,
      assets: [
        asset("Liferaft-0.3.1-mac-arm64.dmg", 0),
        asset("Liferaft-0.3.1-mac-arm64.dmg.sha256", 9)
      ]
    },
    {
      tag_name: "v0.3.0",
      draft: false,
      prerelease: false,
      assets: [asset("Liferaft-0.3.0-mac-arm64.dmg", 2)]
    },
    {
      tag_name: "v0.4.0",
      draft: false,
      prerelease: true,
      assets: [asset("Liferaft-0.4.0-mac-arm64.dmg", 99)]
    }
  ];
  assert.deepEqual(
    (await loadLiferaftDownloads(async () => Response.json(releases)))?.map(
      ({ tag, downloads }) => [tag, downloads]
    ),
    [
      ["v0.3.1", 0],
      ["v0.3.0", 2]
    ]
  );
  assert.equal(await loadLiferaftDownloads(async () => new Response(null, { status: 429 })), null);
});
