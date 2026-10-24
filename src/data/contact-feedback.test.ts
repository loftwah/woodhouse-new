import assert from "node:assert/strict";
import test from "node:test";
import {
  contactMessages,
  enquiryFields,
  enquiryProblemMessage,
  isEnquiryField
} from "./contact-feedback.ts";

test("only the enquiry's own fields are accepted from the server redirect", () => {
  for (const field of enquiryFields) assert.equal(isEnquiryField(field), true);
  for (const value of ["", "email", "website", null, 7]) assert.equal(isEnquiryField(value), false);
});

test("invalid-field copy names the correction instead of a generic failure", () => {
  assert.match(enquiryProblemMessage("reply"), /reply address/);
  assert.match(enquiryProblemMessage("name"), /80 characters/);
  assert.match(enquiryProblemMessage("topic"), /listed topics/);
  assert.match(enquiryProblemMessage("kind"), /software agent/);
  assert.match(enquiryProblemMessage("message"), /10 and 3,000/);
  assert.match(enquiryProblemMessage(null), /did not pass validation/);
});

test("the pending state does not claim delivery", () => {
  assert.match(contactMessages.sending, /Sending/);
  assert.doesNotMatch(contactMessages.sending, /reached|delivered|sent\b/i);
  assert.match(contactMessages.slow, /do not send again/);
  assert.match(contactMessages.restored, /Nothing has been sent/);
  assert.match(contactMessages.restoredAfterSend, /check the last confirmation/);
});
