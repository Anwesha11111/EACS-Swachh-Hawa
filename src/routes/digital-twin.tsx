import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Cpu, Activity, Globe2 } from "lucide-react";

export const Route = createFileRoute("/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Twin · Swachh Hawa" }] }),
  component: Page,
});

const TWIN_LAYERS = [
  { name: "Atmospheric Dispersion", model: "Gaussian plume v2.1", status: "Live", accuracy: 94, update: "15min" },
  { name: "Meteorological Field", model: "WRF-ARW 3km grid", status: "Live", accuracy: 91, update: "1h" },
  { name: "Emission Inventory", model: "GAINS India 2026", status: "Live", accuracy: 87, update: "24h" },
  { name: "Traffic Flow", model: "SUMO-OSM NCR", status: "Live", accuracy: 82, update: "5min" },
  { name: "Boundary Layer Dynamics", model: "ML-BLH v1.4", status: "Live", accuracy: 89, update: "30min" },
  { name: "Industrial Stack Registry", model: "CPCB ICRS 2026", status: "Partial", accuracy: 76, update: "Manual" },
];

const SYNC_FIDELITY = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  twin: 88 + Math.round(8 * Math.sin(i / 4) + Math.random() * 3),
  physical: 100,
}));

const RADAR_SYNC = [
  { axis: "Dispersion", twin: 94 },
  { axis: "Meteo", twin: 91 },
  { axis: "Emissions", twin: 87 },
  { axis: "Traffic", twin: 82 },
  { axis: "BLH", twin: 89 },
  { axis: "Industry", twin: 76 },
];

const CITIES_TWIN = [
  { city: "Delhi", syncPct: 96, lastSync: "1m ago", layers: 6 },
  { city: "Patna", syncPct: 91, lastSync: "2m ago", layers: 5 },
  { city: "Lucknow", syncPct: 88, lastSync: "4m ago", layers: 5 },
  { city: "Kanpur", syncPct: 84, lastSync: "6m ago", layers: 4 },
  { city: "Mumbai", syncPct: 93, lastSync: "2m ago", layers: 6 },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="AI · Digital Twin"
        title="National Environmental Digital Twin"
        description="Physics-grounded multi-layer digital twin of the Indian atmosphere. Six synchronised model layers: dispersion, meteorology, emission inventory, traffic, boundary layer, and industrial stack registry."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
            <Globe2 className="h-3.5 w-3.5 text-[var(--cyan)]" />
            <span className="mono text-[var(--cyan)]">TWIN LIVE · 6 layers synced</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Mean Sync Fidelity", v: "91%", c: "emerald" },
          { l: "Model Layers", v: "6 / 6", c: "primary" },
          { l: "Grid Resolution", v: "3km WRF", c: "cyan" },
          { l: "State Vector Size", v: "18.4M params", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Twin Layer Registry" subtitle="All 6 model layers with accuracy and update cadence" dense>
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Layer","Model","Accuracy","Update","Status"].map(h => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TWIN_LAYERS.map(l => (
                <tr key={l.name} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 font-medium">{l.name}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground">{l.model}</td>
                  <td className="px-3 py-2.5 mono font-semibold" style={{ color: l.accuracy > 88 ? "var(--emerald)" : l.accuracy > 80 ? "var(--amber)" : "var(--rose)" }}>{l.accuracy}%</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{l.update}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: l.status === "Live" ? "color-mix(in oklab,var(--emerald) 16%,transparent)" : "color-mix(in oklab,var(--amber) 16%,transparent)",
                      color: l.status === "Live" ? "var(--emerald)" : "var(--amber)",
                    }}>{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Layer Accuracy Radar" subtitle="Synchronisation fidelity per model domain">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_SYNC} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Radar name="Twin accuracy" dataKey="twin" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip formatter={(v: number) => [`${v}%`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="State Vector Sync Fidelity — 24h" subtitle="% of physical world state captured in twin · drops = model drift or data gap">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SYNC_FIDELITY} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
              <YAxis tick={{ fontSize: 9 }} domain={[70, 100]} unit="%" />
              <Tooltip formatter={(v: number) => [`${v}%`]} />
              <Line type="monotone" dataKey="physical" stroke="var(--border)" strokeWidth={1} strokeDasharray="4 2" dot={false} name="Physical (100%)" />
              <Line type="monotone" dataKey="twin" stroke="var(--cyan)" strokeWidth={2.5} dot={false} name="Twin fidelity" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Per-City Twin Status" subtitle="Individual city instances of the national twin">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {CITIES_TWIN.map(c => (
            <div key={c.city} className="rounded-xl border border-border bg-card/60 p-3 text-center">
              <Activity className="h-5 w-5 mx-auto mb-1 text-[var(--cyan)]" />
              <div className="text-sm font-semibold">{c.city}</div>
              <div className="mono text-xl font-bold mt-1" style={{ color: c.syncPct > 90 ? "var(--emerald)" : "var(--amber)" }}>{c.syncPct}%</div>
              <div className="text-[10px] text-muted-foreground mono">{c.layers} layers · {c.lastSync}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
