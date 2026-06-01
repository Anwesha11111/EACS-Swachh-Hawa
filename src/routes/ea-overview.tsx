import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  Boxes, Building2, Database, Network, Lock as LockIcon,
  ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, XCircle,
} from "lucide-react";

export const Route = createFileRoute("/ea-overview")({
  head: () => ({ meta: [{ title: "EA Overview · Swachh Hawa" }] }),
  component: Page,
});

const EA_PAGES = [
  {
    to: "/ea-capability",
    icon: Boxes,
    title: "Business Capability Model",
    subtitle: "L0–L2 ArchiMate capability map across 6 domains",
    status: "documented",
    maturity: 72,
    adrs: 3,
    color: "primary",
  },
  {
    to: "/ea-operating-model",
    icon: Building2,
    title: "Operating Model",
    subtitle: "Roles, responsibilities, RACI — CPCB · State PCBs · Urban Bodies",
    status: "documented",
    maturity: 68,
    adrs: 2,
    color: "cyan",
  },
  {
    to: "/ea-data-arch",
    icon: Database,
    title: "Data Architecture & Governance",
    subtitle: "Ownership matrix, lineage, retention, DPDP data classes",
    status: "documented",
    maturity: 81,
    adrs: 4,
    color: "emerald",
  },
  {
    to: "/ea-integration",
    icon: Network,
    title: "Integration Architecture",
    subtitle: "AsyncAPI / OpenAPI contracts, Kafka topology, event catalogue",
    status: "documented",
    maturity: 74,
    adrs: 3,
    color: "amber",
  },
  {
    to: "/ea-ledger",
    icon: LockIcon,
    title: "Distributed Ledger Design",
    subtitle: "SHA-256 hash-chain, Merkle anchoring, trust rationale ADR",
    status: "documented",
    maturity: 77,
    adrs: 2,
    color: "chart-1",
  },
  {
    to: "/ea-security-dpia",
    icon: ShieldCheck,
    title: "Security Architecture & DPIA",
    subtitle: "STRIDE threat model, DPIA for DPDP Act 2023, zero-trust controls",
    status: "documented",
    maturity: 85,
    adrs: 4,
    color: "rose",
  },
];

const TOGAF_PHASES = [
  { phase: "A", name: "Architecture Vision", artifact: "EA Overview (this page)", done: true },
  { phase: "B", name: "Business Architecture", artifact: "Capability Model · Operating Model", done: true },
  { phase: "C", name: "Information Systems", artifact: "Data Architecture", done: true },
  { phase: "D", name: "Technology Architecture", artifact: "Integration Arch · Ledger Design · Cloud-Edge", done: true },
  { phase: "E", name: "Opportunities & Solutions", artifact: "Policy Simulator · What-if Analysis", done: true },
  { phase: "F", name: "Migration Planning", artifact: "Roadmap (in progress)", done: false },
  { phase: "G", name: "Implementation Governance", artifact: "Audit Trail · Compliance Dashboard", done: true },
  { phase: "H", name: "Architecture Change Mgmt", artifact: "ADRs per domain", done: true },
];

export default function Page() {
  const avgMaturity = Math.round(EA_PAGES.reduce((s, p) => s + p.maturity, 0) / EA_PAGES.length);
  const totalAdrs = EA_PAGES.reduce((s, p) => s + p.adrs, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ENTERPRISE ARCHITECTURE · Overview"
        title="Swachh Hawa EA Framework"
        description="TOGAF ADM-aligned architecture documentation across six domains: Capability Model, Operating Model, Data Architecture, Integration Architecture, Distributed Ledger Design, and Security/DPIA. Responds to Dr. Nayak's six-point architecture review."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "EA Domains Documented", v: "6 / 6", c: "emerald" },
          { l: "Avg. Maturity Score", v: `${avgMaturity}%`, c: "primary" },
          { l: "Architecture Decision Records", v: String(totalAdrs), c: "cyan" },
          { l: "TOGAF ADM Phases Covered", v: "7 / 8", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Domain cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {EA_PAGES.map(p => {
          const Icon = p.icon;
          return (
            <Link key={p.to} to={p.to as any} className="group rounded-xl border border-border bg-card/70 p-4 hover:border-primary/50 hover:bg-accent/30 transition-colors flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg p-2 bg-card border border-border">
                    <Icon className="h-4 w-4" style={{ color: `var(--${p.color})` }} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{p.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{p.subtitle}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] mono text-muted-foreground">
                  <span>Maturity</span>
                  <span>{p.maturity}%</span>
                </div>
                <div className="h-1.5 w-full rounded bg-border/60 overflow-hidden">
                  <div className="h-full rounded transition-all" style={{
                    width: `${p.maturity}%`,
                    background: `var(--${p.color})`,
                  }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="rounded px-1.5 py-0.5 mono font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">
                  {p.adrs} ADR{p.adrs > 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground mono uppercase tracking-wider">{p.status}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* TOGAF ADM phase mapping */}
      <Panel title="TOGAF ADM Phase Coverage" subtitle="Architecture Development Method alignment — showing which phases have corresponding artifacts in this platform">
        <div className="divide-y divide-border/40">
          {TOGAF_PHASES.map(p => (
            <div key={p.phase} className="flex items-center gap-3 py-2.5 px-1">
              <div className="mono text-xs font-bold w-6 text-center rounded bg-primary/10 text-primary py-0.5">{p.phase}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{p.name}</div>
                <div className="text-[10px] text-muted-foreground mono mt-0.5">{p.artifact}</div>
              </div>
              {p.done
                ? <CheckCircle2 className="h-4 w-4 text-[var(--emerald)] shrink-0" />
                : <AlertTriangle className="h-4 w-4 text-[var(--amber)] shrink-0" />}
            </div>
          ))}
        </div>
      </Panel>

      {/* Reviewer context */}
      <Panel title="Architecture Review Response" subtitle="Dr. Niladri Bihari Nayak — six-point feedback addressed">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-xs">
          {[
            { pt: "1", q: "What is the business capability model?", a: "L0–L2 ArchiMate map covering Sensing, Intelligence, Governance, Transparency, Infrastructure, Administration", page: "/ea-capability" },
            { pt: "2", q: "How is data ownership and lineage governed?", a: "Data Architecture page: ownership matrix, DPDP Act 2023 data class registry, retention schedules", page: "/ea-data-arch" },
            { pt: "3", q: "What is the integration architecture?", a: "AsyncAPI catalogue for 8 Kafka topics; OpenAPI contracts for REST endpoints; sequence diagrams per flow", page: "/ea-integration" },
            { pt: "4", q: "Security and DPDP compliance posture?", a: "STRIDE threat model, full DPIA narrative, zero-trust controls, DPDP Rules 2025 mapping", page: "/ea-security-dpia" },
            { pt: "5", q: "Operating model and governance roles?", a: "RACI matrix across CPCB / State PCBs / ULBs / edge operators; ARB, DGC, SRB defined", page: "/ea-operating-model" },
            { pt: "6", q: "Why a hash-chain over a public blockchain?", a: "Explicit ADR with drivers, considered options, rationale, trade-offs, and review schedule", page: "/ea-ledger" },
          ].map(r => (
            <Link key={r.pt} to={r.page as any} className="group rounded-lg border border-border/60 p-3 hover:border-primary/40 hover:bg-accent/20 transition-colors">
              <div className="flex gap-2 items-start">
                <span className="mono text-[10px] font-bold rounded bg-primary/10 text-primary px-1.5 py-0.5 shrink-0">#{r.pt}</span>
                <div>
                  <div className="font-medium text-[11px]">{r.q}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{r.a}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
