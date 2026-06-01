import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/ea-capability")({
  head: () => ({ meta: [{ title: "Capability Model · Swachh Hawa" }] }),
  component: Page,
});

// L0 → L1 → L2 capability hierarchy
const CAPABILITY_MAP = [
  {
    l0: "Sensing & Acquisition",
    color: "primary",
    maturity: 88,
    l1: [
      { name: "Fixed Station Monitoring", l2: ["PM2.5/PM10 Measurement", "NO₂/SO₂/O₃ Sensing", "Met. Parameter Collection"], maturity: 92 },
      { name: "Mobile & Drone Sensing", l2: ["Vehicle-mounted Units", "UAV Payload Management", "Spatial Coverage Planning"], maturity: 81 },
      { name: "Sensor Lifecycle Mgmt", l2: ["Calibration Scheduling", "Firmware OTA Update", "Fault Detection & Swap"], maturity: 90 },
    ],
  },
  {
    l0: "Data Intelligence",
    color: "cyan",
    maturity: 83,
    l1: [
      { name: "AI/ML Forecasting", l2: ["72-h AQI Forecast (LSTM)", "Pollution Source Attribution", "Seasonal Pattern Detection"], maturity: 86 },
      { name: "Data Trust & Provenance", l2: ["SHA-256 Hash Chaining", "Merkle Root Anchoring", "Differential Privacy (ε-DP)"], maturity: 84 },
      { name: "Explainability & Simulation", l2: ["SHAP Feature Attribution", "Policy Impact Simulation", "Digital Twin Sync"], maturity: 79 },
    ],
  },
  {
    l0: "Governance & Enforcement",
    color: "rose",
    maturity: 74,
    l1: [
      { name: "Regulatory Compliance", l2: ["NCAP Scorecard Tracking", "NAAQS Exceedance Alerts", "GRAP Stage Automation"], maturity: 78 },
      { name: "Enforcement Operations", l2: ["Source Identification", "Notice Generation", "Fine & Penalty Tracking"], maturity: 71 },
      { name: "Citizen Engagement", l2: ["Complaint Intake & Routing", "Public AQI Disclosure", "Grievance Resolution SLA"], maturity: 72 },
    ],
  },
  {
    l0: "Platform Infrastructure",
    color: "emerald",
    maturity: 91,
    l1: [
      { name: "Edge Computing Tier", l2: ["LoRa Mesh Backhaul", "Edge Inference (Jetson/RPi)", "72h Offline Buffer"], maturity: 93 },
      { name: "Cloud Processing Tier", l2: ["Kafka Stream Ingestion", "TimescaleDB Time-series", "ML Training Pipeline"], maturity: 92 },
      { name: "API & Integration Layer", l2: ["REST / WebSocket API GW", "AsyncAPI Event Bus", "Third-party Data Connectors"], maturity: 87 },
    ],
  },
  {
    l0: "Transparency & Reporting",
    color: "amber",
    maturity: 79,
    l1: [
      { name: "Public Dashboards", l2: ["National AQI Map", "City Comparison Views", "Trend & Forecast Displays"], maturity: 85 },
      { name: "Regulatory Reporting", l2: ["CPCB Annual Reports", "DPDP Audit Logs", "RTI-ready Data Exports"], maturity: 74 },
      { name: "Research Data Access", l2: ["Open Data Sandbox", "Anonymised API Datasets", "Academic Export Workflow"], maturity: 77 },
    ],
  },
  {
    l0: "Administration & Security",
    color: "chart-1",
    maturity: 82,
    l1: [
      { name: "Identity & Access Mgmt", l2: ["RBAC Role Definitions", "OAuth 2.0 / OIDC Flows", "Privileged Access Reviews"], maturity: 84 },
      { name: "Security Operations", l2: ["SIEM Alert Triage", "Vulnerability Scanning", "Incident Response Runbooks"], maturity: 83 },
      { name: "Data Protection", l2: ["DPDP Consent Management", "PII Tokenisation", "Cross-border Transfer Controls"], maturity: 80 },
    ],
  },
];

