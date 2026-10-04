// Fingerprint for the published public read model.
//
// SHA-256 is computed directly rather than through EmDash's `computeContentHash`,
// which returns a `sha1:` digest for media de-duplication. Labelling that as
// `sha256:` would be a false claim about the algorithm, and the content
// generation is meant to be the trustworthy half of the identity pair.

export const CONTENT_GENERATION_PREFIX = "sha256:";

/**
 * Hashes canonical description lines into a `sha256:` fingerprint.
 *
 * The input is sorted by the caller, so two reads of the same published model
 * produce the same value regardless of query ordering.
 */
export async function contentGenerationDigest(lines: string[]): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(lines.join("\n")));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
  return `${CONTENT_GENERATION_PREFIX}${hex}`;
}

export function isContentGeneration(value: unknown): boolean {
  return (
    typeof value === "string" &&
    new RegExp(`^${CONTENT_GENERATION_PREFIX}[a-f0-9]{64}$`).test(value)
  );
}
