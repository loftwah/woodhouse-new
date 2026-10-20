import type { APIRoute } from "astro";
import { normaliseContract } from "../../data/guestbook-contract";

/**
 * The public Here / there contract, read through Woodhouse's own origin.
 *
 * The guestbook publishes its approved items as a versioned contract, but it
 * does not send permissive CORS headers, so a browser on another origin cannot
 * read it directly. This route is a read-only pass-through: it forwards the
 * published contract unchanged apart from a normalised shape, and falls back to
 * the checked-in snapshot when the provider cannot be reached.
 *
 * It stores nothing, accepts no writes and creates no account.
 */
export const prerender = false;

const PROVIDER = "https://guestbook.loftwah.com/api/items";
const SNAPSHOT = "/exhibits/guestbook-items.json";

export const GET: APIRoute = async ({ site }) => {
  const origin = new URL(site ?? "https://woodhouse.loftwah.com").origin;
  try {
    const response = await fetch(PROVIDER, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) throw new Error(`provider ${response.status}`);
    const contract = normaliseContract(await response.json());
    if (!contract) throw new Error("provider shape");
    return Response.json(
      { available: true, source: "live", fetchedAt: new Date().toISOString(), ...contract },
      { headers: { "cache-control": "public, max-age=300" } }
    );
  } catch {
    try {
      const response = await fetch(new URL(SNAPSHOT, origin));
      const snapshot = normaliseContract(await response.json());
      if (!snapshot) throw new Error("snapshot shape");
      return Response.json(
        {
          available: true,
          source: "snapshot",
          fetchedAt: null,
          note: "The live provider could not be reached, so this is the checked-in copy of the published contract.",
          ...snapshot
        },
        { headers: { "cache-control": "public, max-age=60" } }
      );
    } catch {
      return Response.json(
        { available: false, source: "unavailable", items: [] },
        { status: 503, headers: { "cache-control": "no-store" } }
      );
    }
  }
};
