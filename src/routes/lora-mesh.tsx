import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Wifi, Radio, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/lora-mesh")({
  head: () => ({ meta: [{ title: "LoRa Mesh · Swachh Hawa" }] }),
  component: Page,
});

const MESH_NODES = [
  { id: "GW-DEL-01", city: "Delhi", role: "Gateway", peers: 12, rssi: -62, snr: 8.4, uptime: "14d 6h", packets24h: 48210, status: "ok" },
  { id: "GW-GZB-01", city: "Ghaziabad", role: "Gateway", peers: 9, rssi: -71, snr: 7.1, uptime: "14d 6h", packets24h: 34180, status: "ok" },
  { id: "RLY-DEL-08", city: "Delhi", role: "Relay", peers: 4, rssi: -78, snr: 5.8, uptime: "8d 3h", packets24h: 12420, status: "ok" },
  { id: "RLY-LDH-03", city: "Ludhiana", role: "Relay", peers: 6, rssi: -84, snr: 4.2, uptime: "2d 11h", packets24h: 9830, status: "warning" },
  { id: "END-PNE-21", city: "Pune", role: "End node", peers: 1, rssi: -91, snr: 2.1, uptime: "—", packets24h: 0, status: "offline" },
];

const RSSI_TREND = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  gw_del: -62 + Math.round(Math.random() * 6 - 3),
  rly_ldh: -84 + Math.round(Math.random() * 8 - 4),
  threshold: -100,
}));

const THROUGHPUT = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  packets: 380 + Math.round(120 * Math.sin(i / 4) + Math.random() * 40),
  retx: Math.round(8 + Math.random() * 6),
}));

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="INFRA · LoRa Mesh"
        title="LoRa-Mesh Sensor Backhaul Network"
        description="Long-range (up to 15km), low-power mesh topology providing resilient backhaul. Self-healing routing — packets hop through relay nodes if primary path fails. 72h edge buffer for offline nodes."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Gateways", v: "48", c: "primary" },
          { l: "Relay Nodes", v: "312", c: "cyan" },
          { l: "End Nodes", v: "2,091", c: "chart-1" },
          { l: "Mesh Coverage", v: "94%", c: "emerald" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* SVG topology */}
      <Panel title="Mesh Topology — Delhi-NCR Cluster" subtitle="Live node status · solid lines = active links · dashed = degraded">
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 700 280" className="w-full" style={{ minWidth: 400, maxHeight: 280 }}>
            <defs>
              <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--cyan)" />
              </marker>
            </defs>
            {/* Links */}
            {[
              { x1: 350, y1: 140, x2: 150, y2: 80, dashed: false },
              { x1: 350, y1: 140, x2: 550, y2: 80, dashed: false },
              { x1: 350, y1: 140, x2: 200, y2: 220, dashed: false },
              { x1: 350, y1: 140, x2: 500, y2: 220, dashed: false },
              { x1: 150, y1: 80, x2: 80, y2: 200, dashed: false },
              { x1: 150, y1: 80, x2: 250, y2: 200, dashed: false },
              { x1: 550, y1: 80, x2: 620, y2: 200, dashed: true },
              { x1: 550, y1: 80, x2: 480, y2: 200, dashed: false },
            ].map((l, i) => (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={l.dashed ? "var(--amber)" : "var(--cyan)"} strokeWidth="1.5"
                strokeDasharray={l.dashed ? "5 4" : "none"} opacity={0.7} />
            ))}
            {/* Central gateway */}
            <circle cx="350" cy="140" r="18" fill="var(--primary)" stroke="white" strokeWidth="2" />
            <text x="350" y="145" textAnchor="middle" fontSize="9" fill="white" fontFamily="monospace" fontWeight="bold">GW</text>
            <text x="350" y="170" textAnchor="middle" fontSize="10" fill="var(--foreground)" fontFamily="monospace">GW-DEL-01</text>
            {/* Relay nodes */}
            {[
              { cx: 150, cy: 80, id: "RLY-01", color: "var(--cyan)" },
              { cx: 550, cy: 80, id: "RLY-02", color: "var(--cyan)" },
              { cx: 200, cy: 220, id: "RLY-03", color: "var(--cyan)" },
              { cx: 500, cy: 220, id: "RLY-04", color: "var(--cyan)" },
            ].map(n => (
              <g key={n.id}>
                <circle cx={n.cx} cy={n.cy} r="13" fill={n.color} fillOpacity={0.3} stroke={n.color} strokeWidth="1.5" />
                <text x={n.cx} y={n.cy + 4} textAnchor="middle" fontSize="8" fill={n.color} fontFamily="monospace">RLY</text>
                <text x={n.cx} y={n.cy + 24} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontFamily="monospace">{n.id}</text>
              </g>
            ))}
            {/* End nodes */}
            {[
              { cx: 80, cy: 200, ok: true }, { cx: 250, cy: 200, ok: true },
              { cx: 620, cy: 200, ok: false }, { cx: 480, cy: 200, ok: true },
            ].map((n, i) => (
              <g key={i}>
                <circle cx={n.cx} cy={n.cy} r="8" fill={n.ok ? "var(--emerald)" : "var(--rose)"} opacity={0.8} />
                <text x={n.cx} y={n.cy + 20} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)" fontFamily="monospace">END</text>
              </g>
            ))}
            <text x="10" y="270" fontSize="10" fill="var(--muted-foreground)" fontFamily="monospace">● Gateway  ○ Relay  · End node  — Active  - - Degraded</text>
          </svg>
        </div>
      </Panel>

      <Panel title="Mesh Node Fleet" subtitle="RSSI, SNR, uptime, and 24h packet counts" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Node ID","City","Role","Peers","RSSI (dBm)","SNR","Uptime","Packets 24h","Status"].map(h => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MESH_NODES.map(n => (
                <tr key={n.id} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 mono text-primary font-semibold">{n.id}</td>
                  <td className="px-3 py-2.5">{n.city}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{n.role}</td>
                  <td className="px-3 py-2.5 mono">{n.peers}</td>
                  <td className="px-3 py-2.5 mono" style={{ color: n.rssi > -75 ? "var(--emerald)" : n.rssi > -88 ? "var(--amber)" : "var(--rose)" }}>{n.rssi}</td>
                  <td className="px-3 py-2.5 mono">{n.snr}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{n.uptime}</td>
                  <td className="px-3 py-2.5 mono">{n.packets24h.toLocaleString()}</td>
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
        <Panel title="RSSI Trend — 24h" subtitle="Signal strength for key nodes · threshold -100dBm">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RSSI_TREND} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} domain={[-110, -50]} />
                <Tooltip />
                <Line type="monotone" dataKey="gw_del" stroke="var(--emerald)" strokeWidth={2} dot={false} name="GW-DEL-01" />
                <Line type="monotone" dataKey="rly_ldh" stroke="var(--amber)" strokeWidth={2} dot={false} name="RLY-LDH-03" />
                <Line type="monotone" dataKey="threshold" stroke="var(--rose)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Min threshold" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Packet Throughput & Retransmission" subtitle="Packets/min and retx rate · high retx = link quality degrading">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={THROUGHPUT} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="packets" stroke="var(--cyan)" strokeWidth={2} dot={false} name="Packets/min" />
                <Line type="monotone" dataKey="retx" stroke="var(--rose)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Retransmissions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
