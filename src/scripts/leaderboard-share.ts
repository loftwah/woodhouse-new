export type ImageShareResult =
  "shared" | "cancelled" | "unsupported" | "unavailable" | "ready" | "busy" | "pending" | "failed";

type ImageShareOptions = {
  loadImage: () => Promise<File>;
  share?: ((data: ShareData) => Promise<void>) | undefined;
  canShare?: ((data: ShareData) => boolean) | undefined;
};

/**
 * Prepares one PNG outside the click and keeps the native handoff immediate.
 * A prepared file never waits on another promise before navigator.share().
 */
export function createImageShare({ loadImage, share, canShare }: ImageShareOptions) {
  let prepared: File | undefined;
  let preparing: Promise<File> | undefined;
  let phase: "preparing" | "sharing" | undefined;

  function prepare() {
    if (prepared) return Promise.resolve(prepared);
    preparing ??= loadImage()
      .then((file) => {
        prepared = file;
        return file;
      })
      .catch((error) => {
        preparing = undefined;
        throw error;
      });
    return preparing;
  }

  async function shareImage(): Promise<ImageShareResult> {
    // Two different acknowledgements: an image still loading is not the same
    // work as a share sheet the person is already looking at.
    if (phase === "sharing") return "pending";
    if (phase === "preparing") return "busy";
    if (!share) return "unsupported";
    if (!prepared) {
      phase = "preparing";
      try {
        await prepare();
      } catch {
        return "unavailable";
      } finally {
        phase = undefined;
      }
      if (canShare && !canShare({ files: [prepared!] })) return "unsupported";
      return "ready";
    }
    if (canShare && !canShare({ files: [prepared] })) return "unsupported";
    phase = "sharing";
    try {
      // No await before this call: the file and the gesture stay together.
      await share({ files: [prepared] });
      return "shared";
    } catch (error) {
      return error instanceof Error && error.name === "AbortError" ? "cancelled" : "failed";
    } finally {
      phase = undefined;
    }
  }

  return {
    prepare,
    share: shareImage,
    get busy() {
      return phase !== undefined;
    },
    get ready() {
      return prepared !== undefined;
    }
  };
}
