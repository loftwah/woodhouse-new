import assert from "node:assert/strict";
import { test } from "node:test";
import { emailFromGitIdent, matchesAccount } from "./check-git-identity.mjs";

const account = { id: 123456, login: "example-owner" };

test("rejects a fabricated lane noreply that can attribute work to someone else", () => {
  assert.equal(matchesAccount("lane-e@users.noreply.github.com", account), false);
});

test("accepts the authenticated account's numeric noreply and verified email", () => {
  assert.equal(matchesAccount("123456+example-owner@users.noreply.github.com", account), true);
  assert.equal(
    matchesAccount("owner@example.test", account, [
      { email: "owner@example.test", verified: true }
    ]),
    true
  );
  assert.equal(
    matchesAccount("owner@example.test", account, [
      { email: "owner@example.test", verified: false }
    ]),
    false
  );
  assert.equal(matchesAccount("123456+other@users.noreply.github.com", account), false);
});

test("reads effective Git identities including environment overrides", () => {
  assert.equal(
    emailFromGitIdent("A Name <owner@example.test> 1234567890 +1100"),
    "owner@example.test"
  );
  assert.equal(emailFromGitIdent("invalid"), null);
});
