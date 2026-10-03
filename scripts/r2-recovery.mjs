import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { readFileSync } from "node:fs";
import { chmod, lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";

const RECOVERY_SCHEMA_VERSION = 2;
const PROTECTED_BUCKETS = new Set(["woodhouse-emdash-media", "woodhouse-emdash-media-preview"]);

export function loadLocalEnv(env = process.env, filePath = path.resolve(".env")) {
  let contents;
  try {
    contents = readFileSync(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return env;
    throw error;
  }
  for (const line of contents.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match || env[match[1]] !== undefined) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

export function hasR2Credentials(env = process.env) {
  return Boolean(
    (env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID) &&
    (env.R2_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY) &&
    (env.R2_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID)
  );
}

export function createR2Client(env = process.env) {
  const accessKeyId = env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY;
  const accountId = env.R2_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID;
  if (!accessKeyId || !secretAccessKey || !accountId) {
    throw new Error(
      "R2 recovery requires account-scoped R2 S3 credentials and an account ID; values are never printed."
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    maxAttempts: 4,
    credentials: { accessKeyId, secretAccessKey }
  });
}

async function listAllObjects(client, bucket) {
  const objects = [];
  let continuationToken;
  const seenTokens = new Set();
  for (;;) {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: 1000
      })
    );
    for (const item of response.Contents ?? []) {
      if (typeof item.Key !== "string" || !Number.isInteger(item.Size) || item.Size < 0) {
        throw new Error("R2 returned an object without a valid key and size.");
      }
      objects.push(item);
    }
    if (!response.IsTruncated) break;
    const next = response.NextContinuationToken;
    if (!next || seenTokens.has(next))
      throw new Error("R2 pagination did not provide a new continuation token.");
    seenTokens.add(next);
    continuationToken = next;
  }
  return objects.sort((a, b) => a.Key.localeCompare(b.Key));
}

function normalizeEtag(value) {
  return typeof value === "string" ? value.replace(/^"|"$/g, "") : "";
}

function inventoryFingerprint(objects) {
  return JSON.stringify(
    objects.map(({ Key, Size, ETag, LastModified }) => [
      Key,
      Size,
      normalizeEtag(ETag),
      LastModified instanceof Date ? LastModified.toISOString() : String(LastModified ?? "")
    ])
  );
}

function keyFilename(key) {
  return `${createHash("sha256").update(key).digest("hex")}.blob`;
}

function asNodeReadable(body) {
  if (body && typeof body.pipe === "function") return body;
  if (body instanceof Uint8Array || Buffer.isBuffer(body)) return Readable.from([body]);
  if (body && typeof body[Symbol.asyncIterator] === "function") return Readable.from(body);
  if (body && typeof body.getReader === "function") return Readable.fromWeb(body);
  throw new Error("R2 returned an unsupported object body stream.");
}

async function writeAndHash(body, filePath) {
  const hash = createHash("sha256");
  let bytes = 0;
  const counter = new Transform({
    transform(chunk, _encoding, callback) {
      const buffer = Buffer.from(chunk);
      bytes += buffer.length;
      hash.update(buffer);
      callback(null, buffer);
    }
  });
  await pipeline(
    asNodeReadable(body),
    counter,
    createWriteStream(filePath, { flags: "wx", mode: 0o600 })
  );
  return { bytes, sha256: hash.digest("hex") };
}

async function hashBody(body) {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of asNodeReadable(body)) {
    const buffer = Buffer.from(chunk);
    bytes += buffer.length;
    hash.update(buffer);
  }
  return { bytes, sha256: hash.digest("hex") };
}

async function hashFile(filePath) {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of createReadStream(filePath)) {
    bytes += chunk.length;
    hash.update(chunk);
  }
  return { bytes, sha256: hash.digest("hex") };
}

function objectRecord(key, file, response, integrity) {
  return {
    key,
    file,
    size: integrity.bytes,
    sha256: integrity.sha256,
    etag: normalizeEtag(response.ETag),
    lastModified: normalizedDate(response.LastModified),
    storageClass: response.StorageClass ?? null,
    httpMetadata: {
      cacheControl: response.CacheControl ?? null,
      contentDisposition: response.ContentDisposition ?? null,
      contentEncoding: response.ContentEncoding ?? null,
      contentLanguage: response.ContentLanguage ?? null,
      contentType: response.ContentType ?? null,
      expires: normalizedDate(response.Expires)
    },
    customMetadata: response.Metadata ?? {}
  };
}

