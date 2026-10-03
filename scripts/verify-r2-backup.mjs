import { verifyBackupManifest } from "./r2-recovery.mjs";

const args = process.argv.slice(2);
if (args[0] === "--") args.shift();
const manifestPath = args[0];
if (!manifestPath)
  throw new Error(
    "Usage: pnpm run verify:r2 -- .release/backups/<environment>/r2/<id>/manifest.json"
  );
const { manifest } = await verifyBackupManifest(manifestPath);
console.log(
  `R2 archive integrity passed: ${manifest.objectCount} objects, ${manifest.totalBytes} bytes, private manifest ${manifestPath}.`
);
