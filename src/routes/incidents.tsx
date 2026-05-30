import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { INCIDENTS } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { AlertOctagon, Search, Filter, Download, ArrowRight, FileText, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/incidents")({
  head: () => ({ meta: [{ title: "Enforcement · Swachh Hawa" }] }),
  component: Page,
});

const PIPELINE_STEPS = [
  { step: 1, label: "Sense", color: "var(--chart-1)" },
  { step: 2, label: "Validate", color: "var(--cyan)" },
  { step: 3, label: "Breach", color: "var(--amber)" },
  { step: 4, label: "Attribute", color: "var(--rose)" },
  { step: 5, label: "Dossier", color: "var(--primary)" },
  { step: 6, label: "Dispatch", color: "var(--chart-2)" },
  { step: 7, label: "Resolve", color: "var(--emerald)" },
];

const RESOLUTION_TREND = Array.from({ length: 14 }, (_, i) => ({
  day: `${16 + i} May`,
  open: 20 + Math.round(10 * Math.sin(i / 3) + Math.random() * 5),
  resolved: 80 + Math.round(15 * Math.sin(i / 3 + 1) + Math.random() * 8),
}));

const BY_TYPE = [
  { type: "Industrial", count: 34, c: "var(--rose)" },
  { type: "Construction", count: 28, c: "var(--amber)" },
  { type: "Biomass", count: 22, c: "var(--chart-1)" },
  { type: "Vehicles", count: 19, c: "var(--cyan)" },
  { type: "Fire/Smoke", count: 15, c: "var(--chart-2)" },
];

function Page() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--rose)]/40 bg-[var(--rose)]/8 px-4 py-3 flex items-center gap-3">
        <AlertOctagon className="h-5 w-5 text-[var(--rose)]" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-[var(--rose)]">EMERGENCY MODE · 3 critical incidents active in Delhi-NCR</div>
          <div className="text-xs text-muted-foreground mono">CPCB-NCRPB joint enforcement window · GRAP Stage III in effect</div>
        </div>
        <button className="rounded bg-[var(--rose)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">Activate Strike Teams</button>
      </div>

      <PageHeader
        eyebrow="OPS · Enforcement Console"
        title="Incident & Enforcement Dashboard"
        description="Auto-generated cases from the 7-step breach-to-enforcement pipeline. Every case is hash-chain bound to its originating sensor. Evidence is cryptographically sealed before officer dispatch."
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
              <FileText className="h-3.5 w-3.5" /> New Manual Case
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Open Cases", v: 28, c: "rose" },
          { l: "Investigating", v: 14, c: "amber" },
          { l: "Resolved 24h", v: 92, c: "emerald" },
          { l: "Compliance Rate", v: "87%", c: "primary" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-3xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* 7-step pipeline mini strip */}
      <Panel title="Breach-to-Enforcement Pipeline" subtitle="Every case flows through all 7 steps — traceable from raw sensor hash to published outcome">
        <div className="flex items-center gap-1 flex-wrap">
          {PIPELINE_STEPS.map((s, idx) => (
            <div key={s.step} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-2">
                <span className="mono text-[10px] font-bold" style={{ color: s.color }}>{s.step}</span>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              {idx < PIPELINE_STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>
      </Panel>

      {/* Incident table */}
      <Panel dense>
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2 rounded border border-border bg-background/50 px-2 py-1 text-xs flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search incidents by ID, city, type…" className="w-full bg-transparent outline-none" />
          </div>
          <button className="flex items-center gap-1 rounded border border-border bg-background/50 px-2 py-1 text-xs"><Filter className="h-3.5 w-3.5" /> Filter</button>
          <button className="flex items-center gap-1 rounded border border-border bg-background/50 px-2 py-1 text-xs"><Download className="h-3.5 w-3.5" /> Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Case ID","City","Type","Severity","Pipeline Stage","Officer","Reported","Evidence"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INCIDENTS.map((i) => (
                <tr key={i.id} className="border-b border-border/40 hover:bg-accent/40 cursor-pointer">
                  <td className="px-4 py-2.5 mono text-primary font-semibold">{i.id}</td>
                  <td className="px-4 py-2.5">{i.city}</td>
                  <td className="px-4 py-2.5">{i.type}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded px-2 py-0.5 text-[10px] mono font-bold"
                          style={{
                            background: i.severity === "Critical" ? "color-mix(in oklab, var(--rose) 18%, transparent)"
                                      : i.severity === "High"     ? "color-mix(in oklab, var(--amber) 18%, transparent)"
                                      : "color-mix(in oklab, var(--cyan) 18%, transparent)",
                            color:      i.severity === "Critical" ? "var(--rose)"
                                      : i.severity === "High"     ? "var(--amber)"
                                      : "var(--cyan)",
                          }}>{i.severity.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono" style={{
                      background: i.status === "Resolved" ? "color-mix(in oklab,var(--emerald) 16%,transparent)"
                        : i.status === "Investigating" ? "color-mix(in oklab,var(--amber) 16%,transparent)"
                        : "color-mix(in oklab,var(--rose) 16%,transparent)",
                      color: i.status === "Resolved" ? "var(--emerald)" : i.status === "Investigating" ? "var(--amber)" : "var(--rose)",
                    }}>{i.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{i.officer}</td>
                  <td className="px-4 py-2.5 mono text-muted-foreground text-[10px]">{i.ts}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1 text-[var(--emerald)]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="mono text-[10px]">Sealed</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Trend + breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Open vs. Resolved Trend — 14 Days" subtitle="Daily case load across the national grid">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RESOLUTION_TREND} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={2} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="resolved" stroke="var(--emerald)" strokeWidth={2} dot={{ r: 2 }} name="Resolved" />
                <Line type="monotone" dataKey="open" stroke="var(--rose)" strokeWidth={2} dot={{ r: 2 }} name="Open" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Cases by Pollution Type — Last 30d" subtitle="Industrial emission most common enforcement category">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BY_TYPE} layout="vertical" margin={{ left: 80, right: 40 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v, "cases"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {BY_TYPE.map((d, i) => <Cell key={i} fill={d.c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}

