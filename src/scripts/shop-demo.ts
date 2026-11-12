/**
 * Client-side state for the credential-free merch demo (#148).
 *
 * Everything lives in this browser's localStorage: there is no order table, no
 * customer record and no provider call. The reducer in `src/data/merch-demo.ts`
 * is the same code the tests exercise, so duplicate events behave here exactly
 * as they do in the proof.
 */

import {
  applyDemoEvent,
  createDemoOrder,
  demoFixtures,
  demoOrderTimeline,
  demoSeller,
  merchCandidates,
  merchProducts,
  orderTotalLabel,
  type DemoEvent,
  type DemoEventType,
  type DemoLine,
  type DemoOrder
} from "../data/merch-demo.ts";

const CART_KEY = "woodhouse.merch.cart.v1";
const ORDERS_KEY = "woodhouse.merch.orders.v1";
const OPERATOR_KEY = "woodhouse.merch.operator.v1";
const CHECKOUT_KEY = "woodhouse.merch.checkout.v1";
const storageProblem =
  "This browser could not save the change. Check its storage settings and try again.";

type OperatorState = {
  candidates: Record<string, "approved" | "returned" | "rejected">;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function showNote(note: HTMLElement | null, message: string) {
  if (!note) return;
  note.textContent = message;
  note.hidden = !message;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cart(): DemoLine[] {
  return readJson<DemoLine[]>(CART_KEY, []);
}

function saveCart(lines: DemoLine[]) {
  return writeJson(CART_KEY, lines);
}

function orders(): DemoOrder[] {
  return readJson<DemoOrder[]>(ORDERS_KEY, []);
}

function saveOrders(list: DemoOrder[]) {
  return writeJson(ORDERS_KEY, list);
}

function saveOrder(order: DemoOrder) {
  const list = orders();
  const index = list.findIndex((item) => item.id === order.id);
  if (index >= 0) list[index] = order;
  else list.unshift(order);
  return saveOrders(list.slice(0, 30));
}

function addLine(productSlug: string, variantId: string, quantity = 1) {
  const current = cart();
  const existing = current.find(
    (line) => line.productSlug === productSlug && line.variantId === variantId
  );
  if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
  else current.push({ productSlug, variantId, quantity });
  const saved = saveCart(current);
  if (saved) updateCartCount();
  return saved;
}

function setLineQuantity(productSlug: string, variantId: string, quantity: number) {
  const current = cart()
    .map((line) =>
      line.productSlug === productSlug && line.variantId === variantId
        ? { ...line, quantity: Math.max(0, Math.min(10, quantity)) }
        : line
    )
    .filter((line) => line.quantity > 0);
  const saved = saveCart(current);
  if (saved) updateCartCount();
  return saved;
}

function removeLine(productSlug: string, variantId: string) {
  const current = cart().filter(
    (line) => !(line.productSlug === productSlug && line.variantId === variantId)
  );
  const saved = saveCart(current);
  if (saved) updateCartCount();
  return saved;
}

function cartCount() {
  return cart().reduce((total, line) => total + line.quantity, 0);
}

function updateCartCount() {
  const count = cartCount();
  for (const node of document.querySelectorAll<HTMLElement>("[data-cart-count]"))
    node.textContent = String(count);
  for (const node of document.querySelectorAll<HTMLAnchorElement>("[data-cart-link]"))
    node.setAttribute("aria-label", `Demo basket, ${count} item${count === 1 ? "" : "s"}`);
}

function lineFor(line: DemoLine) {
  const product = merchProducts.find((item) => item.slug === line.productSlug);
  const variant = product?.variants.find((item) => item.id === line.variantId);
  return product && variant ? { product, variant } : null;
}

function cartSummary(lines: DemoLine[]) {
  const priced = lines
    .map((line) => {
      const found = lineFor(line);
      return found ? { ...line, ...found } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const subtotal = priced.reduce(
    (total, line) => total + line.variant.priceCents * line.quantity,
    0
  );
  return {
    priced,
    subtotal,
    shipping: priced.length ? demoSeller.shippingEstimateCents : 0,
    total: subtotal + (priced.length ? demoSeller.shippingEstimateCents : 0)
  };
}

const statusLabels: Record<DemoOrder["status"], string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  fulfilment_confirmed: "Fulfilment confirmed",
  print_requested: "Print requested",
  printed: "Printed",
  shipped: "Shipped"
};

function statusLabel(status: DemoOrder["status"]) {
  return statusLabels[status];
}

function checkoutId() {
  try {
    const existing = sessionStorage.getItem(CHECKOUT_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(CHECKOUT_KEY, created);
    return created;
  } catch {
    throw new Error(storageProblem);
  }
}

/** A payment attempt has settled, so the next checkout is a new order. */
function closeCheckoutSession() {
  try {
    sessionStorage.removeItem(CHECKOUT_KEY);
  } catch {
    /* The order still belongs to this checkout for this page view. */
  }
}

function eventFor(order: DemoOrder, type: DemoEventType, amountCents?: number): DemoEvent {
  return {
    id: `evt-${crypto.randomUUID()}`,
    orderId: order.id,
    type,
    environment: "demo",
    signature: "demo-valid",
    account: demoSeller.account,
    ...(type === "print.completed" && order.printActionId
      ? { printActionId: order.printActionId }
      : {}),
    ...(amountCents === undefined ? {} : { amountCents })
  };
}

function renderLocalCatalogue() {
  const section = document.querySelector<HTMLElement>("[data-local-catalogue]");
  const list = document.querySelector<HTMLElement>("[data-local-products]");
  if (!section || !list) return;
  const state = operator();
  const approved = merchCandidates.filter(
    (product) => state.candidates[product.slug] === "approved"
  );
  section.hidden = approved.length === 0;
  list.innerHTML = approved
    .map((product) => {
      const price = Math.min(...product.variants.map((variant) => variant.priceCents));
      return `
        <li class="product-card">
          <span class="product-card__art">
            <img src="${escapeHtml(product.artwork.src)}" alt="${escapeHtml(product.artwork.alt)}" width="${product.artwork.width}" height="${product.artwork.height}" loading="lazy" />
          </span>
          <div class="product-card__body">
            <p class="product-kind">${escapeHtml(product.kind)} · local approval</p>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.blurb)}</p>
            <p class="product-price">From ${orderTotalLabel(price)} · demo price</p>
            <p class="product-credit">${escapeHtml(product.artwork.credit)}</p>
          </div>
        </li>`;
    })
    .join("");
}

function initCatalogue() {
  renderLocalCatalogue();
  const feedback = document.querySelector<HTMLElement>("[data-add-feedback]");
  for (const form of document.querySelectorAll<HTMLFormElement>("[data-add-to-cart]")) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const productSlug = form.dataset.product ?? "";
      const variantId =
        form.querySelector<HTMLInputElement>("input[name=variant]:checked")?.value ??
        form.dataset.defaultVariant ??
        "";
      if (!productSlug || !variantId) return;
      const saved = addLine(productSlug, variantId, 1);
      showNote(
        feedback,
        saved ? "Added to the demo basket. Nothing was charged or reserved." : storageProblem
      );
    });
  }

  for (const input of document.querySelectorAll<HTMLInputElement>("[data-variant-price]")) {
    input.addEventListener("change", () => {
      const price = document.querySelector<HTMLElement>("[data-selected-price]");
      if (price) price.textContent = orderTotalLabel(Number(input.dataset.variantPrice ?? 0));
    });
  }
}

function renderBasket() {
  const host = document.querySelector<HTMLElement>("[data-basket]");
  if (!host) return;
  const note = document.querySelector<HTMLElement>("[data-basket-note]");
  const summary = cartSummary(cart());
  if (!summary.priced.length) {
    host.innerHTML =
      '<p class="shop-empty">The demo basket is empty. <a href="/shop/">Browse the demo catalogue</a>.</p>';
    return;
  }
  host.innerHTML = `
    <ul class="basket-lines">
      ${summary.priced
        .map(
          (line) => `
        <li class="basket-line" data-line="${escapeHtml(line.productSlug)}|${escapeHtml(line.variantId)}">
          <img src="${escapeHtml(line.product.artwork.src)}" alt="${escapeHtml(line.product.artwork.alt)}" width="160" height="120" loading="lazy" />
          <div class="basket-line__body">
            <h2><a href="/shop/${escapeHtml(line.product.slug)}/">${escapeHtml(line.product.name)}</a></h2>
            <p>${escapeHtml(line.variant.label)} · ${orderTotalLabel(line.variant.priceCents)} each</p>
            <label>Quantity
              <input type="number" min="1" max="10" value="${line.quantity}" data-quantity="${escapeHtml(line.product.slug)}|${escapeHtml(line.variantId)}" />
            </label>
            <button type="button" class="text-button" data-remove="${escapeHtml(line.product.slug)}|${escapeHtml(line.variantId)}">Remove</button>
          </div>
          <p class="basket-line__price">${orderTotalLabel(line.variant.priceCents * line.quantity)}</p>
        </li>`
        )
        .join("")}
    </ul>
    <dl class="basket-totals">
      <div><dt>Subtotal</dt><dd>${orderTotalLabel(summary.subtotal)}</dd></div>
      <div><dt>Shipping estimate</dt><dd>${orderTotalLabel(summary.shipping)}</dd></div>
      <div class="basket-totals__total"><dt>Demo total</dt><dd>${orderTotalLabel(summary.total)}</dd></div>
    </dl>
    <p class="shop-estimate">Prices, shipping and tax are demo estimates. No supplier quote, charge or reservation exists.</p>
    <p><a class="shop-action" href="/shop/checkout/">Continue to the demo checkout</a></p>
  `;
  for (const input of host.querySelectorAll<HTMLInputElement>("[data-quantity]")) {
    input.addEventListener("change", () => {
      const [product, variant] = (input.dataset.quantity ?? "").split("|");
      if (product && variant) {
        const saved = setLineQuantity(product, variant, Math.trunc(Number(input.value)));
        showNote(note, saved ? "" : storageProblem);
        renderBasket();
      }
    });
  }
  for (const button of host.querySelectorAll<HTMLButtonElement>("[data-remove]")) {
    button.addEventListener("click", () => {
      const [product, variant] = (button.dataset.remove ?? "").split("|");
      if (product && variant) {
        const saved = removeLine(product, variant);
        showNote(note, saved ? "" : storageProblem);
        renderBasket();
      }
    });
  }
}

function renderCheckout() {
  const host = document.querySelector<HTMLElement>("[data-checkout-summary]");
  if (!host) return;
  const summary = cartSummary(cart());
  const button = document.querySelector<HTMLButtonElement>("[data-place-order]");
  if (!summary.priced.length) {
    host.innerHTML =
      '<p class="shop-empty">There is nothing to check out. <a href="/shop/">Browse the demo catalogue</a>.</p>';
    if (button) button.disabled = true;
    return;
  }
  if (button) button.disabled = false;
  host.innerHTML = `
    <ul class="checkout-lines">
      ${summary.priced
        .map(
          (line) => `
        <li>
          <span>${escapeHtml(line.product.name)} · ${escapeHtml(line.variant.label)} × ${line.quantity}</span>
          <strong>${orderTotalLabel(line.variant.priceCents * line.quantity)}</strong>
        </li>`
        )
        .join("")}
    </ul>
    <dl class="basket-totals">
      <div><dt>Subtotal</dt><dd>${orderTotalLabel(summary.subtotal)}</dd></div>
      <div><dt>Shipping estimate</dt><dd>${orderTotalLabel(summary.shipping)}</dd></div>
      <div class="basket-totals__total"><dt>Demo total</dt><dd>${orderTotalLabel(summary.total)}</dd></div>
    </dl>
  `;
}

function initCheckout() {
  renderCheckout();
  const button = document.querySelector<HTMLButtonElement>("[data-place-order]");
  const outcome = document.querySelector("[data-outcome]") as HTMLSelectElement | null;
  const note = document.querySelector<HTMLElement>("[data-checkout-note]");
  const recovery = document.querySelector<HTMLAnchorElement>("[data-checkout-recovery]");
  if (!button) return;
  button.addEventListener("click", () => {
    const lines = cart();
    if (!lines.length) return;
    button.disabled = true;
    try {
      const id = checkoutId();
      const existing = orders().find((order) => order.id === `demo-${id}`);
      const order = existing ?? createDemoOrder(id, lines, [...merchProducts, ...merchCandidates]);
      const choice = outcome?.value ?? "paid";
      const event =
        choice === "paid"
          ? eventFor(order, "payment.succeeded", order.totalCents)
          : choice === "failed"
            ? eventFor(order, "payment.failed")
            : eventFor(order, "payment.cancelled");
      const settled = order.status === "pending" ? applyDemoEvent(order, event).order : order;
      if (settled !== order && !saveOrder(settled)) throw new Error(storageProblem);
      const tracking = `/shop/order/?id=${encodeURIComponent(settled.id)}`;
      if (settled.status !== "pending") {
        const basket = cart();
        const matchesOrder =
          basket.length === settled.lines.length &&
          basket.every((line, index) => {
            const ordered = settled.lines[index];
            return (
              ordered?.productSlug === line.productSlug &&
              ordered.variantId === line.variantId &&
              ordered.quantity === line.quantity
            );
          });
        if (settled.status === "paid" && matchesOrder && !saveCart([])) {
          if (recovery) {
            recovery.href = tracking;
            recovery.hidden = false;
          }
          throw new Error(
            "The demo order was saved. This browser could not clear the basket. You can retry or open the saved order."
          );
        }
        closeCheckoutSession();
      }
      window.location.href = tracking;
    } catch (error) {
      showNote(
        note,
        error instanceof Error ? error.message : "The demo order could not be created."
      );
      button.disabled = false;
    }
  });
  // Back/forward cache restores the page with the button still disabled from a
  // click that navigated away. Reconcile the visible state instead of leaving
  // the checkout permanently unsubmittable.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    showNote(note, "");
    if (recovery) recovery.hidden = true;
    renderCheckout();
  });
}

