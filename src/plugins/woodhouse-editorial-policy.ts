import type { ContentPolicyEvent, SandboxedPlugin } from "emdash/plugin";

type ControlledCollection =
  | "projects"
  | "factory_snapshots"
  | "project_statuses"
  | "evidence_records"
  | "dispatches"
  | "incidents"
  | "conversations";

type PublicTextField =
  | "name"
  | "title"
  | "summary"
  | "proof_boundary"
  | "source_description"
  | "deck"
  | "initial_belief"
  | "what_happened"
  | "evidence"
  | "root_cause"
  | "factory_change";

const controlledCollections: readonly ControlledCollection[] = [
  "projects",
  "factory_snapshots",
  "project_statuses",
  "evidence_records",
  "dispatches",
  "incidents",
  "conversations"
];

const reviewDateCollections = new Set<ControlledCollection>([
  "factory_snapshots",
  "project_statuses",
  "evidence_records",
  "incidents",
  "conversations"
]);

const proofBoundaryCollections = new Set<ControlledCollection>([
  "project_statuses",
  "evidence_records",
  "incidents",
  "conversations"
]);

const incidentFields: readonly PublicTextField[] = [
  "initial_belief",
  "what_happened",
  "evidence",
  "root_cause",
  "factory_change"
];

const projectFields: readonly PublicTextField[] = ["name", "title", "summary"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isControlledCollection(value: string): value is ControlledCollection {
  return controlledCollections.some((collection) => collection === value);
}

function hasText(data: Record<string, unknown>, field: PublicTextField): boolean {
  const value = data[field];
  return typeof value === "string" && value.trim().length > 0;
}

function validReviewDate(value: unknown): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

// Surfaces a human can publish from: the Admin's own API and the visual editor.
// Deliberately not `mcp`.
type HumanPublishSource = "api" | "visual-editor";
const humanPublishSources: ReadonlySet<string> = new Set<HumanPublishSource>([
  "api",
  "visual-editor"
]);

export function publicationBlock(
  event: Pick<ContentPolicyEvent, "collection" | "content" | "origin">
): string | undefined {
  if (!isControlledCollection(event.collection)) return undefined;

  // An agent cannot be the party that makes a record public. EmDash's token
  // scopes cannot express this: `content_publish` requires only `content:write`,
  // and publishing then resolves from the token owner's role, so a token can
  // reach publication no matter how narrow it is. The remaining checks below
  // only inspect field values, and the agent supplies those values itself, so
  // without this rule an agent can satisfy every requirement and publish. The
  // agent leaves a draft; a human publishes it in the Admin.
  //
  // This is an allowlist rather than a refusal of "mcp", so a missing or
  // unrecognised origin fails closed. A new EmDash source is refused until
  // someone decides it is a human surface, which is the safe direction: a
  // blocked publish is visible and recoverable, a leaked one is not.
  if (!humanPublishSources.has(event.origin?.source as HumanPublishSource))
    return "Agent-originated changes cannot be published. Leave the record as a draft for human review.";

  const data = isRecord(event.content.data) ? event.content.data : {};
  if (data.public_safe !== true)
    return "Mark this record as approved for public use before publishing.";

  if (
    reviewDateCollections.has(event.collection) &&
    !validReviewDate(data.reviewed_at ?? data.review_date)
  ) {
    return "Add a valid review date in YYYY-MM-DD format before publishing.";
  }
  if (proofBoundaryCollections.has(event.collection) && !hasText(data, "proof_boundary")) {
    return "Describe what this record does not prove before publishing.";
  }
  if (event.collection === "projects" && !projectFields.every((field) => hasText(data, field))) {
    return "Add the project name, dossier title and public summary before publishing.";
  }
  if (event.collection === "factory_snapshots" && !hasText(data, "source_description")) {
    return "Describe the reviewed source snapshot before publishing.";
  }
  if (event.collection === "dispatches") {
    if (!hasText(data, "deck"))
      return "Add a short public summary before publishing this dispatch.";
    if (!Array.isArray(data.content) || data.content.length === 0)
      return "Add at least one Woodhouse editorial block before publishing.";
  }
  if (event.collection === "incidents") {
    if (!incidentFields.every((field) => hasText(data, field))) {
      return "Complete the incident belief, event, evidence, cause and factory change before publishing.";
    }
  }
  if (event.collection === "conversations" && data.source_reviewed !== true) {
    return "Record a human review of the source before publishing this conversation-derived piece.";
  }
  return undefined;
}

const plugin: SandboxedPlugin = {
  hooks: {
    "content:beforePublish": async (event) => {
      const reason = publicationBlock(event);
      return reason ? { cancel: true, reason } : undefined;
    },
    "content:beforeSchedule": async (event) => {
      const reason = publicationBlock(event);
      return reason ? { cancel: true, reason } : undefined;
    }
  }
};

export default plugin;
