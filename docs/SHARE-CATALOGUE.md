# Woodhouse Share catalogue

The public read-only API lists campaign artwork and originals already published
through Share. It follows the same project publication rules, including the
publication of each contributing project in a composite.

- `GET /api/v1/assets?project=fighter&orientation=landscape&limit=12`
- `GET /api/v1/assets?q=masked%20fill`
- `GET /api/v1/assets/new-001`

Lists return `version`, `assets` and `nextAfter`. Pass `nextAfter` as `after`
with the same filters to fetch the next page in asset ID order. The default
page size is 24 and the maximum is 50. Use `kind` to distinguish editorial
compositions, production screenshots and published product artwork. The
`orientation` filter accepts landscape, portrait or square.

Each record links to the source, collection, preview and exact original where
published, with known file dimensions, commissioning hashes and revision IDs.
An empty stage or hash means the source record lacks that information. The
API reports reuse as unconfirmed. Check terms with the project owner before
importing an asset for a new publication or transformation.
