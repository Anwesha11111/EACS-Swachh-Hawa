import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { Car, MapPin, Activity } from "lucide-react";

export const Route = createFileRoute("/vehicles")({
  head: () => ({ meta: [{ title: "Mobile Monitoring Vehicles · Swachh Hawa" }] }),
  component: Page,
});

const VEHICLES = [
  { id: "MMV-DEL-01", city: "Delhi", type: "CPCB Reference Van", status: "Deployed", odometer: 12840, lastCalib: "2026-05-20", pm25: 298, pm10: 412, no2: 88, so2: 42, co: 2.1, lat: "28.6448", lng: "77.2167" },
  { id: "MMV-DEL-02", city: "Delhi", type: "Mobile Lab", status: "En Route", odometer: 8210, lastCalib: "2026-05-18", pm25: 184, pm10: 268, no2: 61, so2: 28, co: 1.4, lat: "28.5921", lng: "77.1993" },
  { id: "MMV-GZB-01", city: "Ghaziabad", type: "CPCB Reference Van", status: "Deployed", odometer: 6440, lastCalib: "2026-05-22", pm25: 318, pm10: 468, no2: 94, so2: 51, co: 2.8, lat: "28.6692", lng: "77.4538" },
  { id: "MMV-LDH-01", city: "Ludhiana", type: "Mobile Lab", status: "Maintenance", odometer: 22100, lastCalib: "2026-04-30", pm25: 0, pm10: 0, no2: 0, so2: 0, co: 0, lat: "—", lng: "—" },
];

const TRACK = Array.from({ length: 60 }, (_, i) => ({
  t: `T+${i}m`,
  pm25: 280 + Math.round(80 * Math.sin(i / 8) + Math.random() * 40),
  speed: 18 + Math.round(22 * Math.abs(Math.sin(i / 6)) + Math.random() * 8),
  no2: 72 + Math.round(30 * Math.sin(i / 6 + 1) + Math.random() * 12),
}));

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="INFRA · Mobile Monitoring Vehicles"
        title="Mobile Monitoring Vehicle Fleet"
        description="CPCB Reference Vans and Mobile Lab vehicles for last-mile verification, on-road emission profiling, and reference calibration of fixed sensors. Instruments: BAM PM2.5/PM10, chemiluminescent NOₓ, UV fluorescence SO₂."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Vehicles Deployed", v: "3", c: "emerald" },
          { l: "Route Coverage Today", v: "284 km", c: "primary" },
          { l: "Fixed Sensors Calibrated", v: "38", c: "cyan" },
          { l: "Hotspots Verified", v: "11", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title="Vehicle Fleet — Live Sensor Readings" subtitle="BAM PM2.5, PM10, NO₂, SO₂, CO — updated every 5 minutes" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Vehicle ID","City","Type","Status","PM2.5","PM10","NO₂","SO₂","CO","Last Calib","Coordinates"].map(h => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map(v => (
                <tr key={v.id} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 mono text-primary font-semibold">{v.id}</td>
                  <td className="px-3 py-2.5">{v.city}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{v.type}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: v.status === "Deployed" ? "color-mix(in oklab,var(--emerald) 16%,transparent)"
                        : v.status === "En Route" ? "color-mix(in oklab,var(--cyan) 16%,transparent)"
                        : "color-mix(in oklab,var(--amber) 16%,transparent)",
                      color: v.status === "Deployed" ? "var(--emerald)" : v.status === "En Route" ? "var(--cyan)" : "var(--amber)",
                    }}>{v.status}</span>
                  </td>
                  <td className="px-3 py-2.5 mono" style={{ color: v.pm25 > 250 ? "var(--rose)" : v.pm25 > 100 ? "var(--amber)" : v.pm25 > 0 ? "var(--chart-1)" : "var(--muted-foreground)" }}>{v.pm25 || "—"}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{v.pm10 || "—"}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{v.no2 || "—"}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{v.so2 || "—"}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{v.co || "—"}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground">{v.lastCalib}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground">{v.lat !== "—" ? `${v.lat}, ${v.lng}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Mobile Track — MMV-DEL-01 — PM2.5 & NO₂ Profile" subtitle="On-road pollution profile logged at 1min intervals · peaks indicate emission hotspots">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TRACK} margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={9} />
              <YAxis yAxisId="pm" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="no2" orientation="right" tick={{ fontSize: 9 }} />
              <Tooltip />
              <Area yAxisId="pm" type="monotone" dataKey="pm25" stroke="var(--rose)" fill="var(--rose)" fillOpacity={0.12} strokeWidth={2} name="PM2.5 (µg/m³)" />
              <Line yAxisId="no2" type="monotone" dataKey="no2" stroke="var(--amber)" strokeWidth={1.5} dot={false} name="NO₂ (µg/m³)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
