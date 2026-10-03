import assert from "node:assert/strict";
import test from "node:test";
import { EnquiryPersistenceError, parseEnquiry, persistThenNotify } from "./enquiry-workflow.ts";

const validEnquiry = {
  name: "Dean",
  reply: "dean+woodhouse@deanlofts.xyz",
  topic: "Engineering",
  kind: "human",
  message: "Can you tell me how the public evidence is reviewed?"
};

test("enquiry schema accepts tagged private reply addresses and rejects invalid inputs", () => {
  assert.deepEqual(parseEnquiry(validEnquiry), validEnquiry);
  assert.equal(parseEnquiry({ ...validEnquiry, topic: "Secrets" }), null);
  assert.equal(parseEnquiry({ ...validEnquiry, reply: "not-an-email" }), null);
  assert.equal(parseEnquiry({ ...validEnquiry, message: "short" }), null);
  assert.equal(parseEnquiry({ ...validEnquiry, message: "x".repeat(3001) }), null);
});

test("enquiry notification runs only after persistence succeeds", async () => {
  const order: string[] = [];
  await persistThenNotify({
    persist: async () => {
      order.push("persist");
    },
    notify: async () => {
      order.push("notify");
    },
    warn: () => assert.fail("successful notification must not warn")
  });
  assert.deepEqual(order, ["persist", "notify"]);
});

test("notification failure preserves the saved enquiry and emits only a generic warning", async () => {
  let persisted = false;
  let warning = "";
  await persistThenNotify({
    persist: async () => {
      persisted = true;
    },
    notify: async () => {
      throw new Error("provider response must not be logged");
    },
    warn: (message) => {
      warning = message;
    }
  });
  assert.equal(persisted, true);
  assert.equal(warning, "Woodhouse enquiry saved, but the notification email could not be sent.");
  assert.doesNotMatch(warning, /provider response/);
});

test("persistence failure prevents notification and remains typed", async () => {
  let notified = false;
  await assert.rejects(
    persistThenNotify({
      persist: async () => {
        throw new Error("storage unavailable");
      },
      notify: async () => {
        notified = true;
      },
      warn: () => undefined
    }),
    (error: unknown) => error instanceof EnquiryPersistenceError
  );
  assert.equal(notified, false);
});
