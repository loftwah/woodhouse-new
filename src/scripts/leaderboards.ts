import { createImageShare } from "./leaderboard-share.ts";

const root = document.querySelector<HTMLElement>("[data-leaderboard]");
if (root) {
  const statuses = root.querySelectorAll<HTMLElement>("[data-lb-status], [data-lb-export-status]");
  const captionField = root.querySelector<HTMLTextAreaElement>(".lb-caption textarea");
  const saveLink = root.querySelector<HTMLAnchorElement>("[data-lb-save]");
  const savedLink = root.querySelector<HTMLAnchorElement>("[data-lb-saved-link]");
  const caption = () => captionField?.value ?? root.dataset.caption ?? "";
  let operation = 0;
  const say = (text: string, ticket: number) => {
    if (ticket === operation)
      statuses.forEach((status) => {
        status.textContent = text;
      });
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
    button.addEventListener("click", async () => {
      const ticket = ++operation;
      const copied = await copy(caption());
      if (ticket !== operation) return;
      if (copied) say("Caption copied. Paste it into your post.", ticket);
      else {
        showImages();
        captionField?.focus({ preventScroll: true });
        captionField?.select();
        say("Select and copy your caption below.", ticket);
      }
    })
  );
  root.querySelector("[data-lb-link]")?.addEventListener("click", async () => {
    const ticket = ++operation;
    const copied = await copy(root.dataset.link ?? "");
    if (ticket !== operation) return;
    if (copied) say("Link copied. It opens this exact view.", ticket);
    else {
      showSavedView();
      say("Copy unavailable. Use the saved-view link.", ticket);
    }
  });
  root.querySelectorAll("[data-lb-share]").forEach((button) =>
    button.addEventListener("click", async () => {
      if (!shareImage) return;
      const ticket = ++operation;
      // A tap while the first preparation is still running must acknowledge
      // itself, not disappear. It must also not open a second share sheet.
      if (shareImage.busy) {
        say("Still preparing your image. Try again when it’s ready.", ticket);
        return;
      }
      if (typeof navigator.share === "function" && !shareImage.ready)
        say("Preparing your image…", ticket);
      const result = await shareImage.share();
      if (result === "busy") return;
      if (result === "ready") {
        say("Image ready. Tap Share image again.", ticket);
        return;
      }
      if (result === "shared") {
        say("Image sent. Paste your caption in the post.", ticket);
        return;
      }
      if (result === "cancelled") {
        say("Sharing cancelled. Your view is still here.", ticket);
        return;
      }
      if (result === "unsupported") {
        showImages();
        say("Image sharing unavailable. Save a PNG instead.", ticket);
        return;
      }
      if (result === "unavailable") {
        showSave();
        say("Image didn’t load. Save a PNG instead.", ticket);
        return;
      }
      showSave();
      say("Couldn’t share. Save a PNG and copy the caption.", ticket);
    })
  );
  root.querySelector("[data-lb-images]")?.addEventListener("click", (event) => {
    event.preventDefault();
    showImages();
  });
}
