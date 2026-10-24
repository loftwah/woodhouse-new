import { initWasm } from "@resvg/resvg-wasm";
import wasm from "../assets/resvg.wasm";

// Both public PNG routes share the library's single WASM instance. Independent
// route promises caused the second route to fail with "Already initialized".
let initialized: Promise<void> | undefined;

/**
 * Initialise the shared WASM renderer once per isolate.
 *
 * A failed init must not be cached: the library's `initWasm` can only succeed
 * once, so retaining its rejection would turn one transient failure into a 503
 * for every later request in the isolate until eviction. Clearing the slot on
 * rejection lets the next request try again, and a successful init stays cached
 * exactly as before.
 */
export function ensureReportRenderer() {
  if (initialized) return initialized;
  const pending = initWasm(wasm).catch((error: unknown) => {
    if (initialized === pending) initialized = undefined;
    throw error;
  });
  // A request that fails before it awaits this promise must not leave an
  // unobserved rejection behind.
  pending.catch(() => {});
  initialized = pending;
  return pending;
}

let fonts: Promise<Uint8Array[]> | undefined;

/**
 * Fetch the two report fonts once per isolate. They are public static assets on
 * this origin, so the subrequest is the only dependency here.
 *
 * A rejection releases the cache for the next request, and only when this exact
 * promise is still the cached one, so a later successful load is never cleared
 * by an earlier failure. The extra handled branch keeps an unawaited failure
 * from surfacing as an unhandled rejection.
 */
export function loadReportFonts(origin: string) {
  if (fonts) return fonts;
  const pending = Promise.all(
    [400, 700].map(async (weight) => {
      const response = await fetch(new URL(`/fonts/bricolage-report-${weight}.ttf`, origin), {
        redirect: "manual",
        signal: AbortSignal.timeout(4000)
      });
      if (!response.ok) throw Error("Font unavailable");
      return new Uint8Array(await response.arrayBuffer());
    })
  ).then(
    (buffers) => buffers,
    (error: unknown) => {
      if (fonts === pending) fonts = undefined;
      throw error;
    }
  );
  pending.catch(() => {});
  fonts = pending;
  return pending;
}
