/**
 * The credential-free Woodhouse merch demo (#148).
 *
 * The observed failure this prevents: a demo shop that looks real but has no
 * order identity, so a duplicate payment webhook, a reordered fulfilment event
 * or a wrong-account callback can create a second charge, a second order or a
 * second print action. There are no provider calls here. The same reducer runs
 * in the browser demo and in the tests; every rejected event says why.
 *
 * Money is in integer cents. Prices, shipping, tax and margins are explicit
 * demo placeholders, not supplier quotes. Nothing in this module charges,
 * emails, prints or publishes anything.
 */

type MerchKind = "poster" | "apparel" | "stickers" | "postcards";

type MerchVariant = {
  id: string;
  label: string;
  priceCents: number;
  /** A demo availability note, never a live supplier stock level. */
  availability: string;
};

type MerchArtwork = {
  src: string;
  alt: string;
  credit: string;
  width: number;
  height: number;
};

export type MerchProduct = {
  slug: string;
  name: string;
  kind: MerchKind;
  blurb: string;
  description: string;
  artwork: MerchArtwork;
  variants: MerchVariant[];
  productionNote: string;
  shippingNote: string;
  taxNote: string;
  marginNote: string;
  approval: "approved" | "candidate";
  reviewedAt: string;
};

export const merchReviewDate = "2026-11-07";

export const merchProducts: MerchProduct[] = [
  {
    slug: "workshop-poster",
    name: "The workshop, on paper",
    kind: "poster",
    blurb: "The reviewed Woodhouse workshop plate, printed as a demo poster.",
    description:
      "A landscape plate of the woodhouse floor: the bench, the tools and the work that becomes a public record. This is a demo composition using existing Woodhouse artwork, not a supplier proof.",
    artwork: {
      src: "/og/factory-workshop-20261018.jpg",
      alt: "The Woodhouse workshop illustration used for the demo poster.",
      credit: "Woodhouse composition · factory workshop artwork",
      width: 1200,
      height: 630
    },
    variants: [
      { id: "a2", label: "A2 · 420 × 594 mm", priceCents: 4900, availability: "Demo stock · 25" },
      {
        id: "a1",
        label: "A1 · 594 × 841 mm",
        priceCents: 7900,
        availability: "Made to order · demo"
      }
    ],
    productionNote: "Uncoated 200 gsm paper, poster tube. Supplier and finish are not chosen.",
    shippingNote: "Estimated $12 within Australia. No shipping rate has been quoted.",
    taxNote: "GST is an estimate included for the demo; no tax calculation is connected.",
    marginNote: "Margin is not shown because no supplier quote exists.",
    approval: "approved",
    reviewedAt: merchReviewDate
  },
  {
    slug: "first-bell-tee",
    name: "First bell tee",
    kind: "apparel",
    blurb: "Fighter's annual artwork on a demo heavyweight tee.",
    description:
      "The Fighter annual illustration, placed on the front of a heavyweight tee. The mock-up is a demo composition; the garment, print method and fit are not supplier-verified.",
    artwork: {
      src: "/share/fighter/loftwah-fighter-art-annual-1080p.jpg",
      alt: "Fighter annual artwork used for the demo tee.",
      credit: "Fighter artwork · Loftwah Fighter",
      width: 1920,
      height: 1080
    },
    variants: [
      { id: "s", label: "S", priceCents: 5900, availability: "Demo stock · 8" },
      { id: "m", label: "M", priceCents: 5900, availability: "Demo stock · 12" },
      { id: "l", label: "L", priceCents: 5900, availability: "Demo stock · 6" }
    ],
    productionNote:
      "Heavyweight cotton, front print. Supplier, blank and print method are not chosen.",
    shippingNote: "Estimated $10 within Australia. No shipping rate has been quoted.",
    taxNote: "GST is an estimate included for the demo; no tax calculation is connected.",
    marginNote: "Margin is not shown because no supplier quote exists.",
    approval: "approved",
    reviewedAt: merchReviewDate
  },
  {
    slug: "cartridge-funk-stickers",
    name: "Cartridge Funk stickers",
    kind: "stickers",
    blurb: "A demo sticker sheet built from LoftwahFM's Cartridge Funk sleeve.",
    description:
      "A sheet of weatherproof stickers using the Cartridge Funk sleeve. This is a demo composition; the die cut, finish and weatherproof claim are not supplier-verified.",
    artwork: {
      src: "/share/loftwahfm/cartridge-funk.jpg",
      alt: "LoftwahFM Cartridge Funk artwork used for the demo sticker sheet.",
      credit: "LoftwahFM artwork · Cartridge Funk",
      width: 1024,
      height: 1024
    },
    variants: [
      { id: "sheet", label: "One A6 sheet", priceCents: 1200, availability: "Demo stock · 40" },
      { id: "pair", label: "Two sheets", priceCents: 2000, availability: "Demo stock · 20" }
    ],
    productionNote: "A6 vinyl sheet, matte laminate. Supplier and durability are not verified.",
    shippingNote: "Estimated $5 within Australia. No shipping rate has been quoted.",
    taxNote: "GST is an estimate included for the demo; no tax calculation is connected.",
    marginNote: "Margin is not shown because no supplier quote exists.",
    approval: "approved",
    reviewedAt: merchReviewDate
  },
  {
    slug: "threat-poster",
    name: "The threat, at poster scale",
    kind: "poster",
    blurb: "Protocol 11's threat poster as a demo art print.",
    description:
      "A portrait art print using Protocol 11's campaign poster. The room, the cast and the threat belong to the game; this is a demo composition, not a licensed print run.",
    artwork: {
      src: "/share/protocol-11/campaign-2026-10-19/threat-poster-1080x1920.jpg",
      alt: "Protocol 11 threat poster used for the demo art print.",
      credit: "Protocol 11 artwork · campaign poster, 19 October 2026",
      width: 1080,
      height: 1920
    },
    variants: [
      { id: "a3", label: "A3 · 297 × 420 mm", priceCents: 3900, availability: "Demo stock · 15" },
      { id: "a2", label: "A2 · 420 × 594 mm", priceCents: 5900, availability: "Demo stock · 9" }
    ],
    productionNote: "Matte 250 gsm art paper. Supplier and colour proof are not chosen.",
    shippingNote: "Estimated $12 within Australia. No shipping rate has been quoted.",
    taxNote: "GST is an estimate included for the demo; no tax calculation is connected.",
    marginNote: "Margin is not shown because no supplier quote exists.",
    approval: "approved",
    reviewedAt: merchReviewDate
  }
];

