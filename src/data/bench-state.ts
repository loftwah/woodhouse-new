/**
 * The patch bench's shareable state.
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

const LAYERS: BenchLayer[] = ["effects", "run", "music"];
const STATION = /^[a-z0-9-]{2,40}$/;

/** The state a set of query parameters describes. */
export const benchStateFromParams = (params: URLSearchParams): BenchState => {
  const layer = params.get("layer");
  const station = params.get("station");
  const apart = Number(params.get("apart"));
  return {
    open: params.get("bench") === "open" || params.has("layer") || params.has("apart"),
    apart: Number.isFinite(apart) ? Math.min(1, Math.max(0, apart)) : 0.72,
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
  return params;
};

/** A shareable link for a state, relative to the current page. */
export const benchStateLink = (pathname: string, state: BenchState): string => {
  const params = benchStateToParams(state);
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
};