export async function backupBucket({
  client,
  environment,
  bucket,
  outputDirectory,
  createdAt = new Date().toISOString()
}) {
  if (!client || !environment || !bucket || !outputDirectory)
    throw new Error("Backup requires a client, environment, bucket and private output directory.");
  const absoluteDirectory = path.resolve(outputDirectory);
  await mkdir(path.dirname(absoluteDirectory), { recursive: true, mode: 0o700 });
  await chmod(path.dirname(absoluteDirectory), 0o700);
  await mkdir(absoluteDirectory, { mode: 0o700 });
  await chmod(absoluteDirectory, 0o700);
  const objectDirectory = path.join(absoluteDirectory, "objects");
  await mkdir(objectDirectory, { mode: 0o700 });

  try {
    const before = await listAllObjects(client, bucket);
    const records = [];
    for (const listed of before) {
      const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: listed.Key }));
      if (response.SSECustomerAlgorithm || response.SSECustomerKeyMD5) {
        throw new Error(
          "An R2 object uses customer-supplied encryption; export requires its key and has been stopped."
        );
      }
      if (
        normalizeEtag(listed.ETag) &&
        normalizeEtag(response.ETag) !== normalizeEtag(listed.ETag)
      ) {
        throw new Error(
          "An R2 object changed between inventory and download; no complete manifest was written."
        );
      }
      const filename = keyFilename(listed.Key);
      const relativeFile = `objects/${filename}`;
      const integrity = await writeAndHash(response.Body, path.join(objectDirectory, filename));
      if (
        integrity.bytes !== listed.Size ||
        (response.ContentLength !== undefined && integrity.bytes !== response.ContentLength)
      ) {
        throw new Error(
          "An R2 object size changed during download; no complete manifest was written."
        );
      }
      records.push(
        objectRecord(
          listed.Key,
          relativeFile,
          { ...response, LastModified: response.LastModified ?? listed.LastModified },
          integrity
        )
      );
    }

    const after = await listAllObjects(client, bucket);
    if (inventoryFingerprint(before) !== inventoryFingerprint(after)) {
      throw new Error(
        "The R2 bucket changed while it was being backed up; no complete manifest was written."
      );
    }

    const manifest = {
      schemaVersion: RECOVERY_SCHEMA_VERSION,
      provider: "cloudflare-r2-s3",
      environment,
      bucket,
      createdAt,
      complete: true,
      archiveDirectory: absoluteDirectory,
      objectCount: records.length,
      totalBytes: records.reduce((total, item) => total + item.size, 0),
      objects: records,
      verification: {
        method: "r2-s3-list-get-sha256-and-stable-inventory",
        objects: records.length
      }
    };
    const manifestPath = path.join(absoluteDirectory, "manifest.json");
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
      mode: 0o600,
      flag: "wx"
    });
    await chmod(manifestPath, 0o600);
    return { manifest, manifestPath };
  } catch (error) {
    // This directory was created exclusively by this invocation; remove only its partial output.
    await import("node:fs/promises").then(({ rm }) =>
      rm(absoluteDirectory, { recursive: true, force: true })
    );
    throw error;
  }
}

