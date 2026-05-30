import { createFileRoute } from "@tanstack/react-router";
import { Panel, StatusDot } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { FORECAST_7D, AI_INSIGHTS } from "@/lib/mock-data";
import {
  Area, AreaChart, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell, ReferenceLine,
} from "recharts";
import { Brain, FlaskConical, GitBranch, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forecasting")({
  head: () => ({ meta: [{ title: "AI Forecasting · Swachh Hawa" }] }),
  component: Page,
});

// SHAP values: positive = AQI-raising contributor (rose), negative = AQI-reducing (emerald)
const SHAP = [
  { f: "Traffic Density",      v:  0.32 },
  { f: "Wind Speed (inv)",     v:  0.21 },
  { f: "Industrial Load",      v:  0.18 },
  { f: "Humidity",             v:  0.11 },
  { f: "Temperature",          v:  0.09 },
  { f: "Crop Burning Index",   v:  0.06 },
  { f: "Construction Active",  v:  0.03 },
  { f: "Rain (last 6h)",       v: -0.14 },
  { f: "Sea Breeze Onset",     v: -0.08 },
];

const MODEL_META = [
  { k: "Model",          v: "LGBM v3.2.1 + LSTM-Transformer Ensemble v6.2" },
  { k: "Trained on",     v: "2019–2025 CPCB telemetry · 14,832 sensor-years" },
  { k: "Horizon",        v: "24h / 48h / 72h / 7d / 30d" },
  { k: "MAE (24h)",      v: "11.8 µg/m³ PM2.5" },
  { k: "RMSE (24h)",     v: "16.4 µg/m³" },
  { k: "R² (test set)",  v: "0.93" },
  { k: "Retrain cadence",v: "Weekly rolling window + on-drift alert" },
  { k: "Registry",       v: "MLflow · Run ID: a4e7f2b9 · Stage: Production" },
  { k: "DP note",        v: "Forecasting inputs use raw (unperturbed) sensor data — DP noise added only at publish boundary" },
  { k: "Context filter", v: "source_proximate readings excluded from public AQI aggregation used as training label" },
];

