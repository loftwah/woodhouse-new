import { Data, Effect, Either, Schema } from "effect";

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

export function parseEnquiry(value: unknown): EnquirySubmission | null {
  const result = Schema.decodeUnknownEither(enquirySchema)(value);
  return Either.isRight(result) ? result.right : null;
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
