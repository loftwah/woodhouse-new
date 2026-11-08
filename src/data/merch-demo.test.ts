import test from "node:test";
import assert from "node:assert/strict";
import {
  applyDemoEvent,
  createDemoOrder,
  demoFixtures,
  demoOrderTimeline,
  merchCandidates,
  merchProducts,
  processDemoEvents
} from "./merch-demo.ts";

test("the public catalogue only contains approved products", () => {
  assert.ok(merchProducts.length >= 3);
  assert.ok(merchProducts.every((product) => product.approval === "approved"));
  assert.ok(merchCandidates.every((product) => product.approval === "candidate"));
  for (const product of merchProducts) {
    const ids = new Set(product.variants.map((variant) => variant.id));
    assert.equal(ids.size, product.variants.length, `${product.slug} repeats a variant id`);
    assert.ok(product.variants.every((variant) => variant.priceCents > 0));
  }
});

test("one checkout owns one order, even when the request is retried", () => {
  const lines = [{ productSlug: "workshop-poster", variantId: "a2", quantity: 1 }];
  const first = createDemoOrder("checkout-1", lines);
  const retry = createDemoOrder("checkout-1", lines, merchProducts, "2026-11-07T00:00:00Z");
  assert.equal(first.id, retry.id);
  assert.equal(first.id, "demo-checkout-1");
  assert.equal(first.totalCents, retry.totalCents);
  assert.equal(first.lines.length, 1);
});

test("the same product and variant never becomes two order lines", () => {
  const order = createDemoOrder("checkout-2", [
    { productSlug: "first-bell-tee", variantId: "m", quantity: 1 },
    { productSlug: "first-bell-tee", variantId: "m", quantity: 1 }
  ]);
  assert.equal(order.lines.length, 1);
  assert.equal(order.lines[0]?.quantity, 2);
  assert.equal(order.subtotalCents, 11800);
});

test("an invalid quantity is refused instead of creating an unpayable order", () => {
  for (const quantity of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () =>
        createDemoOrder("checkout-invalid", [
          { productSlug: "workshop-poster", variantId: "a2", quantity }
        ]),
      /positive, finite quantity/,
      String(quantity)
    );
  }
});

test("a duplicate payment event cannot charge twice", () => {
  const fixture = demoFixtures.duplicatePayment("checkout-3");
  const { order, results } = processDemoEvents(fixture.order, fixture.events);
  assert.equal(order.status, "paid");
  assert.equal(order.paymentEventId, "evt-pay-1");
  assert.equal(results.filter((result) => result.accepted).length, 1);
  assert.match(results[1]?.reason ?? "", /already applied/);
  assert.match(results[2]?.reason ?? "", /only a pending order/);
  assert.equal(order.processed.length, 1);
});

test("fulfilment and print events cannot run before payment and confirmation", () => {
  const fixture = demoFixtures.reorderedFulfilment("checkout-4");
  const { order, results } = processDemoEvents(fixture.order, fixture.events);
  assert.equal(order.status, "paid");
  assert.equal(order.fulfilmentAuthorised, false);
  assert.equal(order.printActionId, null);
  assert.match(results[0]?.reason ?? "", /confirmed payment/);
  assert.match(results[1]?.reason ?? "", /paid order/);
  assert.equal(results[2]?.accepted, true);
});

test("another payment environment cannot move an order", () => {
  const order = createDemoOrder("checkout-env", [
    { productSlug: "workshop-poster", variantId: "a2", quantity: 1 }
  ]);
  const result = applyDemoEvent(order, {
    id: "evt-production",
    orderId: order.id,
    type: "payment.succeeded",
    environment: "production",
    signature: "demo-valid",
    account: "woodhouse-demo",
    amountCents: order.totalCents
  });
  assert.equal(result.accepted, false);
  assert.match(result.reason, /environment/);
  assert.equal(result.order.status, "pending");
});

test("an invalid signature or another account cannot move an order", () => {
  const forged = demoFixtures.invalidSignature("checkout-5");
  const forgedResult = processDemoEvents(forged.order, forged.events);
  assert.equal(forgedResult.order.status, "pending");
  assert.match(forgedResult.results[0]?.reason ?? "", /signature/);

  const wrongAccount = demoFixtures.wrongAccount("checkout-6");
  const wrongResult = processDemoEvents(wrongAccount.order, wrongAccount.events);
  assert.equal(wrongResult.order.status, "pending");
  assert.match(wrongResult.results[0]?.reason ?? "", /another account/);
});

test("printing needs both payment and a separate confirmation, and happens once", () => {
  const fixture = demoFixtures.refundAndDuplicatePrint("checkout-7");
  const { order, results } = processDemoEvents(fixture.order, fixture.events);
  assert.equal(order.status, "refunded");
  assert.equal(order.printActionId, "evt-print");
  assert.equal(results[3]?.accepted, false);
  assert.match(results[3]?.reason ?? "", /already has a print action/);
  assert.equal(results[4]?.accepted, true);
  assert.equal(results[5]?.accepted, false);
  assert.match(results[5]?.reason ?? "", /refund|already applied/);
});

