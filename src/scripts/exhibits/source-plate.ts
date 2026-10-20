/**
 * The source plate — Woodhouse's second working exhibit.
 *
 * It shows a real App Composer relationship: a Here / there contribution and
 * the Linkarooie card composed from it. The composition is not a copy. It is
 * derived from the source through the published contract, so hiding the source
 * removes the card.
 *
 * The exhibit never writes to the provider. The visibility switch changes the
 * demonstration only, and the label says so.
 */

import { composedCard, composedReason, type ContractItem } from "../../data/guestbook-contract";
type Contract = {
  available: boolean;
  source: "live" | "snapshot" | "unavailable";
  fetchedAt?: string | null;
  note?: string;
  contract?: number;
  provider?: string;
  items: ContractItem[];
};

type Separation = { value: number; velocity: number; target: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The DOM library and the Workers types both declare `Element`, and the merged
 * result no longer satisfies the DOM's `ParentNode`. This helper keeps the
 * call sites readable without depending on either constraint.
 */
type QueryRoot = { querySelector: (selectors: string) => unknown };
const pick = <T>(root: QueryRoot, selector: string): T | null =>
  root.querySelector(selector) as unknown as T | null;

class SourcePlate {
  private readonly root: HTMLElement;
  private readonly field!: HTMLElement;
  private readonly sourcePlate!: HTMLElement;
  private readonly composedPlate!: HTMLElement;
  private readonly status!: HTMLElement;
  private readonly tether!: SVGPathElement | null;
  private readonly items: ContractItem[] = [];
  private index = 0;
  private hidden = false;
  private separation: Separation = { value: 0, velocity: 0, target: 0 };
  private reduced = false;
  private running = false;
  private lastTime = 0;
  private source = "unavailable";
  private loaded = false;

  constructor(root: HTMLElement) {
    this.root = root;
    const field = root;
    const sourcePlate = pick<HTMLElement>(root, "[data-plate='source']");
    const composedPlate = pick<HTMLElement>(root, "[data-plate='composed']");
    const status = pick<HTMLElement>(root, "[data-plate-status]");
    if (!field || !sourcePlate || !composedPlate || !status) return;
    this.field = field;
    this.sourcePlate = sourcePlate;
    this.composedPlate = composedPlate;
    this.status = status;
    this.tether = pick<SVGPathElement>(root, "[data-tether-path]");

    this.reduced = prefersReducedMotion();
    this.readDeepLink();
    this.wire();
    this.setSeparation(this.separation.target, true);
    void this.load();
  }

  /* ── Data ─────────────────────────────────────────────────────────────────── */

  private async load() {
    const status = pick<HTMLElement>(this.root, "[data-plate-loading]");
    try {
      const response = await fetch("/api/guestbook-items.json", {
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error("contract unavailable");
      const contract = (await response.json()) as Contract;
      this.source = contract.source ?? "unavailable";
      this.items.push(...contract.items);
      if (!this.items.length) throw new Error("no items");
    } catch {
      this.source = "unavailable";
      if (status) status.textContent = "The published contract could not be read.";
      this.say(
        "The published contract could not be read, so the plates show the checked-in copy or nothing at all."
      );
      this.render();
      return;
    }
    this.loaded = true;
    const wanted = new URLSearchParams(window.location.search).get("source");
    const found = this.items.findIndex((item) => item.id === wanted);
    if (found >= 0) this.index = found;
    this.render();
    this.renderChoices();
    this.say(
      this.source === "live"
        ? "Reading the published contract. Both plates show the same contribution."
        : "The live provider could not be reached, so this is the checked-in copy of the published contract."
    );
  }

  private renderChoices() {
    const list = pick<HTMLElement>(this.root, "[data-plate-choices]");
    if (!list) return;
    // The buttons are updated in place. Rebuilding them would destroy the
    // control a keyboard visitor just activated and throw their focus away.
    const existing = Array.from(list.querySelectorAll<HTMLButtonElement>("button"));
    if (existing.length !== this.items.length) {
      list.innerHTML = "";
      for (const [position, item] of this.items.entries()) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item.title.replace(/ · fictional demo postcard$/, "");
        button.addEventListener("click", () => {
          this.index = position;
          this.render();
          this.renderChoices();
          this.say(`Source changed. The composition followed it: ${item.title}.`);
          this.syncUrl();
        });
        list.appendChild(button);
      }
    }
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>("button"));
    buttons.forEach((button, position) => {
      const item = this.items[position];
      if (!item) return;
      button.textContent = item.title.replace(/ · fictional demo postcard$/, "");
      button.setAttribute("aria-pressed", String(position === this.index));
    });
  }

  private get current(): ContractItem | undefined {
    return this.items[this.index];
  }

  /* ── Rendering ────────────────────────────────────────────────────────────── */

  private render() {
    const item = this.current;
    const sourceImage = pick<HTMLImageElement>(this.root, "[data-source-image]");
    const sourceTitle = pick<HTMLElement>(this.root, "[data-source-title]");
    const sourceContract = pick<HTMLElement>(this.root, "[data-source-contract]");
    const sourceRevision = pick<HTMLElement>(this.root, "[data-source-revision]");
    const sourceVisibility = pick<HTMLElement>(this.root, "[data-source-visibility]");
    const sourceState = pick<HTMLElement>(this.root, "[data-source-state]");
    const composedImage = pick<HTMLImageElement>(this.root, "[data-composed-image]");
    const composedTitle = pick<HTMLElement>(this.root, "[data-composed-title]");
    const composedLink = pick<HTMLAnchorElement>(this.root, "[data-composed-link]");
    const composedCardElement = pick<HTMLElement>(this.root, "[data-composed-card]");
    const composedEmpty = pick<HTMLElement>(this.root, "[data-composed-empty]");
    const loading = pick<HTMLElement>(this.root, "[data-plate-loading]");
    const provenance = pick<HTMLElement>(this.root, "[data-plate-provenance]");

    if (loading) loading.hidden = this.loaded;
    if (provenance) {
      provenance.textContent =
        this.source === "live"
          ? "Live contract, read just now."
          : this.source === "snapshot"
            ? "Checked-in copy of the published contract. The live provider could not be reached."
            : "The published contract could not be read.";
    }
    if (!item) {
      if (sourceImage) sourceImage.removeAttribute("src");
      if (sourceTitle) sourceTitle.textContent = "No contribution available.";
      if (composedCardElement) composedCardElement.hidden = true;
      if (composedEmpty) composedEmpty.hidden = false;
      return;
    }

    const publicVisible = composedCard(item, this.hidden).visible;
    if (sourceImage) {
      sourceImage.src = item.image;
      sourceImage.alt = item.title;
    }
    if (sourceTitle) sourceTitle.textContent = item.title;
    if (sourceContract) sourceContract.textContent = "guestbook · contract 1";
    if (sourceRevision) sourceRevision.textContent = String(item.revision ?? "—");
    if (sourceVisibility) {
      sourceVisibility.textContent = this.hidden ? "not public" : item.visibility;
    }
    if (sourceState) {
      sourceState.textContent = this.hidden
        ? "Hidden in this demonstration only."
        : "Public in the published contract.";
      sourceState.dataset.state = this.hidden ? "hidden" : "public";
    }
    if (composedImage) {
      composedImage.src = item.image;
      composedImage.alt = item.title;
    }
    if (composedTitle) composedTitle.textContent = item.title;
    if (composedLink) {
      composedLink.href = item.url;
      composedLink.textContent = "Open the original contribution";
    }
    if (composedCardElement) composedCardElement.hidden = !publicVisible;
    if (composedEmpty) {
      composedEmpty.hidden = publicVisible;
      composedEmpty.textContent = composedReason(composedCard(item, this.hidden).reason);
    }
    this.sourcePlate.classList.toggle("is-hidden", this.hidden);
    this.composedPlate.classList.toggle("is-empty", !publicVisible);
    this.root.dataset.hidden = String(this.hidden);
  }

  /* ── Separation ───────────────────────────────────────────────────────────── */

  private setSeparation(value: number, instant = false) {
    const next = clamp(value, 0, 1);
    this.separation.target = next;
    if (instant) {
      this.separation.value = next;
      this.separation.velocity = 0;
      this.paint();
      return;
    }
    this.start();
  }

  private start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.step(dt);
      if (this.settled()) {
        this.running = false;
        this.paint();
        return;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private settled() {
    return (
      Math.abs(this.separation.target - this.separation.value) < 0.001 &&
      Math.abs(this.separation.velocity) < 0.001
    );
  }

  private step(dt: number) {
    if (this.reduced) {
      this.separation.value = this.separation.target;
      this.separation.velocity = 0;
      return;
    }
    const acceleration =
      (this.separation.target - this.separation.value) * 130 - this.separation.velocity * 22;
    this.separation.velocity += acceleration * dt;
    this.separation.value += this.separation.velocity * dt;
    this.paint();
  }

  private paint() {
    const value = this.separation.value;
    this.root.style.setProperty("--plate-separation", value.toFixed(3));
    this.sourcePlate.style.setProperty("--slide", `${(-value * 6).toFixed(2)}%`);
    this.composedPlate.style.setProperty("--slide", `${(value * 18).toFixed(2)}%`);
    this.drawTether();
  }

  /** The line back to the original, drawn between the two live anchors. */
  private drawTether() {
    if (!this.tether) return;
    const from = pick<HTMLElement>(this.root, "[data-tether-source]");
    const to = pick<HTMLElement>(this.root, "[data-tether-target]");
    if (!from || !to) return;
    const field = this.field.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const x1 = a.left + a.width / 2 - field.left;
    const y1 = a.top + a.height / 2 - field.top;
    const x2 = b.left + b.width / 2 - field.left;
    const y2 = b.top + b.height / 2 - field.top;
    const mid = (y1 + y2) / 2 + Math.abs(x2 - x1) * 0.08;
    this.tether.setAttribute(
      "d",
      `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${mid.toFixed(1)}, ${x2.toFixed(1)} ${mid.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
    );
    this.tether.parentElement?.setAttribute(
      "data-visible",
      this.separation.value > 0.06 ? "true" : "false"
    );
  }

  /* ── Wiring ───────────────────────────────────────────────────────────────── */

  private wire() {
    const apart = pick<HTMLButtonElement>(this.root, "[data-plate-apart]");
    apart?.addEventListener("click", () => {
      const next = this.separation.target > 0.45 ? 0 : 1;
      this.setSeparation(next);
      this.say(
        next
          ? "Plates apart. The card is composed from the contribution on the left."
          : "Plates together."
      );
      this.syncUrl();
    });

    const hide = pick<HTMLButtonElement>(this.root, "[data-plate-hide]");
    hide?.addEventListener("click", () => {
      this.hidden = !this.hidden;
      this.renderHideControl();
      this.render();
      this.say(
        this.hidden
          ? "The source is marked not public in this demonstration. The composed card is gone, exactly as the contract says it would be. Nothing was sent to the guestbook."
          : "The source is public again, and the composed card came back with it."
      );
      this.syncUrl();
    });
    // A link that opens the plates already hidden must show a control that
    // agrees with the page, not one that says it will hide a visible source.
    this.renderHideControl();

    pick<HTMLButtonElement>(this.root, "[data-plate-copy]")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.say("Link copied. It reopens the plates in this state.");
      } catch {
        this.say("Copying is blocked here. The address bar holds the same link.");
      }
    });

    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => this.paint();

  private renderHideControl() {
    const hide = pick<HTMLButtonElement>(this.root, "[data-plate-hide]");
    if (!hide) return;
    hide.setAttribute("aria-pressed", String(this.hidden));
    hide.textContent = this.hidden
      ? "Show the source again"
      : "Hide the source (demonstration only)";
  }

  private readDeepLink() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("hidden") === "1") this.hidden = true;
    if (params.get("apart") === "1") this.separation.target = 1;
  }

  private syncUrl() {
    const params = new URLSearchParams(window.location.search);
    const item = this.current;
    if (item) params.set("source", item.id);
    else params.delete("source");
    if (this.hidden) params.set("hidden", "1");
    else params.delete("hidden");
    if (this.separation.target > 0.45) params.set("apart", "1");
    else params.delete("apart");
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }

  private say(message: string) {
    this.status.textContent = message;
  }
}

for (const root of Array.from(document.querySelectorAll<HTMLElement>("[data-source-plate]"))) {
  new SourcePlate(root);
}

export {};
