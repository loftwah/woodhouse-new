import { chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  backupBucket,
  createR2Client,
  hasR2Credentials,
  loadLocalEnv,
  newBackupDirectory
} from "./r2-recovery.mjs";

const root = process.cwd();
const scriptArgs = process.argv.slice(2);
if (scriptArgs[0] === "--") scriptArgs.shift();
const [environment, ...args] = scriptArgs;
const targets = {
  preview: { bucket: "woodhouse-emdash-media-preview" },
  production: { bucket: "woodhouse-emdash-media" }
};

if (!targets[environment])
  throw new Error(
    "Usage: pnpm run backup:r2 -- preview|production [--output=/private/.release/path/manifest.json]"
  );
loadLocalEnv();

const bucket = targets[environment].bucket;
const outputArg = args.find((argument) => argument.startsWith("--output="));
const defaultDirectory = newBackupDirectory(environment, root);
const outputPath = path.resolve(
  outputArg?.slice("--output=".length) ?? path.join(defaultDirectory, "manifest.json")
);
const releaseRoot = path.resolve(root, ".release");
const outputDirectory = path.dirname(outputPath);
const relativeOutput = path.relative(releaseRoot, outputPath);
if (
  relativeOutput === ".." ||
  relativeOutput.startsWith(`..${path.sep}`) ||
  path.isAbsolute(relativeOutput)
) {
  throw new Error("R2 recovery files must remain under the ignored .release directory.");
}
if (path.basename(outputPath) !== "manifest.json")
  throw new Error(
    "R2 recovery manifest must be named manifest.json inside its private backup directory."
  );
if (path.extname(outputPath).toLowerCase() !== ".json")
  throw new Error("R2 recovery manifest path must end in .json.");

if (hasR2Credentials()) {
  const { manifest, manifestPath } = await backupBucket({
    client: createR2Client(),
    environment,
    bucket,
    outputDirectory
  });
  console.log(
    `R2 backup verified: ${manifest.objectCount} objects, ${manifest.totalBytes} bytes; private manifest ${path.relative(root, manifestPath)}.`
  );
} else {
  const result = spawnSync("pnpm", ["exec", "wrangler", "r2", "bucket", "info", bucket, "--json"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`Could not inspect R2 bucket ${bucket}; no manifest was written.`);
  const jsonStart = result.stdout.indexOf("{");
  if (jsonStart < 0) throw new Error("Wrangler did not return JSON bucket information.");
  const info = JSON.parse(result.stdout.slice(jsonStart));
  const objectCount = Number(info.object_count);
  const bucketSize = String(info.bucket_size ?? "").trim();
  if (!Number.isInteger(objectCount) || objectCount < 0)
    throw new Error("R2 returned an invalid object count.");
  if (objectCount !== 0 || !/^0(?:\s|$)/.test(bucketSize)) {
    throw new Error(
      "The R2 bucket is not empty. Set private R2 S3 credentials to create a complete object archive; no empty-bucket manifest was written."
    );
  }

  await mkdir(path.dirname(outputDirectory), { recursive: true, mode: 0o700 });
  await chmod(path.dirname(outputDirectory), 0o700);
  await mkdir(outputDirectory, { recursive: false, mode: 0o700 });
  await chmod(outputDirectory, 0o700);
  const manifest = {
    schemaVersion: 2,
    provider: "cloudflare-r2",
    environment,
    bucket,
    createdAt: new Date().toISOString(),
    complete: true,
    archiveDirectory: outputDirectory,
    objectCount: 0,
    totalBytes: 0,
    objects: [],
    verification: {
      method: "wrangler-r2-bucket-info-empty-only",
      objectCount: 0,
      bucketSize: info.bucket_size
    }
  };
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    mode: 0o600,
    flag: "wx"
  });
  await chmod(outputPath, 0o600);
  console.log(
    `Verified empty R2 bucket ${bucket}; private manifest ${path.relative(root, outputPath)}.`
  );
}
