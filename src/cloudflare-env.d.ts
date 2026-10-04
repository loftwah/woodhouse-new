/// <reference types="@cloudflare/workers-types" />

import type { BuildIdentity } from "./data/build-identity.ts";

declare global {
  /**
   * Replaced at build time by the identity integration in astro.config.mjs. The
   * declared shape is a compile-time fallback only; a real build always
   * substitutes the computed identity, and a build that cannot compute a valid
   * one refuses to run.
   */
  const __WOODHOUSE_BUILD_IDENTITY__: BuildIdentity;
}

export {};