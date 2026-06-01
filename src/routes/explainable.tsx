import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Brain, TrendingDown, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/explainable")({
  head: () => ({ meta: [{ title: "Explainable AI · Swachh Hawa" }] }),
  component: Page,
});

const SHAP_VALUES = [
  { feature: "PM2.5 lag-24h", shap: 28.4, dir: 1 },
  { feature: "Wind speed", shap: -18.2, dir: -1 },
  { feature: "Temperature", shap: -12.1, dir: -1 },
  { feature: "Humidity", shap: 9.8, dir: 1 },
  { feature: "NO₂ lag-6h", shap: 14.3, dir: 1 },
  { feature: "Traffic density", shap: 8.6, dir: 1 },
  { feature: "NDVI (green)", shap: -6.2, dir: -1 },
  { feature: "Solar radiation", shap: -5.1, dir: -1 },
  { feature: "Boundary layer H", shap: -11.7, dir: -1 },
  { feature: "Dew point", shap: 4.4, dir: 1 },
].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));

const COUNTERFACTUALS = [
  { scenario: "Wind speed +2 m/s", aqiDelta: -34, from: 198, to: 164, feasible: true },
  { scenario: "Temp -3 °C", aqiDelta: -19, from: 198, to: 179, feasible: true },
  { scenario: "Humidity -15%", aqiDelta: +12, from: 198, to: 210, feasible: false },
  { scenario: "Boundary layer +200m", aqiDelta: -41, from: 198, to: 157, feasible: true },
  { scenario: "Traffic ban 6–10h", aqiDelta: -22, from: 198, to: 176, feasible: true },
];

const MODEL_DRIFT = Array.from({ length: 30 }, (_, i) => ({
  day: `${1 + i} May`,
  mae: parseFloat((12.4 + Math.sin(i / 4) * 2.1 + Math.random() * 1.5).toFixed(2)),
  rmse: parseFloat((18.2 + Math.sin(i / 3.5) * 3.4 + Math.random() * 2).toFixed(2)),
}));

const CONFIDENCE_INTERVAL = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  predicted: 160 + Math.round(60 * Math.sin(i / 3.8) + 20),
  upper: 195 + Math.round(55 * Math.sin(i / 3.8) + 25),
  lower: 125 + Math.round(65 * Math.sin(i / 3.8) + 15),
  actual: i < 6 ? 162 + Math.round(58 * Math.sin(i / 3.8) + 18) : undefined,
}));

const RADAR_FEATURES = [
  { feature: "PM2.5 lag", A: 90 },
  { feature: "Meteorology", A: 72 },
  { feature: "Traffic", A: 55 },
  { feature: "Industry", A: 68 },
  { feature: "Boundary layer", A: 80 },
  { feature: "Seasonality", A: 48 },
];

