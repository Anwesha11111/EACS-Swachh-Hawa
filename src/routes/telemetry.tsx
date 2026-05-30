import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { Database, Wifi, Activity } from "lucide-react";

export const Route = createFileRoute("/telemetry")({
  head: () => ({ meta: [{ title: "Telemetry Feed · Swachh Hawa" }] }),
  component: Page,
});

const PACKET_STREAM = Array.from({ length: 60 }, (_, i) => ({
  t: `${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}`,
  packets: 380 + Math.round(120 * Math.sin(i / 8) + Math.random() * 40),
  lora: 280 + Math.round(80 * Math.sin(i / 9 + 1) + Math.random() * 30),
  cellular: 100 + Math.round(40 * Math.sin(i / 7 + 0.5) + Math.random() * 15),
}));

const LATENCY = Array.from({ length: 30 }, (_, i) => ({
  t: `${String(i * 2).padStart(2, "0")}m`,
  p50: parseFloat((42 + Math.random() * 8).toFixed(1)),
  p95: parseFloat((98 + Math.random() * 22).toFixed(1)),
  p99: parseFloat((180 + Math.random() * 50).toFixed(1)),
}));

const RECENT_PACKETS = Array.from({ length: 12 }, (_, i) => ({
  seq: 48820 + i,
  device: `SH-${["DEL-0042","DEL-0043","GZB-0011","LDH-0088","KOL-0031","MUM-0019"][i % 6]}`,
  ts: `2026-05-30T05:${String(48 + i).padStart(2, "0")}:${String(i * 5 % 60).padStart(2, "0")}Z`,
  pm25: 42 + i * 7,
  pm10: 80 + i * 12,
  no2: 28 + i * 3,
  temp: parseFloat((24.1 + i * 0.3).toFixed(1)),
  humidity: 58 + i,
  backhaul: ["LoRa-Mesh","LoRa-Mesh","Cellular","LoRa-Mesh","WiFi","Cellular"][i % 6],
  valid: i !== 4,
}));

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="INFRA · Telemetry Feed"
        title="Raw Sensor Telemetry Stream"
        description="Full-fidelity packet stream from 2,451 deployed nodes across LoRa-Mesh, cellular, and WiFi backhaul. Every packet carries measurement_context and HMAC signature."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Packets/min", v: "8,421", c: "primary", icon: <Activity className="h-4 w-4" /> },
          { l: "LoRa-Mesh", v: "68%", c: "cyan", icon: <Wifi className="h-4 w-4" /> },
          { l: "Ingest Lag p99", v: "184ms", c: "amber", icon: <Database className="h-4 w-4" /> },
          { l: "Parse Errors 24h", v: "0.02%", c: "emerald", icon: <Activity className="h-4 w-4" /> },
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

      <Panel title="Packet Ingestion Rate — Live (60s)" subtitle="Total packets/s split by backhaul type: LoRa-Mesh, Cellular, WiFi">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PACKET_STREAM} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={9} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Area type="monotone" dataKey="packets" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} strokeWidth={2} name="Total" />
              <Area type="monotone" dataKey="lora" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.1} strokeWidth={1.5} name="LoRa-Mesh" />
              <Area type="monotone" dataKey="cellular" stroke="var(--amber)" fill="var(--amber)" fillOpacity={0.1} strokeWidth={1.5} name="Cellular" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="End-to-End Ingest Latency" subtitle="p50 / p95 / p99 percentiles · target p99 < 250ms">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={LATENCY} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={4} />
              <YAxis tick={{ fontSize: 9 }} unit="ms" />
              <Tooltip />
              <Line type="monotone" dataKey="p50" stroke="var(--emerald)" strokeWidth={2} dot={false} name="p50" />
              <Line type="monotone" dataKey="p95" stroke="var(--amber)" strokeWidth={2} dot={false} name="p95" />
              <Line type="monotone" dataKey="p99" stroke="var(--rose)" strokeWidth={2} dot={false} name="p99" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Recent Packets — Raw Telemetry" subtitle="Decoded payload · hash-chain signed · measurement_context tagged" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Seq","Device","Timestamp","PM2.5","PM10","NO₂","Temp","Humidity","Backhaul","Valid"].map(h => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_PACKETS.map(p => (
                <tr key={p.seq} className={`border-b border-border/40 hover:bg-accent/40 ${!p.valid ? "bg-[var(--rose)]/5" : ""}`}>
                  <td className="px-3 py-2 mono text-muted-foreground">{p.seq}</td>
                  <td className="px-3 py-2 mono text-primary font-semibold">{p.device}</td>
                  <td className="px-3 py-2 mono text-[10px] text-muted-foreground whitespace-nowrap">{p.ts}</td>
                  <td className="px-3 py-2 mono">{p.pm25}</td>
                  <td className="px-3 py-2 mono">{p.pm10}</td>
                  <td className="px-3 py-2 mono">{p.no2}</td>
                  <td className="px-3 py-2 mono">{p.temp}°C</td>
                  <td className="px-3 py-2 mono">{p.humidity}%</td>
                  <td className="px-3 py-2">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono" style={{
                      background: p.backhaul.includes("LoRa") ? "color-mix(in oklab,var(--cyan) 18%,transparent)" : "color-mix(in oklab,var(--amber) 18%,transparent)",
                      color: p.backhaul.includes("LoRa") ? "var(--cyan)" : "var(--amber)",
                    }}>{p.backhaul}</span>
                  </td>
                  <td className="px-3 py-2 mono">{p.valid ? <span className="text-[var(--emerald)]">✓</span> : <span className="text-[var(--rose)]">ERR</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
