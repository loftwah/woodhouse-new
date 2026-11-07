/**
 * Verified agent capabilities that a Woodhouse reader can follow to the owning
 * app. This is a small, allowlisted projection of a live app-owned contract,
 * not a second app registry, executor or permission grant.
 *
 * The observed failure: a shipped capability was only discoverable by reading
 * App Composer's source or guessing an endpoint. Woodhouse's job is to signpost
 * the real contract and its limits; the app still owns execution, storage and
 * permissions.
 */
export const AGENT_CAPABILITY_REVIEWED = "2026-11-07";

type AgentCapabilityOperation = {
  name: string;
  description: string;
  kind: "read" | "effect";
  method: "GET" | "POST";
  path: string;
  availability: "public" | "guest-invitation";
  requires: string[];
  confirmation: boolean;
  verified: string;
};

export type AgentCapability = {
  provider: {
    name: string;
    slug: string;
    origin: string;
    contract: string;
    humanContract: string;
  };
  app: {
    name: string;
    origin: string;
  };
  operations: AgentCapabilityOperation[];
  boundary: string;
};

export const agentCapabilities: AgentCapability[] = [
  {
    provider: {
      name: "App Composer",
      slug: "app-composer",
      origin: "https://composer.loftwah.com",
      contract: "https://composer.loftwah.com/capabilities.json",
      humanContract: "https://composer.loftwah.com/capabilities"
    },
    app: {
      name: "Here / there",
      origin: "https://guestbook.loftwah.com"
    },
    operations: [
      {
        name: "read-invitation",
        description:
          "Read one visitor book's current invitation state, contribution limits and exact form paths. It never returns a guest code or private media.",
        kind: "read",
        method: "GET",
        path: "/r/:resource/api/invitation",
        availability: "public",
        requires: ["none"],
        confirmation: false,
        verified: "2026-11-06"
      },
      {
        name: "submit-postcard",
        description:
          "Submit one short postcard for owner review. It requires the app-issued guest code, explicit consent and a browser-rendered PNG; it cannot publish, moderate or read private records.",
        kind: "effect",
        method: "POST",
        path: "/r/:resource/api/guest-postcard",
        availability: "guest-invitation",
        requires: ["guest-invitation-code", "consent"],
        confirmation: true,
        verified: "2026-11-07"
      }
    ],
    boundary:
      "App Composer publishes the contract; the app owns execution, storage and permissions. Woodhouse does not proxy or invoke the operation. The guest code is issued by the app, and every postcard remains pending until owner review, so a successful submission never guarantees publication."
  }
];

/**
 * The exact public projection used by `/agents/facts.json`. Keeping this
 * function separate lets a test prove that no extra field (or credential-like
 * field) can be added by the renderer.
 */
export function publicAgentCapabilities() {
  return agentCapabilities.map((capability) => ({
    provider: {
      name: capability.provider.name,
      slug: capability.provider.slug,
      origin: capability.provider.origin,
      contract: capability.provider.contract,
      humanContract: capability.provider.humanContract
    },
    app: {
      name: capability.app.name,
      origin: capability.app.origin
    },
    operations: capability.operations.map((operation) => ({
      name: operation.name,
      description: operation.description,
      kind: operation.kind,
      method: operation.method,
      path: operation.path,
      availability: operation.availability,
      requires: [...operation.requires],
      confirmation: operation.confirmation,
      verified: operation.verified
    })),
    boundary: capability.boundary
  }));
}
