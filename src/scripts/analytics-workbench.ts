import * as echarts from "echarts/core";
import { LineChart, BarChart, type LineSeriesOption, type BarSeriesOption } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  AriaComponent,
  type GridComponentOption,
  type TooltipComponentOption,
  type LegendComponentOption,
  type DataZoomComponentOption
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
type ChartOption = echarts.ComposeOption<
  | LineSeriesOption
  | BarSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | DataZoomComponentOption
>;
echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  AriaComponent,
  SVGRenderer
]);
type ChartData = {
  period: { from: string; to: string; days: number };
  measure: string;
  unit: string;
  overview?: boolean;
  series: {
    name: string;
    colour: string;
    statuses: string[];
    values: (number | null)[];
    measure?: string;
    unit?: string;
  }[];
  createdAt: string | null;
};
const payload = document.querySelector("#activity-chart-data");
const target = document.querySelector<HTMLElement>("[data-activity-chart]");
// The mixed overview has no single-measure chart, but it still owns the same
// daily values and CSV export. Binding export only inside the chart branch is how
// the overview download became a dead button.
if (payload) {
  const data = JSON.parse(payload.textContent ?? "{}") as ChartData;
  const dates = Array.from({ length: data.period.days }, (_, i) =>
    new Date(Date.parse(data.period.from) + i * 86400000).toISOString().slice(0, 10)
  );
  const dateInput = document.querySelector<HTMLInputElement>("[data-inspect-day]");
  const output = document.querySelector<HTMLOutputElement>("[data-day-output]");
  const inspect = (index: number) => {
    const day = dates[index];
    if (!day || !output) return;
    output.textContent = `${day} UTC · ${data.series.map((s) => `${s.name}: ${s.values[index] === null ? "not measured" : (s.values[index]?.toLocaleString("en-AU") ?? "not measured")}${s.values[index] !== null && data.unit === "seconds" ? " seconds" : ""} (${s.statuses[index]})`).join(" · ")}`;
  };
  if (target) {
    document.querySelector<HTMLElement>("[data-day-inspector]")!.hidden = false;
    dateInput?.addEventListener("input", () => inspect(Number(dateInput.value)));
    inspect(data.period.days - 1);
  }
  if (target && data.series.some((s) => s.values.some((v) => v !== null))) {
    try {
      const chart = echarts.init(target, undefined, { renderer: "svg" });
      const mobile = () => target.clientWidth < 560;
      const build = (type: "line" | "bar"): ChartOption => ({
        animation: !matchMedia("(prefers-reduced-motion: reduce)").matches,
        animationDuration: 250,
        color: data.series.map((s) => s.colour),
        backgroundColor: "transparent",
        textStyle: { fontFamily: "system-ui, sans-serif", color: "#b4c0d2" },
        aria: {
          enabled: true,
          label: {
            description: `${data.measure} per UTC day, ${data.period.from} to ${data.period.to}. Missing days are gaps. The chart data table contains every value.`
          },
          decal: { show: true }
        },
        grid: { top: 24, left: mobile() ? 48 : 60, right: mobile() ? 18 : 28, bottom: 85 },
        tooltip: {
          trigger: "axis",
          renderMode: "richText",
          confine: true,
          backgroundColor: "#111e31",
          borderColor: "#425571",
          textStyle: { color: "#f4f7fd", fontSize: 12 },
          axisPointer: { type: "cross", lineStyle: { color: "#8ba2bf", type: "dashed" } },
          valueFormatter: (value) =>
            value === null || value === undefined
              ? "Not measured"
              : `${Number(value).toLocaleString("en-AU")}${data.unit === "seconds" ? " seconds" : ""}`
        },
        legend: {
          show: false,
          selected: Object.fromEntries(
            [...document.querySelectorAll<HTMLButtonElement>("[data-series-toggle]")].map((b) => [
              b.dataset.seriesToggle!,
              b.getAttribute("aria-pressed") !== "false"
            ])
          )
        },
        xAxis: {
          type: "category",
          data: dates,
          boundaryGap: type === "bar",
          axisLine: { lineStyle: { color: "#35435a" } },
          axisTick: { show: false },
          axisLabel: {
            color: "#a9b8d0",
            fontSize: 11,
            hideOverlap: true,
            formatter: (value: string) =>
              new Date(value).toLocaleDateString("en-AU", {
                timeZone: "UTC",
                day: "numeric",
                month: "short"
              })
          }
        },
        yAxis: {
          type: "value",
          min: 0,
          minInterval: 1,
          splitNumber: 4,
          axisLabel: {
            color: "#a9b8d0",
            fontSize: 11,
            formatter: (value: number) =>
              value >= 1000 ? `${Math.round(value / 100) / 10}k` : String(value)
          },
          splitLine: { lineStyle: { color: "#263349" } },
          axisPointer: { label: { precision: 0 } }
        },
        dataZoom: [
          {
            type: "slider",
            bottom: 17,
            height: 25,
            start: 0,
            end: 100,
            showDetail: false,
            borderColor: "#2d4058",
            backgroundColor: "#0e1b2d",
            fillerColor: "rgba(121,216,255,.12)",
            dataBackground: { lineStyle: { color: "#417fa8" }, areaStyle: { color: "#1b354d" } },
            selectedDataBackground: {
              lineStyle: { color: "#79d8ff" },
              areaStyle: { color: "#274766" }
            },
            handleStyle: { color: "#7c9bb7", borderColor: "#7c9bb7" },
            moveHandleSize: 0,
            brushSelect: false
          },
          {
            type: "inside",
            zoomOnMouseWheel: false,
            moveOnMouseWheel: false,
            preventDefaultMouseMove: false
          }
        ],
        series: data.series.map((s) => ({
          name: s.name,
          type,
          data: s.values,
          connectNulls: false,
          smooth: false,
          showSymbol: data.period.days < 45,
          symbolSize: 5,
          lineStyle: { width: 2 },
          itemStyle: { color: s.colour },
          emphasis: { focus: "series" },
          barMaxWidth: 20
        }))
      });
      chart.setOption(build("line"));
      document.querySelectorAll<HTMLButtonElement>("[data-series-toggle]").forEach((button) => {
        button.disabled = false;
        button.addEventListener("click", () => {
          const pressed = button.getAttribute("aria-pressed") !== "false";
          button.setAttribute("aria-pressed", String(!pressed));
          chart.dispatchAction({ type: "legendToggleSelect", name: button.dataset.seriesToggle });
        });
      });
      // ECharts clears the host; the HTML table remains the permanent fallback.
      target.classList.add("is-enhanced");
      document.querySelector<HTMLElement>("[data-chart-controls]")!.hidden = false;
      const reset = document.querySelector<HTMLButtonElement>("[data-reset-zoom]")!;
      reset.hidden = false;
      reset.addEventListener("click", () =>
        chart.dispatchAction({ type: "dataZoom", start: 0, end: 100 })
      );
      document.querySelectorAll<HTMLButtonElement>("[data-chart-type]").forEach((button) =>
        button.addEventListener("click", () => {
          document
            .querySelectorAll("[data-chart-type]")
            .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
          chart.setOption(build(button.dataset.chartType as "line" | "bar"), { notMerge: true });
        })
      );
      chart.on("updateAxisPointer", (event: unknown) => {
        const info = event as { axesInfo?: { value?: number | string }[] };
        const value = info.axesInfo?.[0]?.value;
        const index = typeof value === "number" ? value : dates.indexOf(String(value));
        if (index >= 0) {
          if (dateInput) dateInput.value = String(index);
          inspect(index);
        }
      });
      new ResizeObserver(() => chart.resize()).observe(target);
      const help = document.querySelector("[data-chart-help]");
      if (help)
        help.textContent =
          "Hover or tap a date. Drag the lower brush to zoom; use the day slider for keyboard inspection.";
    } catch {
      const help = document.querySelector("[data-chart-help]");
      if (help)
        help.textContent =
          "Interactive chart unavailable. Use the chart data table to inspect every value.";
    }
  }
  const csvButton = document.querySelector<HTMLButtonElement>("[data-csv-download]");
  if (csvButton) {
    csvButton.hidden = false;
    csvButton.addEventListener("click", () => {
      const cell = (value: string) =>
        `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replace(/"/g, '""')}"`;
      const rows = [
        [
          "Woodhouse frozen chart data",
          `${data.period.from} to ${data.period.to} UTC`,
          `Captured ${data.createdAt ?? "unavailable"}`
        ],
        [
          data.overview
            ? "Reported activity, not unique people. Each project uses its own relevant measure and unit; values are not added together. Empty values mean unavailable. Coverage accompanies each value."
            : "Reported activity, not unique people. Empty values mean unavailable. Coverage accompanies each value."
        ],
        [
          "UTC date",
          ...data.series.flatMap((s) => [
            data.overview
              ? `${s.name} · ${s.measure ?? data.measure} (${s.unit ?? data.unit})`
              : `${s.name} · ${data.measure} (${data.unit})`,
            `${s.name} coverage`
          ])
        ],
        ...dates.map((d, i) => [
          d,
          ...data.series.flatMap((s) => [
            s.values[i] === null ? "" : String(s.values[i] ?? ""),
            s.statuses[i] ?? "missing"
          ])
        ])
      ];
      const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `woodhouse-${data.period.from}-${data.period.to}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
}
const dateForm = document.querySelector<HTMLFormElement>("[data-date-form]");
if (dateForm) {
  const from = dateForm.elements.namedItem("from") as HTMLInputElement;
  const to = dateForm.elements.namedItem("to") as HTMLInputElement;
  dateForm.addEventListener("submit", (event) => {
    to.setCustomValidity("");
    const days = (Date.parse(to.value) - Date.parse(from.value)) / 86400000 + 1;
    if (days < 1 || days > 90) {
      event.preventDefault();
      to.setCustomValidity(
        days < 1
          ? "The end date must be on or after the start date."
          : "Choose a window of 90 days or fewer."
      );
      to.reportValidity();
    }
  });
  for (const input of [from, to]) input.addEventListener("input", () => to.setCustomValidity(""));
}
const sharePayload = document.querySelector("#report-sharing");
if (sharePayload) {
  const { image, caption } = JSON.parse(sharePayload.textContent ?? "{}");
  const status = document.querySelector<HTMLElement>("[data-report-status]");
  // A later user action owns feedback. Image preparation can finish after copy.
  let feedback = 0;
  // A missing preview is reported as a missing image, not left as a broken
  // frame inside the share panel. The downloads and the caption still work.
  const preview = document.querySelector<HTMLImageElement>("[data-report-preview]");
  preview?.addEventListener("error", () => {
    preview.hidden = true;
    if (status && feedback === 0)
      status.textContent = "The shared image preview is unavailable. Try a PNG download.";
  });
  document.querySelector("[data-report-copy]")?.addEventListener("click", async () => {
    const owner = ++feedback;
    if (status) status.textContent = "Copying caption and report link…";
    try {
      await navigator.clipboard.writeText(caption);
      if (status && owner === feedback) status.textContent = "Caption and report link copied.";
    } catch {
      if (status && owner === feedback)
        status.textContent = "Copy unavailable. Open the frozen permalink and share its address.";
    }
  });
  const button = document.querySelector<HTMLButtonElement>("[data-report-share]");
  let file: File | null = null;
  // Request identity: a later request owns the result, so a slow earlier
  // preparation cannot publish a stale file over a newer one.
  let request = 0;
  const panel = document.querySelector<HTMLDetailsElement>("[data-share-panel]");
  const prepare = async () => {
    if (!panel?.open || !button || !navigator.canShare || !navigator.share) return;
    const id = ++request;
    const owner = feedback;
    file = null;
    button.hidden = true;
    button.dataset.state = "preparing";
    if (status) status.textContent = "Preparing the report image…";
    try {
      const response = await fetch(image, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw Error("image unavailable");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw Error("image unavailable");
      const prepared = new File([blob], "woodhouse-report.png", { type: "image/png" });
      if (id !== request) return;
      file = prepared;
      if (navigator.canShare({ files: [prepared] })) {
        button.hidden = false;
        button.dataset.state = "ready";
        if (status && owner === feedback)
          status.textContent = "The report image is ready to share.";
      } else if (status && owner === feedback) {
        status.textContent = "This device cannot share the image directly. Use a PNG download.";
      }
    } catch {
      if (id !== request) return;
      button.hidden = true;
      delete button.dataset.state;
      if (status && owner === feedback)
        status.textContent = "Image preview unavailable. Try a PNG download.";
    }
  };
  panel?.addEventListener("toggle", () => {
    if (!panel.open) {
      request += 1;
      file = null;
      return;
    }
    void prepare();
  });
  button?.addEventListener("click", async () => {
    if (!file) return;
    const owner = ++feedback;
    if (status) status.textContent = "Opening your device's share options…";
    try {
      await navigator.share({ files: [file], text: caption });
      if (status && owner === feedback)
        status.textContent = "Handed to your device's share options.";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        if (status && owner === feedback)
          status.textContent = "Sharing cancelled. The report image is still ready.";
        return;
      }
      if (status && owner === feedback)
        status.textContent = "Image sharing unavailable. Use a PNG download.";
    }
  });
}
