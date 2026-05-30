import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IndiaMap } from "@/components/ui-kit/IndiaMap";
import { Panel, StatusDot } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { aqiCategory, HOURLY_AQI, type CityAqi, CITIES } from "@/lib/mock-data";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { Layers, Plane, Truck, Wind, Sun, Moon, Satellite } from "lucide-react";

export const Route = createFileRoute("/live-map")({
  head: () => ({ meta: [{ title: "Live GIS Intelligence · Swachh Hawa" }] }),
  component: LiveMap,
});

function LiveMap() {
  const [sel, setSel] = useState<CityAqi>(CITIES[0]);
  const cat = aqiCategory(sel.aqi);
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="GEO · Command Surface"
        title="Live GIS Intelligence Map"
        description="Multi-layer geospatial command surface — sensors, wind, propagation, drones, industrial corridors."
        actions={
          <div className="flex items-center gap-2 text-[11px] mono">
            <StatusDot /> <span className="text-muted-foreground">SAT · ISRO-BHUVAN · 22 layers</span>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel dense className="relative">
          <div className="relative h-[720px]">
            <IndiaMap onSelect={setSel} />
            {/* Floating overlay controls */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              <FloatBtn icon={Layers} label="Layers" />
              <FloatBtn icon={Satellite} label="Satellite" />
              <FloatBtn icon={Wind} label="Wind" />
              <FloatBtn icon={Plane} label="Drones" />
              <FloatBtn icon={Truck} label="MVU" />
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-1.5 text-[11px] mono backdrop-blur">
              <Sun className="h-3 w-3 text-[var(--amber)]" />
              <input type="range" min={0} max={23} defaultValue={14} className="w-32 accent-[var(--primary)]" />
              <Moon className="h-3 w-3 text-[var(--cyan)]" />
              <span className="text-muted-foreground">14:00 IST</span>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Selected Sensor" subtitle={`${sel.name}, ${sel.state}`}>
            <div className="flex items-baseline justify-between">
              <div className="mono text-4xl font-semibold" style={{ color: `var(--${cat.token})` }}>{sel.aqi}</div>
              <div className="rounded px-2 py-0.5 text-[10px] font-bold mono"
                   style={{ background: `color-mix(in oklab, var(--${cat.token}) 18%, transparent)`, color: `var(--${cat.token})` }}>
                {cat.label.toUpperCase()}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] mono">
              <div className="rounded border border-border bg-background/50 p-2"><div className="text-muted-foreground">PM2.5</div><div className="text-sm">{sel.pm25}</div></div>
              <div className="rounded border border-border bg-background/50 p-2"><div className="text-muted-foreground">PM10</div><div className="text-sm">{sel.pm10}</div></div>
              <div className="rounded border border-border bg-background/50 p-2"><div className="text-muted-foreground">Δ 24h</div><div className="text-sm">{sel.trend >= 0 ? "+" : ""}{sel.trend}%</div></div>
            </div>
            <div className="mt-3 h-24">
              <ResponsiveContainer>
                <AreaChart data={HOURLY_AQI}>
                  <defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop stopColor="var(--primary)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 11 }} />
                  <Area dataKey="delhi" stroke="var(--primary)" fill="url(#ga)" strokeWidth={1.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Device Telemetry" dense>
            <ul className="divide-y divide-border/60 text-xs mono">
              {["Battery 92%","Signal -68 dBm","Uptime 99.94%","Last sync 2s ago","Firmware 4.2.1","TLS handshake OK","Edge inference 18ms"].map((r) => (
                <li key={r} className="flex items-center justify-between px-4 py-2"><span>{r}</span><StatusDot /></li>
              ))}
            </ul>
          </Panel>
          <Panel title="Incident History" dense>
            <ul className="divide-y divide-border/60 text-xs">
              {["INC-48211 · PM spike · 18:42","INC-48190 · Calibration drift · 14:11","INC-47882 · Power cycle · 09:02","INC-47710 · Offline 4m · 06:47"].map((r) => (
                <li key={r} className="px-4 py-2 hover:bg-accent/40">{r}</li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function FloatBtn({ icon: I, label }: any) {
  return (
    <button className="flex items-center gap-2 rounded-md border border-border bg-card/85 px-2.5 py-1.5 text-[11px] backdrop-blur hover:border-primary/40">
      <I className="h-3.5 w-3.5 text-primary" /><span className="mono">{label}</span>
    </button>
  );
}