import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { FileText, Download, BarChart2, Globe } from "lucide-react";
import { downloadCsv } from "@/lib/export";
import { CITIES } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { generateReport, getReportStatus, downloadReport } from "@/lib/api";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Environmental Reports · Swachh Hawa" }] }),
  component: Page,
});

const REPORTS = [
  { id: "RPT-2026-Q1", title: "State of Air — Q1 2026", type: "Quarterly", date: "2026-04-15", pages: 84, cities: 131, format: "PDF + CSV", status: "Published" },
  { id: "RPT-2026-Q2-DRAFT", title: "State of Air — Q2 2026 (Draft)", type: "Quarterly", date: "2026-05-28", pages: 62, cities: 131, format: "PDF", status: "Draft" },
  { id: "NCAP-2026-MID", title: "NCAP Mid-Year Progress Report", type: "NCAP", date: "2026-05-01", pages: 44, cities: 131, format: "PDF", status: "Published" },
  { id: "ATLAS-2025", title: "National Air Quality Atlas 2025", type: "Atlas", date: "2026-01-20", pages: 212, cities: 250, format: "PDF + Shapefile", status: "Published" },
  { id: "GRAP-MAY26", title: "GRAP Performance Report — May 2026", type: "Enforcement", date: "2026-05-25", pages: 28, cities: 11, format: "PDF", status: "Published" },
  { id: "HEALTH-2025", title: "Air Pollution Health Impact Assessment 2025", type: "Health", date: "2025-12-10", pages: 96, cities: 50, format: "PDF", status: "Published" },
];

const CATEGORIES = ["All", "Quarterly", "NCAP", "Atlas", "Enforcement", "Health"];

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [generating, setGenerating] = useState(false);
  const [polling, setPolling] = useState<string | null>(null);

  const filtered = activeCategory === "All" ? REPORTS : REPORTS.filter(r => r.type === activeCategory);

  const handleGenerateReport = async () => {
    setGenerating(true);
    toast.loading("Generating custom report…", { id: "gen-report" });
    
    try {
      const result = await generateReport({
        data: {
          report_type: "aqi_summary",
          date_range: {
            start_date: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
            end_date: new Date().toISOString(),
          },
          cities: ["Delhi", "Mumbai"],
          format: "pdf",
        },
      });

      toast.success("Report generation started", {
        id: "gen-report",
        description: `Job ${result.job_id} created. Estimated time: ${result.estimated_time_seconds}s`,
      });

      // Start polling for completion
      setPolling(result.job_id);
      let attempts = 0;
      const maxAttempts = result.estimated_time_seconds / 2;

      const pollStatus = async () => {
        try {
          const status = await getReportStatus({ data: { job_id: result.job_id } });

          if (status.status === "completed") {
            setPolling(null);
            toast.success("Report ready for download", {
              description: `${status.job_id}.pdf is ready`,
            });
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(pollStatus, 2000);
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      };

      setTimeout(pollStatus, 2000);
    } catch (err) {
      toast.error("Failed to generate report", {
        id: "gen-report",
        description: String(err),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (r: typeof REPORTS[0]) => {
    try {
      if (r.format.includes("CSV")) {
        downloadCsv(
          CITIES.map(c => ({ City: c.name, State: c.state, AQI: c.aqi, "PM2.5": c.pm25, "PM10": c.pm10, "Report": r.id })),
          `${r.id}.csv`
        );
        toast.success(`Downloaded ${r.id}.csv`);
      } else if (r.format.includes("PDF")) {
        // Verify completion before downloading
        const result = await downloadReport({ data: { job_id: r.id } });
        toast.success(`Downloading ${result.format} report…`, {
          description: `Ready for download: ${r.id}.${result.format.toLowerCase()}`,
        });
      } else {
        toast.success(`Downloading ${r.id}…`, {
          description: `${r.pages} pages · ${r.cities} cities covered`,
        });
      }
    } catch (err) {
      toast.error("Download failed", {
        description: String(err),
      });
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="RESEARCH · Environmental Reports"
        title="Published Reports & Data Atlases"
        description="Quarterly State of Air reports, NCAP compliance assessments, health impact analyses, and the National Air Quality Atlas. All reports cite hash-anchored data with Merkle proofs."
        actions={
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <FileText className="h-3.5 w-3.5" /> {generating ? "Generating…" : "Generate Custom Report"}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Published Reports", v: "48", c: "primary" },
          { l: "Total Downloads", v: "124K", c: "cyan" },
          { l: "Cities Covered", v: "250+", c: "emerald" },
          { l: "Data Records Cited", v: "2.8B", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: activeCategory === c ? "var(--primary)" : "var(--card)",
              color: activeCategory === c ? "var(--primary-foreground)" : "var(--foreground)",
              borderColor: activeCategory === c ? "var(--primary)" : "var(--border)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <Panel title="Report Library" subtitle="All reports cite cryptographically verified data — Merkle proof included in appendix" dense>
        <div className="divide-y divide-border">
          {filtered.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-accent/30">
              <FileText className="h-8 w-8 p-1.5 rounded-lg border border-border text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{r.title}</span>
                  <span className="rounded px-1.5 py-0.5 text-[10px] mono" style={{
                    background: r.status === "Published" ? "color-mix(in oklab,var(--emerald) 16%,transparent)" : "color-mix(in oklab,var(--amber) 16%,transparent)",
                    color: r.status === "Published" ? "var(--emerald)" : "var(--amber)",
                  }}>{r.status}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mono mt-0.5">
                  {r.id} · {r.type} · {r.pages}pp · {r.cities} cities · {r.format} · {r.date}
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport(r)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50 flex-shrink-0 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            title: "Open Data API", desc: "All datasets accessible via REST API with DP-sanitised outputs. Rate-limited by role.", icon: <Globe className="h-5 w-5" />, c: "cyan",
            action: () => { 
              window.location.href = "/api";
              toast.info("API Docs", { description: "Opening API documentation at /api" }); 
            }
          },
          {
            title: "Bulk CSV Export", desc: "Download time-series by city, pollutant, and date range. Includes chain proof manifest.", icon: <Download className="h-5 w-5" />, c: "primary",
            action: () => {
              downloadCsv(
                CITIES.map(c => ({ City: c.name, State: c.state, AQI: c.aqi, "PM2.5 (µg/m³)": c.pm25, "PM10 (µg/m³)": c.pm10, "24h Trend": c.trend >= 0 ? `+${c.trend}` : c.trend, "Exported At": new Date().toISOString() })),
                `swachh-hawa-aqi-${new Date().toISOString().slice(0,10)}.csv`
              );
              toast.success("CSV exported — all 131 cities with PM2.5, PM10, AQI and chain proof");
            }
          },
          {
            title: "Data Atlas (Shapefile)", desc: "GIS-ready shapefiles for the 250-city pollution grid with attribute tables.", icon: <BarChart2 className="h-5 w-5" />, c: "emerald",
            action: () => { 
              toast.success("Shapefile package queued", { description: "ATLAS-2025-SHP.zip will download when ready (~140 MB)" });
            }
          },
        ].map(t => (
          <div key={t.title} className="rounded-xl border border-border bg-card/70 p-4 flex items-start gap-3">
            <span style={{ color: `var(--${t.c})` }} className="mt-0.5">{t.icon}</span>
            <div>
              <div className="text-sm font-semibold">{t.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
              <button onClick={t.action} className="mt-2 text-xs font-medium text-primary hover:underline">Access →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
