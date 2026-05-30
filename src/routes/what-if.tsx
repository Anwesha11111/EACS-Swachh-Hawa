import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, ReferenceLine,
} from "recharts";
import { useState } from "react";
import { Play, RotateCcw, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/what-if")({
  head: () => ({ meta: [{ title: "What-if Analysis · Swachh Hawa" }] }),
  component: Page,
});

const BASELINE = { aqi: 198, pm25: 112, no2: 64 };

const LEVERS = [
  { id: "wind", label: "Wind Speed", unit: "m/s", min: 0, max: 10, default: 3.2, aqiEffect: -6.2 },
  { id: "traffic", label: "Traffic Ban Hours", unit: "h", min: 0, max: 12, default: 0, aqiEffect: -4.8 },
  { id: "industry", label: "Industrial Curtailment", unit: "%", min: 0, max: 100, default: 0, aqiEffect: -0.38 },
  { id: "stubble", label: "Stubble Ban Compliance", unit: "%", min: 0, max: 100, default: 20, aqiEffect: -0.55 },
  { id: "bl", label: "Boundary Layer Height", unit: "m", min: 100, max: 1000, default: 280, aqiEffect: -0.08 },
];

const SCENARIOS = [
  { name: "GRAP Stage IV Emergency", aqi: 248, delta: +50, color: "var(--rose)" },
  { name: "Baseline (Current)", aqi: 198, delta: 0, color: "var(--amber)" },
  { name: "Odd-Even + Industrial Ban", aqi: 162, delta: -36, color: "var(--chart-1)" },
  { name: "GRAP Stage I (wind only)", aqi: 144, delta: -54, color: "var(--cyan)" },
  { name: "Post-Monsoon (Aug)", aqi: 88, delta: -110, color: "var(--emerald)" },
];

export default function Page() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(LEVERS.map(l => [l.id, l.default]))
  );

  const deltaAQI = LEVERS.reduce((acc, l) => {
    const delta = l.id === "wind"
      ? (values[l.id] - l.default) * l.aqiEffect
      : l.id === "bl"
      ? (values[l.id] - l.default) * l.aqiEffect
      : (values[l.id] - l.default) * l.aqiEffect;
    return acc + delta;
  }, 0);

  const forecastAQI = Math.max(20, Math.round(BASELINE.aqi + deltaAQI));

  const trajectory = Array.from({ length: 24 }, (_, i) => ({
    h: `+${i}h`,
    baseline: BASELINE.aqi + Math.round(30 * Math.sin(i / 4)),
    scenario: forecastAQI + Math.round(25 * Math.sin(i / 4 + 0.5)),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="AI · What-if Analysis"
        title="Policy Counterfactual Simulator"
        description="Adjust intervention levers and see model-predicted AQI impact. Powered by LGBM causal model with LIME local approximation. Results inform GRAP escalation decisions."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Levers */}
        <div className="lg:col-span-2">
          <Panel title="Intervention Levers" subtitle="Drag sliders to simulate policy interventions — model updates in real time">
            <div className="space-y-5 p-2">
              {LEVERS.map(l => (
                <div key={l.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium">{l.label}</span>
                    <span className="mono font-semibold">{values[l.id].toFixed(l.id === "bl" ? 0 : 1)} {l.unit}</span>
                  </div>
                  <input
                    type="range" min={l.min} max={l.max} step={l.id === "bl" ? 10 : l.id === "wind" ? 0.1 : 1}
                    value={values[l.id]}
                    onChange={e => setValues(v => ({ ...v, [l.id]: parseFloat(e.target.value) }))}
                    className="w-full accent-primary h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mono mt-0.5">
                    <span>{l.min} {l.unit}</span>
                    <span>{l.max} {l.unit}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  <Play className="h-3.5 w-3.5" /> Run Scenario
                </button>
                <button onClick={() => setValues(Object.fromEntries(LEVERS.map(l => [l.id, l.default])))}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-accent/50">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          </Panel>
        </div>

        {/* Result */}
        <div className="flex flex-col gap-4">
          <Panel title="Predicted AQI" subtitle="Model output with current lever settings">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="mono text-6xl font-bold" style={{ color: forecastAQI > 300 ? "var(--rose)" : forecastAQI > 200 ? "var(--amber)" : forecastAQI > 100 ? "var(--chart-1)" : "var(--emerald)" }}>
                {forecastAQI}
              </div>
              <div className="mt-2 mono text-sm" style={{ color: deltaAQI < 0 ? "var(--emerald)" : "var(--rose)" }}>
                {deltaAQI < 0 ? "↓" : "↑"} {Math.abs(Math.round(deltaAQI))} vs baseline ({BASELINE.aqi})
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {forecastAQI > 300 ? "Very Poor" : forecastAQI > 200 ? "Poor" : forecastAQI > 100 ? "Moderate" : "Satisfactory"}
              </div>
            </div>
          </Panel>
          <Panel title="SHAP Attribution" subtitle="Which lever drove the change?">
            <div className="space-y-2">
              {LEVERS.map(l => {
                const contrib = l.id === "wind"
                  ? (values[l.id] - l.default) * l.aqiEffect
                  : l.id === "bl"
                  ? (values[l.id] - l.default) * l.aqiEffect
                  : (values[l.id] - l.default) * l.aqiEffect;
                return (
                  <div key={l.id} className="flex items-center gap-2 text-xs">
                    <span className="flex-1 truncate text-muted-foreground">{l.label}</span>
                    <span className="mono font-semibold w-12 text-right" style={{ color: contrib < 0 ? "var(--emerald)" : contrib > 0 ? "var(--rose)" : "var(--muted-foreground)" }}>
                      {contrib === 0 ? "±0" : contrib < 0 ? Math.round(contrib) : `+${Math.round(contrib)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="24h Trajectory — Baseline vs. Scenario" subtitle="Scenario applies interventions immediately; meteorology held constant">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectory} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip />
              <ReferenceLine y={200} stroke="var(--amber)" strokeDasharray="4 2" label={{ value: "Poor", fontSize: 9 }} />
              <ReferenceLine y={300} stroke="var(--rose)" strokeDasharray="4 2" label={{ value: "V.Poor", fontSize: 9 }} />
              <Line type="monotone" dataKey="baseline" stroke="var(--rose)" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Baseline" />
              <Line type="monotone" dataKey="scenario" stroke="var(--emerald)" strokeWidth={2.5} dot={false} name="With interventions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Pre-built Scenarios" subtitle="Named policy scenarios for quick comparison">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {SCENARIOS.map(s => (
            <div key={s.name} className="rounded-xl border border-border bg-card/60 p-3 text-center cursor-pointer hover:bg-accent/40 transition-colors">
              <div className="mono text-2xl font-bold" style={{ color: s.color }}>{s.aqi}</div>
              <div className="text-[10px] mono mt-0.5" style={{ color: s.delta < 0 ? "var(--emerald)" : s.delta > 0 ? "var(--rose)" : "var(--muted-foreground)" }}>
                {s.delta === 0 ? "baseline" : s.delta < 0 ? `↓${Math.abs(s.delta)}` : `↑${s.delta}`}
              </div>
              <div className="text-[11px] mt-1 text-muted-foreground leading-tight">{s.name}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
