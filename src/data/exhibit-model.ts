/**
 * The patch bench, explained as the state machine it actually is.
 *
 * The observed failure this prevents: a working exhibit that people can use but
 * cannot follow, so "the music stops but the run keeps going" stays a claim in
 * prose instead of a mechanism you can step through.
 *
 * Every step cites a string that still exists in the implementation. The drift
 * check in `exhibit-model.test.ts` reads those files and fails when an anchor
 * disappears, which marks the explanation stale instead of letting it drift.
 */

type ExhibitState = {
  /** What the game and its effects are doing. */
  run: string;
  /** What the music transport is doing, and who owns it. */
  music: string;
};

export type ExhibitStep = {
  id: string;
  /** The visitor's action or the condition, in their words. */
  action: string;
  /** What actually happens. */
  result: string;
  /** Why it happens, in terms of ownership. */
  because: string;
  state: ExhibitState;
  source: { path: string; anchor: string; note: string };
};

const CODE = "src/scripts/exhibits/patch-bench.ts";

/**
 * The reviewed source and date the walkthrough describes. A later behavioural
 * change must update this note and re-run the drift fixture; the date is not a
 * substitute for the check.
 */
export const exhibitReview = {
  reviewedAt: "2026-10-23",
  sourceRevision: "361aae0fbfe3498feab758c4ab17b34dd55e8b57",
  sourceUrl:
    "https://github.com/loftwah/woodhouse-new/blob/361aae0fbfe3498feab758c4ab17b34dd55e8b57/src/scripts/exhibits/patch-bench.ts",
  contract:
    "Reconnect restores the audio link only. The run keeps advancing independently, and a deliberate Play starts the soundtrack again."
} as const;

export const exhibitSteps: ExhibitStep[] = [
  {
    id: "waiting",
    action: "You arrive",
    result: "The bench is dark. The run has not started, and nothing is playing.",
    because:
      "A run that advances while nobody is playing has already ended before you have read the copy. The bench says it is waiting instead.",
    state: {
      run: "Waiting for your first deliberate move",
      music: "Off. No audio context has been created."
    },
    source: { path: CODE, anchor: "private waiting = true;", note: "the waiting flag" }
  },
  {
    id: "run",
    action: "You make a move",
    result: "The run starts scoring and its sound effects fire from oscillators on the page.",
    because:
      "The game owns the world and the effects. Both come from one audio manager the game already had, so the effects cost nothing extra to hide or lose.",
    state: {
      run: "Playing, and keeping its own score",
      music: "Off. The music bus exists but carries nothing."
    },
    source: {
      path: CODE,
      anchor: "const musicBus = context.createGain();",
      note: "the separate music bus"
    }
  },
  {
    id: "connect",
    action: "You connect a station",
    result:
      "The page asks LoftwahFM's versioned client for a public station. The message changes to “Preparing the station…” and then “Starting the stream…”.",
    because:
      "Music arrives over a network from a different origin, so it is prepared by the owner that publishes it. The page never starts a second audio engine to do it.",
    state: {
      run: "Playing, unaffected",
      music: "Preparing, then streaming from the station's origin"
    },
    source: { path: CODE, anchor: "Preparing the station…", note: "the preparation message" }
  },
  {
    id: "playing",
    action: "The stream starts",
    result: "The soundtrack plays under the run. Clipping a gate lowers the music for a moment.",
    because:
      "Ducking moves one gain on the music bus. It does not pause, restart or resume the stream, which is why a bass hit never restarts the song.",
    state: {
      run: "Playing",
      music: "Playing, temporarily ducked by the run"
    },
    source: { path: CODE, anchor: "Starting the stream…", note: "the start message" }
  },
  {
    id: "disconnect",
    action: "You pull the music out",
    result:
      "“The link is open. The soundtrack is stopped; the run continues.” The score keeps moving and the effects keep firing.",
    because:
      "The link is one connection. Removing it stops the bus the page owns and leaves the game's bus alone, so nothing else has to compensate.",
    state: {
      run: "Playing, with its own effects",
      music: "Stopped, with the link open"
    },
    source: {
      path: CODE,
      anchor: "The link is open. The soundtrack is stopped; the run continues.",
      note: "the disconnect message"
    }
  },
  {
    id: "reconnect",
    action: "You reconnect it",
    result:
      "“Music link restored. The run kept going; press Play to start the soundtrack.” The link is back, but the music is not playing yet.",
    because:
      "The page kept its transport; reconnecting restores the connection, not the playback. The run advanced while the music was disconnected, so its score is not where you left it. Play is a separate, deliberate action.",
    state: {
      run: "Playing, advanced since the disconnect",
      music: "Link restored; ready for a deliberate Play"
    },
    source: {
      path: CODE,
      anchor: "Music link restored. The run kept going; press Play to start the soundtrack.",
      note: "the reconnect message"
    }
  },
  {
    id: "failure",
    action: "A station fails to prepare",
    result:
      "“That station could not be prepared. The run keeps working.” Choosing another station retries; nothing else on the bench stops.",
    because:
      "A failed stream is a failure of one optional owner. The exhibit reports it where the music control lives and leaves the game and its effects running.",
    state: {
      run: "Playing",
      music: "Unavailable, and reported as unavailable"
    },
    source: {
      path: CODE,
      anchor: "That station could not be prepared. The run keeps working.",
      note: "the failure message"
    }
  }
];

export type DriftCheck = {
  path: string;
  anchor: string;
  note: string;
};

/** Every implementation string this explanation depends on. */
export const exhibitAnchors: DriftCheck[] = exhibitSteps.map((step) => step.source);
