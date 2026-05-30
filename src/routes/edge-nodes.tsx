import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { Cpu, HardDrive, Zap } from "lucide-react";

export const Route = createFileRoute("/edge-nodes")({
  head: () => ({ meta: [{ title: "Edge Nodes · Swachh Hawa" }] }),
  component: Page,
});

const EDGE_NODES = [
  { id: "EDGE-DEL-01", city: "Delhi", model: "NVIDIA Jetson Orin", cpu: 42, ram: 58, storage: 34, temp: 48, tasks: ["local inference","anomaly detect","72h buffer"], status: "ok" },
  { id: "EDGE-GZB-01", city: "Ghaziabad", model: "Raspberry Pi 5", cpu: 31, ram: 44, storage: 22, temp: 44, tasks: ["72h buffer","local inference"], status: "ok" },
  { id: "EDGE-LDH-01", city: "Ludhiana", model: "NVIDIA Jetson Nano", cpu: 78, ram: 82, storage: 61, temp: 64, tasks: ["local inference","anomaly detect","72h buffer"], status: "warning" },
  { id: "EDGE-PNE-01", city: "Pune", model: "Raspberry Pi 5", cpu: 0, ram: 0, storage: 0, temp: 0, tasks: [], status: "offline" },
  { id: "EDGE-KOL-01", city: "Kolkata", model: "NVIDIA Jetson Orin", cpu: 38, ram: 51, storage: 29, temp: 46, tasks: ["local inference","anomaly detect","72h buffer"], status: "ok" },
];

const INFERENCE_LATENCY = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  local: parseFloat((8 + Math.random() * 4).toFixed(1)),
  cloud: parseFloat((120 + Math.random() * 40).toFixed(1)),
}));

const BUFFER_STATS = [
  { node: "EDGE-DEL-01", buffered: 4821, capacity: 72 * 420, pct: 16 },
  { node: "EDGE-GZB-01", buffered: 2140, capacity: 72 * 210, pct: 14 },
  { node: "EDGE-LDH-01", buffered: 8940, capacity: 72 * 280, pct: 44 },
  { node: "EDGE-KOL-01", buffered: 3210, capacity: 72 * 320, pct: 14 },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="INFRA · Edge Nodes"
        title="Edge Compute Fleet"
        description="NVIDIA Jetson Orin and Raspberry Pi 5 edge nodes running local inference, anomaly detection, and 72-hour offline data buffers. Edge inference latency ~8ms vs 120ms cloud round-trip."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Edge Nodes", v: "48", c: "primary" },
          { l: "Online", v: "46", c: "emerald" },
          { l: "Avg CPU", v: "47%", c: "amber" },
          { l: "Edge Inference p50", v: "8.2ms", c: "cyan" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title="Edge Node Fleet" subtitle="CPU · RAM · temperature · 72h buffer tasks" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs table-sticky-col">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Node ID","City","Hardware","CPU","RAM","Storage","Temp","Edge Tasks","Status"].map(h => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EDGE_NODES.map(n => (
                <tr key={n.id} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 mono text-primary font-semibold">{n.id}</td>
                  <td className="px-3 py-2.5">{n.city}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground whitespace-nowrap">{n.model}</td>
                  <td className="px-3 py-2.5 mono" style={{ color: n.cpu > 70 ? "var(--rose)" : n.cpu > 50 ? "var(--amber)" : "var(--emerald)" }}>{n.cpu > 0 ? `${n.cpu}%` : "—"}</td>
                  <td className="px-3 py-2.5 mono" style={{ color: n.ram > 70 ? "var(--rose)" : n.ram > 50 ? "var(--amber)" : "var(--emerald)" }}>{n.ram > 0 ? `${n.ram}%` : "—"}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{n.storage > 0 ? `${n.storage}%` : "—"}</td>
                  <td className="px-3 py-2.5 mono" style={{ color: n.temp > 60 ? "var(--rose)" : n.temp > 50 ? "var(--amber)" : "var(--muted-foreground)" }}>{n.temp > 0 ? `${n.temp}°C` : "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {n.tasks.map(t => (
                        <span key={t} className="rounded px-1 py-0.5 text-[9px] mono bg-[var(--primary)]/12 text-[var(--primary)]">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: n.status === "ok" ? "color-mix(in oklab,var(--emerald) 16%,transparent)" : n.status === "warning" ? "color-mix(in oklab,var(--amber) 16%,transparent)" : "color-mix(in oklab,var(--rose) 16%,transparent)",
                      color: n.status === "ok" ? "var(--emerald)" : n.status === "warning" ? "var(--amber)" : "var(--rose)",
                    }}>{n.status.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Edge vs Cloud Inference Latency — 24h" subtitle="Local edge ~8ms vs cloud round-trip ~120ms">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INFERENCE_LATENCY} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} unit="ms" />
                <Tooltip formatter={(v: number) => [`${v}ms`]} />
                <Area type="monotone" dataKey="cloud" stroke="var(--amber)" fill="var(--amber)" fillOpacity={0.1} strokeWidth={1.5} name="Cloud p50" />
                <Area type="monotone" dataKey="local" stroke="var(--emerald)" fill="var(--emerald)" fillOpacity={0.15} strokeWidth={2} name="Edge p50" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="72h Offline Buffer Utilisation" subtitle="Packets buffered at edge (syncs to cloud when connectivity restores)">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BUFFER_STATS} layout="vertical" margin={{ left: 100, right: 50 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} unit="%" />
                <YAxis type="category" dataKey="node" tick={{ fontSize: 9, fontFamily: "monospace" }} width={100} />
                <Tooltip formatter={(v: number) => [`${v}% capacity used`]} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {BUFFER_STATS.map((d, i) => (
                    <Cell key={i} fill={d.pct > 60 ? "var(--rose)" : d.pct > 40 ? "var(--amber)" : "var(--emerald)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
