import { createFileRoute } from "@tanstack/react-router";
import { Panel, StatusDot } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { SENSORS } from "@/lib/mock-data";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart } from "recharts";
import { TelemetryTicker } from "@/components/ui-kit/TelemetryTicker";

export const Route = createFileRoute("/sensors")({
  head: () => ({ meta: [{ title: "Sensor Network · Swachh Hawa" }] }),
  component: Page,
});

const PACKETS = Array.from({ length: 30 }, (_, i) => ({
  t: i, mqtt: 800 + Math.round(Math.sin(i/3) * 200 + Math.random()*100),
  lora: 600 + Math.round(Math.cos(i/2) * 180 + Math.random()*100),
  sat:  220 + Math.round(Math.sin(i/4) * 80  + Math.random()*40),
}));

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="INFRA · Mesh Operations"
        title="Sensor Network & Infrastructure"
        description="14,832 nodes · LoRa-mesh + MQTT + satellite-uplink fleet. DevOps-grade observability."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { l: "Online Nodes", v: "14,810", c: "emerald" },
          { l: "Degraded",     v: "14", c: "amber" },
          { l: "Offline",      v: "8", c: "rose" },
          { l: "Pkts/sec",     v: "1,482", c: "cyan" },
          { l: "p95 Latency",  v: "46ms", c: "primary" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Packet Ingestion (last 30s)" subtitle="MQTT · LoRa-Mesh · Satellite uplink">
          <div className="h-[260px]">
            <ResponsiveContainer>
              <AreaChart data={PACKETS}>
                <defs>
                  {["mqtt","lora","sat"].map((k, i) => (
                    <linearGradient key={k} id={`g${k}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={`var(--chart-${i+1})`} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={`var(--chart-${i+1})`} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
                <Area dataKey="mqtt" stroke="var(--chart-1)" fill="url(#gmqtt)" />
                <Area dataKey="lora" stroke="var(--chart-2)" fill="url(#glora)" />
                <Area dataKey="sat"  stroke="var(--chart-3)" fill="url(#gsat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="LoRa Mesh Topology" subtitle="Live edge graph">
          <MeshGraph />
        </Panel>
      </div>

      <TelemetryTicker />

      <Panel title="Fleet Health" subtitle="Per-device telemetry · Trust score = composite: neighbour consensus + calibration R² + forecast accuracy + satellite cross-val" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs table-sticky-col">
            <thead className="text-[10px] uppercase mono tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                {["Device","Type","City","Context","Status","Trust Score","Battery","Uptime","Packets","Latency"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SENSORS.map((s, idx) => {
                const trustScore = parseFloat((0.97 - idx * 0.04 + (idx % 3) * 0.02).toFixed(2));
                const ctxOptions = ["ambient", "ambient", "source_proximate", "ambient", "indoor"];
                const ctx = ctxOptions[idx % ctxOptions.length];
                return (
                  <tr key={s.id} className="border-b border-border/40 hover:bg-accent/40">
                    <td className="px-4 py-2 mono text-primary font-semibold">{s.id}</td>
                    <td className="px-4 py-2">{s.type}</td>
                    <td className="px-4 py-2">{s.city}</td>
                    <td className="px-4 py-2">
                      <span className="rounded px-1.5 py-0.5 text-[9px] mono" style={{
                        background: ctx === "source_proximate" ? "color-mix(in oklab,var(--rose) 18%,transparent)"
                          : ctx === "indoor" ? "color-mix(in oklab,var(--amber) 18%,transparent)"
                          : "color-mix(in oklab,var(--cyan) 18%,transparent)",
                        color: ctx === "source_proximate" ? "var(--rose)" : ctx === "indoor" ? "var(--amber)" : "var(--cyan)",
                      }}>{ctx}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <StatusDot tone={s.status === "online" ? "emerald" : s.status === "degraded" ? "amber" : "rose"} />
                        <span className="uppercase mono text-[10px]">{s.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2 mono font-semibold" style={{ color: trustScore > 0.85 ? "var(--emerald)" : trustScore > 0.6 ? "var(--amber)" : "var(--rose)" }}>
                      {trustScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded bg-muted overflow-hidden">
                          <div className="h-full" style={{
                            width: `${s.battery}%`,
                            background: s.battery > 60 ? "var(--emerald)" : s.battery > 30 ? "var(--amber)" : "var(--rose)",
                          }} />
                        </div>
                        <span className="mono text-[10px]">{s.battery}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 mono">{s.uptime.toFixed(2)}%</td>
                    <td className="px-4 py-2 mono">{s.packets.toLocaleString()}</td>
                    <td className="px-4 py-2 mono">{s.latencyMs}ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Kafka Stream"><MiniLine color="var(--cyan)" /></Panel>
        <Panel title="Cloud-Edge Sync"><MiniLine color="var(--emerald)" /></Panel>
        <Panel title="Container Health"><MiniLine color="var(--primary)" /></Panel>
      </div>
    </div>
  );
}

function MiniLine({ color }: { color: string }) {
  const data = Array.from({ length: 40 }, (_, i) => ({ t: i, v: 50 + Math.round(Math.sin(i / 3) * 25 + Math.random() * 15) }));
  return (
    <div className="h-32">
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line dataKey="v" stroke={color} dot={false} strokeWidth={1.6} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 11 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MeshGraph() {
  // Force-free fake topology
  const nodes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const r = 80 + (i % 3) * 35;
    return { id: i, x: 200 + Math.cos(angle) * r, y: 130 + Math.sin(angle) * r };
  });
  return (
    <svg viewBox="0 0 400 260" className="h-[260px] w-full">
      <circle cx={200} cy={130} r={10} fill="var(--primary)" style={{ filter: "drop-shadow(0 0 10px var(--primary))" }} />
      {nodes.map((n, i) => (
        <g key={i}>
          <line x1={200} y1={130} x2={n.x} y2={n.y} stroke="var(--primary)" strokeOpacity={0.25} strokeWidth={0.6} />
          <circle cx={n.x} cy={n.y} r={4} fill="var(--cyan)" opacity={0.9} />
          <circle cx={n.x} cy={n.y} r={8} fill="var(--cyan)" opacity={0.15}>
            <animate attributeName="r" values="4;12;4" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