/** A candidate the operator can approve, return or reject in the demo console. */
export const merchCandidates: MerchProduct[] = [
  {
    slug: "loom-study-postcards",
    name: "Loom study postcards",
    kind: "postcards",
    blurb: "A five-card study of the loom plate, awaiting operator review.",
    description:
      "A candidate product: a five-card postcard set built from the existing loom plate. It is deliberately not in the public demo catalogue until the operator approves it in the demo console.",
    artwork: {
      src: "/og/factory-workshop-20261018.jpg",
      alt: "Woodhouse loom study proposed for a demo postcard set.",
      credit: "Woodhouse composition · loom study",
      width: 1200,
      height: 630
    },
    variants: [
      {
        id: "set",
        label: "Set of five A6 cards",
        priceCents: 1800,
        availability: "Candidate · not in catalogue"
      }
    ],
    productionNote: "A6 uncoated cards. Supplier and finish are not chosen.",
    shippingNote: "Estimated $6 within Australia. No shipping rate has been quoted.",
    taxNote: "GST is an estimate included for the demo; no tax calculation is connected.",
    marginNote: "Margin is not shown because no supplier quote exists.",
    approval: "candidate",
    reviewedAt: merchReviewDate
  }
];

export function merchProduct(slug: string): MerchProduct | undefined {
  return [...merchProducts, ...merchCandidates].find((product) => product.slug === slug);
}

export const demoSeller = {
  account: "woodhouse-demo",
  environment: "demo" as const,
  currency: "AUD",
  shippingEstimateCents: 1200,
  checkoutLabel: "Demo checkout · no payment is taken"
};

export type DemoLine = {
  productSlug: string;
  variantId: string;
  quantity: number;
};

type DemoOrderLine = DemoLine & {
  name: string;
  variantLabel: string;
  unitPriceCents: number;
};

type DemoOrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "fulfilment_confirmed"
  | "print_requested"
  | "printed"
  | "shipped";

export type DemoOrder = {
  id: string;
  /** The checkout that owns this order; retries with the same id reuse it. */
  checkoutId: string;
  createdAt: string;
  lines: DemoOrderLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: DemoOrderStatus;
  /** The one accepted payment event, if any. */
  paymentEventId: string | null;
  refundEventId: string | null;
  /** A separate authority from payment: nothing can be printed without it. */
  fulfilmentAuthorised: boolean;
  /** The one accepted print action, if any. */
  printActionId: string | null;
  /** Event ids already applied, so a retry cannot apply twice. */
  processed: string[];
  log: string[];
};