function isContained(parent, child) {
  const relative = path.relative(parent, child);
  return (
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

export async function verifyBackupManifest(manifestPath, { requiredPrivate = true } = {}) {
  const resolvedManifest = path.resolve(manifestPath);
  const releaseRoot = path.resolve(".release");
  if (!isContained(releaseRoot, resolvedManifest))
    throw new Error("R2 manifests must remain under the private .release directory.");
  const manifestRealPath = await realpath(resolvedManifest);
  if (!isContained(releaseRoot, manifestRealPath))
    throw new Error("R2 manifest symlinks cannot escape the private .release directory.");
  const details = await lstat(resolvedManifest);
  if (
    !details.isFile() ||
    details.isSymbolicLink() ||
    (requiredPrivate && (details.mode & 0o077) !== 0)
  )
    throw new Error("R2 recovery manifest must be a private regular file.");
  const manifest = JSON.parse(await readFile(resolvedManifest, "utf8"));
  const emptyWranglerSnapshot =
    manifest.provider === "cloudflare-r2" &&
    manifest.objectCount === 0 &&
    manifest.verification?.method === "wrangler-r2-bucket-info-empty-only";
  if (
    manifest.schemaVersion !== RECOVERY_SCHEMA_VERSION ||
    (!emptyWranglerSnapshot && manifest.provider !== "cloudflare-r2-s3") ||
    manifest.complete !== true ||
    !Array.isArray(manifest.objects)
  ) {
    throw new Error("R2 recovery manifest schema is incomplete or unsupported.");
  }
  if (
    manifest.objects.length !== manifest.objectCount ||
    manifest.objects.some(
      (item) =>
        !item ||
        typeof item.key !== "string" ||
        !Number.isInteger(item.size) ||
        item.size < 0 ||
        !/^[a-f0-9]{64}$/.test(item.sha256 ?? "")
    )
  ) {
    throw new Error("R2 manifest object inventory is invalid.");
  }
  if (new Set(manifest.objects.map((item) => item.key)).size !== manifest.objects.length)
    throw new Error("R2 manifest contains duplicate object keys.");

  const archiveDirectory = path.resolve(
    manifest.archiveDirectory ?? path.dirname(resolvedManifest)
  );
  if (!isContained(releaseRoot, archiveDirectory))
    throw new Error("R2 archive files must remain under the private .release directory.");
  const archiveRealPath = await realpath(archiveDirectory);
  if (!isContained(releaseRoot, archiveRealPath))
    throw new Error("R2 archive symlinks cannot escape the private .release directory.");
  const archiveStat = await lstat(archiveDirectory);
  if (
    !archiveStat.isDirectory() ||
    archiveStat.isSymbolicLink() ||
    (requiredPrivate && (archiveStat.mode & 0o077) !== 0)
  )
    throw new Error("R2 archive directory must be private and cannot be a symlink.");
  if (manifest.objects.length > 0) {
    const objectsDirectory = path.join(archiveDirectory, "objects");
    const objectsRealPath = await realpath(objectsDirectory);
    const objectsStat = await lstat(objectsDirectory);
    if (
      !isContained(archiveRealPath, objectsRealPath) ||
      !objectsStat.isDirectory() ||
      objectsStat.isSymbolicLink() ||
      (requiredPrivate && (objectsStat.mode & 0o077) !== 0)
    ) {
      throw new Error("R2 object archive directory must be private and cannot be a symlink.");
    }
  }
  const totalBytes = manifest.objects.reduce((total, item) => total + item.size, 0);
  if (totalBytes !== manifest.totalBytes)
    throw new Error("R2 manifest total size does not match its object inventory.");
  for (const item of manifest.objects) {
    if (typeof item.file !== "string" || path.isAbsolute(item.file))
      throw new Error("R2 manifest contains an unsafe archive path.");
    const filePath = path.resolve(archiveDirectory, item.file);
    if (!isContained(archiveDirectory, filePath))
      throw new Error("R2 manifest archive path escapes its private directory.");
    const fileRealPath = await realpath(filePath);
    if (!isContained(archiveRealPath, fileRealPath))
      throw new Error("R2 object symlinks cannot escape their private archive directory.");
    const fileStat = await lstat(filePath);
    if (
      !fileStat.isFile() ||
      fileStat.isSymbolicLink() ||
      (requiredPrivate && (fileStat.mode & 0o077) !== 0)
    )
      throw new Error("R2 archive object must be a private regular file.");
    const integrity = await hashFile(filePath);
    if (integrity.bytes !== item.size || integrity.sha256 !== item.sha256)
      throw new Error("R2 archive object failed its SHA-256 or size check.");
  }
  return { manifest, archiveDirectory, manifestPath: resolvedManifest };
}

function normalizeMetadata(metadata = {}) {
  return Object.fromEntries(Object.entries(metadata).sort(([a], [b]) => a.localeCompare(b)));
}

function normalizedDate(value) {
  return value instanceof Date ? value.toISOString() : value ? new Date(value).toISOString() : null;
}

function verifyHeadMetadata(archived, head) {
  const http = archived.httpMetadata ?? {};
  return (
    head.ContentLength === archived.size &&
    (head.ContentType ?? null) === (http.contentType ?? null) &&
    (head.CacheControl ?? null) === (http.cacheControl ?? null) &&
    (head.ContentDisposition ?? null) === (http.contentDisposition ?? null) &&
    (head.ContentEncoding ?? null) === (http.contentEncoding ?? null) &&
    (head.ContentLanguage ?? null) === (http.contentLanguage ?? null) &&
    normalizedDate(head.Expires) === (http.expires ?? null) &&
    JSON.stringify(normalizeMetadata(head.Metadata)) ===
      JSON.stringify(normalizeMetadata(archived.customMetadata)) &&
    (!archived.storageClass || !head.StorageClass || head.StorageClass === archived.storageClass)
  );
}

export async function verifyBucketMatchesManifest(client, bucket, manifest) {
  const live = await listAllObjects(client, bucket);
  const expected = [...manifest.objects].sort((a, b) => a.key.localeCompare(b.key));
  if (live.length !== expected.length)
    throw new Error("Live R2 object count differs from the verified backup manifest.");
  for (let index = 0; index < expected.length; index += 1) {
    const archived = expected[index];
    const listed = live[index];
    if (
      listed.Key !== archived.key ||
      listed.Size !== archived.size ||
      normalizeEtag(listed.ETag) !== (archived.etag ?? "") ||
      normalizedDate(listed.LastModified) !== archived.lastModified
    ) {
      throw new Error("Live R2 object inventory differs from the verified backup manifest.");
    }
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: archived.key }));
    if (!verifyHeadMetadata(archived, head)) {
      throw new Error("Live R2 object metadata differs from the verified backup manifest.");
    }
  }
  return {
    objectCount: live.length,
    totalBytes: live.reduce((total, item) => total + item.Size, 0)
  };
}

