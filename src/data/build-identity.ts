// Woodhouse's production-identity shape, `loftwah.build-identity/1`.
//
// This module is imported by the deployed Worker, so it must stay free of
// runtime-specific imports. The integration in scripts/build-identity.mjs owns
// the schema string and computing the values; this module only describes the
// shape the Worker reads.

export type BuildIdentity = {
  schema: string;
  name: string;
  environment: string;
  sourceDigest: string;
  builtAt: string;
  gitCommit: string | null;
  gitClean: boolean;
};

/** A dirty build has no exact serving commit. Never borrow a checkout identity. */
export function producerRevision(
  identity: Pick<
    BuildIdentity,
    "gitCommit" | "gitClean"
  > | null = typeof __WOODHOUSE_BUILD_IDENTITY__ === "undefined"
    ? null
    : __WOODHOUSE_BUILD_IDENTITY__
): string | null {
  return identity?.gitClean === true && /^[a-f0-9]{40}$/.test(identity.gitCommit ?? "")
    ? identity.gitCommit
    : null;
}
