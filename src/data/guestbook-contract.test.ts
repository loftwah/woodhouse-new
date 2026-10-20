import assert from "node:assert/strict";
import { test } from "node:test";
import {
  composedCard,
  composedReason,
  normaliseContract,
  type ContractItem
} from "./guestbook-contract.ts";

const published = {
  contract: 1,
  provider: "guestbook",
  items: [
    {
      contract: 1,
      provider: "guestbook",
      id: "one",
      revision: 2,
      title: "The tide lighthouse, slow moon",
      description: "App Composer demo",
      visibility: "public",
      url: "https://guestbook.loftwah.com/item/one",
      image: "https://guestbook.loftwah.com/media/one",
      synthetic: false
    }
  ]
};

test("a published contract keeps only the fields the exhibit uses", () => {
  const contract = normaliseContract(published);
  assert.ok(contract);
  assert.equal(contract.contract, 1);
  assert.equal(contract.provider, "guestbook");
  assert.equal(contract.items.length, 1);
  assert.equal(contract.items[0]?.id, "one");
  assert.equal(contract.items[0]?.revision, 2);
});

test("a payload that is not a contract is rejected rather than published empty", () => {
  assert.equal(normaliseContract(null), null);
  assert.equal(normaliseContract("nope"), null);
  assert.equal(normaliseContract({ contract: 1 }), null);
  assert.equal(normaliseContract({ items: [] }), null);
  assert.equal(normaliseContract({ items: [{ id: "no-address" }] }), null);
});

test("a record without a usable image is not offered as a contribution", () => {
  const contract = normaliseContract({
    items: [
      { id: "a", title: "A", url: "https://x.test/a", visibility: "public" },
      {
        id: "b",
        title: "B",
        url: "https://x.test/b",
        visibility: "public",
        image: "https://x.test/b.png"
      }
    ]
  });
  assert.ok(contract);
  assert.equal(contract.items.length, 1);
  assert.equal(contract.items[0]?.id, "b");
});

test("a public contribution produces a composed card", () => {
  const item = normaliseContract(published)?.items[0] as ContractItem;
  assert.deepEqual(composedCard(item, false), { visible: true, reason: "ok" });
});

test("a hidden source removes the composed card", () => {
  const item = normaliseContract(published)?.items[0] as ContractItem;
  assert.deepEqual(composedCard(item, true), { visible: false, reason: "hidden" });
});

test("a contribution that is not public produces no card", () => {
  const item = {
    ...(normaliseContract(published)?.items[0] as ContractItem),
    visibility: "private"
  };
  assert.deepEqual(composedCard(item, false), { visible: false, reason: "hidden" });
});

test("a missing contribution is reported as missing rather than hidden", () => {
  assert.deepEqual(composedCard(undefined, false), { visible: false, reason: "missing" });
  assert.match(composedReason("missing"), /No contribution/);
  assert.match(composedReason("hidden"), /not public/);
});
