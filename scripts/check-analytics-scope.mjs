// Regression for #102: one deliberate destination must own every task/export.
// Call checkAnalyticsScope(page, {origin, directory}) with an available Playwright
// page. Read-only frozen public data, always excluded from audience collection.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function checkAnalyticsScope(page, { origin, directory }) {
  await mkdir(directory, { recursive: true });
  const report = "e0fbda9c0faa2798b864c83f";
  const query = new URLSearchParams({
    report,
    project: "woodhouse",
    measure: "project_opens",
    destination: "bubbles",
    analytics: "off",
    qa: "1"
  });
  const start = `${origin}/activity/?${query}`;
  const nav = page.getByRole("navigation", { name: "Report views" });
  const selection = () => {
    const url = new URL(page.url());
    for (const [key, value] of query) assert.equal(url.searchParams.get(key), value, key);
  };
  const payload = () => page.locator("#activity-chart-data").textContent().then(JSON.parse);
  await page.goto(start);
  selection();
  const data = await payload();
  assert.match(data.series[0].name, /Woodhouse → Bubbles/);
  assert(data.series[0].values.includes(null), "Missing history stays unavailable");
  assert(data.series[0].values.includes(0), "Measured zero remains zero");
  assert.equal(
    data.series[0].values.reduce((sum, value) => sum + (value ?? 0), 0),
    4
  );
  assert.match(await page.locator(".selected-total").innerText(), /^4\b/);
  await page.screenshot({ path: path.join(directory, "chart-desktop.png"), fullPage: true });
  await nav.getByRole("link", { name: "Data", exact: true }).click();
  selection();
  assert.deepEqual((await payload()).series, data.series);
  assert.match(await page.locator(".daily-data thead").innerText(), /Woodhouse → Bubbles/);
  const firstDates = await page.locator(".daily-data tbody th").allTextContents();
  await page.getByRole("link", { name: "Older dates", exact: true }).click();
  selection();
  assert.notDeepEqual(await page.locator(".daily-data tbody th").allTextContents(), firstDates);
  assert.deepEqual((await payload()).series, data.series);
  const csvDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV", exact: true }).click();
  const csv = await csvDownload;
  await csv.saveAs(path.join(directory, "bubbles-discovery.csv"));
  const csvText = await readFile(path.join(directory, "bubbles-discovery.csv"), "utf8");
  const daily = csvText.split(/\r?\n/).filter((line) => /^"\d{4}-\d\d-\d\d"/.test(line));
  assert.equal(daily.length, 30);
  assert.equal(
    daily.reduce((sum, line) => sum + Number(line.split(",")[1].replaceAll('"', "")), 0),
    4
  );
  assert.match(csvText, /Woodhouse → Bubbles/);
  await nav.getByRole("link", { name: "Portfolio stories", exact: true }).click();
  selection();
  await nav.getByRole("link", { name: "Chart", exact: true }).click();
  selection();
  assert.equal(
    (await payload()).series[0].values.reduce((a, b) => a + (b ?? 0), 0),
    4
  );
  await nav.getByRole("link", { name: "Share", exact: true }).click();
  selection();
  const caption = await page.locator(".share-caption pre").textContent();
  assert.match(caption, /Bubbles/);
  assert.match(caption, /\b4\b/);
  assert.doesNotMatch(caption, /analytics=off|qa=/);
  const publicUrl = new URL(caption.match(/https:\/\/\S+/g).at(-1));
  assert.equal(publicUrl.origin, origin);
  for (const key of ["report", "project", "measure", "destination"])
    assert.equal(publicUrl.searchParams.get(key), query.get(key));
  await writeFile(path.join(directory, "caption.txt"), caption);
  await page.getByRole("button", { name: "Copy caption + link", exact: true }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), caption);
  assert.match(await page.locator("[data-report-status]").innerText(), /copied/i);
  const pngDownload = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download landscape PNG", exact: true }).click();
  const png = await pngDownload;
  await png.saveAs(path.join(directory, "bubbles-discovery.png"));
  const bytes = await readFile(path.join(directory, "bubbles-discovery.png"));
  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
  const image = new URL(await page.locator("[data-report-preview]").getAttribute("src"), origin);
  assert.equal(image.searchParams.get("destination"), "bubbles");
  const permalink = await page
    .getByRole("link", { name: "Open frozen permalink", exact: true })
    .getAttribute("href");
  assert.equal(new URL(permalink, origin).searchParams.get("analytics"), "off");
  await page.getByRole("link", { name: "Open frozen permalink", exact: true }).click();
  selection();
  await page.reload();
  selection();
  await page.goBack();
  selection();
  await page.goForward();
  selection();
  await page.getByRole("link", { name: "All destinations", exact: true }).click();
  assert.equal(new URL(page.url()).searchParams.has("destination"), false);
  assert.match(await page.locator(".selected-total").innerText(), /^18\b/);
  await page.goBack();
  selection();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(directory, "chart-phone.png"), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const unknown = await page.request.get(
    start.replace("destination=bubbles", "destination=unknown-product")
  );
  assert.equal(unknown.status(), 404);
  const unsupported = await page.request.get(
    `${origin}/api/portfolio-card.png?report=${report}&project=fighter&measure=game_starts&destination=bubbles`
  );
  assert.equal(unsupported.status(), 400);
  // Custom dates create a new report; every task must keep those effective dates.
  const custom = new URL(start);
  custom.searchParams.delete("report");
  custom.searchParams.set("from", "2026-10-16");
  custom.searchParams.set("to", "2026-10-22");
  await page.goto(custom.href);
  const customData = await payload();
  assert.equal(customData.period.from, "2026-10-16");
  assert.equal(customData.period.to, "2026-10-22");
  await nav.getByRole("link", { name: "Data", exact: true }).click();
  assert.deepEqual((await payload()).period, customData.period);
  assert.equal(new URL(page.url()).searchParams.get("destination"), "bubbles");
  await page.reload();
  assert.deepEqual((await payload()).period, customData.period);
  const visits = new URL(start);
  visits.searchParams.delete("destination");
  visits.searchParams.set("measure", "visits");
  visits.searchParams.set("view", "notes");
  await page.goto(visits.href);
  await page
    .locator("summary")
    .filter({ hasText: /^Project discovery$/ })
    .click();
  const rail = page.getByRole("navigation", { name: "Measured destinations" });
  const selected = rail.locator("a").filter({ hasText: "Bubbles" });
  const railUrl = new URL(await selected.getAttribute("href"), origin);
  assert.equal(railUrl.searchParams.get("project"), "woodhouse");
  assert.equal(railUrl.searchParams.get("measure"), "project_opens");
  assert.equal(railUrl.searchParams.get("destination"), "bubbles");
  await selected.click();
  selection();
  return {
    report,
    destination: "bubbles",
    destinationTotal: 4,
    overallTotal: 18,
    dates: 30,
    clipboard: "exact",
    png: [1200, 630],
    customDates: customData.period,
    physicalShare: "not observed"
  };
}

// Use an existing approved Playwright runtime; this check adds no dependency.
if (process.argv[1]?.endsWith("check-analytics-scope.mjs")) {
  const [origin, directory, runtime] = process.argv.slice(2);
  if (!origin || !directory || !runtime)
    throw new Error(
      "Usage: node scripts/check-analytics-scope.mjs <origin> <evidence directory> <existing Playwright module path>"
    );
  const { chromium } = await import(runtime);
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      permissions: ["clipboard-read", "clipboard-write"],
      recordVideo: { dir: directory, size: { width: 1440, height: 1000 } }
    });
    const page = await context.newPage();
    const receipt = await checkAnalyticsScope(page, { origin, directory });
    await context.close();
    await writeFile(path.join(directory, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
    console.log(JSON.stringify(receipt));
  } finally {
    await browser.close();
  }
}