export type DemoEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "payment.cancelled"
  | "payment.refunded"
  | "fulfilment.confirmed"
  | "print.requested"
  | "print.completed"
  | "shipped";

export type DemoEvent = {
  id: string;
  orderId: string;
  type: DemoEventType;
  environment: "demo" | "production";
  signature: "demo-valid" | "demo-invalid";
  account: string;
  amountCents?: number;
};

export type EventResult = {
  order: DemoOrder;
  accepted: boolean;
  reason: string;
};

const refundable = new Set<DemoOrderStatus>([
  "paid",
  "fulfilment_confirmed",
  "print_requested",
  "printed"
]);

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Create the one order owned by a checkout. The same checkout id returns the same order. */
export function createDemoOrder(
  checkoutId: string,
  lines: DemoLine[],
  products: MerchProduct[] = merchProducts,
  createdAt = new Date().toISOString()
): DemoOrder {
  if (!checkoutId.trim()) throw new Error("A demo order needs a checkout id.");
  const catalogue = new Map(products.map((product) => [product.slug, product]));
  const seen = new Map<string, DemoOrderLine>();
  for (const line of lines) {
    const product = catalogue.get(line.productSlug);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    if (!product || !variant)
      throw new Error(`Unknown demo product or variant: ${line.productSlug}/${line.variantId}.`);
    const quantity = Math.max(1, Math.min(10, Math.trunc(line.quantity)));
    const key = `${line.productSlug}:${line.variantId}`;
    const existing = seen.get(key);
    if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
    else
      seen.set(key, {
        ...line,
        quantity,
        name: product.name,
        variantLabel: variant.label,
        unitPriceCents: variant.priceCents
      });
  }
  const orderLines = [...seen.values()];
  if (!orderLines.length) throw new Error("A demo order needs at least one line.");
  const subtotalCents = orderLines.reduce(
    (total, line) => total + line.unitPriceCents * line.quantity,
    0
  );
  const shippingCents = demoSeller.shippingEstimateCents;
  return {
    id: `demo-${checkoutId}`,
    checkoutId,
    createdAt,
    lines: orderLines,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    status: "pending",
    paymentEventId: null,
    refundEventId: null,
    fulfilmentAuthorised: false,
    printActionId: null,
    processed: [],
    log: [
      `Order created for ${money(subtotalCents)} + ${money(shippingCents)} shipping estimate.`,
      "Awaiting a demo payment event. No charge has been attempted."
    ]
  };
}

/**
 * Apply one event. This is deliberately strict:
 * - the environment, account and signature must match the demo seller;
 * - an event id is applied once;
 * - one payment event may charge an order;
 * - a refund cannot precede payment;
 * - printing needs both a paid order and a separate fulfilment confirmation;
 * - one print action may exist.
 */
export function applyDemoEvent(order: DemoOrder, event: DemoEvent): EventResult {
  const reject = (reason: string): EventResult => ({
    order: { ...order, log: [...order.log, `Rejected ${event.type}: ${reason}`] },
    accepted: false,
    reason
  });
  if (event.orderId !== order.id) return reject("the event belongs to another order");
  if (event.environment !== demoSeller.environment)
    return reject("the event came from another environment");
  if (event.account !== demoSeller.account) return reject("the event belongs to another account");
  if (event.signature !== "demo-valid") return reject("the demo signature is invalid");
  if (order.processed.includes(event.id)) return reject("this event id was already applied");

  const accept = (next: Partial<DemoOrder>, message: string): EventResult => ({
    order: {
      ...order,
      ...next,
      processed: [...order.processed, event.id],
      log: [...order.log, message]
    },
    accepted: true,
    reason: message
  });

  switch (event.type) {
    case "payment.succeeded": {
      if (order.status !== "pending") return reject("only a pending order can be paid");
      if (event.amountCents !== order.totalCents)
        return reject("the payment amount does not match the demo order total");
      return accept(
        { status: "paid", paymentEventId: event.id },
        `Payment accepted once for ${money(order.totalCents)}. This is the only charge on the order.`
      );
    }
    case "payment.failed": {
      if (order.status !== "pending") return reject("only a pending order can fail");
      return accept({ status: "failed" }, "The demo payment failed. The order is terminal.");
    }
    case "payment.cancelled": {
      if (order.status !== "pending") return reject("only a pending order can be cancelled");
      return accept(
        { status: "cancelled" },
        "The demo checkout was cancelled. The order is terminal."
      );
    }
    case "payment.refunded": {
      if (!refundable.has(order.status))
        return reject("only a paid, unshipped order can be refunded");
      return accept(
        { status: "refunded", refundEventId: event.id },
        "Refund recorded once. No second refund can be applied."
      );
    }
    case "fulfilment.confirmed": {
      if (order.status !== "paid")
        return reject("fulfilment needs a paid order and a separate confirmation");
      return accept(
        { status: "fulfilment_confirmed", fulfilmentAuthorised: true },
        "Fulfilment confirmed by a separate authority. Printing is still not requested."
      );
    }
    case "print.requested": {
      if (order.printActionId) return reject("this order already has a print action");
      if (order.status !== "fulfilment_confirmed" || !order.fulfilmentAuthorised)
        return reject("printing needs confirmed payment and confirmed fulfilment");
      return accept(
        { status: "print_requested", printActionId: event.id },
        "One print action created. A duplicate event cannot create a second."
      );
    }
    case "print.completed": {
      if (order.status !== "print_requested") return reject("no print action is waiting");
      return accept({ status: "printed" }, "Print completed for the existing print action.");
    }
    case "shipped": {
      if (order.status !== "printed") return reject("only a printed order can ship");
      return accept({ status: "shipped" }, "Demo shipment recorded. No carrier was contacted.");
    }
  }
}

