import type { APIRoute } from "astro";
import { assetMcp } from "../../../data/asset-mcp";
import { shareCatalogue } from "../../../data/share-catalogue";

export const prerender = false;
export const ALL: APIRoute = ({ request }) => assetMcp(request, shareCatalogue);
