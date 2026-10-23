import test from "node:test";
import assert from "node:assert/strict";
import {
  parseDistributionContext,
  distributionMetric,
  parseDistributionMetric
} from "./story-distribution.ts";
test("only published vocabulary and bounded frozen report syntax form dimensions", () => {
  const context = parseDistributionContext({
    edition: "one-more-round",
    story: "edition",
    report: "a".repeat(24)
  });
  assert(context);
  assert.deepEqual(parseDistributionMetric(distributionMetric(context, "arrival")), {
    ...context,
    stage: "arrival",
    target: null
  });
  assert.deepEqual(parseDistributionMetric(distributionMetric(context, "opening", "protocol-11")), {
    ...context,
    stage: "opening",
    target: "protocol-11"
  });
  for (const metric of [
    distributionMetric(context, "opening", "private"),
    distributionMetric(context, "arrival", "bubbles"),
    distributionMetric(context, "opening"),
    distributionMetric(context, "arrival") + ":extra:secret"
  ])
    assert.equal(parseDistributionMetric(metric), null);
  assert.equal(parseDistributionContext({ ...context, session: "secret" }), null);
  assert.equal(parseDistributionContext({ ...context, story: "private" }), null);
});
