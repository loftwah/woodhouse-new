import { createImageShare } from "./leaderboard-share.ts";

const root = document.querySelector<HTMLElement>("[data-leaderboard]");
if (root) {
  const captionField = root.querySelector<HTMLTextAreaElement>(".lb-caption textarea");
  const saveLink = root.querySelector<HTMLAnchorElement>("[data-lb-save]");
  const savedLink = root.querySelector<HTMLAnchorElement>("[data-lb-saved-link]");
  const caption = () => captionField?.value ?? root.dataset.caption ?? "";
  let operation = 0;
  /**
   * The live region that belongs to the control the reader used. The sharebar
   * and the export panel are separate surfaces: one activation must not write
   * the same message into both live regions.
   */
  const statusFor = (control: Element) =>
    control.closest(".lb-sharebar")?.querySelector<HTMLElement>("[data-lb-status]") ??
    control.closest(".lb-exports")?.querySelector<HTMLElement>("[data-lb-export-status]") ??
    root.querySelector<HTMLElement>("[data-lb-status]");
  const say = (text: string, ticket: number, region: HTMLElement | null) => {
    if (ticket === operation && region) region.textContent = text;
  };
  function showImages() {
    const section = root!.querySelector<HTMLElement>("#share-images");
    section?.scrollIntoView({ behavior: "instant", block: "start" });
    section?.querySelector<HTMLAnchorElement>(".lb-image-grid a")?.focus({ preventScroll: true });
  }
  function showSavedView() {
    savedLink?.scrollIntoView({ behavior: "instant", block: "center" });
    savedLink?.focus({ preventScroll: true });
  }
  function showSave() {
    saveLink?.scrollIntoView({ behavior: "instant", block: "center" });
    saveLink?.focus({ preventScroll: true });
  }
  const shareImage = root.dataset.image
    ? createImageShare({
        loadImage: async () => {
          const response = await fetch(root!.dataset.image!, {
            signal: AbortSignal.timeout(15000)
          });
          if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png"))
            throw Error();
          return new File(
            [await response.blob()],
            root!.dataset.filename ?? "woodhouse-leaderboards.png",
            {
              type: "image/png"
            }
          );
        },
        share: typeof navigator.share === "function" ? (data) => navigator.share(data) : undefined,
        canShare:
          typeof navigator.canShare === "function" ? (data) => navigator.canShare(data) : undefined
      })
    : null;
  // Prepare outside the gesture. A ready File lets Safari use the click itself.
  if (shareImage && typeof navigator.share === "function")
    void shareImage.prepare().catch(() => {});
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  root.querySelectorAll("[data-lb-caption]").forEach((button) =>
    button.addEventListener("click", async (event) => {
      const region = statusFor(event.currentTarget as Element);
      const ticket = ++operation;
      const copied = await copy(caption());
      if (ticket !== operation) return;
      if (copied) say("Caption copied. Paste it into your post.", ticket, region);
      else {
        showImages();
        captionField?.focus({ preventScroll: true });
        captionField?.select();
        say("Select and copy your caption below.", ticket, region);
      }
    })
  );
  root.querySelector("[data-lb-link]")?.addEventListener("click", async (event) => {
    const region = statusFor(event.currentTarget as Element);
    const ticket = ++operation;
    const copied = await copy(root.dataset.link ?? "");
    if (ticket !== operation) return;
    if (copied) say("Link copied. It opens this exact view.", ticket, region);
    else {
      showSavedView();
      say("Copy unavailable. Use the saved-view link.", ticket, region);
    }
  });
  root.querySelectorAll("[data-lb-share]").forEach((button) =>
    button.addEventListener("click", async (event) => {
      if (!shareImage) return;
      const region = statusFor(event.currentTarget as Element);
      const ticket = ++operation;
      if (typeof navigator.share === "function" && !shareImage.ready)
        say("Preparing your image…", ticket, region);
      const result = await shareImage.share();
      // A newer action owns the page: do not move focus or scroll on behalf of
      // a share whose status is already suppressed.
      if (ticket !== operation) return;
      if (result === "busy") {
        say("Still preparing your image. Try again when it’s ready.", ticket, region);
        return;
      }
      if (result === "pending") {
        say("Your device is still finishing the last share.", ticket, region);
        return;
      }
      if (result === "ready") {
        say("Image ready. Tap Share image again.", ticket, region);
        return;
      }
      if (result === "shared") {
        say("Image sent. Paste your caption in the post.", ticket, region);
        return;
      }
      if (result === "cancelled") {
        say("Sharing cancelled. Your view is still here.", ticket, region);
        return;
      }
      if (result === "unsupported") {
        showImages();
        say("Image sharing unavailable. Save a PNG instead.", ticket, region);
        return;
      }
      if (result === "unavailable") {
        showSave();
        say("Image didn’t load. Save a PNG instead.", ticket, region);
        return;
      }
      showSave();
      say("Couldn’t share. Save a PNG and copy the caption.", ticket, region);
    })
  );
  root.querySelector("[data-lb-images]")?.addEventListener("click", (event) => {
    event.preventDefault();
    showImages();
  });
}
