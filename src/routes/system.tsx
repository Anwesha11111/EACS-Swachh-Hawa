import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { Server, Database, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/system")({
  head: () => ({ meta: [{ title: "System Health · Swachh Hawa" }] }),
  component: Page,
});

const SERVICES = [
  { name: "API Gateway", status: "healthy", latency: "18ms", uptime: "99.98%", requests: "8,421/s" },
  { name: "Ingest Service (Kafka)", status: "healthy", latency: "4ms", uptime: "99.99%", requests: "380 pk/s" },
  { name: "Trust Engine", status: "healthy", latency: "6ms", uptime: "99.97%", requests: "380/s" },
  { name: "ML Forecast Service", status: "healthy", latency: "42ms", uptime: "99.94%", requests: "120/min" },
  { name: "Audit Log Store", status: "healthy", latency: "2ms", uptime: "100%", requests: "append-only" },
  { name: "DP Noise Service", status: "healthy", latency: "1ms", uptime: "99.99%", requests: "per-query" },
  { name: "Merkle Anchor Job", status: "healthy", latency: "1.2s", uptime: "100%", requests: "hourly cron" },
  { name: "Notification Service", status: "degraded", latency: "840ms", uptime: "98.12%", requests: "180/min" },
];

const CPU_MEM = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  cpu: 28 + Math.round(22 * Math.sin(i / 4) + Math.random() * 8),
  mem: 54 + Math.round(12 * Math.sin(i / 6 + 1) + Math.random() * 5),
}));

const DB_STATS = [
  { db: "TimescaleDB (primary)", size: "4.8 TB", queries: "12,400/min", replication: "Sync", lag: "0ms", status: "healthy" },
  { db: "TimescaleDB (replica)", size: "4.8 TB", queries: "—", replication: "Async", lag: "12ms", status: "healthy" },
  { db: "AuditStore (append-only)", size: "840 GB", queries: "append", replication: "WORM", lag: "—", status: "healthy" },
  { db: "Redis (session/cache)", size: "12 GB", queries: "48,000/s", replication: "Sentinel", lag: "—", status: "healthy" },
];

const QUEUE_DEPTH = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  ingest: Math.round(80 + Math.random() * 40),
  alert: Math.round(12 + Math.random() * 8),
}));

export default function Page() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--emerald)]/30 bg-[var(--emerald)]/6 px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-[var(--emerald)]" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-[var(--emerald)]">SYSTEM STATUS · 7/8 services healthy · 1 degraded</div>
          <div className="text-xs text-muted-foreground mono">Notification service high latency under investigation · All critical paths operational</div>
        </div>
      </div>

      <PageHeader
        eyebrow="ADMIN · System Health"
        title="Platform Observability Dashboard"
        description="Cluster health, Kafka queue depths, TimescaleDB replication lag, Redis cache hit rate, and service latency SLOs for all 8 platform services."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Services Healthy", v: "7 / 8", c: "emerald", icon: <CheckCircle2 className="h-4 w-4" /> },
          { l: "Cluster Nodes", v: "12", c: "primary", icon: <Server className="h-4 w-4" /> },
          { l: "DB Size Total", v: "6.4 TB", c: "cyan", icon: <Database className="h-4 w-4" /> },
          { l: "p99 API Latency", v: "184ms", c: "amber", icon: <Zap className="h-4 w-4" /> },
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

      <Panel title="Service Health Matrix" subtitle="All 8 platform microservices · SLO target: p99 < 200ms · uptime > 99.9%" dense>
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            <tr className="border-b border-border">
              {["Service","Latency (p50)","Uptime","Throughput","Status"].map(h => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SERVICES.map(s => (
              <tr key={s.name} className="border-b border-border/40 hover:bg-accent/40">
                <td className="px-4 py-2.5 font-medium">{s.name}</td>
                <td className="px-4 py-2.5 mono" style={{ color: parseFloat(s.latency) > 200 ? "var(--rose)" : "var(--emerald)" }}>{s.latency}</td>
                <td className="px-4 py-2.5 mono text-muted-foreground">{s.uptime}</td>
                <td className="px-4 py-2.5 mono text-muted-foreground">{s.requests}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                    background: s.status === "healthy" ? "color-mix(in oklab,var(--emerald) 16%,transparent)" : "color-mix(in oklab,var(--amber) 16%,transparent)",
                    color: s.status === "healthy" ? "var(--emerald)" : "var(--amber)",
                  }}>{s.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Cluster CPU & Memory — 24h" subtitle="AWS ap-south-1 · 12 c6a.4xlarge nodes">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CPU_MEM} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} unit="%" />
                <Tooltip formatter={(v: number) => [`${v}%`]} />
                <Area type="monotone" dataKey="cpu" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} strokeWidth={2} name="CPU" />
                <Area type="monotone" dataKey="mem" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} strokeWidth={2} name="Memory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Kafka Queue Depth" subtitle="Ingest and alert queues · target < 200 msgs lag">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={QUEUE_DEPTH} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="ingest" stroke="var(--cyan)" strokeWidth={2} dot={false} name="Ingest queue" />
                <Line type="monotone" dataKey="alert" stroke="var(--amber)" strokeWidth={1.5} dot={false} name="Alert queue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Database Fleet" subtitle="TimescaleDB time-series, append-only audit store, Redis cache layer">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Database","Size","Query Rate","Replication","Replica Lag","Status"].map(h => (
                  <th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DB_STATS.map(d => (
                <tr key={d.db} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-medium">{d.db}</td>
                  <td className="px-4 py-2.5 mono text-muted-foreground">{d.size}</td>
                  <td className="px-4 py-2.5 mono text-muted-foreground">{d.queries}</td>
                  <td className="px-4 py-2.5 mono text-muted-foreground">{d.replication}</td>
                  <td className="px-4 py-2.5 mono" style={{ color: d.lag === "0ms" || d.lag === "—" ? "var(--emerald)" : "var(--amber)" }}>{d.lag}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">HEALTHY</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
