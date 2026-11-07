# Woodhouse merch demo — architecture and provider seams

Reviewed 7 November 2026. Owns issue
[#148](https://github.com/loftwah/woodhouse-new/issues/148).

## What this release is

A credential-free shop-shaped demo: four approved products built from existing
project artwork, a browser-local basket, a simulated checkout with
pending/paid/failed/cancelled/refunded outcomes, order tracking and a local
operator console. It proves the order/event invariants and the visitor/operator
experience. It does not charge, reserve, print, ship or collect customer data.

The public routes are `/shop/`, `/shop/<product>/`, `/shop/basket/`,
`/shop/checkout/`, `/shop/order/` and `/shop/operator/`. They are `noindex` and
not in the sitemap: a demo shop must not read as a live offer.

## Where the invariants live

- `src/data/merch-demo.ts` — catalogue, order creation and the event reducer.
- `src/data/merch-demo.test.ts` — duplicate, reordered, invalid-signature,
  wrong-account, wrong-environment, amount-mismatch, terminal-state, refund and
  duplicate-print fixtures.
- `src/scripts/shop-demo.ts` — the same reducer in the browser; localStorage
  holds the demo cart and up to 30 fictional orders.

The guarantees are:

1. One checkout owns one order; retrying the same checkout id returns it.
2. One accepted payment event charges an order; duplicate or later payment
   events cannot charge again.
3. Refunds are recorded once and cannot precede payment.
4. Printing requires a paid order **and** a separate fulfilment confirmation.
5. One print action per order; a different duplicate event is rejected.
6. Wrong environment, account, signature, order or amount is rejected before
   any state change.

These are demo assertions. They are not evidence of a provider integration.

## Chosen provider path

**Recommended: Stripe-hosted Checkout + Printful**, with Shopify retained as the
alternative if the portfolio decides catalogue and fulfilment should be
Shopify-owned. The choice belongs to App Composer's commerce programme (#105 and
its Shopify/Stripe/PayPal/Printful children), not to a second Woodhouse commerce
platform. Woodhouse owns its shop front, product visuals, editorial approval and
visitor/operator UX; a provider adapter owns the money and fulfilment boundary.

The intended mapping:

| Demo event                             | Real seam                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `payment.succeeded`                    | Stripe hosted Checkout completion, verified from the current session/payment state, not a return URL |
| `payment.failed` / `payment.cancelled` | Stripe session expiry/cancellation, reconciled from current state                                    |
| `payment.refunded`                     | Stripe refund observation, once per refund identity                                                  |
| `fulfilment.confirmed`                 | A separate Woodhouse operator authority, not a payment event                                         |
| `print.requested`                      | One Printful order/draft request with an idempotency key and retained action identity                |
| `print.completed`                      | A Printful shipment/status observation, not an inference from the request                            |
| `shipped`                              | Carrier/fulfilment observation, not a UI action alone                                                |

## Compatibility with App Composer

App Composer's `composer.order/1` and `composer.order-event/1` contracts already
retain workspace/account scope, payment environment, proof class, local order and
payment-attempt identity, amount, currency, payment/refund state, checkout
ownership, fulfilment ownership and uncertain-action reconciliation. Its docs
also state that Shopify-owned checkout cannot be charged again through Stripe or
PayPal.

This demo does **not** import that runtime. The compatibility gaps are explicit:

- no workspace/account scope (one demo seller);
- no proof class or observation revision;
- no durable D1 records, action identities or uncertain-action reconciliation;
- no provider adapter, signature verification or current-state retrieval;
- no customer/contact fields by design.

A real Woodhouse integration should consume the App Composer order/action
contract (or a shared adapter built under #105) rather than extend this local
reducer into a parallel commerce platform. If Shopify is selected, checkout and
fulfilment ownership must remain Shopify's; the demo's `payment.succeeded` and
`print.requested` steps would map to Shopify order/fulfilment observations rather
than Stripe/Printful calls.

## Gates before a real sale

- authorised sandbox merchant accounts, API versions and webhook signing secrets;
- exact scopes and secret storage reviewed outside this repository;
- prices, tax, shipping, consumer-law, refund and retention decisions made by MP;
- fulfilment confirmation separated from payment and from publication;
- replay, duplicate, reordering, cancellation, expiry and uncertainty tests
  against the real provider adapter;
- provider account/environment identity read from the server, never from an
  imported order payload.

No account, credential, paid order, Printful submission or live provider call is
authorised by this release.
