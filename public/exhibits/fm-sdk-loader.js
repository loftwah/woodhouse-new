/**
 * Loads LoftwahFM's pinned browser client and publishes it on the page.
 *
 * The script lives in `public/` so it is never bundled: the client is fetched
 * from LoftwahFM's own origin at runtime, exactly as a game would import it.
 * Nothing here starts audio. The client is only requested when a visitor asks
 * for the soundtrack.
 */
import * as sdk from "https://fm.loftwah.com/radio/v1/client/1.2.0/index.js";

globalThis.__loftwahFmSdk = sdk;
globalThis.dispatchEvent(new Event("loftwah-fm-sdk-ready"));