function renderOrder() {
  const host = document.querySelector<HTMLElement>("[data-order]");
  if (!host) return;
  const id = new URLSearchParams(window.location.search).get("id");
  const order = orders().find((item) => item.id === id);
  if (!order) {
    host.innerHTML =
      '<p class="shop-empty">No demo order with that reference exists in this browser. <a href="/shop/">Return to the demo catalogue</a>.</p>';
    return;
  }
  const stages = demoOrderTimeline(order);
  host.innerHTML = `
    <p class="shop-eyebrow">Demo order ${escapeHtml(order.id)}</p>
    <h1>${escapeHtml(statusLabel(order.status))}</h1>
    <p class="shop-lede">${escapeHtml(order.log.at(-1) ?? "")}</p>
    <ol class="order-timeline">
      ${stages
        .map(
          (stage) => `
        <li class="${stage.state === "done" ? "is-done" : stage.state === "current" ? "is-current" : stage.state === "terminal" ? "is-terminal" : ""}">
          <span>${escapeHtml(statusLabel(stage.status))}</span>
        </li>`
        )
        .join("")}
    </ol>
    <ul class="checkout-lines">
      ${order.lines
        .map(
          (line) => `
        <li>
          <span>${escapeHtml(line.name)} · ${escapeHtml(line.variantLabel)} × ${line.quantity}</span>
          <strong>${orderTotalLabel(line.unitPriceCents * line.quantity)}</strong>
        </li>`
        )
        .join("")}
    </ul>
    <dl class="basket-totals">
      <div><dt>Subtotal</dt><dd>${orderTotalLabel(order.subtotalCents)}</dd></div>
      <div><dt>Shipping estimate</dt><dd>${orderTotalLabel(order.shippingCents)}</dd></div>
      <div class="basket-totals__total"><dt>Demo total</dt><dd>${orderTotalLabel(order.totalCents)}</dd></div>
    </dl>
    <h2>Event log</h2>
    <ol class="order-log">
      ${order.log.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
    </ol>
    <p class="shop-estimate">This order exists only in this browser. No payment, print or shipment happened.</p>
    <p><a class="shop-action" href="/shop/operator/">Open the demo operator view</a> · <a href="/shop/">Back to the shop</a></p>
  `;
}

