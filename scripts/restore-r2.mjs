import { chmod, writeFile } from "node:fs/promises";
import path from "node:path";
import { createR2Client, loadLocalEnv, restoreBucket } from "./r2-recovery.mjs";

const args = process.argv.slice(2);
if (args[0] === "--") args.shift();
const manifestPath = args.find((arg) => !arg.startsWith("--"));
const targetArgument = args.find((arg) => arg.startsWith("--target-bucket="));
const targetBucket = targetArgument?.slice("--target-bucket=".length);
if (!manifestPath || !targetBucket) {
  throw new Error(
    "Usage: pnpm run restore:r2 -- .release/backups/<environment>/r2/<id>/manifest.json --target-bucket=woodhouse-emdash-recovery-<name>"
  );
}

loadLocalEnv();
const report = await restoreBucket({
  client: createR2Client(),
  manifestPath,
  targetBucket
});
const manifestDirectory = path.dirname(path.resolve(manifestPath));
const reportPath = path.join(manifestDirectory, `restore-${targetBucket}.json`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600, flag: "wx" });
await chmod(reportPath, 0o600);
console.log(
  `R2 restore verified in isolated bucket ${targetBucket}: ${report.objectCount} objects, ${report.totalBytes} bytes; private readback report ${path.relative(process.cwd(), reportPath)}.`
);
