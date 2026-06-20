// Client-side export utilities — SVG → PNG and data → CSV.
// No server round-trip; runs entirely in the browser.

/** Serialises an SVG element to a downloadable PNG. */
export async function exportSvgAsPng(svgEl: SVGSVGElement, filename = "export.png"): Promise<void> {
  const { width, height } = svgEl.getBoundingClientRect();
  const svgString = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = window.devicePixelRatio || 2;
      canvas.width  = width  * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#0f1117";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob(pngBlob => {
        if (!pngBlob) { reject(new Error("Canvas export failed")); return; }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
        resolve();
      }, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}

type Row = Record<string, string | number | boolean | null | undefined>;

/** Converts an array of objects to a CSV file and triggers download. */
export function downloadCsv(rows: Row[], filename = "export.csv"): void {
  if (!rows.length) return;

  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csv = [
    keys.join(","),
    ...rows.map(r => keys.map(k => escape(r[k])).join(",")),
  ].join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Convenience: export CityAqi array as CSV. */
export function exportCitiesAqiCsv(
  cities: { name: string; state: string; aqi: number; pm25: number; pm10: number; trend: number }[]
): void {
  downloadCsv(
    cities.map(c => ({
      City: c.name,
      State: c.state,
      AQI: c.aqi,
      "PM2.5 (µg/m³)": c.pm25,
      "PM10 (µg/m³)":  c.pm10,
      "Trend (24h)":   c.trend >= 0 ? `+${c.trend}` : String(c.trend),
      "Exported At":   new Date().toISOString(),
    })),
    `swachh-hawa-aqi-${new Date().toISOString().slice(0, 10)}.csv`
  );
}
