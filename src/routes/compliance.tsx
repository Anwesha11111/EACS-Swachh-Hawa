import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance · Swachh Hawa" }] }),
  component: Page,
});

const NCAP_STATES = [
  { state: "Delhi", cities: 11, attained: 4, score: 62, trend: +4, pm25Avg: 187, grap: "III" },
  { state: "Uttar Pradesh", cities: 17, attained: 6, score: 48, trend: +2, pm25Avg: 164, grap: "—" },
  { state: "Punjab", cities: 8, attained: 5, score: 71, trend: +7, pm25Avg: 112, grap: "—" },
  { state: "Rajasthan", cities: 6, attained: 3, score: 55, trend: -1, pm25Avg: 138, grap: "—" },
  { state: "Haryana", cities: 7, attained: 4, score: 64, trend: +3, pm25Avg: 128, grap: "—" },
  { state: "Bihar", cities: 5, attained: 1, score: 31, trend: -3, pm25Avg: 221, grap: "—" },
  { state: "Maharashtra", cities: 9, attained: 7, score: 82, trend: +5, pm25Avg: 94, grap: "—" },
  { state: "West Bengal", cities: 6, attained: 3, score: 57, trend: +1, pm25Avg: 142, grap: "—" },
  { state: "Madhya Pradesh", cities: 7, attained: 4, score: 61, trend: +2, pm25Avg: 119, grap: "—" },
  { state: "Karnataka", cities: 4, attained: 4, score: 91, trend: +8, pm25Avg: 72, grap: "—" },
];

const NCAP_TREND = Array.from({ length: 6 }, (_, i) => ({
  year: `${2021 + i}`,
  cities_attained: 18 + i * 8,
  total: 131,
  pct: parseFloat(((18 + i * 8) / 1.31).toFixed(1)),
}));

const DPDP_POSTURE = [
  { clause: "§4 — Data minimisation", status: "compliant", detail: "Only fields necessary for AQI computation and enforcement are collected." },
  { clause: "§7 — Lawful basis", status: "compliant", detail: "DisclosurePolicy entity defines legal_basis per data class." },
  { clause: "§8 — Data principal rights", status: "compliant", detail: "Opt-out for location precision; data deletion requests processed in 72h." },
  { clause: "§9 — Data fiduciary duties", status: "compliant", detail: "DPDPA consent logs appended to audit trail per event." },
  { clause: "§11 — Cross-border transfer", status: "partial", detail: "Academic export uses international partners — SCCs under review." },
  { clause: "§17 — Exemptions (national security)", status: "compliant", detail: "Enforcement evidence exempt from DP under §17(2)(b)." },
  { clause: "§27 — Data Protection Board", status: "compliant", detail: "Incident reporting pipeline configured for 72h breach notification." },
];