function operator(): OperatorState {
  return readJson<OperatorState>(OPERATOR_KEY, { candidates: {} });
}

function saveOperator(state: OperatorState) {
  return writeJson(OPERATOR_KEY, state);
}

function renderOperator() {
  const note = document.querySelector<HTMLElement>("[data-operator-note]");
  const candidateHost = document.querySelector<HTMLElement>("[data-operator-candidates]");
  if (candidateHost) {
    const state = operator();
    candidateHost.innerHTML = merchCandidates
      .map((product) => {
        const decision = state.candidates[product.slug];
        return `
        <li class="operator-candidate" data-candidate="${escapeHtml(product.slug)}">
          <img src="${escapeHtml(product.artwork.src)}" alt="${escapeHtml(product.artwork.alt)}" width="160" height="100" loading="lazy" />
          <div>
            <h2>${escapeHtml(product.name)}</h2>
            <p>${escapeHtml(product.blurb)}</p>
            <p class="operator-state">${decision ? `Decision: ${escapeHtml(decision)}` : "Awaiting review"}</p>
            <div class="operator-actions">
              <button type="button" data-decision="approved">Approve for demo catalogue</button>
              <button type="button" data-decision="returned">Return for changes</button>
              <button type="button" data-decision="rejected">Reject</button>
            </div>
          </div>
        </li>`;
      })
      .join("");
    for (const button of candidateHost.querySelectorAll<HTMLButtonElement>("[data-decision]")) {
      button.addEventListener("click", () => {
        const candidate = button.closest<HTMLElement>("[data-candidate]")?.dataset.candidate;
        const decision = button.dataset.decision as OperatorState["candidates"][string];
        if (!candidate) return;
        const state = operator();
        state.candidates[candidate] = decision;
        const saved = saveOperator(state);
        showNote(note, saved ? "" : storageProblem);
        if (saved) renderOperator();
      });
    }
  }

  const orderHost = document.querySelector<HTMLElement>("[data-operator-orders]");
  if (!orderHost) return;
  const list = orders();
  if (!list.length) {
    orderHost.innerHTML =
      '<p class="shop-empty">No demo orders in this browser yet. <a href="/shop/">Create one</a> or run a fixture below.</p>';
    return;
  }
  orderHost.innerHTML = list
    .map((order) => {
      const action =
        order.status === "paid"
          ? "fulfilment.confirmed"
          : order.status === "fulfilment_confirmed"
            ? "print.requested"
            : order.status === "print_requested"
              ? "print.completed"
              : order.status === "printed"
                ? "shipped"
                : null;
      return `
      <li class="operator-order">
        <div>
          <h3><a href="/shop/order/?id=${encodeURIComponent(order.id)}">${escapeHtml(order.id)}</a></h3>
          <p class="operator-state">${escapeHtml(statusLabel(order.status))} · ${orderTotalLabel(order.totalCents)}</p>
          <p>${order.lines.map((line) => `${escapeHtml(line.name)} × ${line.quantity}`).join(" · ")}</p>
        </div>
        ${
          action
            ? `<button type="button" data-order-action="${escapeHtml(action)}" data-order-id="${escapeHtml(order.id)}">${
                action === "fulfilment.confirmed"
                  ? "Confirm fulfilment"
                  : action === "print.requested"
                    ? "Request demo print"
                    : action === "print.completed"
                      ? "Mark printed"
                      : "Mark shipped"
              }</button>`
            : `<span class="operator-state">${order.status === "pending" ? "Awaiting demo payment" : "No operator action"}</span>`
        }
      </li>`;
    })
    .join("");

  for (const button of orderHost.querySelectorAll<HTMLButtonElement>("[data-order-action]")) {
    button.addEventListener("click", () => {
      const id = button.dataset.orderId;
      const type = button.dataset.orderAction as DemoEventType;
      const order = orders().find((item) => item.id === id);
      if (!order) return;
      const result = applyDemoEvent(order, eventFor(order, type));
      const saved = saveOrder(result.order);
      showNote(note, saved ? "" : storageProblem);
      if (saved) renderOperator();
    });
  }
}

