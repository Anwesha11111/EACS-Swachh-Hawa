import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Building2, TrendingDown, Award } from "lucide-react";

export const Route = createFileRoute("/smart-city")({
  head: () => ({ meta: [{ title: "Smart City Monitor · Swachh Hawa" }] }),
  component: Page,
});

const CITIES_KPI = [
  { city: "Surat", aqiScore: 82, green: 91, ev: 74, waste: 88, water: 79, overall: 83, trend: +4 },
  { city: "Pune", aqiScore: 78, green: 85, ev: 68, waste: 82, water: 88, overall: 80, trend: +2 },
  { city: "Bhopal", aqiScore: 72, green: 80, ev: 55, waste: 76, water: 72, overall: 71, trend: +3 },
  { city: "Nagpur", aqiScore: 69, green: 74, ev: 61, waste: 71, water: 68, overall: 69, trend: +1 },
  { city: "Indore", aqiScore: 74, green: 88, ev: 62, waste: 92, water: 81, overall: 79, trend: +6 },
  { city: "Delhi", aqiScore: 28, green: 44, ev: 52, waste: 58, water: 61, overall: 49, trend: -2 },
  { city: "Patna", aqiScore: 18, green: 32, ev: 28, waste: 42, water: 55, overall: 35, trend: -4 },
];

const TOP_CITY = CITIES_KPI[0];
const RADAR_TOP = [
  { axis: "Air Quality", A: TOP_CITY.aqiScore },
  { axis: "Green Cover", A: TOP_CITY.green },
  { axis: "EV Adoption", A: TOP_CITY.ev },
  { axis: "Waste Mgmt", A: TOP_CITY.waste },
  { axis: "Water Quality", A: TOP_CITY.water },
];

const NCAP_CITIES_COUNT = [
  { state: "Maharashtra", smart: 5, ncap: 9 },
  { state: "Madhya Pradesh", smart: 4, ncap: 7 },
  { state: "Gujarat", smart: 3, ncap: 6 },
  { state: "Uttar Pradesh", smart: 2, ncap: 17 },
  { state: "Delhi", smart: 1, ncap: 11 },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="OVERVIEW · Smart City Monitor"
        title="Smart City Environmental KPI Dashboard"
        description="Multi-dimensional environmental scorecards for India's Smart Cities Mission cities. Air quality, green cover, EV fleet adoption, waste management, and water quality indices aggregated from live sensor data."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Smart Cities Monitored", v: "72", c: "primary" },
          { l: "Best Performer", v: "Surat", c: "emerald" },
          { l: "Avg Overall Score", v: "66/100", c: "chart-1" },
          { l: "Improving YoY", v: "58%", c: "cyan" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="City Environmental Scorecard" subtitle="Air quality · green cover · EV · waste · water · overall (0–100)" dense>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
                  <tr className="border-b border-border">
                    {["City","AQI Score","Green Cover","EV Adoption","Waste Mgmt","Water","Overall","Trend"].map(h => (
                      <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CITIES_KPI.map(c => (
                    <tr key={c.city} className="border-b border-border/40 hover:bg-accent/40">
                      <td className="px-3 py-2.5 font-medium">{c.city}</td>
                      {[c.aqiScore, c.green, c.ev, c.waste, c.water].map((v, i) => (
                        <td key={i} className="px-3 py-2.5 mono" style={{ color: v > 70 ? "var(--emerald)" : v > 50 ? "var(--amber)" : "var(--rose)" }}>{v}</td>
                      ))}
                      <td className="px-3 py-2.5 mono font-bold" style={{ color: c.overall > 70 ? "var(--emerald)" : c.overall > 50 ? "var(--amber)" : "var(--rose)" }}>{c.overall}</td>
                      <td className="px-3 py-2.5 mono font-semibold" style={{ color: c.trend > 0 ? "var(--emerald)" : "var(--rose)" }}>{c.trend > 0 ? `+${c.trend}` : c.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel title="Best Performer — Surat" subtitle="Multi-axis environmental radar">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-[var(--emerald)]" />
            <span className="text-sm font-semibold">Surat · Score 83/100</span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_TOP} cx="50%" cy="50%" outerRadius={80}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                <Radar name="Surat" dataKey="A" stroke="var(--emerald)" fill="var(--emerald)" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip formatter={(v: number) => [`${v}/100`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Overall Score Distribution" subtitle="Smart cities ranked by combined environmental score">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CITIES_KPI.sort((a, b) => b.overall - a.overall)} margin={{ top: 4, right: 16, bottom: 20, left: 0 }}>
                <XAxis dataKey="city" tick={{ fontSize: 9, fontFamily: "monospace" }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Tooltip formatter={(v: number) => [`${v}/100`]} />
                <Bar dataKey="overall" radius={[4, 4, 0, 0]}>
                  {CITIES_KPI.map((d, i) => (
                    <Cell key={i} fill={d.overall > 70 ? "var(--emerald)" : d.overall > 50 ? "var(--amber)" : "var(--rose)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Smart Cities vs NCAP Coverage" subtitle="How many non-attainment cities are also Smart Cities">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={NCAP_CITIES_COUNT} layout="vertical" margin={{ left: 100, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="state" tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="ncap" fill="var(--amber)" name="Non-attainment cities" radius={[0, 4, 4, 0]} />
                <Bar dataKey="smart" fill="var(--emerald)" name="Smart Cities" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