function safeRecoveryBucket(bucket) {
  return (
    typeof bucket === "string" &&
    bucket.length <= 63 &&
    /^woodhouse-emdash-recovery-[a-z0-9][a-z0-9-]{2,36}$/.test(bucket) &&
    !PROTECTED_BUCKETS.has(bucket)
  );
}

function restoreMetadata(item) {
  const http = item.httpMetadata ?? {};
  const input = {
    ContentType: http.contentType ?? undefined,
    CacheControl: http.cacheControl ?? undefined,
    ContentDisposition: http.contentDisposition ?? undefined,
    ContentEncoding: http.contentEncoding ?? undefined,
    ContentLanguage: http.contentLanguage ?? undefined,
    Expires: http.expires ? new Date(http.expires) : undefined,
    Metadata: item.customMetadata ?? {}
  };
  if (item.storageClass) input.StorageClass = item.storageClass;
  return input;
}

export async function restoreBucket({ client, manifestPath, targetBucket }) {
  if (!client) throw new Error("R2 restore requires an authenticated R2 client.");
  if (!safeRecoveryBucket(targetBucket))
    throw new Error(
      "Restore target must use the isolated woodhouse-emdash-recovery-* bucket prefix."
    );
  const { manifest, archiveDirectory } = await verifyBackupManifest(manifestPath);
  if (targetBucket === manifest.bucket || PROTECTED_BUCKETS.has(targetBucket))
    throw new Error("Restore cannot target its source or a live Woodhouse media bucket.");

  const firstPage = await client.send(
    new ListObjectsV2Command({ Bucket: targetBucket, MaxKeys: 1 })
  );
  if ((firstPage.Contents?.length ?? 0) > 0 || firstPage.IsTruncated)
    throw new Error("Restore target must be an existing empty R2 bucket.");

  for (const item of manifest.objects) {
    const filePath = path.resolve(archiveDirectory, item.file);
    await client.send(
      new PutObjectCommand({
        Bucket: targetBucket,
        Key: item.key,
        Body: createReadStream(filePath),
        ContentLength: item.size,
        ...restoreMetadata(item)
      })
    );
  }

  const restored = await listAllObjects(client, targetBucket);
  const expected = [...manifest.objects].sort((a, b) => a.key.localeCompare(b.key));
  if (
    restored.length !== expected.length ||
    restored.some(
      (item, index) => item.Key !== expected[index].key || item.Size !== expected[index].size
    )
  ) {
    throw new Error(
      "Restored R2 listing does not match the archived inventory; leave the isolated bucket intact for inspection."
    );
  }
  for (const item of expected) {
    const body = await client.send(new GetObjectCommand({ Bucket: targetBucket, Key: item.key }));
    const integrity = await hashBody(body.Body);
    if (integrity.bytes !== item.size || integrity.sha256 !== item.sha256) {
      throw new Error(
        "Restored R2 object failed its SHA-256 readback; leave the isolated bucket intact for inspection."
      );
    }
    const head = await client.send(new HeadObjectCommand({ Bucket: targetBucket, Key: item.key }));
    if (!verifyHeadMetadata(item, head))
      throw new Error(
        "Restored R2 object metadata readback failed; leave the isolated bucket intact for inspection."
      );
  }
  return {
    environment: manifest.environment,
    sourceBucket: manifest.bucket,
    targetBucket,
    sourceManifest: path.resolve(manifestPath),
    sourceManifestSha256: createHash("sha256")
      .update(await readFile(path.resolve(manifestPath)))
      .digest("hex"),
    createdAt: new Date().toISOString(),
    objectCount: expected.length,
    totalBytes: manifest.totalBytes,
    result: "verified"
  };
}

export function newBackupDirectory(environment, root = process.cwd(), now = new Date()) {
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return path.join(root, ".release", "backups", environment, "r2", `${stamp}-${randomUUID()}`);
}
