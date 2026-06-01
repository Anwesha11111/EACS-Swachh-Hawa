import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { CheckCircle2, Minus, XCircle } from "lucide-react";

export const Route = createFileRoute("/ea-operating-model")({
  head: () => ({ meta: [{ title: "Operating Model · Swachh Hawa" }] }),
  component: Page,
});

const ROLES = [
  {
    role: "CPCB (Central Pollution Control Board)",
    tier: "National",
    color: "primary",
    responsibilities: [
      "Platform policy owner and national data custodian",
      "Approves NCAP targets and state action plans",
      "Chairs Architecture Review Board (ARB)",
      "Receives 72h breach notifications (DPDP §27)",
    ],
  },
  {
    role: "State PCBs (31 Boards)",
    tier: "State",
    color: "cyan",
    responsibilities: [
      "Operate fixed monitoring stations in their jurisdiction",
      "Initiate enforcement actions for NAAQS violations",
      "Review and approve state compliance reports",
      "Manage citizen complaint resolution SLA (14 days)",
    ],
  },
  {
    role: "Urban Local Bodies (ULBs)",
    tier: "City",
    color: "emerald",
    responsibilities: [
      "Deploy and maintain edge nodes in city boundaries",
      "Execute GRAP-stage emergency actions (traffic, construction bans)",
      "Publish city-level AQI on civic portals via Open API",
      "Coordinate with state PCB on hotspot enforcement",
    ],
  },
  {
    role: "Platform Operations Team",
    tier: "Platform",
    color: "amber",
    responsibilities: [
      "24×7 NOC for sensor uptime SLA (>98%) and cloud infra",
      "Manages Kafka / TimescaleDB / Redis fleet",
      "Executes OTA firmware updates for edge nodes",
      "On-call escalation for P1 incidents (<15-min MTTR)",
    ],
  },
  {
    role: "Data Governance Council (DGC)",
    tier: "Cross-cutting",
    color: "chart-1",
    responsibilities: [
      "Owns data classification and retention schedules",
      "Reviews and approves new data collection purposes (DPDP §4)",
      "Manages consent records and data principal requests",
      "Authorises academic export and cross-border transfers",
    ],
  },
  {
    role: "Security & Risk Board (SRB)",
    tier: "Cross-cutting",
    color: "rose",
    responsibilities: [
      "Owns STRIDE threat model and DPIA registers",
      "Approves pentests and third-party security audits",
      "Receives SIEM escalations for P1/P2 security events",
      "Signs off on architecture changes affecting security posture",
    ],
  },
];

// RACI: rows = processes, cols = CPCB, State PCBs, ULBs, Platform Ops, DGC, SRB
const RACI_PROCESSES = [
  { process: "Sensor deployment & calibration",       r: ["-","R","R","A","-","-"] },
  { process: "Real-time AQI data ingestion",           r: ["-","-","-","R","A","-"] },
  { process: "NCAP compliance scorecard generation",  r: ["A","R","-","C","-","-"] },
  { process: "Enforcement notice issuance",           r: ["C","R","I","-","-","-"] },
  { process: "GRAP stage trigger & enforcement",      r: ["A","R","R","I","-","-"] },
  { process: "Citizen complaint resolution",          r: ["I","R","R","-","A","-"] },
  { process: "Data retention & deletion (DPDP)",      r: ["I","-","-","R","A","C"] },
  { process: "Cross-border academic data export",     r: ["A","-","-","R","R","C"] },
  { process: "Security incident response",            r: ["I","I","I","R","I","A"] },
  { process: "Platform OTA firmware updates",         r: ["-","-","C","R","A","-"] },
  { process: "ML model retraining & deployment",      r: ["-","-","-","R","A","C"] },
  { process: "Architecture Review Board decisions",   r: ["A","C","C","R","C","C"] },
];

const RACI_COLS = ["CPCB","State PCBs","ULBs","Platform Ops","DGC","SRB"];

const RACI_COLOR: Record<string, string> = {
  R: "var(--primary)", A: "var(--emerald)", C: "var(--amber)", I: "var(--muted-foreground)", "-": "transparent",
};
const RACI_BG: Record<string, string> = {
  R: "color-mix(in oklab,var(--primary) 14%,transparent)",
  A: "color-mix(in oklab,var(--emerald) 14%,transparent)",
  C: "color-mix(in oklab,var(--amber) 14%,transparent)",
  I: "color-mix(in oklab,var(--muted-foreground) 10%,transparent)",
  "-": "transparent",
};

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ENTERPRISE ARCHITECTURE · Operating Model"
        title="Platform Operating Model"
        description="Roles and responsibilities across CPCB, State PCBs, Urban Local Bodies, and platform operations. RACI matrix across 12 key platform processes. Responds to Dr. Nayak's Point 5: 'What is the governance and operating model?'"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Stakeholder Tiers", v: "4", c: "primary" },
          { l: "Cross-cutting Boards", v: "2 (DGC, SRB)", c: "cyan" },
          { l: "Processes in RACI", v: "12", c: "emerald" },
          { l: "Escalation SLA (P1)", v: "15 min", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ROLES.map(r => (
          <div key={r.role} className="rounded-xl border border-border bg-card/70 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold leading-tight">{r.role}</div>
                <span className="mt-1 inline-block text-[10px] mono rounded px-1.5 py-0.5 font-bold" style={{
                  background: `color-mix(in oklab,var(--${r.color}) 14%,transparent)`,
                  color: `var(--${r.color})`,
                }}>{r.tier}</span>
              </div>
            </div>
            <ul className="space-y-1 mt-1">
              {r.responsibilities.map(resp => (
                <li key={resp} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                  <span className="mt-1 h-1 w-1 rounded-full shrink-0" style={{ background: `var(--${r.color})` }} />
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* RACI matrix */}
      <Panel title="RACI Matrix" subtitle="R=Responsible  A=Accountable  C=Consulted  I=Informed" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-[10px] mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">Process</th>
                {RACI_COLS.map(c => (
                  <th key={c} className="px-3 py-2 text-center text-[10px] mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RACI_PROCESSES.map(p => (
                <tr key={p.process} className="border-b border-border/40 hover:bg-accent/30">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{p.process}</td>
                  {p.r.map((cell, i) => (
                    <td key={i} className="px-3 py-2 text-center">
                      {cell !== "-" && (
                        <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{ background: RACI_BG[cell], color: RACI_COLOR[cell] }}>
                          {cell}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ADR */}
      <Panel title="ADR-002 · Architecture Review Board Structure" subtitle="Architecture Decision Record">
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div><span className="font-semibold text-foreground">Status:</span> <span className="mono rounded px-1.5 py-0.5 text-[10px] font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">ACCEPTED</span> · 2025-04-01</div>
          <div><span className="font-semibold text-foreground">Context:</span> Multi-stakeholder platform spanning national, state, and city tiers requires clear decision rights for architecture changes, data governance, and security controls to prevent unilateral decisions that break cross-jurisdiction consistency.</div>
          <div><span className="font-semibold text-foreground">Decision:</span> Establish a lightweight ARB chaired by CPCB with quorum of 3 members (CPCB + 1 State PCB + Platform Ops). DGC and SRB operate as standing specialist boards with veto on data and security matters respectively. All significant architecture changes require an ADR that passes ARB review.</div>
          <div><span className="font-semibold text-foreground">Consequences:</span> Adds ~2-week overhead to major changes. Mitigated by async ADR review process (Confluence + GitHub PR). Reduces risk of privacy or security regressions reaching production.</div>
        </div>
      </Panel>
    </div>
  );
}
