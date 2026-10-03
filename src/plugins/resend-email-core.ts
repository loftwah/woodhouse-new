export type ResendEmailMessage = {
  to: string;
  cc?: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RESEND_TIMEOUT_MS = 8_000;
const MAX_RECIPIENTS = 50;
const MAX_SUBJECT_LENGTH = 998;
const MAX_BODY_LENGTH = 100_000;
const EMAIL_ADDRESS = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export type ResendPayload = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  cc?: string[];
  reply_to?: string;
};

export function isEmailAddress(value: string): boolean {
  return value.length <= 254 && EMAIL_ADDRESS.test(value);
}

export function createResendPayload(from: string, message: ResendEmailMessage): ResendPayload {
  if (!isEmailAddress(from) || !isEmailAddress(message.to)) {
    throw new Error("[woodhouse-resend-email] A valid sender and recipient address are required.");
  }
  if (message.cc?.some((address) => !isEmailAddress(address))) {
    throw new Error("[woodhouse-resend-email] A valid carbon-copy address is required.");
  }
  if (message.replyTo && !isEmailAddress(message.replyTo)) {
    throw new Error("[woodhouse-resend-email] A valid reply-to address is required.");
  }
  if (1 + (message.cc?.length ?? 0) > MAX_RECIPIENTS) {
    throw new Error("[woodhouse-resend-email] The recipient limit is 50 addresses.");
  }
  if (
    !message.subject.trim() ||
    message.subject.length > MAX_SUBJECT_LENGTH ||
    /[\r\n]/.test(message.subject)
  ) {
    throw new Error("[woodhouse-resend-email] A valid email subject is required.");
  }
  if (message.text.length + (message.html?.length ?? 0) > MAX_BODY_LENGTH) {
    throw new Error("[woodhouse-resend-email] Email content exceeds the 100,000-character limit.");
  }

  return {
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    ...(message.html ? { html: message.html } : {}),
    ...(message.cc?.length ? { cc: message.cc } : {}),
    ...(message.replyTo ? { reply_to: message.replyTo } : {})
  };
}

export async function sendResendRequest(
  apiKey: string,
  payload: ResendPayload,
  fetcher: typeof fetch = fetch
): Promise<string> {
  const response = await fetcher(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(RESEND_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`[woodhouse-resend-email] Resend rejected delivery (HTTP ${response.status}).`);
  }
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("[woodhouse-resend-email] Resend returned an unreadable success response.");
  }
  if (typeof result !== "object" || result === null || Array.isArray(result)) {
    throw new Error("[woodhouse-resend-email] Resend returned an unreadable success response.");
  }
  const id = "id" in result ? result.id : undefined;
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("[woodhouse-resend-email] Resend returned an unreadable success response.");
  }
  return id;
}
