// Woodhouse's production-identity shape, `loftwah.build-identity/1`.
//
// This module is imported by the deployed Worker and by the build-time
// integration, so it must stay free of runtime-specific imports. The
// integration in scripts/build-identity.mjs owns computing the values and
// deliberately keeps its own copy of the schema string; a test asserts the two
// copies cannot drift.

export const BUILD_IDENTITY_SCHEMA = "loftwah.build-identity/1";

export type BuildIdentity = {
  schema: string;
  name: string;
  environment: string;
  sourceDigest: string;
  builtAt: string;
  gitCommit: string | null;
  gitClean: boolean;
};
