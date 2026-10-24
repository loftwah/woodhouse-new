const root = document.querySelector<HTMLElement>("[data-leaderboard]");
if (root) {
  const status = root.querySelector<HTMLElement>("[data-lb-status]")!;
  let busy = false;
  let operation = 0;
  let prepared: File | undefined;
  let preparing: Promise<File> | undefined;
  const say = (text: string, ticket: number) => {
    if (ticket === operation) status.textContent = text;
  };
  function prepare() {
    preparing ??= fetch(root!.dataset.image!)
      .then(async (response) => {
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png"))
          throw Error();
        prepared = new File([await response.blob()], "woodhouse-leaderboard.png", {
          type: "image/png"
        });
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
  root.querySelector("[data-lb-caption]")?.addEventListener("click", async () => {
    const ticket = ++operation;
    if (await copy(root.dataset.caption ?? "")) say("Caption and link copied.", ticket);
    else {
      const details = root.querySelector<HTMLDetailsElement>(".lb-caption");
      if (details) {
        details.open = true;
        details.querySelector("textarea")?.select();
      }
      say("Copy unavailable. Your caption is selected below.", ticket);
    }
  });
  root.querySelector("[data-lb-link]")?.addEventListener("click", async () => {
    const ticket = ++operation;
    say(
      (await copy(root.dataset.link ?? ""))
        ? "Link copied. It opens this exact view."
        : "Copy unavailable. Use the saved-view link below.",
      ticket
    );
  });
  root.querySelector("[data-lb-share]")?.addEventListener("click", async () => {
    if (busy) return;
    const ticket = ++operation;
    busy = true;
    try {
      if (typeof navigator.share !== "function") {
        say(
          (await copy(root.dataset.caption ?? ""))
            ? "Caption and link copied. Choose Save PNG to take the image too."
            : "Choose Save PNG, then select the caption below.",
          ticket
        );
        return;
      }
      if (!prepared) {
        say("Preparing your image…", ticket);
        await prepare();
        say("Image ready. Tap Share to choose where it goes.", ticket);
        return;
      }
      // No await before the native handoff when the file is ready.
      if (navigator.canShare?.({ files: [prepared] })) {
        await navigator.share({
          files: [prepared],
          title: "Woodhouse · Projects making moves",
          text: root.dataset.caption ?? ""
        });
        say("Handed to your device’s share options.", ticket);
      } else {
        await navigator.share({
          title: "Woodhouse · Projects making moves",
          text: root.dataset.caption ?? "",
          url: root.dataset.link!
        });
        say("Handed to your device’s share options. Save PNG is ready too.", ticket);
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
  });
}
