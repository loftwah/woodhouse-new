# UI corrections — 6 November 2026

These are production screenshots at 390px, before and after the 6 November changes. They document
the affected phone composition; the same routes were also checked at 1440px.

| Pair | Before | After | What changed |
| --- | --- | --- | --- |
| 404 | `404-before.jpg` | `404-after.jpg` | Replaced a centred dead end with a left-aligned recovery page: search, front door, project ledger and four destinations. The page still correctly answers HTTP 404. |
| Edition invitation | `edition-before.jpg` | `edition-after.jpg` | The title, description and separate discovery link now read as three deliberate lines; the arrow stays with the sentence instead of sitting alone on the next line. |
| Analytics | `analytics-before.jpg` | `analytics-after.jpg` | Discovery copy now says “1 click” rather than “1 clicks”. The selected project also scrolls into view in the phone rail; that is a DOM observation, not visible in this static pair. |

The screenshots were taken from <https://woodhouse.loftwah.com/> after the production deploy of
Worker `00e109ee-8e2d-4ee9-a2ff-62051e4ac925` at source commit `1a86fc5`.

They are evidence of presentation, not of analytics correctness or physical device behaviour.
