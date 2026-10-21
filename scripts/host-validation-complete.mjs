import { writeFileSync, renameSync } from "node:fs";

/** Call only after all owned work/cleanup, including failure and cancellation.
 * The reservation is cooperative: arbitrary detached subprocesses are unsupported.
 * Absence of this acknowledgement quarantines a crashed workload's capacity. */
export function completeHostValidation() {
  const destination = process.env.LOFTWAH_VALIDATION_COMPLETION;
  const generation = process.env.LOFTWAH_VALIDATION_GENERATION;
  if (!destination && !generation) return; // Direct editing checks hold no lease.
  if (!destination || !/^[a-f0-9]{32}$/.test(generation ?? "")) {
    throw new Error("Invalid host validation completion contract");
  }
  const temporary = `${destination}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify({ version: 1, generation, cleanup: "complete" }) + "\n", {
    mode: 0o600
  });
  renameSync(temporary, destination);
}
