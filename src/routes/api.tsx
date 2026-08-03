import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Code2, Key, Zap, Shield } from "lucide-react";

export const Route = createFileRoute("/api")({
  head: () => ({ meta: [{ title: "Research APIs · Swachh Hawa" }] }),
  component: Page,
});

const ENDPOINTS = [
  { method: "GET", path: "/v1/aqi/{city}", desc: "Current AQI for a city with DP-sanitised reading", auth: "API Key", dp: "ε=1.0", rate: "100/min" },
  { method: "GET", path: "/v1/aqi/grid", desc: "Full national grid snapshot (all stations)", auth: "API Key", dp: "ε=1.0", rate: "10/min" },
  { method: "GET", path: "/v1/forecast/{city}", desc: "7-day AQI forecast with confidence intervals", auth: "API Key", dp: "None", rate: "100/min" },
  { method: "GET", path: "/v1/history/{city}", desc: "Historical AQI time-series by date range", auth: "API Key + JWT", dp: "ε=4.0", rate: "30/min" },
  { method: "GET", path: "/v1/incidents", desc: "Public enforcement incident summaries", auth: "API Key", dp: "ε=2.0", rate: "50/min" },
  { method: "GET", path: "/v1/proof/{hash}", desc: "Cryptographic Merkle proof for a measurement hash", auth: "None", dp: "None", rate: "200/min" },
  { method: "POST", path: "/v1/alerts/subscribe", desc: "Register push alert endpoint (AQI threshold)", auth: "JWT", dp: "ε=0.5", rate: "5/day" },
  { method: "GET", path: "/v1/sensors", desc: "Station metadata (no raw readings)", auth: "API Key", dp: "None", rate: "100/min" },
];

const API_USAGE = Array.from({ length: 14 }, (_, i) => ({
  day: `${16 + i} May`,
  calls: 48000 + Math.round(12000 * Math.sin(i / 3) + Math.random() * 5000),
  errors: Math.round(120 + Math.random() * 80),
}));

const CONSUMERS = [
  { name: "CPCB Internal Dashboard", key: "CPCB-001", calls24h: 12841, tier: "Enterprise" },
  { name: "IIT Delhi Research Group", key: "IITD-018", calls24h: 8210, tier: "Research" },
  { name: "AirVisual India", key: "AVS-044", calls24h: 48200, tier: "Commercial" },
  { name: "WHO South-East Asia", key: "WHO-009", calls24h: 3440, tier: "Multilateral" },
  { name: "Citizen App (iOS/Android)", key: "MOB-102", calls24h: 124800, tier: "Public" },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "var(--emerald)",
  POST: "var(--cyan)",
  DELETE: "var(--rose)",
};

function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="RESEARCH · Research APIs"
        title="Open Data API — OpenAPI 3.1"
        description="Signed, rate-limited REST APIs exposing AQI readings, forecasts, cryptographic proofs, and enforcement summaries. Differential privacy applied at the publish boundary per DisclosurePolicy."
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50">
              <Code2 className="h-3.5 w-3.5" /> OpenAPI Spec
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
              <Key className="h-3.5 w-3.5" /> Request API Key
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "API Calls 24h", v: "1.24M", c: "primary" },
          { l: "Error Rate", v: "0.18%", c: "emerald" },
          { l: "p99 Latency", v: "184ms", c: "cyan" },
          { l: "Active API Keys", v: "1,241", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title="API Endpoint Reference" subtitle="All GET endpoints return DP-sanitised data · Merkle proof endpoint is public and unauthenticated" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Method","Endpoint","Description","Auth","DP Budget","Rate Limit"].map(h => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map(e => (
                <tr key={e.path} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: `color-mix(in oklab,${METHOD_COLOR[e.method]} 16%,transparent)`,
                      color: METHOD_COLOR[e.method],
                    }}>{e.method}</span>
                  </td>
                  <td className="px-3 py-2.5 mono text-primary text-[10px] whitespace-nowrap">{e.path}</td>
                  <td className="px-3 py-2.5 text-muted-foreground max-w-[200px]">{e.desc}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground">{e.auth}</td>
                  <td className="px-3 py-2.5 mono text-[10px]" style={{ color: e.dp !== "None" ? "var(--cyan)" : "var(--muted-foreground)" }}>{e.dp}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground">{e.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="API Call Volume & Error Rate — 14 Days" subtitle="Total calls per day and error count">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={API_USAGE} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={2} />
                <YAxis yAxisId="calls" tick={{ fontSize: 9 }} />
                <YAxis yAxisId="errors" orientation="right" tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line yAxisId="calls" type="monotone" dataKey="calls" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="API calls" />
                <Line yAxisId="errors" type="monotone" dataKey="errors" stroke="var(--rose)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Errors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top API Consumers" subtitle="Ranked by 24h call volume" dense>
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Consumer","Key","Calls 24h","Tier"].map(h => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONSUMERS.map(c => (
                <tr key={c.key} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 font-medium">{c.name}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-primary">{c.key}</td>
                  <td className="px-3 py-2.5 mono">{c.calls24h.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{c.tier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel title="Sample Request & Response" subtitle="GET /v1/aqi/delhi — DP-sanitised with Merkle proof reference">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-2">Request</div>
            <pre className="rounded-lg border border-border bg-background/60 p-3 text-[10px] mono text-muted-foreground overflow-x-auto">{`GET /v1/aqi/delhi HTTP/1.1
Host: api.swachhhawa.gov.in
Authorization: Bearer <API_KEY>
Accept: application/json`}</pre>
          </div>
          <div>
            <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-2">Response</div>
            <pre className="rounded-lg border border-border bg-background/60 p-3 text-[10px] mono text-muted-foreground overflow-x-auto">{`{
  "city": "Delhi",
  "aqi": 194,
  "pm25": 108,
  "measurement_context": "ambient",
  "ts": "2026-05-30T05:48:00Z",
  "dp_noise_applied": true,
  "epsilon": 1.0,
  "merkle_root": "7f3a...e891",
  "ledger_ref": "IPFS:Qm9xK...f44a",
  "proof_url": "/v1/proof/a3f2...c4e1"
}`}</pre>
          </div>
        </div>
      </Panel>
    </div>
  );
}
