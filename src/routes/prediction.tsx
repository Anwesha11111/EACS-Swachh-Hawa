import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, Bar,
} from "recharts";
import { FORECAST_7D, CITIES } from "@/lib/mock-data";
import { Brain, TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/prediction")({
  head: () => ({ meta: [{ title: "Pollution Prediction · Swachh Hawa" }] }),
  component: Page,
});

const HORIZONS = ["24h", "48h", "72h", "7d", "30d"];
const CITY_OPTIONS = ["Delhi", "Mumbai", "Kolkata", "Patna", "Lucknow"];

const HOURLY_FORECAST = Array.from({ length: 48 }, (_, i) => ({
  h: `+${i}h`,
  aqi: 160 + Math.round(80 * Math.sin(i / 6) + Math.random() * 20),
  upper: 195 + Math.round(70 * Math.sin(i / 6) + Math.random() * 15),
  lower: 125 + Math.round(60 * Math.sin(i / 6) + Math.random() * 15),
  pm25: 88 + Math.round(45 * Math.sin(i / 6 + 0.3) + Math.random() * 12),
}));

const MULTI_CITY_FORECAST = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  delhi: 200 + Math.round(60 * Math.sin(i / 2) + 10),
  patna: 330 + Math.round(50 * Math.sin(i / 2.2) + 15),
  lucknow: 280 + Math.round(55 * Math.sin(i / 1.8 + 0.3) + 12),
  mumbai: 140 + Math.round(30 * Math.sin(i / 3 + 1) + 8),
}));

export default function Page() {
  const [horizon, setHorizon] = useState("48h");
  const [city, setCity] = useState("Delhi");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="AI · Pollution Prediction"
        title="Multi-Horizon Pollutant Forecasting"
        description="LightGBM ensemble model with 48-feature input. Confidence intervals via quantile regression. MLflow-versioned. SHAP attribution available on Explainable AI page."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span className="mono">LGBM v3.2.1 · MAE 11.8 · R² 0.91</span>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card/70 p-1">
          <span className="text-[10px] mono text-muted-foreground ml-1 mr-1">Horizon:</span>
          {HORIZONS.map(h => (
            <button key={h} onClick={() => setHorizon(h)}
              className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ background: horizon === h ? "var(--primary)" : "transparent", color: horizon === h ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
              {h}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card/70 p-1">
          <span className="text-[10px] mono text-muted-foreground ml-1 mr-1">City:</span>
          {CITY_OPTIONS.map(c => (
            <button key={c} onClick={() => setCity(c)}
              className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ background: city === c ? "var(--primary)" : "transparent", color: city === c ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Forecast AQI +6h", v: "194", c: "amber" },
          { l: "Forecast AQI +24h", v: "178", c: "amber" },
          { l: "Confidence (24h)", v: "87%", c: "emerald" },
          { l: "Peak Expected", v: "+8h · 218", c: "rose" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title={`${city} · AQI Forecast — ${horizon} with 90% Confidence Band`} subtitle="Shaded band = quantile regression p5–p95 · actual shown where available">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={HOURLY_FORECAST.slice(0, horizon === "24h" ? 24 : horizon === "48h" ? 48 : 24)} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={5} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="var(--primary)" fillOpacity={0.12} name="Upper CI" />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="var(--background)" fillOpacity={1} name="Lower CI" />
              <Line type="monotone" dataKey="aqi" stroke="var(--primary)" strokeWidth={2.5} dot={false} name="AQI Forecast" />
              <Line type="monotone" dataKey="pm25" stroke="var(--rose)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="PM2.5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="7-Day Multi-City AQI Forecast" subtitle="LGBM ensemble · independent per-city model chain">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MULTI_CITY_FORECAST} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="patna" stroke="var(--rose)" strokeWidth={2} dot={{ r: 3 }} name="Patna" />
                <Line type="monotone" dataKey="lucknow" stroke="var(--amber)" strokeWidth={2} dot={{ r: 3 }} name="Lucknow" />
                <Line type="monotone" dataKey="delhi" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} name="Delhi" />
                <Line type="monotone" dataKey="mumbai" stroke="var(--emerald)" strokeWidth={2} dot={{ r: 3 }} name="Mumbai" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="7-Day Forecast Summary Table" subtitle="Predicted AQI with category and confidence" dense>
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Day","Predicted","Upper","Lower","Confidence","Category"].map(h => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORECAST_7D.map(d => (
                <tr key={d.day} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2 mono font-medium">{d.day}</td>
                  <td className="px-3 py-2 mono font-bold" style={{ color: d.predicted > 300 ? "var(--rose)" : d.predicted > 200 ? "var(--amber)" : "var(--chart-1)" }}>{d.predicted}</td>
                  <td className="px-3 py-2 mono text-muted-foreground">{d.upper}</td>
                  <td className="px-3 py-2 mono text-muted-foreground">{d.lower}</td>
                  <td className="px-3 py-2 mono">{(d.confidence * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2 text-[10px] mono text-muted-foreground">
                    {d.predicted > 300 ? "Very Poor" : d.predicted > 200 ? "Poor" : d.predicted > 100 ? "Moderate" : "Satisfactory"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
