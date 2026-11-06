/**
 * The Storybook Astro framework does not re-export the generic CSF Meta and
 * StoryObj aliases. Stories are checked by Storybook at build time; a local
 * structural alias keeps `astro check` fast and honest without importing
 * Storybook internals.
 */
export type Meta = Record<string, unknown>;
export type Story = Record<string, unknown>;
