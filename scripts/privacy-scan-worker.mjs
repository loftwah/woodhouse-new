import { readFile } from "node:fs/promises";
import { parentPort, workerData } from "node:worker_threads";
import { scanPublicText } from "./public-privacy.mjs";

// Each worker scans complete files with the same rules as the serial guard.
const findings = [];
for (const { index, file, isPublic } of workerData.files) {
  const bytes = await readFile(file);
  const labels = scanPublicText(bytes, {
    privateValues: workerData.privateValues,
    includeMarkers: isPublic,
    includePatterns: true
  });
  if (labels.length) findings.push({ index, labels });
}
parentPort.postMessage(findings);
