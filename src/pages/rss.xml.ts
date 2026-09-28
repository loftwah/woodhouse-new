import { fieldNotes } from "../data/field-notes";
export const prerender = true;

function xmlSafe(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function GET() {
  const items = fieldNotes.map((note) => {
    const link = "https://woodhouse.loftwah.com/dispatches/" + note.slug + "/";
    return "<item><title>" + xmlSafe(note.title) + "</title><link>" + link + "</link><guid>" + link + "</guid><description>" + xmlSafe(note.deck) + "</description><pubDate>Mon, 28 Sep 2026 00:00:00 +1000</pubDate><category>" + xmlSafe(note.kind) + "</category></item>";
  }).join("");
  const feed = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0"><channel><title>WOODHOUSE Dispatches</title>' +
    '<link>https://woodhouse.loftwah.com/dispatches/</link>' +
    '<description>Notes on running the Loftwah Software Factory.</description>' +
    '<language>en-AU</language><lastBuildDate>Mon, 28 Sep 2026 00:00:00 +1000</lastBuildDate>' +
    "<generator>WOODHOUSE</generator><atom:link xmlns:atom=\"http://www.w3.org/2005/Atom\" href=\"https://woodhouse.loftwah.com/rss.xml\" rel=\"self\" type=\"application/rss+xml\"/>" +
    items + "</channel></rss>";
  return new Response(feed, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
