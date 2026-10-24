import { Data, Effect, Either, Schema } from "effect";
import { isEnquiryField, type EnquiryField } from "../data/contact-feedback.ts";

const emailAddress = Schema.String.pipe(
  Schema.maxLength(200),
  Schema.filter((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
);

const enquirySchema = Schema.Struct({
  name: Schema.String.pipe(Schema.maxLength(80)),
  reply: emailAddress,
  topic: Schema.Literal("Woodhouse", "Projects", "Engineering", "Media", "Other"),
  kind: Schema.Literal("human", "agent"),
  message: Schema.String.pipe(Schema.minLength(10), Schema.maxLength(3000))
});

export type EnquirySubmission = Schema.Schema.Type<typeof enquirySchema>;

export type EnquiryDecode = { value: EnquirySubmission } | { field: EnquiryField };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Effect wraps a struct failure in a Composite pointer. Walk to the first
 * field pointer so the contact page can name the field that needs attention
 * instead of asking the person to guess.
 */
function firstPointerPath(issue: unknown): string | null {
  if (!isRecord(issue)) return null;
  if (issue._tag === "Pointer" && typeof issue.path === "string") return issue.path;
  const nested = issue.issues ?? issue.issue;
  if (Array.isArray(nested)) {
    for (const item of nested) {
      const path = firstPointerPath(item);
      if (path) return path;
    }
    return null;
  }
  return firstPointerPath(nested);
}

export function decodeEnquiry(value: unknown): EnquiryDecode {
  const result = Schema.decodeUnknownEither(enquirySchema)(value);
  if (Either.isRight(result)) return { value: result.right };
  const path = firstPointerPath(result.left.issue);
  return { field: isEnquiryField(path) ? path : "message" };
}

export function parseEnquiry(value: unknown): EnquirySubmission | null {
  const result = decodeEnquiry(value);
  return "value" in result ? result.value : null;
}

export class EnquiryPersistenceError extends Data.TaggedError("EnquiryPersistenceError")<{
  cause: unknown;
}> {}

class EnquiryNotificationError extends Data.TaggedError("EnquiryNotificationError")<{
  cause: unknown;
}> {}

const notificationFailureMessage =
  "Woodhouse enquiry saved, but the notification email could not be sent.";

export async function persistThenNotify(options: {
  persist: () => Promise<void>;
  notify: () => Promise<void>;
  warn: (message: string) => void;
}): Promise<void> {
  const persist = Effect.tryPromise({
    try: options.persist,
    catch: (cause) => new EnquiryPersistenceError({ cause })
  });
  const notify = Effect.tryPromise({
    try: options.notify,
    catch: (cause) => new EnquiryNotificationError({ cause })
  }).pipe(
    Effect.catchTag("EnquiryNotificationError", () =>
      Effect.sync(() => options.warn(notificationFailureMessage))
    )
  );

  const result = await Effect.runPromise(Effect.either(Effect.andThen(persist, notify)));
  if (Either.isLeft(result)) throw result.left;
}
