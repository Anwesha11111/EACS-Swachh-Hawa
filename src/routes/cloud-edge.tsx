import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Cloud, Server, Zap, Database } from "lucide-react";

export const Route = createFileRoute("/cloud-edge")({
  head: () => ({ meta: [{ title: "Cloud-Edge Network · Swachh Hawa" }] }),
  component: Page,
});

const LATENCY_BREAKDOWN = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  edge_local: parseFloat((8 + Math.random() * 3).toFixed(1)),
  edge_cloud: parseFloat((28 + Math.random() * 8).toFixed(1)),
  cloud_api: parseFloat((92 + Math.random() * 24).toFixed(1)),
}));

const CLOUD_REGIONS = [
  { region: "ap-south-1 (Mumbai)", role: "Primary", services: "Ingestion, ML, API GW", rps: 4821, latency: "18ms", status: "healthy" },
  { region: "ap-southeast-1 (Singapore)", role: "DR Replica", services: "Backup ingestion, Audit store", rps: 120, latency: "62ms", status: "healthy" },
  { region: "Edge Delhi", role: "Edge Tier", services: "Local inference, 72h buffer", rps: 2100, latency: "8ms", status: "healthy" },
  { region: "Edge Kolkata", role: "Edge Tier", services: "Local inference, 72h buffer", rps: 980, latency: "9ms", status: "healthy" },
];

const PIPELINE_STAGES = [
  { stage: "Sensor", latency: 0, desc: "Hardware measurement" },
  { stage: "LoRa Hop", latency: 12, desc: "Mesh relay backhaul" },
  { stage: "Edge Node", latency: 8, desc: "Local inference + validation" },
  { stage: "Cloud Ingest", latency: 28, desc: "Kafka + stream processing" },
  { stage: "Trust Engine", latency: 6, desc: "Hash-chain + trust score" },
  { stage: "API GW", latency: 4, desc: "REST / WebSocket publish" },
];

const THROUGHPUT = Array.from({ length: 12 }, (_, i) => ({
  h: `${String(i * 2).padStart(2, "0")}:00`,
  ingest: 380 + Math.round(80 * Math.sin(i / 3) + Math.random() * 40),
  processed: 370 + Math.round(78 * Math.sin(i / 3) + Math.random() * 38),
}));

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="INFRA · Cloud-Edge"
        title="Hybrid Cloud-Edge Architecture"
        description="Three-tier compute: sensor → LoRa-Mesh → edge node (Jetson/RPi5) → cloud ingest (AWS ap-south-1) → API gateway. Edge tier delivers sub-10ms local response; cloud handles ML training and cross-city analytics."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Edge Nodes Active", v: "46", c: "primary", icon: <Server className="h-4 w-4" /> },
          { l: "Cloud Ingest RPS", v: "8,421", c: "cyan", icon: <Cloud className="h-4 w-4" /> },
          { l: "E2E Latency p50", v: "58ms", c: "emerald", icon: <Zap className="h-4 w-4" /> },
          { l: "Data In-flight", v: "1.2 TB/day", c: "amber", icon: <Database className="h-4 w-4" /> },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4 flex items-start gap-3">
            <span style={{ color: `var(--${s.c})` }} className="mt-0.5">{s.icon}</span>
            <div>
              <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
              <div className="mono text-2xl font-semibold mt-0.5" style={{ color: `var(--${s.c})` }}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline latency waterfall */}
      <Panel title="End-to-End Pipeline Latency Breakdown" subtitle="Cumulative latency from sensor measurement to API publish">
        <div className="flex items-end gap-3 flex-wrap mt-2">
          {PIPELINE_STAGES.map((s, i) => {
            const total = PIPELINE_STAGES.slice(0, i + 1).reduce((acc, x) => acc + x.latency, 0);
            return (
              <div key={s.stage} className="flex flex-col items-center gap-1 flex-1 min-w-[80px]">
                <div className="text-[10px] mono text-muted-foreground">{total > 0 ? `+${s.latency}ms` : "—"}</div>
                <div className="w-full rounded-t-lg" style={{
                  height: Math.max(12, s.latency * 2.5),
                  background: s.latency > 20 ? "var(--amber)" : s.latency > 10 ? "var(--chart-1)" : "var(--emerald)",
                }} />
                <div className="text-[10px] font-semibold text-center">{s.stage}</div>
                <div className="text-[9px] text-muted-foreground text-center leading-tight">{s.desc}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Total e2e p50: <span className="mono font-bold text-foreground">58ms</span> — well within 250ms target for real-time alerting.
        </div>
      </Panel>

      <Panel title="Cloud Region & Edge Tier Registry" subtitle="Availability, request rate, and health per deployment tier" dense>
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            <tr className="border-b border-border">
              {["Region/Tier","Role","Services","RPS","Latency","Health"].map(h => (
                <th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CLOUD_REGIONS.map(r => (
              <tr key={r.region} className="border-b border-border/40 hover:bg-accent/40">
                <td className="px-4 py-2.5 mono text-primary font-semibold whitespace-nowrap">{r.region}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.role}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.services}</td>
                <td className="px-4 py-2.5 mono">{r.rps.toLocaleString()}</td>
                <td className="px-4 py-2.5 mono text-[var(--emerald)]">{r.latency}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">
                    {r.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Latency by Tier — 24h" subtitle="Edge local vs edge-cloud vs cloud API p50">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={LATENCY_BREAKDOWN} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} unit="ms" />
                <Tooltip formatter={(v: number) => [`${v}ms`]} />
                <Line type="monotone" dataKey="edge_local" stroke="var(--emerald)" strokeWidth={2} dot={false} name="Edge local" />
                <Line type="monotone" dataKey="edge_cloud" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Edge→Cloud" />
                <Line type="monotone" dataKey="cloud_api" stroke="var(--amber)" strokeWidth={2} dot={false} name="Cloud API" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Ingest vs Processed Throughput" subtitle="Packets/min · gap = processing backlog (should be < 2%)">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={THROUGHPUT} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={2} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="ingest" stroke="var(--cyan)" strokeWidth={2} dot={false} name="Ingested" />
                <Line type="monotone" dataKey="processed" stroke="var(--primary)" strokeWidth={2} dot={false} name="Processed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