function initOperatorFixtures() {
  const log = document.querySelector<HTMLElement>("[data-fixture-log]");
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-fixture]")) {
    button.addEventListener("click", () => {
      const name = button.dataset.fixture as keyof typeof demoFixtures;
      const fixture = demoFixtures[name];
      if (!fixture) return;
      const built = fixture(`fixture-${crypto.randomUUID()}`);
      let current = built.order;
      const lines = [`Created ${current.id}.`];
      for (const event of built.events) {
        const result = applyDemoEvent(current, event);
        current = result.order;
        lines.push(`${result.accepted ? "Accepted" : "Rejected"} ${event.type}: ${result.reason}`);
      }
      const saved = saveOrder(current);
      showNote(document.querySelector("[data-operator-note]"), saved ? "" : storageProblem);
      if (saved) renderOperator();
      if (log) {
        log.hidden = !saved;
        if (!saved) return;
        log.innerHTML = `<p><strong>${escapeHtml(button.textContent?.trim() ?? "Fixture")}</strong></p><ol>${lines
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join("")}</ol>`;
      }
    });
  }
}

export function initShopDemo() {
  const page = document.querySelector<HTMLElement>("[data-shop-page]")?.dataset.shopPage;
  updateCartCount();
  if (page === "catalogue" || page === "product") initCatalogue();
  if (page === "basket") renderBasket();
  if (page === "checkout") initCheckout();
  if (page === "order") renderOrder();
  if (page === "operator") {
    renderOperator();
    initOperatorFixtures();
  }
}