test("a payment amount mismatch is rejected without charging", () => {
  const order = createDemoOrder("checkout-8", [
    { productSlug: "cartridge-funk-stickers", variantId: "sheet", quantity: 1 }
  ]);
  const result = applyDemoEvent(order, {
    id: "evt-short",
    orderId: order.id,
    type: "payment.succeeded",
    environment: "demo",
    signature: "demo-valid",
    account: "woodhouse-demo",
    amountCents: 1
  });
  assert.equal(result.accepted, false);
  assert.match(result.reason, /amount/);
  assert.equal(result.order.status, "pending");
});

test("failed and cancelled payments are terminal", () => {
  for (const type of ["payment.failed", "payment.cancelled"] as const) {
    const order = createDemoOrder(`checkout-${type}`, [
      { productSlug: "workshop-poster", variantId: "a2", quantity: 1 }
    ]);
    const result = applyDemoEvent(order, {
      id: `evt-${type}`,
      orderId: order.id,
      type,
      environment: "demo",
      signature: "demo-valid",
      account: "woodhouse-demo"
    });
    assert.equal(result.accepted, true);
    assert.ok(["failed", "cancelled"].includes(result.order.status));
    const retry = applyDemoEvent(result.order, {
      id: `evt-${type}-retry`,
      orderId: order.id,
      type: "payment.succeeded",
      environment: "demo",
      signature: "demo-valid",
      account: "woodhouse-demo",
      amountCents: order.totalCents
    });
    assert.equal(retry.accepted, false);
    assert.equal(retry.order.status, result.order.status);
  }
});

test("one demo order never becomes two charges or two prints", () => {
  const order = createDemoOrder("checkout-9", [
    { productSlug: "workshop-poster", variantId: "a2", quantity: 1 },
    { productSlug: "first-bell-tee", variantId: "s", quantity: 2 }
  ]);
  const events = [
    {
      id: "evt-1",
      orderId: order.id,
      type: "payment.succeeded" as const,
      environment: "demo" as const,
      signature: "demo-valid" as const,
      account: "woodhouse-demo",
      amountCents: order.totalCents
    },
    {
      id: "evt-2",
      orderId: order.id,
      type: "fulfilment.confirmed" as const,
      environment: "demo" as const,
      signature: "demo-valid" as const,
      account: "woodhouse-demo"
    },
    {
      id: "evt-3",
      orderId: order.id,
      type: "print.requested" as const,
      environment: "demo" as const,
      signature: "demo-valid" as const,
      account: "woodhouse-demo"
    },
    {
      id: "evt-4",
      orderId: order.id,
      type: "print.requested" as const,
      environment: "demo" as const,
      signature: "demo-valid" as const,
      account: "woodhouse-demo"
    }
  ];
  const result = processDemoEvents(order, events);
  assert.equal(result.order.paymentEventId, "evt-1");
  assert.equal(result.order.printActionId, "evt-3");
  assert.equal(result.results.filter((item) => item.accepted).length, 3);
});

test("a refund must match the one charge and keeps the stages it reached", () => {
  const fixture = demoFixtures.refundAndDuplicatePrint("checkout-10");
  const paid = applyDemoEvent(fixture.order, {
    id: "evt-pay",
    orderId: fixture.order.id,
    type: "payment.succeeded",
    environment: "demo",
    signature: "demo-valid",
    account: "woodhouse-demo",
    amountCents: fixture.order.totalCents
  });
  assert.equal(paid.accepted, true);
  const short = applyDemoEvent(paid.order, {
    id: "evt-refund-short",
    orderId: fixture.order.id,
    type: "payment.refunded",
    environment: "demo",
    signature: "demo-valid",
    account: "woodhouse-demo",
    amountCents: 1
  });
  assert.equal(short.accepted, false);
  assert.match(short.reason, /refund amount/);

  const { order } = processDemoEvents(fixture.order, fixture.events);
  assert.equal(order.status, "refunded");
  assert.equal(order.refundedFrom, "print_requested");
  assert.deepEqual(
    demoOrderTimeline(order).map((stage) => [stage.status, stage.state]),
    [
      ["pending", "done"],
      ["paid", "done"],
      ["fulfilment_confirmed", "done"],
      ["print_requested", "done"],
      ["refunded", "terminal"]
    ]
  );
});

test("a failed or cancelled order keeps a visible terminal timeline", () => {
  for (const type of ["payment.failed", "payment.cancelled"] as const) {
    const order = createDemoOrder(`checkout-${type}-timeline`, [
      { productSlug: "workshop-poster", variantId: "a2", quantity: 1 }
    ]);
    const result = applyDemoEvent(order, {
      id: `evt-${type}`,
      orderId: order.id,
      type,
      environment: "demo",
      signature: "demo-valid",
      account: "woodhouse-demo"
    });
    assert.equal(result.accepted, true);
    assert.deepEqual(
      demoOrderTimeline(result.order).map((stage) => [stage.status, stage.state]),
      [
        ["pending", "done"],
        [type === "payment.failed" ? "failed" : "cancelled", "terminal"]
      ]
    );
  }
});
