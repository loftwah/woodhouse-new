/**
 * The reviewed lifecycle of a portfolio project.
 *
 * The observed failure: a retired or parked project kept its old "Open" or
 * "Try" action and appeared beside active work, so a reader could not tell
 * what was still being built. Lifecycle projects from the project's current
 * reviewed status record, which is already the canonical dated statement: a
 * status labelled exactly `Retired` or `Paused` is a portfolio decision, while
 * every engineering state ("Final convergence", "A+ convergence", …) remains
 * active. The exact-match rule avoids treating prose such as "delivery paused"
 * in an older engineering note as a lifecycle decision.
 *
 * Lifecycle is deliberately separate from the engineering state: a retired
 * project still has a real history, and a paused project is not cancelled.
 */
export type ProjectLifecycle = "active" | "paused" | "retired" | "unknown";

const lifecycleStates: Record<string, ProjectLifecycle> = {
  Paused: "paused",
  Retired: "retired"
};

/** Map a current status label to a portfolio lifecycle. */
export function projectLifecycle(value: unknown): ProjectLifecycle {
  if (typeof value !== "string") return "unknown";
  const status = value.trim();
  // A missing status is not an explicit statement of active work. Only a real
  // engineering label falls through to `active`; blank or whitespace-only text
  // stays unreviewed so it cannot join current work by omission.
  if (!status) return "unknown";
  return lifecycleStates[status] ?? "active";
}

/** Only an explicit `active` record joins current work, counts and rankings. */
function isActiveProject(project: { lifecycle: ProjectLifecycle }): boolean {
  return project.lifecycle === "active";
}

export function activeProjects<T extends { lifecycle: ProjectLifecycle }>(projects: T[]): T[] {
  return projects.filter(isActiveProject);
}

/** A reader-facing label; active projects do not need a badge of their own. */
export function lifecycleLabel(lifecycle: ProjectLifecycle): string | null {
  if (lifecycle === "active") return null;
  if (lifecycle === "paused") return "Paused";
  if (lifecycle === "retired") return "Retired";
  return "Lifecycle unreviewed";
}
