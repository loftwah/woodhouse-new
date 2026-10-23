/** Public edition assets reviewed 23 October 2026. Frozen originals retain their original identity. */
export type EditionShareAsset = {
  id: string;
  project?: string;
  title: string;
  kind: "image" | "video";
  file: string;
  poster?: string;
  width: number;
  height: number;
  caption: string;
  link: string;
  note: string;
  alt: string;
};
export const editionShareAssets: EditionShareAsset[] = [
  {
    id: "invitation-landscape",
    title: "Edition invitation · landscape",
    kind: "image",
    file: "/share/one-more-round/invitation-landscape.jpg",
    width: 1920,
    height: 1080,
    caption:
      "A card table, an aimed shot, a board to clear and a squad to choose. Find your next game, hear LoftwahFM and try an App Composer composition.\nhttps://woodhouse.loftwah.com/editions/one-more-round/",
    link: "https://woodhouse.loftwah.com/editions/one-more-round/",
    note: "Product artwork · no statistical claim",
    alt: "One more round. Protocol 11 card table beside SHOALSHOT underwater play. An invitation to play, listen or try a composition."
  },
  {
    id: "invitation-square",
    title: "Edition invitation · square",
    kind: "image",
    file: "/share/one-more-round/invitation-square.jpg",
    width: 1200,
    height: 1200,
    caption:
      "A card table, an aimed shot, a board to clear and a squad to choose. Find your next game, hear LoftwahFM and try an App Composer composition.\nhttps://woodhouse.loftwah.com/editions/one-more-round/",
    link: "https://woodhouse.loftwah.com/editions/one-more-round/",
    note: "Product artwork · no statistical claim",
    alt: "One more round. Protocol 11 card table beside SHOALSHOT underwater play. An invitation to play, listen or try a composition."
  },
  {
    id: "invitation-portrait",
    title: "Edition invitation · portrait",
    kind: "image",
    file: "/share/one-more-round/invitation-portrait.jpg",
    width: 1080,
    height: 1920,
    caption:
      "A card table, an aimed shot, a board to clear and a squad to choose. Find your next game, hear LoftwahFM and try an App Composer composition.\nhttps://woodhouse.loftwah.com/editions/one-more-round/",
    link: "https://woodhouse.loftwah.com/editions/one-more-round/",
    note: "Product artwork · no statistical claim",
    alt: "One more round. Protocol 11 card table beside SHOALSHOT underwater play. An invitation to play, listen or try a composition."
  },
  {
    id: "film-landscape",
    title: "One more round · landscape film",
    kind: "video",
    file: "/share/one-more-round/one-more-round-landscape.mp4",
    poster: "/share/one-more-round/film-landscape.jpg",
    width: 1920,
    height: 1080,
    caption:
      "A card table, an aimed shot, a board to clear and a squad to choose. Find your next game, hear LoftwahFM and try an App Composer composition.\nhttps://woodhouse.loftwah.com/editions/one-more-round/\nReal controlled gameplay and public demonstration footage. Source dates and limits are visible in the film. Music: Pixel Box Theory by Loftwah.",
    link: "https://woodhouse.loftwah.com/editions/one-more-round/",
    note: "33-second edit · real product footage · captions in the picture",
    alt: "One more round edition film: a table decision, a Tide Leviathan catch, a board clear, squad combat, music and an app composition."
  },
  {
    id: "film-vertical",
    title: "One more round · vertical film",
    kind: "video",
    file: "/share/one-more-round/one-more-round-vertical.mp4",
    poster: "/share/one-more-round/film-vertical.jpg",
    width: 1080,
    height: 1920,
    caption:
      "A card table, an aimed shot, a board to clear and a squad to choose. Find your next game, hear LoftwahFM and try an App Composer composition.\nhttps://woodhouse.loftwah.com/editions/one-more-round/\nReal controlled gameplay and public demonstration footage. Source dates and limits are visible in the film. Music: Pixel Box Theory by Loftwah.",
    link: "https://woodhouse.loftwah.com/editions/one-more-round/",
    note: "33-second edit · real product footage · captions in the picture",
    alt: "One more round edition film: a table decision, a Tide Leviathan catch, a board clear, squad combat, music and an app composition."
  },
  {
    id: "edition-landscape",
    title: "One more round frozen report · landscape",
    kind: "image",
    file: "/share/one-more-round/edition-landscape.png",
    width: 1200,
    height: 630,
    caption:
      "One more round.\nA changing card table, a carefully placed shot, an arcade board and a squad to build. Find your next short game, hear its possible soundtrack and take a useful story with you.\nEditorial review: 2026-10-23. Observations: 2026-10-12 to 2026-10-18 UTC. Partial source coverage; no weekly record or causal claim.\nProtocol 11: 0h 1m 34s · Classic active gameplay · Partial coverage\nSHOALSHOT: 1 · Reported completed runs · Partial coverage\nBubbles: 0 · Reported completed runs · Partial coverage\nFighter: 1 · Reported fight completions · Legacy/test risk\nLoftwahFM × games: 1h 34m 25s · All-source audible listening · Legacy/test risk\nLink Check × App Composer: 24 · Completed Link Checks · Bounded count\nSeparate source measures, not unique people or a ranked competition. Definitions and limits accompany each story.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/editions/one-more-round/?report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/editions/one-more-round/?report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "One more round frozen observation card with its measure, daily chart, source coverage and limitations."
  },
  {
    id: "edition-square",
    title: "One more round frozen report · square",
    kind: "image",
    file: "/share/one-more-round/edition-square.png",
    width: 1200,
    height: 1200,
    caption:
      "One more round.\nA changing card table, a carefully placed shot, an arcade board and a squad to build. Find your next short game, hear its possible soundtrack and take a useful story with you.\nEditorial review: 2026-10-23. Observations: 2026-10-12 to 2026-10-18 UTC. Partial source coverage; no weekly record or causal claim.\nProtocol 11: 0h 1m 34s · Classic active gameplay · Partial coverage\nSHOALSHOT: 1 · Reported completed runs · Partial coverage\nBubbles: 0 · Reported completed runs · Partial coverage\nFighter: 1 · Reported fight completions · Legacy/test risk\nLoftwahFM × games: 1h 34m 25s · All-source audible listening · Legacy/test risk\nLink Check × App Composer: 24 · Completed Link Checks · Bounded count\nSeparate source measures, not unique people or a ranked competition. Definitions and limits accompany each story.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/editions/one-more-round/?report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/editions/one-more-round/?report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "One more round frozen observation card with its measure, daily chart, source coverage and limitations."
  },
  {
    id: "edition-portrait",
    title: "One more round frozen report · portrait",
    kind: "image",
    file: "/share/one-more-round/edition-portrait.png",
    width: 1080,
    height: 1920,
    caption:
      "One more round.\nA changing card table, a carefully placed shot, an arcade board and a squad to build. Find your next short game, hear its possible soundtrack and take a useful story with you.\nEditorial review: 2026-10-23. Observations: 2026-10-12 to 2026-10-18 UTC. Partial source coverage; no weekly record or causal claim.\nProtocol 11: 0h 1m 34s · Classic active gameplay · Partial coverage\nSHOALSHOT: 1 · Reported completed runs · Partial coverage\nBubbles: 0 · Reported completed runs · Partial coverage\nFighter: 1 · Reported fight completions · Legacy/test risk\nLoftwahFM × games: 1h 34m 25s · All-source audible listening · Legacy/test risk\nLink Check × App Composer: 24 · Completed Link Checks · Bounded count\nSeparate source measures, not unique people or a ranked competition. Definitions and limits accompany each story.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/editions/one-more-round/?report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/editions/one-more-round/?report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "One more round frozen observation card with its measure, daily chart, source coverage and limitations."
  },
  {
    id: "protocol-11-landscape",
    title: "Protocol 11 frozen report · landscape",
    kind: "image",
    file: "/share/one-more-round/protocol-11-landscape.png",
    width: 1200,
    height: 630,
    caption:
      "A different table every round.\n0h 1m 34s · Classic active gameplay\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nReported foreground play seconds while the active mode was Classic. Summed from the accepted 1–30 second active_time increments whose mode is classic. Additive with Active play time: the four mode subtotals sum to that overall total, and a session that changes mode contributes to more than one mode because each increment is counted once. Paused, hidden, inactive and radio time are excluded, and it does not establish a person's total play.\nClassic mode only. Accepted active gameplay seconds are not completed hands, scores or unique players. Read the selected window’s source coverage before comparing periods.\nExact accepted event counters, not unique humans or anti-cheat proof. Blocking, opt-out, offline play and automated traffic affect coverage. DNT, GPC, designated QA and preview traffic are excluded. Production browser measurements start with this release; no historical backfill. Current UTC day and collection-start day may be partial. Cross-device retention, cohort retention and acquisition sources are not measured. Browser returns are unavailable until this product releases its own optional consent client. Mode subtotals come from the same accepted gameplay events as their overall measure: from the day the split begins, the mode subtotals sum exactly to that measure, and a day with no row for a mode is a measured zero for it. Before the split begins there are gaps, not zeroes, and raw history older than 90 days cannot be reconstructed. Visits and engaged sessions are tab session markers and are deliberately not split by mode: one tab session can span several modes, so per-mode session counts would overlap and double-count.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=protocol-11&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=protocol-11&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Protocol 11 frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "protocol-11"
  },
  {
    id: "protocol-11-square",
    title: "Protocol 11 frozen report · square",
    kind: "image",
    file: "/share/one-more-round/protocol-11-square.png",
    width: 1200,
    height: 1200,
    caption:
      "A different table every round.\n0h 1m 34s · Classic active gameplay\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nReported foreground play seconds while the active mode was Classic. Summed from the accepted 1–30 second active_time increments whose mode is classic. Additive with Active play time: the four mode subtotals sum to that overall total, and a session that changes mode contributes to more than one mode because each increment is counted once. Paused, hidden, inactive and radio time are excluded, and it does not establish a person's total play.\nClassic mode only. Accepted active gameplay seconds are not completed hands, scores or unique players. Read the selected window’s source coverage before comparing periods.\nExact accepted event counters, not unique humans or anti-cheat proof. Blocking, opt-out, offline play and automated traffic affect coverage. DNT, GPC, designated QA and preview traffic are excluded. Production browser measurements start with this release; no historical backfill. Current UTC day and collection-start day may be partial. Cross-device retention, cohort retention and acquisition sources are not measured. Browser returns are unavailable until this product releases its own optional consent client. Mode subtotals come from the same accepted gameplay events as their overall measure: from the day the split begins, the mode subtotals sum exactly to that measure, and a day with no row for a mode is a measured zero for it. Before the split begins there are gaps, not zeroes, and raw history older than 90 days cannot be reconstructed. Visits and engaged sessions are tab session markers and are deliberately not split by mode: one tab session can span several modes, so per-mode session counts would overlap and double-count.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=protocol-11&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=protocol-11&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Protocol 11 frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "protocol-11"
  },
  {
    id: "protocol-11-portrait",
    title: "Protocol 11 frozen report · portrait",
    kind: "image",
    file: "/share/one-more-round/protocol-11-portrait.png",
    width: 1080,
    height: 1920,
    caption:
      "A different table every round.\n0h 1m 34s · Classic active gameplay\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nReported foreground play seconds while the active mode was Classic. Summed from the accepted 1–30 second active_time increments whose mode is classic. Additive with Active play time: the four mode subtotals sum to that overall total, and a session that changes mode contributes to more than one mode because each increment is counted once. Paused, hidden, inactive and radio time are excluded, and it does not establish a person's total play.\nClassic mode only. Accepted active gameplay seconds are not completed hands, scores or unique players. Read the selected window’s source coverage before comparing periods.\nExact accepted event counters, not unique humans or anti-cheat proof. Blocking, opt-out, offline play and automated traffic affect coverage. DNT, GPC, designated QA and preview traffic are excluded. Production browser measurements start with this release; no historical backfill. Current UTC day and collection-start day may be partial. Cross-device retention, cohort retention and acquisition sources are not measured. Browser returns are unavailable until this product releases its own optional consent client. Mode subtotals come from the same accepted gameplay events as their overall measure: from the day the split begins, the mode subtotals sum exactly to that measure, and a day with no row for a mode is a measured zero for it. Before the split begins there are gaps, not zeroes, and raw history older than 90 days cannot be reconstructed. Visits and engaged sessions are tab session markers and are deliberately not split by mode: one tab session can span several modes, so per-mode session counts would overlap and double-count.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=protocol-11&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=protocol-11&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Protocol 11 frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "protocol-11"
  },
  {
    id: "shoalshot-landscape",
    title: "SHOALSHOT frozen report · landscape",
    kind: "image",
    file: "/share/one-more-round/shoalshot-landscape.png",
    width: 1200,
    height: 630,
    caption:
      "Read the tide. Place the shot.\n1 · Reported completed runs\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nAccepted terminal game/result transitions. Client reported; not a validated competitive result. Multiplayer tabs report participations, not distinct tables.\nAccepted terminal game/result transitions, including repeat runs. Client-reported activity is not a validated competitive score, catch or unique player.\nExact accepted event counters, not unique humans or anti-cheat proof. Blocking, opt-out, offline play and automated traffic affect coverage. DNT, GPC, designated QA and preview traffic are excluded. Production browser measurements start with this release; no historical backfill. Current UTC day and collection-start day may be partial. Cross-device retention, cohort retention and acquisition sources are not measured. Browser returns are unavailable until this product releases its own optional consent client.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=shoalshot&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=shoalshot&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "SHOALSHOT frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "shoalshot"
  },
  {
    id: "shoalshot-square",
    title: "SHOALSHOT frozen report · square",
    kind: "image",
    file: "/share/one-more-round/shoalshot-square.png",
    width: 1200,
    height: 1200,
    caption:
      "Read the tide. Place the shot.\n1 · Reported completed runs\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nAccepted terminal game/result transitions. Client reported; not a validated competitive result. Multiplayer tabs report participations, not distinct tables.\nAccepted terminal game/result transitions, including repeat runs. Client-reported activity is not a validated competitive score, catch or unique player.\nExact accepted event counters, not unique humans or anti-cheat proof. Blocking, opt-out, offline play and automated traffic affect coverage. DNT, GPC, designated QA and preview traffic are excluded. Production browser measurements start with this release; no historical backfill. Current UTC day and collection-start day may be partial. Cross-device retention, cohort retention and acquisition sources are not measured. Browser returns are unavailable until this product releases its own optional consent client.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=shoalshot&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=shoalshot&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "SHOALSHOT frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "shoalshot"
  },
  {
    id: "shoalshot-portrait",
    title: "SHOALSHOT frozen report · portrait",
    kind: "image",
    file: "/share/one-more-round/shoalshot-portrait.png",
    width: 1080,
    height: 1920,
    caption:
      "Read the tide. Place the shot.\n1 · Reported completed runs\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nAccepted terminal game/result transitions. Client reported; not a validated competitive result. Multiplayer tabs report participations, not distinct tables.\nAccepted terminal game/result transitions, including repeat runs. Client-reported activity is not a validated competitive score, catch or unique player.\nExact accepted event counters, not unique humans or anti-cheat proof. Blocking, opt-out, offline play and automated traffic affect coverage. DNT, GPC, designated QA and preview traffic are excluded. Production browser measurements start with this release; no historical backfill. Current UTC day and collection-start day may be partial. Cross-device retention, cohort retention and acquisition sources are not measured. Browser returns are unavailable until this product releases its own optional consent client.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=shoalshot&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=shoalshot&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "SHOALSHOT frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "shoalshot"
  },
  {
    id: "bubbles-landscape",
    title: "Bubbles frozen report · landscape",
    kind: "image",
    file: "/share/one-more-round/bubbles-landscape.png",
    width: 1200,
    height: 630,
    caption:
      "Find the angle. Clear the board.\n0 · Reported completed runs\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nStarted runs reaching their actual game terminal result, attributed to launch UTC day. Quits and restarts excluded; not a completion cohort rate.\nReported terminal runs across supported games, not a count of successful board clears. Replay measurement is unavailable in this source, not zero. These are not unique players or best scores.\nSelected UTC days are closed; this does not guarantee collection coverage. Stored browser reports are subject to privacy opt-outs, network loss and abuse controls; they are not unique people. Collection is opt-in and starts at this deployment. No historical gameplay is imported or invented. Anonymous daily totals are retained durably; pseudonymous run facts expire after 90 days. Active-time collection starts 2026-10-15T11:33:11.547Z; earlier time is unavailable. Raw gameplay run facts expire after 90 days.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=bubbles&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=bubbles&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Bubbles frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "bubbles"
  },
  {
    id: "bubbles-square",
    title: "Bubbles frozen report · square",
    kind: "image",
    file: "/share/one-more-round/bubbles-square.png",
    width: 1200,
    height: 1200,
    caption:
      "Find the angle. Clear the board.\n0 · Reported completed runs\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nStarted runs reaching their actual game terminal result, attributed to launch UTC day. Quits and restarts excluded; not a completion cohort rate.\nReported terminal runs across supported games, not a count of successful board clears. Replay measurement is unavailable in this source, not zero. These are not unique players or best scores.\nSelected UTC days are closed; this does not guarantee collection coverage. Stored browser reports are subject to privacy opt-outs, network loss and abuse controls; they are not unique people. Collection is opt-in and starts at this deployment. No historical gameplay is imported or invented. Anonymous daily totals are retained durably; pseudonymous run facts expire after 90 days. Active-time collection starts 2026-10-15T11:33:11.547Z; earlier time is unavailable. Raw gameplay run facts expire after 90 days.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=bubbles&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=bubbles&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Bubbles frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "bubbles"
  },
  {
    id: "bubbles-portrait",
    title: "Bubbles frozen report · portrait",
    kind: "image",
    file: "/share/one-more-round/bubbles-portrait.png",
    width: 1080,
    height: 1920,
    caption:
      "Find the angle. Clear the board.\n0 · Reported completed runs\n2026-10-12 to 2026-10-18 UTC · Partial coverage\nStarted runs reaching their actual game terminal result, attributed to launch UTC day. Quits and restarts excluded; not a completion cohort rate.\nReported terminal runs across supported games, not a count of successful board clears. Replay measurement is unavailable in this source, not zero. These are not unique players or best scores.\nSelected UTC days are closed; this does not guarantee collection coverage. Stored browser reports are subject to privacy opt-outs, network loss and abuse controls; they are not unique people. Collection is opt-in and starts at this deployment. No historical gameplay is imported or invented. Anonymous daily totals are retained durably; pseudonymous run facts expire after 90 days. Active-time collection starts 2026-10-15T11:33:11.547Z; earlier time is unavailable. Raw gameplay run facts expire after 90 days.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=bubbles&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=bubbles&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Bubbles frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "bubbles"
  },
  {
    id: "fighter-landscape",
    title: "Fighter frozen report · landscape",
    kind: "image",
    file: "/share/one-more-round/fighter-landscape.png",
    width: 1200,
    height: 630,
    caption:
      "A squad worth coming back to.\n1 · Reported fight completions\n2026-10-12 to 2026-10-18 UTC · Legacy/test risk\nLaunched fights ending in win, loss, draw or forfeit, attributed to launch UTC day. Abandonment excluded; not a completion cohort rate.\nAccepted non-tutorial fight results: win, loss, draw or forfeit, attributed to launch day. These are not wins or unique players. Consult the selected source coverage for historical verification risk.\nHistorical counts before 15 October 2026 include unmarked production QA that cannot be separated or subtracted. These are stored reports, not a clean audience cohort; exclude pre-comparableFrom history from growth comparisons and records. Requested windows may include partial coverage. Current UTC day is partial. Stored browser reports are subject to privacy opt-outs, network loss and abuse controls; they are not unique people. Launch/completion counters backfilled only from the raw rows retained at migration; earlier expired history is unavailable. Anonymous daily totals are retained durably thereafter. Visits, engagement, deliberate Quick Fight replay and optional browser cohort measurement start 2026-10-15T14:34:02.048Z; earlier values are unavailable. Browser cohort rows and raw tab sessions expire after 90 days; anonymous daily counters remain durable. Active-time collection starts 2026-10-15T12:02:46.571Z; earlier time is unavailable. Individual raw game and session facts still expire after 90 days.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=fighter&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=fighter&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Fighter frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "fighter"
  },
  {
    id: "fighter-square",
    title: "Fighter frozen report · square",
    kind: "image",
    file: "/share/one-more-round/fighter-square.png",
    width: 1200,
    height: 1200,
    caption:
      "A squad worth coming back to.\n1 · Reported fight completions\n2026-10-12 to 2026-10-18 UTC · Legacy/test risk\nLaunched fights ending in win, loss, draw or forfeit, attributed to launch UTC day. Abandonment excluded; not a completion cohort rate.\nAccepted non-tutorial fight results: win, loss, draw or forfeit, attributed to launch day. These are not wins or unique players. Consult the selected source coverage for historical verification risk.\nHistorical counts before 15 October 2026 include unmarked production QA that cannot be separated or subtracted. These are stored reports, not a clean audience cohort; exclude pre-comparableFrom history from growth comparisons and records. Requested windows may include partial coverage. Current UTC day is partial. Stored browser reports are subject to privacy opt-outs, network loss and abuse controls; they are not unique people. Launch/completion counters backfilled only from the raw rows retained at migration; earlier expired history is unavailable. Anonymous daily totals are retained durably thereafter. Visits, engagement, deliberate Quick Fight replay and optional browser cohort measurement start 2026-10-15T14:34:02.048Z; earlier values are unavailable. Browser cohort rows and raw tab sessions expire after 90 days; anonymous daily counters remain durable. Active-time collection starts 2026-10-15T12:02:46.571Z; earlier time is unavailable. Individual raw game and session facts still expire after 90 days.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=fighter&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=fighter&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Fighter frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "fighter"
  },
  {
    id: "fighter-portrait",
    title: "Fighter frozen report · portrait",
    kind: "image",
    file: "/share/one-more-round/fighter-portrait.png",
    width: 1080,
    height: 1920,
    caption:
      "A squad worth coming back to.\n1 · Reported fight completions\n2026-10-12 to 2026-10-18 UTC · Legacy/test risk\nLaunched fights ending in win, loss, draw or forfeit, attributed to launch UTC day. Abandonment excluded; not a completion cohort rate.\nAccepted non-tutorial fight results: win, loss, draw or forfeit, attributed to launch day. These are not wins or unique players. Consult the selected source coverage for historical verification risk.\nHistorical counts before 15 October 2026 include unmarked production QA that cannot be separated or subtracted. These are stored reports, not a clean audience cohort; exclude pre-comparableFrom history from growth comparisons and records. Requested windows may include partial coverage. Current UTC day is partial. Stored browser reports are subject to privacy opt-outs, network loss and abuse controls; they are not unique people. Launch/completion counters backfilled only from the raw rows retained at migration; earlier expired history is unavailable. Anonymous daily totals are retained durably thereafter. Visits, engagement, deliberate Quick Fight replay and optional browser cohort measurement start 2026-10-15T14:34:02.048Z; earlier values are unavailable. Browser cohort rows and raw tab sessions expire after 90 days; anonymous daily counters remain durable. Active-time collection starts 2026-10-15T12:02:46.571Z; earlier time is unavailable. Individual raw game and session facts still expire after 90 days.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=fighter&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=fighter&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Fighter frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "fighter"
  },
  {
    id: "music-landscape",
    title: "Music frozen report · landscape",
    kind: "image",
    file: "/share/one-more-round/music-landscape.png",
    width: 1200,
    height: 630,
    caption:
      "A soundtrack with somewhere to go.\n1h 34m 25s · All-source audible listening\n2026-10-12 to 2026-10-18 UTC · Legacy/test risk\nAccepted forward audible progression bounded by server elapsed time; excludes pauses, seeking, muted and stalled playback. FM native audio can report while the page is hidden; game adapters exclude hidden playback. All admitted listening-v1 sources, not gameplay time.\nAccepted audible music time across all admitted sources. This is not gameplay time or unique listeners. History before 15 October may include unmarked verification.\nD1 counts are exact for accepted listening-v1 receipts, not independently audited people or exhaustive listening. Collection began 10 October 2026; aggregate history is retained for 185 days. Entirely pre-collection or expired windows are unavailable, never zero. Current UTC day and the first collection day are partial. Historical counts before 15 October 2026 may include unmarked production verification that cannot be separated or subtracted. Growth comparisons and records require complete dates after comparableFrom. Client delivery, opt-out, rate limits and uninstrumented/older clients may omit listening. Declared tests, preview, obvious bot/headless and DNT/GPC traffic are excluded. Legacy Analytics Engine milestones are excluded: that separate pipeline is adaptively sampled and retained for three months, so it cannot establish exact lifetime records. No browser identity is stored by listening-v1; distinct listeners, returning audience and retention are unavailable.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=music&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=music&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Music frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "loftwahfm"
  },
  {
    id: "music-square",
    title: "Music frozen report · square",
    kind: "image",
    file: "/share/one-more-round/music-square.png",
    width: 1200,
    height: 1200,
    caption:
      "A soundtrack with somewhere to go.\n1h 34m 25s · All-source audible listening\n2026-10-12 to 2026-10-18 UTC · Legacy/test risk\nAccepted forward audible progression bounded by server elapsed time; excludes pauses, seeking, muted and stalled playback. FM native audio can report while the page is hidden; game adapters exclude hidden playback. All admitted listening-v1 sources, not gameplay time.\nAccepted audible music time across all admitted sources. This is not gameplay time or unique listeners. History before 15 October may include unmarked verification.\nD1 counts are exact for accepted listening-v1 receipts, not independently audited people or exhaustive listening. Collection began 10 October 2026; aggregate history is retained for 185 days. Entirely pre-collection or expired windows are unavailable, never zero. Current UTC day and the first collection day are partial. Historical counts before 15 October 2026 may include unmarked production verification that cannot be separated or subtracted. Growth comparisons and records require complete dates after comparableFrom. Client delivery, opt-out, rate limits and uninstrumented/older clients may omit listening. Declared tests, preview, obvious bot/headless and DNT/GPC traffic are excluded. Legacy Analytics Engine milestones are excluded: that separate pipeline is adaptively sampled and retained for three months, so it cannot establish exact lifetime records. No browser identity is stored by listening-v1; distinct listeners, returning audience and retention are unavailable.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=music&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=music&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Music frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "loftwahfm"
  },
  {
    id: "music-portrait",
    title: "Music frozen report · portrait",
    kind: "image",
    file: "/share/one-more-round/music-portrait.png",
    width: 1080,
    height: 1920,
    caption:
      "A soundtrack with somewhere to go.\n1h 34m 25s · All-source audible listening\n2026-10-12 to 2026-10-18 UTC · Legacy/test risk\nAccepted forward audible progression bounded by server elapsed time; excludes pauses, seeking, muted and stalled playback. FM native audio can report while the page is hidden; game adapters exclude hidden playback. All admitted listening-v1 sources, not gameplay time.\nAccepted audible music time across all admitted sources. This is not gameplay time or unique listeners. History before 15 October may include unmarked verification.\nD1 counts are exact for accepted listening-v1 receipts, not independently audited people or exhaustive listening. Collection began 10 October 2026; aggregate history is retained for 185 days. Entirely pre-collection or expired windows are unavailable, never zero. Current UTC day and the first collection day are partial. Historical counts before 15 October 2026 may include unmarked production verification that cannot be separated or subtracted. Growth comparisons and records require complete dates after comparableFrom. Client delivery, opt-out, rate limits and uninstrumented/older clients may omit listening. Declared tests, preview, obvious bot/headless and DNT/GPC traffic are excluded. Legacy Analytics Engine milestones are excluded: that separate pipeline is adaptively sampled and retained for three months, so it cannot establish exact lifetime records. No browser identity is stored by listening-v1; distinct listeners, returning audience and retention are unavailable.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=music&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=music&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Music frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "loftwahfm"
  },
  {
    id: "link-check-landscape",
    title: "Link Check frozen report · landscape",
    kind: "image",
    file: "/share/one-more-round/link-check-landscape.png",
    width: 1200,
    height: 630,
    caption:
      "Know where a link will take you.\n24 · Completed Link Checks\n2026-10-12 to 2026-10-18 UTC · Bounded count\nLink Check inspections counted by the owning app after completion; not clicks, deployment checks or unique users.\nReported completed inspections, including repeat jobs. Bounded counters can omit activity. These are not unique people or proof of a composed owner workflow.\nDaily counters stop at 1000 per app/event/surface and shared per-location rate limits may drop events. The first recorded UTC day is 13 October 2026 and is partial; daily counts expire after 35 days. Missing earlier history is unavailable, not zero. Optional publishers can lose events during outages. Marked verification probes are excluded; reloads, unmarked automation and bots can count. No visitor identity, sessions, return rate, private creator activity or vault contents are collected. Today is partial; these are bounded recorded signals, never lifetime totals.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=link-check&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=link-check&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Link Check frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "app-composer"
  },
  {
    id: "link-check-square",
    title: "Link Check frozen report · square",
    kind: "image",
    file: "/share/one-more-round/link-check-square.png",
    width: 1200,
    height: 1200,
    caption:
      "Know where a link will take you.\n24 · Completed Link Checks\n2026-10-12 to 2026-10-18 UTC · Bounded count\nLink Check inspections counted by the owning app after completion; not clicks, deployment checks or unique users.\nReported completed inspections, including repeat jobs. Bounded counters can omit activity. These are not unique people or proof of a composed owner workflow.\nDaily counters stop at 1000 per app/event/surface and shared per-location rate limits may drop events. The first recorded UTC day is 13 October 2026 and is partial; daily counts expire after 35 days. Missing earlier history is unavailable, not zero. Optional publishers can lose events during outages. Marked verification probes are excluded; reloads, unmarked automation and bots can count. No visitor identity, sessions, return rate, private creator activity or vault contents are collected. Today is partial; these are bounded recorded signals, never lifetime totals.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=link-check&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=link-check&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Link Check frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "app-composer"
  },
  {
    id: "link-check-portrait",
    title: "Link Check frozen report · portrait",
    kind: "image",
    file: "/share/one-more-round/link-check-portrait.png",
    width: 1080,
    height: 1920,
    caption:
      "Know where a link will take you.\n24 · Completed Link Checks\n2026-10-12 to 2026-10-18 UTC · Bounded count\nLink Check inspections counted by the owning app after completion; not clicks, deployment checks or unique users.\nReported completed inspections, including repeat jobs. Bounded counters can omit activity. These are not unique people or proof of a composed owner workflow.\nDaily counters stop at 1000 per app/event/surface and shared per-location rate limits may drop events. The first recorded UTC day is 13 October 2026 and is partial; daily counts expire after 35 days. Missing earlier history is unavailable, not zero. Optional publishers can lose events during outages. Marked verification probes are excluded; reloads, unmarked automation and bots can count. No visitor identity, sessions, return rate, private creator activity or vault contents are collected. Today is partial; these are bounded recorded signals, never lifetime totals.\nSnapshot 8496128e32ddfd0bddf8da66\nhttps://woodhouse.loftwah.com/connections/?story=link-check&report=8496128e32ddfd0bddf8da66\n",
    link: "https://woodhouse.loftwah.com/connections/?story=link-check&report=8496128e32ddfd0bddf8da66",
    note: "12–18 October 2026 UTC · frozen observations · qualifications in image",
    alt: "Link Check frozen observation card with its measure, daily chart, source coverage and limitations.",
    project: "app-composer"
  }
];
