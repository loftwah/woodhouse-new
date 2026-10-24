const root = document.querySelector<HTMLElement>("[data-leaderboard]");
if (root) {
  const statuses = root.querySelectorAll<HTMLElement>("[data-lb-status], [data-lb-export-status]");
  const captionField = root.querySelector<HTMLTextAreaElement>(".lb-caption textarea");
  const caption = () => captionField?.value ?? root.dataset.caption ?? "";
  let busy = false;
  let operation = 0;
  let prepared: File | undefined;
  let preparing: Promise<File> | undefined;
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
  function prepare() {
    preparing ??= fetch(root!.dataset.image!)
      .then(async (response) => {
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png"))
          throw Error();
        prepared = new File(
          [await response.blob()],
          root!.dataset.filename ?? "woodhouse-leaderboard.png",
          {
            type: "image/png"
          }
        );
        return prepared;
      })
      .catch((error) => {
        preparing = undefined;
        throw error;
      });
    return preparing;
  }
  // Prepare outside the gesture. A ready File lets Safari use the click itself.
  if (root.dataset.image && typeof navigator.share === "function") void prepare().catch(() => {});
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
      if (await copy(caption())) say("Caption copied.", ticket);
      else {
        showImages();
        captionField?.select();
        say("Select and copy your caption below.", ticket);
      }
    })
  );
  root.querySelector("[data-lb-link]")?.addEventListener("click", async () => {
    const ticket = ++operation;
    say(
      (await copy(root.dataset.link ?? ""))
        ? "Link copied. It opens this exact view."
        : "Copy unavailable. Use the saved-view link below.",
      ticket
    );
  });
  root.querySelectorAll("[data-lb-share]").forEach((button) =>
    button.addEventListener("click", async () => {
      if (busy) return;
      const ticket = ++operation;
      busy = true;
      try {
        if (typeof navigator.share !== "function") {
          showImages();
          say("Save the PNG and attach it to your post. Your caption is below.", ticket);
          return;
        }
        if (!prepared) {
          say("Preparing your image…", ticket);
          await prepare();
          say("Image ready. Tap Share image again.", ticket);
          return;
        }
        // No await before the native handoff when the file is ready.
        if (navigator.canShare?.({ files: [prepared] })) {
          // A combined file/text payload can become a text-only post on iOS.
          // Keep the image handoff distinct from the editable caption and link.
          await navigator.share({ files: [prepared] });
          say("Image sent to the share sheet. Paste your caption in the post.", ticket);
        } else {
          showImages();
          say(
            "This browser cannot share the image. Save the PNG and attach it to your post.",
            ticket
          );
        }
      } catch (error) {
        say(
          error instanceof Error && error.name === "AbortError"
            ? "Sharing cancelled. Your view is still here."
            : "Couldn’t share this time. Save PNG and copy caption are ready.",
          ticket
        );
      } finally {
        busy = false;
      }
    })
  );
}