export function processDemoEvents(order: DemoOrder, events: DemoEvent[]) {
  let current = order;
  const results: EventResult[] = [];
  for (const event of events) {
    const result = applyDemoEvent(current, event);
    current = result.order;
    results.push(result);
  }
  return { order: current, results };
}

function event(
  id: string,
  orderId: string,
  type: DemoEventType,
  overrides: Partial<DemoEvent> = {}
): DemoEvent {
  return {
    id,
    orderId,
    type,
    environment: "demo",
    signature: "demo-valid",
    account: demoSeller.account,
    ...overrides
  };
}

/** Named fixtures used by the tests and the operator demo console. */
export const demoFixtures = {
  duplicatePayment(checkoutId: string) {
    const order = createDemoOrder(checkoutId, [
      { productSlug: "workshop-poster", variantId: "a2", quantity: 1 }
    ]);
    return {
      order,
      events: [
        event("evt-pay-1", order.id, "payment.succeeded", { amountCents: order.totalCents }),
        event("evt-pay-1", order.id, "payment.succeeded", { amountCents: order.totalCents }),
        event("evt-pay-2", order.id, "payment.succeeded", { amountCents: order.totalCents })
      ]
    };
  },
  reorderedFulfilment(checkoutId: string) {
    const order = createDemoOrder(checkoutId, [
      { productSlug: "first-bell-tee", variantId: "m", quantity: 1 }
    ]);
    return {
      order,
      events: [
        event("evt-print-early", order.id, "print.requested"),
        event("evt-confirm-early", order.id, "fulfilment.confirmed"),
        event("evt-pay", order.id, "payment.succeeded", { amountCents: order.totalCents })
      ]
    };
  },
  invalidSignature(checkoutId: string) {
    const order = createDemoOrder(checkoutId, [
      { productSlug: "cartridge-funk-stickers", variantId: "sheet", quantity: 2 }
    ]);
    return {
      order,
      events: [
        event("evt-forged", order.id, "payment.succeeded", {
          amountCents: order.totalCents,
          signature: "demo-invalid"
        })
      ]
    };
  },
  wrongAccount(checkoutId: string) {
    const order = createDemoOrder(checkoutId, [
      { productSlug: "threat-poster", variantId: "a3", quantity: 1 }
    ]);
    return {
      order,
      events: [
        event("evt-wrong-account", order.id, "payment.succeeded", {
          amountCents: order.totalCents,
          account: "another-shop"
        })
      ]
    };
  },
  refundAndDuplicatePrint(checkoutId: string) {
    const order = createDemoOrder(checkoutId, [
      { productSlug: "workshop-poster", variantId: "a1", quantity: 1 }
    ]);
    return {
      order,
      events: [
        event("evt-pay", order.id, "payment.succeeded", { amountCents: order.totalCents }),
        event("evt-confirm", order.id, "fulfilment.confirmed"),
        event("evt-print", order.id, "print.requested"),
        event("evt-print-2", order.id, "print.requested"),
        event("evt-refund", order.id, "payment.refunded"),
        event("evt-refund-2", order.id, "payment.refunded")
      ]
    };
  }
};

export function orderTotalLabel(cents: number) {
  return money(cents);
}
