/**
 * The enquiry form's public feedback. Field names are shared with the plugin's
 * server redirect so a corrected value is highlighted and described in the same
 * words on both paths.
 */
export const enquiryFields = ["name", "reply", "topic", "kind", "message"] as const;
export type EnquiryField = (typeof enquiryFields)[number];

export function isEnquiryField(value: unknown): value is EnquiryField {
  return typeof value === "string" && (enquiryFields as readonly string[]).includes(value);
}

const fieldMessages: Record<EnquiryField, string> = {
  name: "The name is longer than 80 characters. Shorten it and send again.",
  reply: "That reply address does not look complete. Check it, or leave it blank.",
  topic: "Choose one of the listed topics.",
  kind: "Choose whether you are a person or a software agent.",
  message: "The message needs between 10 and 3,000 characters."
};

export function enquiryProblemMessage(field: EnquiryField | null): string {
  return field ? fieldMessages[field] : "Some details did not pass validation. Check the form.";
}

export const contactMessages = {
  sending: "Sending your enquiry to the private inbox…",
  slow: "The inbox has not replied yet. Keep this page open; do not send again. Your message is kept in this tab.",
  restored: "Draft restored in this tab. Nothing has been sent.",
  invalidKept: "Your message was kept in this tab. Check the highlighted field and send it again.",
  invalidEmpty: "Check the highlighted field and send it again.",
  rateLimitedKept:
    "Your message was kept in this tab. The inbox is busy; try again later or use X or LinkedIn.",
  rateLimitedEmpty: "The inbox is busy; try again later or use X or LinkedIn.",
  restoredAfterSend:
    "This page was restored after a send. Your message is still here; check the last confirmation before sending it again.",
  stillSending: "Still sending. Wait for the inbox to reply before sending again.",
  shortMessage: "The message needs at least 10 characters."
} as const;