const DRIFT_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  mae:  11.8 + Math.round((Math.sin(i / 5) * 1.5 + Math.random() * 0.8) * 10) / 10,
  rmse: 16.4 + Math.round((Math.sin(i / 5) * 2.2 + Math.random() * 1.1) * 10) / 10,
}));

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="MODEL · LGBM + LSTM-Transformer Ensemble v6.2"
        title="AI Forecasting & Explainability"
        description="Neural ensemble pollution forecast with SHAP-based explainability, 95% confidence intervals, and MLflow-tracked model registry. Forecasting inputs always use raw unperturbed sensor readings — differential privacy is applied only at the public-facing publish boundary."
        actions={
          <div className="flex items-center gap-2 text-[11px] mono">
            <StatusDot tone="emerald" />
            <span className="text-muted-foreground">INFER · 14ms · GPU-EDGE-7B</span>
          </div>
        }
      />

      {/* DP caveat banner */}
      <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/6 px-4 py-3 flex items-start gap-3">
        <FlaskConical className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Forecasting uses raw internal data.</span>{" "}
          Differential privacy (ε = 0.5 Laplace/Gaussian) is injected <em>only</em> at the open-data API and citizen portal
          publish boundary — never on forecasting inputs, enforcement evidence, or internal analytics.
          <span className="ml-2 font-semibold text-[var(--primary)]">source_proximate</span> readings are
          routed exclusively to enforcement dossiers and are excluded from the public AQI label used to train the model.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title="7-day Pollution Forecast" subtitle="95% confidence band · Delhi-NCR · LGBM + LSTM-Transformer ensemble">
          <div className="h-[360px] relative">
            <NeuralBg />
            <ResponsiveContainer>
              <ComposedChart data={FORECAST_7D}>
                <defs>
                  <linearGradient id="band" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} label={{ value: "AQI", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
                <ReferenceLine y={300} stroke="var(--amber)" strokeDasharray="4 2" strokeWidth={1} label={{ value: "Stage II", fontSize: 9, fill: "var(--amber)" }} />
                <ReferenceLine y={200} stroke="var(--cyan)" strokeDasharray="4 2" strokeWidth={1} label={{ value: "Moderate", fontSize: 9, fill: "var(--cyan)" }} />
                <Area dataKey="upper" stroke="none" fill="url(#band)" />
                <Area dataKey="lower" stroke="none" fill="var(--background)" />
                <Line dataKey="predicted" stroke="var(--primary)" strokeWidth={2.4} dot={{ r: 4, fill: "var(--primary)" }} name="Forecast AQI" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Confidence by City">
            <div className="space-y-3">
              {[
                { c: "Delhi",     v: 0.92 },
                { c: "Mumbai",    v: 0.78 },
                { c: "Kolkata",   v: 0.71 },
                { c: "Bengaluru", v: 0.86 },
                { c: "Chennai",   v: 0.83 },
              ].map(({ c, v }) => (
                <div key={c}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>{c}</span>
                    <span className="mono" style={{ color: v >= 0.85 ? "var(--emerald)" : v >= 0.7 ? "var(--amber)" : "var(--rose)" }}>
                      {(v * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded bg-muted">
                    <div className="h-full" style={{ width: `${v * 100}%`, background: v >= 0.85 ? "var(--emerald)" : v >= 0.7 ? "var(--amber)" : "var(--rose)" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-xs">
                <Brain className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">Ensemble agreement</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                LGBM × LSTM × Transformer concur with 0.94 cosine similarity on next-48h trajectory.
              </div>
            </div>
          </Panel>

          <Panel title="Model Registry" subtitle="MLflow · Production stage">
            <div className="space-y-1.5 text-xs">
              {[
                { k: "Run ID",   v: "a4e7f2b9" },
                { k: "MAE 24h",  v: "11.8 µg/m³" },
                { k: "R²",       v: "0.93" },
                { k: "Stage",    v: "Production", highlight: true },
              ].map(({ k, v, highlight }) => (
                <div key={k} className="flex items-center justify-between border-b border-border/30 pb-1">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="mono font-semibold" style={{ color: highlight ? "var(--emerald)" : undefined }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <GitBranch className="h-3 w-3" />
              <span>Retrain cadence: weekly rolling window + drift trigger</span>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="SHAP Feature Attribution" subtitle="Positive = AQI-raising · Negative = AQI-reducing · Delhi-NCR current window">
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={SHAP} layout="vertical" margin={{ left: 16, right: 32 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[-0.2, 0.4]} />
                <YAxis dataKey="f" type="category" width={140} tick={{ fontSize: 10, fill: "var(--foreground)" }} />
                <ReferenceLine x={0} stroke="var(--border)" strokeWidth={1.5} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
                  formatter={(v: number) => [v > 0 ? `+${v.toFixed(2)} (raises AQI)` : `${v.toFixed(2)} (reduces AQI)`, "SHAP"]}
                />
                <Bar dataKey="v" radius={[0, 4, 4, 0]}>
                  {SHAP.map((d, i) => (
                    <Cell key={i} fill={d.v >= 0 ? "var(--rose)" : "var(--emerald)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Scenario Radar" subtitle="Baseline vs. GRAP Stage III enforcement scenario">
          <div className="h-[300px]">
            <ResponsiveContainer>
              <RadarChart data={[
                { k: "Traffic",      base: 80, scenario: 50 },
                { k: "Industrial",   base: 72, scenario: 58 },
                { k: "Construction", base: 65, scenario: 40 },
                { k: "Biomass",      base: 55, scenario: 30 },
                { k: "Dust",         base: 48, scenario: 35 },
                { k: "Other",        base: 30, scenario: 22 },
              ]}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="k" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                <Radar dataKey="base"     name="Baseline"  stroke="var(--rose)"    fill="var(--rose)"    fillOpacity={0.15} />
                <Radar dataKey="scenario" name="GRAP III"  stroke="var(--emerald)" fill="var(--emerald)" fillOpacity={0.2} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-[10px] mono">
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded" style={{ background: "var(--rose)" }} /> Baseline</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded" style={{ background: "var(--emerald)" }} /> GRAP Stage III</span>
          </div>
        </Panel>
      </div>

      {/* Model drift */}
      <Panel title="Model Drift Monitor — 30 Days" subtitle="MAE and RMSE rolling window · Retrain triggers if MAE > 18 µg/m³ for 3 consecutive days">
        <div className="h-[200px]">
          <ResponsiveContainer>
            <ComposedChart data={DRIFT_DATA} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} label={{ value: "Day", position: "insideBottomRight", offset: -4, fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} unit=" µg" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 11 }} />
              <ReferenceLine y={18} stroke="var(--amber)" strokeDasharray="4 2" label={{ value: "Retrain threshold", fontSize: 9, fill: "var(--amber)" }} />
              <Line type="monotone" dataKey="mae"  stroke="var(--primary)" strokeWidth={2} dot={false} name="MAE" />
              <Line type="monotone" dataKey="rmse" stroke="var(--cyan)"    strokeWidth={1.5} dot={false} name="RMSE" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex gap-4 text-[10px] mono">
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-6" style={{ background: "var(--primary)" }} /> MAE</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-6" style={{ background: "var(--cyan)" }} /> RMSE</span>
        </div>
      </Panel>

      {/* Model metadata table */}
      <Panel title="Model Metadata & Architecture Notes" subtitle="Full provenance for INITIATE 2026 audit trail">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              {MODEL_META.map(({ k, v }) => (
                <tr key={k} className="border-b border-border/40 hover:bg-accent/30">
                  <td className="px-4 py-2 mono text-muted-foreground text-[10px] uppercase tracking-wider whitespace-nowrap w-40">{k}</td>
                  <td className="px-4 py-2 font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="AI Insight Feed" subtitle="Ensemble-generated alerts · grounded on verified sensor telemetry only">
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {AI_INSIGHTS.map((i) => (
            <li key={i.title} className="rounded-lg border border-border bg-background/40 p-3 hover:border-primary/40">
              <div className="text-[10px] mono uppercase" style={{ color: i.severity === "CRITICAL" ? "var(--rose)" : i.severity === "HIGH" ? "var(--amber)" : "var(--primary)" }}>{i.severity}</div>
              <div className="mt-1 text-sm font-medium">{i.title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{i.detail}</p>
              <div className="mt-2 text-[10px] mono text-muted-foreground">conf {(i.confidence * 100).toFixed(0)}%</div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function NeuralBg() {
  return (
    <svg className="pointer-events-none absolute inset-0 opacity-15" viewBox="0 0 400 200">
      {Array.from({ length: 16 }).map((_, i) => (
        <g key={i}>
          <line x1={20 + (i % 4) * 40} y1={20 + Math.floor(i / 4) * 40} x2={140} y2={100} stroke="var(--primary)" strokeWidth="0.3" />
          <circle cx={20 + (i % 4) * 40} cy={20 + Math.floor(i / 4) * 40} r="2" fill="var(--cyan)" />
        </g>
      ))}
    </svg>
  );
}
