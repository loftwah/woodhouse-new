/**
 * Wording and deadlines for the share gallery. The component owns the DOM; this
 * module owns the truthful result each path can report. Every message names the
 * work or the outcome and its scope, so a browser handoff is never described as
 * a saved file and a blocked clipboard is never described as a copy.
 */

export class OperationTimeoutError extends Error {
  constructor() {
    super("The operation timed out.");
    this.name = "OperationTimeoutError";
  }
}

/**
 * Stop waiting after `milliseconds` while leaving the underlying work alone.
 * A late success is ignored by the caller's intent token rather than presented
 * as if it happened when the person pressed the control.
 */
export function withDeadline<T>(work: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new OperationTimeoutError()), milliseconds);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export type ClipboardProblem = "blocked" | "timed-out" | "unavailable";

export function clipboardProblem(error: unknown): ClipboardProblem {
  if (error instanceof OperationTimeoutError) return "timed-out";
  const name =
    typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";
  return name === "NotAllowedError" || name === "SecurityError" ? "blocked" : "unavailable";
}

export function clipboardFailureMessage(
  problem: ClipboardProblem,
  scope: "image" | "post"
): string {
  if (scope === "image") {
    if (problem === "blocked") return "Clipboard access was blocked. Use Download instead.";
    if (problem === "timed-out")
      return "The image copy timed out. Use Download if you cannot paste the image.";
    return "The image could not be prepared for the clipboard. Use Download instead.";
  }
  const recovery = "The post is open below; copy it from there.";
  if (problem === "blocked") return `Clipboard access was blocked. ${recovery}`;
  if (problem === "timed-out") return `The clipboard did not confirm the copy. ${recovery}`;
  return `Could not copy automatically. ${recovery}`;
}

export function downloadFailureMessage(hasFallback: boolean): string {
  const source = hasFallback
    ? "The project image and its reviewed backup did not load."
    : "The project image did not load.";
  return `${source} Try the download again, or open the full-size image above.`;
}

/** A browser download request, not a saved file. */
export function downloadHandoffMessage(usedFallback: boolean): string {
  return usedFallback
    ? "The reviewed backup artwork was handed to your browser to save."
    : "The file was handed to your browser to save.";
}

export function downloadReadyMessage(usedFallback: boolean): string {
  return usedFallback
    ? "The reviewed backup artwork is ready. Choose Download."
    : "The file is ready. Choose Download.";
}
