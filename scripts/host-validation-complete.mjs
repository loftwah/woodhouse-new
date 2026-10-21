import { writeFileSync, renameSync } from "node:fs";
import { dirname, join, isAbsolute } from "node:path";

/** Call only after all owned work/cleanup, including failure and cancellation.
 * Cooperative descendants must preserve the inherited job lineage marker.
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

/** Bind the supervisor's final outcome to this fresh evidence directory. */
export function registerHostValidationEvidence(evidenceDirectory) {
  const destination = process.env.LOFTWAH_VALIDATION_COMPLETION;
  const generation = process.env.LOFTWAH_VALIDATION_GENERATION;
  if (!destination || !/^[a-f0-9]{32}$/.test(generation ?? "") || !isAbsolute(evidenceDirectory)) {
    throw new Error("Qualification requires an active host validation reservation");
  }
  const registration = join(dirname(destination), `register-${generation}.json`);
  const temporary = `${registration}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify({ version: 1, generation, evidenceDirectory }) + "\n", {
    mode: 0o600
  });
  renameSync(temporary, registration);
}
