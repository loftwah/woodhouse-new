/**
 * Host-side wording for the embedded LoftwahFM player. The host cannot hear the
 * frame, so it reports only what it can observe: the frame navigation, whether
 * the station host answered, and its own deadline. A loaded player is never
 * described as playing audio.
 */
export type FmPlayerStage = "closed" | "loading" | "checking" | "ready" | "slow" | "failed";

export function fmPlayerStatus(stage: FmPlayerStage, station: string): string {
  const name = station.trim() || "the station";
  if (stage === "loading") return `Loading ${name}…`;
  if (stage === "checking") return `The player frame loaded. Checking ${name}…`;
  if (stage === "ready")
    return `The ${name} player is loaded. Press Play inside it to start the station.`;
  if (stage === "slow")
    return `The ${name} player has not appeared yet. It may still be loading. Try again, or open the station on FM.`;
  if (stage === "failed")
    return `The ${name} player could not be loaded. Try again, or open the station on FM.`;
  return "The player loads when this panel opens.";
}
