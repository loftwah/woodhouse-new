import { test } from "node:test";
import assert from "node:assert/strict";
import { assertApprovedSecrets, approvedWorkerSecrets } from "./worker-secrets.mjs";
test("the approved GitHub credential passes while unrelated credentials fail closed", () => {
  assert.doesNotThrow(() =>
    assertApprovedSecrets(new Map(approvedWorkerSecrets.map((k) => [k, "fixture"])))
  );
  assert.throws(() => assertApprovedSecrets(new Map([["OTHER_TOKEN", "fixture"]])), /unreviewed/);
  assert.throws(() => assertApprovedSecrets(new Map([["WOODHOUSE_GITHUB_TOKEN", ""]])), /empty/);
  assert.throws(
    () => assertApprovedSecrets(new Map([["WOODHOUSE_GITHUB_TOKEN", "fixture\nOTHER_KEY=value"]])),
    /multiline/
  );
});
