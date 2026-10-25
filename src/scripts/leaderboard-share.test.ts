import test from "node:test";
import assert from "node:assert/strict";
import { createImageShare } from "./leaderboard-share.ts";

const file = new File([new Uint8Array([1, 2, 3])], "leaderboards.png", { type: "image/png" });

test("a repeated tap cannot open a second share sheet or replace the first result", async () => {
  let loads = 0;
  let shares = 0;
  let resolveImage!: (file: File) => void;
  const controller = createImageShare({
    loadImage: () => {
      loads += 1;
      return new Promise<File>((resolve) => {
        resolveImage = resolve;
      });
    },
    share: async () => {
      shares += 1;
    },
    canShare: () => true
  });
  const first = controller.share();
  assert.equal(await controller.share(), "busy");
  assert.equal(controller.busy, true);
  assert.equal(controller.ready, false);
  resolveImage(file);
  assert.equal(await first, "ready");
  assert.equal(controller.ready, true);
  assert.equal(loads, 1);
  assert.equal(shares, 0);
  assert.equal(await controller.share(), "shared");
  assert.equal(shares, 1);
  assert.equal(controller.busy, false);
});

test("a failed image fetch stays recoverable and never shares text", async () => {
  let attempts = 0;
  const shared: ShareData[] = [];
  const controller = createImageShare({
    loadImage: async () => {
      attempts += 1;
      if (attempts === 1) throw Error("network");
      return file;
    },
    share: async (data) => {
      shared.push(data);
    },
    canShare: () => true
  });
  assert.equal(await controller.share(), "unavailable");
  assert.equal(await controller.share(), "ready");
  assert.equal(await controller.share(), "shared");
  assert.equal(attempts, 2);
  assert.equal(shared.length, 1);
  assert.deepEqual(shared[0]!.files, [file]);
  assert.equal(shared[0]!.text, undefined);
  assert.equal(shared[0]!.url, undefined);
});

test("AbortError is cancellation, not success", async () => {
  let handedOff: ShareData | undefined;
  const controller = createImageShare({
    loadImage: async () => file,
    share: async (data) => {
      handedOff = data;
      throw new DOMException("The user aborted a request", "AbortError");
    },
    canShare: () => true
  });
  await controller.prepare();
  assert.equal(await controller.share(), "cancelled");
  assert.deepEqual(handedOff?.files, [file]);
});

test("the prepared file reaches navigator.share before the promise settles", async () => {
  let called = false;
  let release!: () => void;
  const controller = createImageShare({
    loadImage: async () => file,
    share: () => {
      called = true;
      return new Promise<void>((resolve) => {
        release = resolve;
      });
    },
    canShare: () => true
  });
  await controller.prepare();
  const pending = controller.share();
  assert.equal(called, true, "the handoff waited after the click");
  release();
  assert.equal(await pending, "shared");
});

test("unsupported file sharing is reported instead of attempting a text-only share", async () => {
  let shares = 0;
  const controller = createImageShare({
    loadImage: async () => file,
    share: async () => {
      shares += 1;
    },
    canShare: () => false
  });
  assert.equal(await controller.share(), "unsupported");
  assert.equal(shares, 0);
  assert.equal(await controller.share(), "unsupported");
  assert.equal(shares, 0);
});

test("a share sheet already open is reported as pending, not as preparing", async () => {
  let shares = 0;
  const pending: Array<() => void> = [];
  const controller = createImageShare({
    loadImage: async () => file,
    share: () => {
      shares += 1;
      return new Promise<void>((resolve) => pending.push(resolve));
    },
    canShare: () => true
  });
  await controller.prepare();
  const first = controller.share();
  assert.equal(controller.busy, true, "the sheet is open, so the control stays busy");
  assert.equal(await controller.share(), "pending");
  assert.equal(shares, 1, "a second activation must not open another sheet");
  pending.shift()!();
  assert.equal(await first, "shared");
  assert.equal(controller.busy, false);
  const second = controller.share();
  assert.equal(shares, 2, "a later deliberate activation still shares");
  pending.shift()!();
  assert.equal(await second, "shared");
});
