import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Navigation, Battery, Wind, Camera } from "lucide-react";

export const Route = createFileRoute("/drones")({
  head: () => ({ meta: [{ title: "Drone Monitoring · Swachh Hawa" }] }),
  component: Page,
});

const FLEET = [
  { id: "UAV-DEL-01", city: "Delhi", mission: "Hotspot Surveillance", status: "In Flight", battery: 72, alt: 120, speed: 8.4, pm25: 342, lat: "28.6448", lng: "77.2167", eta: "18 min" },
  { id: "UAV-GZB-01", city: "Ghaziabad", mission: "Stack Emission Check", status: "In Flight", battery: 58, alt: 80, speed: 6.1, pm25: 412, lat: "28.6692", lng: "77.4538", eta: "32 min" },
  { id: "UAV-LDH-02", city: "Ludhiana", mission: "Grid Coverage", status: "RTB", battery: 21, alt: 40, speed: 12.0, pm25: 0, lat: "30.9010", lng: "75.8573", eta: "8 min" },
  { id: "UAV-PNE-01", city: "Pune", mission: "—", status: "Charging", battery: 94, alt: 0, speed: 0, pm25: 0, lat: "—", lng: "—", eta: "—" },
  { id: "UAV-KOL-01", city: "Kolkata", mission: "Industrial Survey", status: "In Flight", battery: 84, alt: 150, speed: 9.2, pm25: 228, lat: "22.5726", lng: "88.3639", eta: "41 min" },
];

const ALTITUDE_PROFILE = Array.from({ length: 30 }, (_, i) => ({
  t: `T+${i}m`,
  uav1: 60 + Math.round(80 * Math.sin(i / 6) + 40),
  uav2: 40 + Math.round(60 * Math.sin(i / 5 + 1) + 20),
  pm25: 280 + Math.round(120 * Math.sin(i / 4 + 0.5) + 40),
}));

const STATUS_COLOR: Record<string, string> = {
  "In Flight": "var(--emerald)",
  "RTB": "var(--amber)",
  "Charging": "var(--cyan)",
  "Maintenance": "var(--rose)",
};

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="INFRA · Drone Monitoring"
        title="Autonomous Drone Surveillance Fleet"
        description="UAV swarms provide last-mile coverage for hotspot verification, industrial stack emission checks, and grid validation. Drones carry calibrated PM2.5/NO₂/SO₂ micro-sensors with onboard edge inference."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Active Drones", v: "3", c: "emerald" },
          { l: "Missions Today", v: "12", c: "primary" },
          { l: "Area Covered", v: "142 km²", c: "cyan" },
          { l: "Incidents Verified", v: "8", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title="Fleet Status" subtitle="Live position, battery, altitude, and onboard sensor readings" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["UAV ID","City","Mission","Status","Battery","Altitude","Speed","PM2.5 onboard","Coordinates","ETA base"].map(h => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLEET.map(d => (
                <tr key={d.id} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 mono text-primary font-semibold">{d.id}</td>
                  <td className="px-3 py-2.5">{d.city}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{d.mission}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: `color-mix(in oklab,${STATUS_COLOR[d.status] ?? "var(--muted-foreground)"} 16%,transparent)`,
                      color: STATUS_COLOR[d.status] ?? "var(--muted-foreground)",
                    }}>{d.status}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1 mono">
                      <Battery className="h-3 w-3" style={{ color: d.battery < 25 ? "var(--rose)" : d.battery < 50 ? "var(--amber)" : "var(--emerald)" }} />
                      {d.battery > 0 ? `${d.battery}%` : "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{d.alt > 0 ? `${d.alt}m` : "—"}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{d.speed > 0 ? `${d.speed} m/s` : "—"}</td>
                  <td className="px-3 py-2.5 mono font-bold" style={{ color: d.pm25 > 300 ? "var(--rose)" : d.pm25 > 150 ? "var(--amber)" : d.pm25 > 0 ? "var(--chart-1)" : "var(--muted-foreground)" }}>
                    {d.pm25 > 0 ? d.pm25 : "—"}
                  </td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground">{d.lat !== "—" ? `${d.lat}, ${d.lng}` : "—"}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{d.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Altitude vs PM2.5 Profile — UAV-DEL-01 Mission" subtitle="Vertical pollution profile reveals boundary layer structure and emission source heights">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ALTITUDE_PROFILE} margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={4} />
              <YAxis yAxisId="alt" tick={{ fontSize: 9 }} unit="m" />
              <YAxis yAxisId="pm25" orientation="right" tick={{ fontSize: 9 }} unit=" µg" />
              <Tooltip />
              <Line yAxisId="alt" type="monotone" dataKey="uav1" stroke="var(--cyan)" strokeWidth={2} dot={false} name="Altitude (m)" />
              <Line yAxisId="pm25" type="monotone" dataKey="pm25" stroke="var(--rose)" strokeWidth={2} dot={false} name="PM2.5 (µg/m³)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Peak PM2.5 detected at 80–120m altitude — consistent with stack exhaust plume rise. Feeding source attribution model.
        </div>
      </Panel>
    </div>
  );
}
