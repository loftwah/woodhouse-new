/**
 * Plain `tsc` does not know how to type an `.astro` module. Astro's own checker
 * does, so this declaration exists only to let the component workshop's story
 * files pass `tsc --noEmit` without weakening the built site's checks.
 */
declare module "*.astro" {
  const component: (props: Record<string, unknown>) => unknown;
  export default component;
}
