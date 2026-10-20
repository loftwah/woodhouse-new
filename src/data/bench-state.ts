/**
 * The patch bench's shareable state, and the states a reader can ask it for.
 *
 * A visitor's link should reopen the bench in the state they were looking at,
 * without pretending an interaction happened that did not. The rules are here
 * so they can be tested and reused by the page, the controller and the dispatch.
 */

type BenchLayer = "effects" | "run" | "music";

export type BenchState = {
  open: boolean;
  apart: number;
  layer: BenchLayer | null;
  music: boolean;
  station: string | null;
};

/**
 * A state a reader can ask the bench for.
 *
 * Every field is optional because a request may name only part of a state,
 * but a request that reaches the bench is read as a whole state: the bench
 * fills in what the request leaves out, so one request can never inherit the
 * state a previous one left behind.
 */
export type BenchRequest = {
  open?: boolean;
  separation?: number;
  layer?: BenchLayer | null;
  music?: boolean;
  message?: string;
};

/**
 * The named states the "Show me" control offers on a dispatch.
 *
 * Each one is a complete state. "The effects bus on its own" means the
 * effects are left alone, which is only true when the music link is open, so
 * it says so rather than inheriting whatever the last button left behind.
 */
export const benchShowStates: { label: string; request: BenchRequest }[] = [
  {
    label: "The three layers apart",
    request: { open: true, separation: 1, layer: null, music: true }
  },
  { label: "The music disconnected", request: { open: true, layer: "music", music: false } },
  { label: "The effects bus on its own", request: { open: true, layer: "effects", music: false } },
  { label: "The run on its own", request: { open: true, layer: "run", music: false } }
];

const LAYERS: BenchLayer[] = ["effects", "run", "music"];
const STATION = /^[a-z0-9-]{2,40}$/;

/** The state a set of query parameters describes. */
export const benchStateFromParams = (params: URLSearchParams): BenchState => {
  const layer = params.get("layer");
  const station = params.get("station");
  const apart = params.get("apart");
  const apartValue = apart === null ? Number.NaN : Number(apart);
  return {
    open: params.get("bench") === "open" || params.has("layer") || params.has("apart"),
    apart: Number.isFinite(apartValue) ? Math.min(1, Math.max(0, apartValue)) : 0.72,
    layer: LAYERS.includes(layer as BenchLayer) ? (layer as BenchLayer) : null,
    music: params.get("music") !== "off",
    station: station && STATION.test(station) ? station : null
  };
};

/**
 * The parameters for a state. Only the differences from the resting bench are
 * written, so a shared link stays short and readable.
 */
export const benchStateToParams = (state: BenchState): URLSearchParams => {
  const params = new URLSearchParams();
  if (state.open) params.set("bench", "open");
  if (state.layer) params.set("layer", state.layer);
  if (!state.music) params.set("music", "off");
  if (state.station) params.set("station", state.station);
  // A separation only exists on an open bench, and the presence of one is what
  // tells a reader the bench is open. A closed bench therefore carries none,
  // or its own link would reopen it open.
  if (state.open && state.apart !== 0.72) params.set("apart", state.apart.toFixed(2));
  return params;
};

/**
 * A shareable link for a state, relative to the current page. Any other query
 * parameter the visitor arrived with is preserved: the bench must not destroy
 * campaign attribution on the site's front door.
 */
export const benchStateLink = (
  pathname: string,
  state: BenchState,
  existing?: URLSearchParams
): string => {
  const params = existing ? new URLSearchParams(existing) : new URLSearchParams();
  for (const [key, value] of benchStateToParams(state)) params.set(key, value);
  if (!state.open) {
    params.delete("bench");
    params.delete("apart");
  }
  if (!state.layer) params.delete("layer");
  if (state.music) params.delete("music");
  if (!state.station) params.delete("station");
  if (state.apart === 0.72) params.delete("apart");
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
};
