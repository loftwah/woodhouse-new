import type { APIRoute } from "astro";
import { shareCatalogue } from "../../../../data/share-catalogue";

export const prerender = false;
export const GET: APIRoute = ({ url, params }) => shareCatalogue(url.searchParams, params.id ?? "");
