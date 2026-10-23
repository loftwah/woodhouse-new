/** Public analytics presentation: navigation and gap-preserving daily geometry. */
export function workbenchView(params: URLSearchParams) {
  const view = params.get("view");
  return view && ["data", "share", "stories", "notes"].includes(view) ? view : "chart";
}

export function viewForFragment(hash: string, pathname = "/activity/"): string | null {
  if (pathname !== "/activity/") return null;
  if (hash === "#share-report") return "share";
  if (
    /^#(source-|sources-heading|coverage-heading|returns-heading|history-heading|mode-split-heading|weekly-heading|discovery-heading|discovery-story-inline-heading)/.test(
      hash
    )
  )
    return "notes";
  if (hash === "#discovery-story" || hash === "#week-focus") return "chart";
  return null;
}

export function trendGeometry(values: readonly (number | null)[]) {
  const maximum = Math.max(0, ...values.filter((value): value is number => value !== null));
  const points: { x: number; y: number }[] = [];
  let connected = false;
  let path = "";
  values.forEach((value, index) => {
    if (value === null) {
      connected = false;
      return;
    }
    const x = values.length > 1 ? (index / (values.length - 1)) * 156 + 2 : 80;
    const y = 37 - (maximum > 0 ? (value / maximum) * 33 : 0);
    points.push({ x, y });
    path += `${connected ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)} `;
    connected = true;
  });
  return { path, points, maximum };
}
