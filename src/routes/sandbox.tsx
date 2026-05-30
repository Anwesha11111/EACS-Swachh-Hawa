import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Download, Play, Database, Code2, FileText } from "lucide-react";

export const Route = createFileRoute("/sandbox")({
  head: () => ({ meta: [{ title: "Research Sandbox · Swachh Hawa" }] }),
  component: Page,
});

const DATASETS = [
  { name: "national-aqi-2010-2025.parquet", rows: "1.2B", size: "48 GB", lic: "CC-BY-4.0" },
  { name: "delhi-sensor-mesh-hourly.csv",  rows: "84M",  size: "6.2 GB", lic: "ODbL" },
  { name: "satellite-firms-modis.geojson", rows: "9.4M", size: "1.8 GB", lic: "NASA-OPEN" },
  { name: "industrial-emissions-cems.json",rows: "210M", size: "12 GB",  lic: "CPCB-OD" },
];

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="RESEARCH · Open Data"
        title="Open Data Sandbox & Research APIs"
        description="Jupyter-style analytics workspace, SQL playground, dataset explorer and signed research APIs."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title="SQL Playground" dense actions={<button className="flex items-center gap-1 rounded bg-primary px-2 py-1 text-[11px] text-primary-foreground"><Play className="h-3 w-3" /> Run</button>}>
          <pre className="mono overflow-x-auto p-4 text-[12px] leading-relaxed text-foreground/90">{`-- AVG PM2.5 by state, last 24h
SELECT state,
       AVG(pm25) AS avg_pm25,
       PERCENTILE_CONT(pm25, 0.95) AS p95_pm25
FROM   national_aqi
WHERE  ts > NOW() - INTERVAL '24 hours'
GROUP  BY state
ORDER  BY avg_pm25 DESC
LIMIT  10;`}</pre>
          <div className="border-t border-border bg-background/50 p-3 text-xs">
            <div className="mono text-[10px] uppercase text-muted-foreground">Result · 10 rows · 142ms</div>
            <table className="mt-2 w-full">
              <thead className="text-[10px] mono uppercase text-muted-foreground"><tr><th className="text-left py-1">state</th><th className="text-left">avg_pm25</th><th className="text-left">p95_pm25</th></tr></thead>
              <tbody className="mono">
                {[["Delhi",218,312],["Bihar",198,288],["UP",182,266],["Punjab",172,260],["Haryana",165,240]].map(([s,a,p]) => (
                  <tr key={s as string} className="border-t border-border/40"><td className="py-1">{s}</td><td>{a}</td><td>{p}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Datasets" dense>
            <ul className="divide-y divide-border/60 text-xs">
              {DATASETS.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-2 px-4 py-2">
                  <div className="min-w-0">
                    <div className="truncate mono">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground mono">{d.rows} · {d.size} · {d.lic}</div>
                  </div>
                  <button className="rounded border border-border p-1.5 hover:bg-accent"><Download className="h-3 w-3" /></button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="API Endpoints" dense>
            <ul className="divide-y divide-border/60 mono text-[11px]">
              {["GET /v1/aqi/{city}","GET /v1/forecast/{city}","GET /v1/sensors/{id}","POST /v1/complaints","WS  /v1/stream/telemetry"].map((e) => (
                <li key={e} className="px-4 py-2"><Code2 className="inline h-3 w-3 mr-1.5 text-primary" />{e}</li>
              ))}
            </ul>
          </Panel>
          <Panel title="Reports">
            <ul className="space-y-2 text-xs">
              {["National AQI Q3-2026","Stubble-Burning Atlas","Smart City Index","Health-Pollution Correlation"].map((r) => (
                <li key={r} className="flex items-center justify-between"><span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-primary" />{r}</span><Download className="h-3.5 w-3.5 text-muted-foreground" /></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

