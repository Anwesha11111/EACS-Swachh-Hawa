import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, BarChart, Bar, Cell,
} from "recharts";
import { Brain, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/intelligence")({
  head: () => ({ meta: [{ title: "Environmental Intelligence · Swachh Hawa" }] }),
  component: Page,
});

const CROSS_DOMAIN = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  aqi: 150 + Math.round(60 * Math.sin(i / 3.8) + 20),
  hospital_admissions: 42 + Math.round(18 * Math.sin(i / 4.2 + 0.8) + 5),
  traffic_density: 40 + Math.round(35 * Math.sin(i / 3.0 + 0.2) + 10),
  economic_loss: parseFloat((1.2 + 0.8 * Math.sin(i / 3.5) + 0.2).toFixed(2)),
}));

const ANOMALY_TIMELINE = [
  { ts: "2026-05-30T03:14", city: "Delhi", type: "PM2.5 spike", magnitude: 4.2, corr: "Firecracker factory fire confirmed via satellite", resolved: true },
  { ts: "2026-05-29T18:41", city: "Patna", type: "NO₂ anomaly", magnitude: 2.8, corr: "Thermal plant load spike — matched grid telemetry", resolved: true },
  { ts: "2026-05-29T09:22", city: "Ludhiana", type: "SO₂ burst", magnitude: 5.1, corr: "Dye factory discharge — enforcement dossier created", resolved: false },
  { ts: "2026-05-28T21:08", city: "Kolkata", type: "PM10 dust", magnitude: 3.1, corr: "Construction site night activity — geo-fenced alert sent", resolved: true },
];

const HEALTH_CORR = Array.from({ length: 30 }, (_, i) => ({
  aqi: 100 + i * 8,
  admissions: Math.round(20 + i * 2.4 + Math.random() * 6),
  city: ["Delhi","Mumbai","Kolkata","Patna","Lucknow"][i % 5],
}));

const CLIMATE_DRIVERS = [
  { factor: "Monsoon onset lag", correlation: 0.74, impact: "High" },
  { factor: "Boundary layer height", correlation: -0.81, impact: "High" },
  { factor: "Urban heat island", correlation: 0.63, impact: "Medium" },
  { factor: "Crop stubble burning", correlation: 0.88, impact: "Very High" },
  { factor: "Forest fire FRP", correlation: 0.69, impact: "High" },
  { factor: "Sea surface temperature", correlation: -0.42, impact: "Low" },
];

const ECONOMIC_IMPACT = [
  { category: "Healthcare costs", crore: 4820, color: "var(--rose)" },
  { category: "Lost productivity", crore: 9140, color: "var(--amber)" },
  { category: "Agriculture loss", crore: 2310, color: "var(--chart-1)" },
  { category: "Tourism decline", crore: 680, color: "var(--chart-2)" },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ANALYTICS · Environmental Intelligence"
        title="Cross-Domain Analytics & Anomaly Detection"
        description="Air quality cross-correlated with health outcomes, climate drivers, economic impact, and traffic data. Anomaly detection using statistical z-score and satellite cross-validation."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span className="mono">LGBM Correlation Model v2.1 · Live</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "AQI–Health Correlation", v: "r=0.87", c: "rose" },
          { l: "Anomalies Detected 7d", v: "23", c: "amber" },
          { l: "Economic Loss Est.", v: "₹168Cr/day", c: "primary" },
          { l: "Climate Drivers Active", v: "3 of 6", c: "cyan" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Cross-domain time series */}
      <Panel title="Cross-Domain Time Series — 24h" subtitle="AQI vs Hospital Admissions, Traffic Density, Economic Loss Index">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CROSS_DOMAIN} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
              <YAxis yAxisId="aqi" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
              <Tooltip />
              <Line yAxisId="aqi" type="monotone" dataKey="aqi" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="AQI" />
              <Line yAxisId="right" type="monotone" dataKey="hospital_admissions" stroke="var(--rose)" strokeWidth={2} dot={false} name="Hospital admissions" />
              <Line yAxisId="right" type="monotone" dataKey="traffic_density" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Traffic density" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Health correlation scatter + climate drivers */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="AQI vs Hospital Respiratory Admissions" subtitle="30-day correlation across 5 cities · r=0.87">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="aqi" name="AQI" tick={{ fontSize: 9 }} label={{ value: "AQI", position: "insideBottom", offset: -4, fontSize: 10 }} />
                <YAxis type="number" dataKey="admissions" name="Admissions" tick={{ fontSize: 9 }} />
                <ZAxis range={[40, 40]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={HEALTH_CORR} fill="var(--rose)" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Climate Driver Correlations with AQI" subtitle="Pearson r coefficient · positive = amplifies pollution">
          <div className="space-y-2.5 mt-1">
            {CLIMATE_DRIVERS.map((d) => (
              <div key={d.factor}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span>{d.factor}</span>
                  <span className="mono font-semibold" style={{ color: Math.abs(d.correlation) > 0.7 ? "var(--rose)" : "var(--chart-1)" }}>
                    r={d.correlation > 0 ? "+" : ""}{d.correlation.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-3 rounded bg-border/30 overflow-hidden">
                  <div className="absolute top-0 left-1/2 h-full w-px bg-border" />
                  {d.correlation > 0 ? (
                    <div className="absolute left-1/2 h-full rounded" style={{
                      width: `${d.correlation * 48}%`,
                      background: "var(--rose)",
                    }} />
                  ) : (
                    <div className="absolute h-full rounded" style={{
                      right: "50%",
                      width: `${Math.abs(d.correlation) * 48}%`,
                      background: "var(--emerald)",
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Anomaly timeline */}
      <Panel title="Anomaly Detection Timeline" subtitle="Statistical z-score (|z|>3) + satellite cross-validation · auto-correlated with external data sources" dense>
        <div className="divide-y divide-border">
          {ANOMALY_TIMELINE.map((a) => (
            <div key={a.ts} className="flex items-start gap-3 p-3">
              <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: a.resolved ? "var(--amber)" : "var(--rose)" }} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold">{a.city} — {a.type}</span>
                  <span className="mono text-[10px] text-muted-foreground">z={a.magnitude.toFixed(1)}σ</span>
                  <span className="ml-auto mono text-[10px]" style={{ color: a.resolved ? "var(--emerald)" : "var(--rose)" }}>
                    {a.resolved ? "RESOLVED" : "OPEN"}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{a.corr}</div>
                <div className="mono text-[10px] text-muted-foreground">{a.ts.replace("T", " ")} UTC</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Economic impact */}
      <Panel title="Economic Impact Estimation — Annual" subtitle="WHO DALYs methodology + RBI economic cost model">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ECONOMIC_IMPACT} layout="vertical" margin={{ left: 140, right: 60 }}>
              <XAxis type="number" tick={{ fontSize: 9 }} unit=" Cr" />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()} Cr`]} />
              <Bar dataKey="crore" radius={[0, 4, 4, 0]}>
                {ECONOMIC_IMPACT.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-background/40 p-3 text-[11px] text-muted-foreground">
          Total estimated economic burden: <span className="text-foreground font-semibold mono">₹16,950 Cr/year</span> across the monitored grid. Methodology: WHO DALY cost (₹28L/DALY), RBI productivity loss model, NABARD agriculture impact assessment.
        </div>
      </Panel>
    </div>
  );
}