const MLFLOW_VERSIONS = [
  { run: "v3.2.1", date: "2026-05-20", mae: 11.8, rmse: 16.4, status: "production" },
  { run: "v3.2.0", date: "2026-05-10", mae: 13.1, rmse: 19.4, status: "archived" },
  { run: "v3.1.5", date: "2026-04-28", mae: 14.7, rmse: 21.8, status: "archived" },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="AI · Explainable AI"
        title="SHAP Explainability & Model Governance"
        description="SHapley Additive exPlanations (SHAP) for every forecast. Counterfactual scenarios, LIME local approximations, model drift monitoring, and MLflow version lineage."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span className="mono">Model: LGBM v3.2.1 · MAE 11.8</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Model MAE (AQI)", v: "11.8", c: "emerald" },
          { l: "RMSE (AQI)", v: "16.4", c: "chart-1" },
          { l: "24h Confidence Band", v: "±35", c: "cyan" },
          { l: "Drift Detected", v: "None", c: "emerald" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="SHAP Waterfall — Delhi AQI Forecast (Current)" subtitle="Feature contributions to today's AQI=198 prediction (base=140). Positive=increases AQI, Negative=decreases.">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SHAP_VALUES} layout="vertical" margin={{ left: 140, right: 50 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} domain={[-35, 35]} unit=" AQI" />
                <YAxis type="category" dataKey="feature" tick={{ fontSize: 9, fontFamily: "monospace" }} width={140} />
                <Tooltip formatter={(v: number) => [`${v > 0 ? "+" : ""}${v.toFixed(1)} AQI`]} />
                <Bar dataKey="shap" radius={[0, 3, 3, 0]}>
                  {SHAP_VALUES.map((d, i) => (
                    <Cell key={i} fill={d.dir > 0 ? "var(--rose)" : "var(--emerald)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--rose)]" />Increases AQI</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--emerald)]" />Decreases AQI</span>
          </div>
        </Panel>

        <Panel title="Feature Importance Radar" subtitle="Relative importance of input categories to the forecast model">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_FEATURES} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Radar name="SHAP importance" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Confidence interval */}
      <Panel title="24h Forecast with Confidence Intervals" subtitle="Shaded band = 90% prediction interval · Actual values shown where available">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CONFIDENCE_INTERVAL} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="var(--primary)" fillOpacity={0.1} name="Upper bound" />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="var(--background)" fillOpacity={1} name="Lower bound" />
              <Line type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={2} dot={false} name="Forecast" />
              <Line type="monotone" dataKey="actual" stroke="var(--emerald)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="0" name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Counterfactuals + model drift */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Counterfactual Scenarios" subtitle="What would AQI be if conditions changed? LIME local approximation.">
          <div className="space-y-2 mt-1">
            {COUNTERFACTUALS.map((c) => (
              <div key={c.scenario} className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3">
                <div className="flex-1">
                  <div className="text-xs font-medium">{c.scenario}</div>
                  <div className="text-[10px] text-muted-foreground mono">AQI {c.from} → {c.to}</div>
                </div>
                <div className="text-right">
                  <span className="mono text-sm font-bold" style={{ color: c.aqiDelta < 0 ? "var(--emerald)" : "var(--rose)" }}>
                    {c.aqiDelta > 0 ? "+" : ""}{c.aqiDelta}
                  </span>
                  <div className="text-[10px] text-muted-foreground">{c.feasible ? "feasible" : "infeasible"}</div>
                </div>
                {!c.feasible && <AlertTriangle className="h-4 w-4 text-[var(--amber)] flex-shrink-0" />}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Model Drift — MAE & RMSE (30 days)" subtitle="Degradation triggers automated retraining via MLflow pipeline">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MODEL_DRIFT} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={7} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="mae" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="MAE" />
                <Line type="monotone" dataKey="rmse" stroke="var(--rose)" strokeWidth={2} dot={false} name="RMSE" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* MLflow versions */}
      <Panel title="MLflow Model Registry" subtitle="Version lineage · production model auto-deployed on passing MAE < 14 threshold">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            <tr className="border-b border-border">
              {["Run ID","Deploy Date","MAE","RMSE","Status"].map((h) => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MLFLOW_VERSIONS.map((v) => (
              <tr key={v.run} className="border-b border-border/40 hover:bg-accent/40">
                <td className="px-4 py-2.5 mono text-primary font-semibold">{v.run}</td>
                <td className="px-4 py-2.5 mono text-muted-foreground">{v.date}</td>
                <td className="px-4 py-2.5 mono">{v.mae}</td>
                <td className="px-4 py-2.5 mono">{v.rmse}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded px-2 py-0.5 text-[10px] mono font-bold" style={{
                    background: v.status === "production" ? "color-mix(in oklab,var(--emerald) 18%,transparent)" : "color-mix(in oklab,var(--muted-foreground) 18%,transparent)",
                    color: v.status === "production" ? "var(--emerald)" : "var(--muted-foreground)",
                  }}>{v.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 rounded-lg border border-border bg-background/40 p-3 text-[11px] text-muted-foreground">
          <TrendingDown className="h-3.5 w-3.5 inline mr-1 text-[var(--emerald)]" />
          <span className="text-[var(--emerald)] font-semibold">No drift detected.</span> MAE stable at 11.8 for 10 days. Next scheduled retraining: 2026-06-01.
        </div>
      </Panel>
    </div>
  );
}
