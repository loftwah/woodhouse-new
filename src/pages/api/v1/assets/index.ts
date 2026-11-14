import type { APIRoute } from "astro";
import { shareCatalogue } from "../../../../data/share-catalogue";

export const prerender = false;
export const GET: APIRoute = ({ url }) => shareCatalogue(url.searchParams);