const MATURITY_DATA = CAPABILITY_MAP.map(d => ({ name: d.l0.split(" ")[0], score: d.maturity, color: d.color }));

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ENTERPRISE ARCHITECTURE · Capability Model"
        title="Business Capability Model"
        description="Three-level ArchiMate-aligned capability map across six L0 domains. Each capability is rated against the Target Operating Model maturity scale (0–100). Responds to Dr. Nayak's Point 1: 'What is the business capability model?'"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "L0 Domains", v: "6", c: "primary" },
          { l: "L1 Capabilities", v: "18", c: "cyan" },
          { l: "L2 Sub-capabilities", v: "54", c: "emerald" },
          { l: "Avg Maturity Score", v: `${Math.round(CAPABILITY_MAP.reduce((s, d) => s + d.maturity, 0) / CAPABILITY_MAP.length)}%`, c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Maturity radar bar chart */}
      <Panel title="L0 Capability Maturity Scores" subtitle="Target Operating Model maturity (0–100) per domain">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MATURITY_DATA} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "monospace" }} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v: number) => [`${v}%`, "Maturity"]} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {MATURITY_DATA.map((d, i) => (
                  <Cell key={i} fill={`var(--${d.color})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* L1/L2 capability cards */}
      <div className="space-y-3">
        {CAPABILITY_MAP.map(domain => (
          <Panel key={domain.l0} title={domain.l0} subtitle={`L0 Domain · Maturity ${domain.maturity}% · ${domain.l1.length} L1 capabilities`}>
            <div className="mt-1 grid grid-cols-1 gap-3 md:grid-cols-3">
              {domain.l1.map(cap => (
                <div key={cap.name} className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold">{cap.name}</div>
                    <span className="text-[10px] mono rounded px-1 py-0.5" style={{
                      background: `color-mix(in oklab,var(--${domain.color}) 14%,transparent)`,
                      color: `var(--${domain.color})`,
                    }}>{cap.maturity}%</span>
                  </div>
                  <div className="h-1 w-full rounded bg-border/50 overflow-hidden">
                    <div className="h-full rounded" style={{
                      width: `${cap.maturity}%`,
                      background: `var(--${domain.color})`,
                    }} />
                  </div>
                  <ul className="space-y-0.5">
                    {cap.l2.map(sub => (
                      <li key={sub} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <span className="mt-0.5 h-1 w-1 rounded-full shrink-0" style={{ background: `var(--${domain.color})` }} />
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      {/* ADR */}
      <Panel title="ADR-001 · Capability Model Scope" subtitle="Architecture Decision Record — why ArchiMate L0–L2, not deeper">
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div><span className="font-semibold text-foreground">Status:</span> <span className="mono rounded px-1.5 py-0.5 text-[10px] font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">ACCEPTED</span> · 2025-03-14</div>
          <div><span className="font-semibold text-foreground">Context:</span> Reviewers required a formal capability model to assess platform scope, identify gaps, and communicate to non-technical stakeholders including CPCB and state PCB leadership.</div>
          <div><span className="font-semibold text-foreground">Decision:</span> Use ArchiMate Motivation + Business viewpoints to a maximum of L2 (sub-capability). Going to L3 adds detail that is better captured in process models and is not needed for the current architecture review cycle.</div>
          <div><span className="font-semibold text-foreground">Consequences:</span> L2 is sufficient for gap analysis and stakeholder communication. L3 process decomposition is deferred to the TOM sprint (Q3 2025). Maturity scores will be re-assessed quarterly.</div>
          <div><span className="font-semibold text-foreground">Alternatives considered:</span> (1) BIZBOK Business Capability Map — rejected: less tool-supported in Archi; (2) Value Stream mapping only — rejected: does not satisfy ArchiMate requirement in Nayak review.</div>
        </div>
      </Panel>
    </div>
  );
}
