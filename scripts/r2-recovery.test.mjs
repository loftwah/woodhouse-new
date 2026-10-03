import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { Readable } from "node:stream";
import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import {
  backupBucket,
  restoreBucket,
  verifyBackupManifest,
  verifyBucketMatchesManifest
} from "./r2-recovery.mjs";

async function readBody(body) {
  const chunks = [];
  for await (const chunk of body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function makeClient(objects) {
  const uploads = new Map();
  const restoredMetadata = new Map();
  return {
    uploads,
    restoredMetadata,
    async send(command) {
      const input = command.input;
      if (command instanceof ListObjectsV2Command) {
        if (input.Bucket === "woodhouse-emdash-recovery-test01") {
          return {
            Contents: [...uploads].map(([Key, value]) => ({
              Key,
              Size: value.body.length,
              ETag: `"${value.etag}"`
            }))
          };
        }
        return {
          Contents: objects.map(({ key, body, etag, lastModified }) => ({
            Key: key,
            Size: body.length,
            ETag: `"${etag}"`,
            LastModified: lastModified
          }))
        };
      }
      if (command instanceof GetObjectCommand) {
        const restored = uploads.get(input.Key);
        if (restored && input.Bucket === "woodhouse-emdash-recovery-test01") {
          return {
            Body: Readable.from([restored.body]),
            ContentLength: restored.body.length,
            ETag: `"${restored.etag}"`
          };
        }
        const value = objects.find((item) => item.key === input.Key);
        if (!value) throw new Error("NoSuchKey");
        return {
          Body: Readable.from([value.body]),
          ContentLength: value.body.length,
          ETag: `"${value.etag}"`,
          LastModified: value.lastModified,
          StorageClass: "STANDARD",
          ContentType: value.contentType,
          CacheControl: value.cacheControl,
          Metadata: value.metadata
        };
      }
      if (command instanceof HeadObjectCommand) {
        const restored = uploads.get(input.Key);
        if (restored && input.Bucket === "woodhouse-emdash-recovery-test01") {
          const metadata = restoredMetadata.get(input.Key);
          return {
            ContentLength: restored.body.length,
            StorageClass: "STANDARD",
            ContentType: metadata.ContentType,
            CacheControl: metadata.CacheControl,
            Metadata: metadata.Metadata
          };
        }
        const value = objects.find((item) => item.key === input.Key);
        if (!value) throw new Error("NoSuchKey");
        return {
          ContentLength: value.body.length,
          StorageClass: "STANDARD",
          ContentType: value.contentType,
          CacheControl: value.cacheControl,
          Metadata: value.metadata
        };
      }
      if (command instanceof PutObjectCommand) {
        const body = await readBody(input.Body);
        uploads.set(input.Key, { body, etag: createHash("md5").update(body).digest("hex") });
        restoredMetadata.set(input.Key, input);
        return {};
      }
      throw new Error(`Unexpected command ${command.constructor.name}`);
    }
  };
}

test("R2 backup archives content privately and restores exact bytes plus metadata to an isolated empty bucket", async () => {
  const root = path.resolve(".release", `r2-test-${randomUUID()}`);
  const backupDirectory = path.join(root, "backup");
  await mkdir(root, { recursive: true, mode: 0o700 });
  await chmod(root, 0o700);
  const objects = [
    {
      key: "images/hero image.png",
      body: Buffer.from("hero image bytes"),
      etag: "hero-etag",
      lastModified: new Date("2026-09-30T00:00:00.000Z"),
      contentType: "image/png",
      cacheControl: "public, max-age=300",
      metadata: { asset: "hero" }
    },
    {
      key: "odd/../literal/key.txt",
      body: Buffer.from("literal object key"),
      etag: "literal-etag",
      lastModified: new Date("2026-09-29T00:00:00.000Z"),
      contentType: "text/plain",
      cacheControl: "no-cache",
      metadata: { owner: "woodhouse" }
    }
  ];
  const client = makeClient(objects);

  try {
    const created = await backupBucket({
      client,
      environment: "preview",
      bucket: "woodhouse-emdash-media-preview",
      outputDirectory: backupDirectory
    });
    const verified = await verifyBackupManifest(created.manifestPath);
    assert.equal(verified.manifest.objectCount, 2);
    assert.equal(
      verified.manifest.totalBytes,
      objects.reduce((sum, item) => sum + item.body.length, 0)
    );
    assert.deepEqual(
      await verifyBucketMatchesManifest(
        client,
        "woodhouse-emdash-media-preview",
        verified.manifest
      ),
      {
        objectCount: 2,
        totalBytes: verified.manifest.totalBytes
      }
    );

    const report = await restoreBucket({
      client,
      manifestPath: created.manifestPath,
      targetBucket: "woodhouse-emdash-recovery-test01"
    });
    assert.equal(report.result, "verified");
    assert.equal(report.objectCount, 2);
    for (const object of objects) {
      assert.deepEqual(client.uploads.get(object.key).body, object.body);
      const metadata = client.restoredMetadata.get(object.key);
      assert.equal(metadata.ContentType, object.contentType);
      assert.equal(metadata.CacheControl, object.cacheControl);
      assert.equal(
        metadata.Metadata.owner ?? metadata.Metadata.asset,
        object.metadata.owner ?? object.metadata.asset
      );
    }
    const savedManifest = JSON.parse(await readFile(created.manifestPath, "utf8"));
    assert.equal(savedManifest.complete, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("R2 restore refuses live buckets and rejects archive tampering before writes", async () => {
  const root = path.resolve(".release", `r2-test-${randomUUID()}`);
  const backupDirectory = path.join(root, "backup");
  await mkdir(root, { recursive: true, mode: 0o700 });
  await chmod(root, 0o700);
  const source = [
    {
      key: "one.txt",
      body: Buffer.from("one"),
      etag: "one-etag",
      lastModified: new Date("2026-09-30T00:00:00.000Z"),
      metadata: {}
    }
  ];
  const client = makeClient(source);
  try {
    const created = await backupBucket({
      client,
      environment: "preview",
      bucket: "woodhouse-emdash-media-preview",
      outputDirectory: backupDirectory
    });
    await assert.rejects(
      () =>
        restoreBucket({
          client,
          manifestPath: created.manifestPath,
          targetBucket: "woodhouse-emdash-media"
        }),
      /isolated woodhouse-emdash-recovery/
    );
    await writeFile(path.join(backupDirectory, created.manifest.objects[0].file), "tampered", {
      mode: 0o600
    });
    await assert.rejects(
      () =>
        restoreBucket({
          client,
          manifestPath: created.manifestPath,
          targetBucket: "woodhouse-emdash-recovery-test01"
        }),
      /SHA-256 or size check/
    );
    assert.equal(client.uploads.size, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
