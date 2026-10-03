import assert from "node:assert/strict";
import test from "node:test";
import {
  createResendPayload,
  sendResendRequest,
  type ResendEmailMessage
} from "./resend-email-core.ts";

const message: ResendEmailMessage = {
  to: "dean+woodhouse@example.com",
  replyTo: "visitor+reply@example.net",
  cc: ["archive@example.net"],
  subject: "New Woodhouse enquiry",
  text: "Private message body"
};

test("Resend payload preserves tagged recipients without exposing credentials", () => {
  assert.deepEqual(createResendPayload("woodhouse@example.com", message), {
    from: "woodhouse@example.com",
    to: "dean+woodhouse@example.com",
    reply_to: "visitor+reply@example.net",
    cc: ["archive@example.net"],
    subject: "New Woodhouse enquiry",
    text: "Private message body"
  });
});

test("Resend payload rejects invalid addresses and header injection", () => {
  assert.throws(() => createResendPayload("bad sender", message), /sender and recipient/);
  assert.throws(
    () => createResendPayload("woodhouse@example.com", { ...message, to: "bad" }),
    /sender and recipient/
  );
  assert.throws(
    () => createResendPayload("woodhouse@example.com", { ...message, replyTo: "bad" }),
    /reply-to/
  );
  assert.throws(
    () =>
      createResendPayload("woodhouse@example.com", {
        ...message,
        subject: "hello\r\nBcc: x@example.com"
      }),
    /subject/
  );
});

test("Resend payload enforces provider recipient and content limits", () => {
  assert.throws(
    () =>
      createResendPayload("woodhouse@example.com", {
        ...message,
        cc: Array.from({ length: 50 }, (_, index) => `archive-${index}@example.net`)
      }),
    /recipient limit/
  );
  assert.throws(
    () =>
      createResendPayload("woodhouse@example.com", {
        ...message,
        text: "x".repeat(100_001)
      }),
    /100,000-character limit/
  );
});

test("Resend request has a fixed HTTPS endpoint, bounded timeout, and safe status errors", async () => {
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  const result = await sendResendRequest(
    "secret-token",
    createResendPayload("woodhouse@example.com", message),
    async (input, init) => {
      requestUrl = String(input);
      requestInit = init;
      return Response.json({ id: "email_123" });
    }
  );

  assert.equal(requestUrl, "https://api.resend.com/emails");
  assert.equal(requestInit?.method, "POST");
  assert.equal(new Headers(requestInit?.headers).get("authorization"), "Bearer secret-token");
  assert.ok(requestInit?.signal instanceof AbortSignal);
  assert.equal(result, "email_123");

  await assert.rejects(
    sendResendRequest(
      "secret-token",
      createResendPayload("woodhouse@example.com", message),
      async () => new Response("private provider detail", { status: 429 })
    ),
    (error: unknown) =>
      error instanceof Error &&
      error.message === "[woodhouse-resend-email] Resend rejected delivery (HTTP 429)."
  );
});

test("Resend success requires a non-empty message ID", async () => {
  for (const body of ["not json", "{}", '{"id":456}', '{"id":" "}']) {
    await assert.rejects(
      sendResendRequest(
        "secret-token",
        createResendPayload("woodhouse@example.com", message),
        async () => new Response(body)
      ),
      /Resend returned an unreadable success response/
    );
  }
});
