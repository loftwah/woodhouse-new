import { projects } from "../data/projects";
import { fieldNotes } from "../data/field-notes";

export const prerender = true;

export function GET() {
  const paths = [
    "/",
    "/factory/",
    "/projects/",
    "/dispatches/",
    "/incidents/",
    "/conversations/",
    "/architecture/",
    "/doctrine/",
    "/dean/",
    "/agents/",
    "/contact/",
    ...projects.map((project) => "/projects/" + project.slug + "/"),
    ...fieldNotes.map((note) => "/dispatches/" + note.slug + "/")
  ];
  const xml = paths.map((path) => "<url><loc>https://woodhouse.loftwah.com" + path + "</loc><lastmod>2026-09-28</lastmod></url>").join("");
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + xml + "</urlset>", {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
}
