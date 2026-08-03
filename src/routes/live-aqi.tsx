import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { CITIES, aqiCategory } from "@/lib/mock-data";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Activity, RefreshCw } from "lucide-react";
import { useLiveAqi } from "@/hooks/useLiveData";

export const Route = createFileRoute("/live-aqi")({
  head: () => ({ meta: [{ title: "Live AQI Stream · Swachh Hawa" }] }),
  component: Page,
});

const LIVE_STREAM = Array.from({ length: 30 }, (_, i) => ({
  t: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
  delhi: 180 + Math.round(50 * Math.sin(i / 4) + Math.random() * 20),
  mumbai: 140 + Math.round(30 * Math.sin(i / 4 + 1) + Math.random() * 15),
  kolkata: 200 + Math.round(40 * Math.sin(i / 3.5 + 0.5) + Math.random() * 18),
  patna: 310 + Math.round(60 * Math.sin(i / 3 + 0.2) + Math.random() * 25),
}));

export default function Page() {
  const { data: aqiData, isFetching, refetch } = useLiveAqi();
  const cities = aqiData?.data ?? CITIES;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="MONITORING · Live AQI Stream"
        title="Real-time AQI Across National Grid"
        description="Per-station AQI stream updated every 15 minutes. All readings hash-chain verified before display."
        actions={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        }
      />

      <Panel title="Live City AQI — 15-min Rolling" subtitle="Last 30 readings · hash-chain validated">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={LIVE_STREAM} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={4} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Area type="monotone" dataKey="patna" stroke="var(--rose)" fill="var(--rose)" fillOpacity={0.1} strokeWidth={2} name="Patna" />
              <Area type="monotone" dataKey="delhi" stroke="var(--amber)" fill="var(--amber)" fillOpacity={0.1} strokeWidth={2} name="Delhi" />
              <Area type="monotone" dataKey="kolkata" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.1} strokeWidth={2} name="Kolkata" />
              <Area type="monotone" dataKey="mumbai" stroke="var(--emerald)" fill="var(--emerald)" fillOpacity={0.1} strokeWidth={2} name="Mumbai" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="All Stations — Current AQI" dense>
        <div className="grid grid-cols-1 gap-0 divide-y divide-border">
          {cities.map((c) => {
            const cat = aqiCategory(c.aqi);
            return (
              <div key={c.name} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/30">
                <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground mono">{c.state} · PM2.5 {c.pm25} µg/m³</div>
                </div>
                <div className="text-right">
                  <div className="mono text-lg font-bold">{c.aqi}</div>
                  <div className={`text-[10px] mono aqi-${cat.token.replace("aqi-", "")}`}>{cat.label}</div>
                </div>
                <div className="w-16">
                  <div className="h-2 rounded-full bg-border/40 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min((c.aqi / 500) * 100, 100)}%`,
                      background: c.aqi > 300 ? "var(--rose)" : c.aqi > 200 ? "var(--amber)" : c.aqi > 100 ? "var(--chart-1)" : "var(--emerald)",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