const CAA_COMPLIANCE = [
  { standard: "NAAQS PM2.5 (24h)", limit: "60 µg/m³", cities_exceedance: 28, pct_exceed: 21 },
  { standard: "NAAQS PM10 (24h)", limit: "100 µg/m³", cities_exceedance: 22, pct_exceed: 17 },
  { standard: "NAAQS NO₂ (annual)", limit: "40 µg/m³", cities_exceedance: 14, pct_exceed: 11 },
  { standard: "NAAQS SO₂ (24h)", limit: "80 µg/m³", cities_exceedance: 6, pct_exceed: 5 },
  { standard: "GRAP Stage III trigger", limit: "AQI > 400", cities_exceedance: 3, pct_exceed: 2 },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="GOV · Compliance"
        title="NCAP & DPDP Compliance Dashboard"
        description="National Clean Air Programme (NCAP) state scorecards, DPDP Act 2023 posture matrix, and CAA/NAAQS exceedance statistics across 131 non-attainment cities."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50">
            <FileText className="h-3.5 w-3.5" /> Export Report
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "NCAP Cities Attained", v: "61 / 131", c: "emerald" },
          { l: "NCAP Target 2026", v: "40% reduction", c: "primary" },
          { l: "DPDP Clauses Compliant", v: "6 / 7", c: "cyan" },
          { l: "NAAQS Exceedances", v: "28 cities", c: "rose" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* NCAP scorecard */}
      <Panel title="NCAP State-by-State Scorecard" subtitle="National Clean Air Programme · 131 non-attainment cities · 2026 compliance baseline" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["State","Non-Att. Cities","Attained","Compliance Score","PM2.5 Avg","Trend (YoY)","GRAP Stage","Status"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NCAP_STATES.map((s) => (
                <tr key={s.state} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 font-medium">{s.state}</td>
                  <td className="px-3 py-2.5 mono">{s.cities}</td>
                  <td className="px-3 py-2.5 mono">{s.attained}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="relative h-4 w-20 rounded bg-border/40 overflow-hidden">
                        <div className="h-full rounded" style={{
                          width: `${s.score}%`,
                          background: s.score >= 75 ? "var(--emerald)" : s.score >= 50 ? "var(--amber)" : "var(--rose)",
                        }} />
                      </div>
                      <span className="mono text-[10px]">{s.score}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 mono" style={{ color: s.pm25Avg > 150 ? "var(--rose)" : s.pm25Avg > 100 ? "var(--amber)" : "var(--emerald)" }}>{s.pm25Avg}</td>
                  <td className="px-3 py-2.5 mono" style={{ color: s.trend > 0 ? "var(--emerald)" : "var(--rose)" }}>{s.trend > 0 ? `+${s.trend}` : s.trend}%</td>
                  <td className="px-3 py-2.5 mono font-semibold" style={{ color: s.grap !== "—" ? "var(--rose)" : "var(--muted-foreground)" }}>{s.grap}</td>
                  <td className="px-3 py-2.5">
                    {s.score >= 75 ? <CheckCircle2 className="h-4 w-4 text-[var(--emerald)]" />
                      : s.score >= 50 ? <AlertTriangle className="h-4 w-4 text-[var(--amber)]" />
                      : <XCircle className="h-4 w-4 text-[var(--rose)]" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* NCAP trend + CAA */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="NCAP Attainment Progress — 2021–2026" subtitle="% of 131 non-attainment cities achieving PM2.5 targets">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={NCAP_TREND} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis tick={{ fontSize: 9 }} unit="%" />
                <Tooltip formatter={(v: number) => [`${v}%`, "Cities attained"]} />
                <Line type="monotone" dataKey="pct" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4, fill: "var(--chart-1)" }} name="Attainment %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="NAAQS Standard Exceedances" subtitle="Cities exceeding 24h and annual national standards">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CAA_COMPLIANCE} layout="vertical" margin={{ left: 160, right: 40 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} unit=" cities" />
                <YAxis type="category" dataKey="standard" tick={{ fontSize: 9 }} width={160} />
                <Tooltip formatter={(v: number) => [`${v} cities`]} />
                <Bar dataKey="cities_exceedance" radius={[0, 4, 4, 0]}>
                  {CAA_COMPLIANCE.map((d, i) => (
                    <Cell key={i} fill={d.pct_exceed > 15 ? "var(--rose)" : d.pct_exceed > 8 ? "var(--amber)" : "var(--chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* DPDP posture */}
      <Panel title="DPDP Act 2023 — Compliance Posture" subtitle="Digital Personal Data Protection Act · clause-by-clause implementation status">
        <div className="divide-y divide-border">
          {DPDP_POSTURE.map((p) => (
            <div key={p.clause} className="flex items-start gap-3 py-3 px-1">
              {p.status === "compliant"
                ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-[var(--emerald)] flex-shrink-0" />
                : <AlertTriangle className="h-4 w-4 mt-0.5 text-[var(--amber)] flex-shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold mono">{p.clause}</span>
                  <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                    background: p.status === "compliant" ? "color-mix(in oklab,var(--emerald) 16%,transparent)" : "color-mix(in oklab,var(--amber) 16%,transparent)",
                    color: p.status === "compliant" ? "var(--emerald)" : "var(--amber)",
                  }}>{p.status.toUpperCase()}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{p.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
