import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/ea-data-arch")({
  head: () => ({ meta: [{ title: "Data Architecture · Swachh Hawa" }] }),
  component: Page,
});

const DATA_DOMAINS = [
  {
    domain: "Sensor Telemetry",
    owner: "Platform Ops",
    steward: "Data Governance Council",
    classification: "Operational",
    dpdp_class: "Non-personal",
    retention: "7 years (CPCB mandate)",
    storage: "TimescaleDB (partitioned by city_id, month)",
    pii: false,
    lineage: "Sensor → LoRa → Edge Node → Kafka (raw) → TimescaleDB",
  },
  {
    domain: "AQI Computed Values",
    owner: "CPCB",
    steward: "Data Governance Council",
    classification: "Public",
    dpdp_class: "Non-personal",
    retention: "10 years",
    storage: "TimescaleDB (materialised views) + Redis (24h TTL cache)",
    pii: false,
    lineage: "Sensor Telemetry → AQI Calculation Service → TimescaleDB (aqi_daily) → API GW",
  },
  {
    domain: "Citizen Complaints",
    owner: "State PCBs",
    steward: "DGC",
    classification: "Restricted",
    dpdp_class: "Personal — contact details, location",
    retention: "5 years post-resolution",
    storage: "PostgreSQL (complaints_db) — PII fields tokenised",
    pii: true,
    lineage: "Citizen Portal → Complaints Service → PostgreSQL (pseudonymised) → State PCB Dashboard",
  },
  {
    domain: "Enforcement Records",
    owner: "State PCBs / CPCB",
    steward: "Legal Counsel",
    classification: "Confidential",
    dpdp_class: "Personal — industry entity details",
    retention: "Indefinite (legal obligation)",
    storage: "AuditStore (WORM append-only) + PostgreSQL",
    pii: true,
    lineage: "Enforcement Module → PostgreSQL + AuditStore → CPCB Reports",
  },
  {
    domain: "ML Model Artefacts",
    owner: "Platform Ops",
    steward: "Data Governance Council",
    classification: "Internal",
    dpdp_class: "Non-personal (derived)",
    retention: "3 years (last N versions)",
    storage: "S3-compatible object store (model registry)",
    pii: false,
    lineage: "TimescaleDB (feature engineering) → Training Pipeline → S3 (model registry) → ML Serve",
  },
  {
    domain: "Audit & Consent Logs",
    owner: "DGC / CPCB",
    steward: "DGC",
    classification: "Highly Restricted",
    dpdp_class: "Personal — consent and access events",
    retention: "7 years (DPDP §27 + CPCB)",
    storage: "AuditStore (WORM, Merkle-anchored)",
    pii: true,
    lineage: "All Services → Audit Middleware → AuditStore → Merkle Anchor Job → IPFS/Blockchain",
  },
];

const RETENTION_CHART = DATA_DOMAINS.map(d => ({
  name: d.domain.split(" ")[0],
  years: d.retention.includes("Indefinite") ? 15 : parseInt(d.retention),
  color: d.pii ? "rose" : "emerald",
}));

const DPDP_CLASSES = [
  { cls: "Non-personal data", examples: "Sensor readings, AQI values, met parameters, ML model weights", basis: "§7(a) — Legitimate state function", risk: "Low" },
  { cls: "Personal — contact details", examples: "Citizen name, phone, email in complaints system", basis: "§7(b) — Contractual necessity (complaint processing)", risk: "Medium" },
  { cls: "Personal — precise location", examples: "Citizen-reported pollution location, lat/lng", basis: "§7(b) + opt-in consent per §6(1)", risk: "Medium" },
  { cls: "Personal — industry entity", examples: "Factory name, officer details in enforcement records", basis: "§7(c) — Legal obligation (Environment Protection Act)", risk: "Low (legal obligation exempts DP rights per §17)" },
  { cls: "Sensitive — consent & access events", examples: "Who accessed what data and when, consent timestamps", basis: "§9 — Data Fiduciary accountability obligation", risk: "High — WORM-protected, DGC access only" },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ENTERPRISE ARCHITECTURE · Data Architecture"
        title="Data Architecture & Governance"
        description="Six data domain ownership matrix, lineage flows, retention schedules, and DPDP Act 2023 data classification. Responds to Dr. Nayak's Point 2: 'How is data ownership and lineage governed?'"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Data Domains", v: "6", c: "primary" },
          { l: "PII Domains", v: "3 / 6", c: "rose" },
          { l: "DPDP Data Classes", v: "5", c: "cyan" },
          { l: "Max Retention", v: "Indefinite", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Data ownership + lineage table */}
      <Panel title="Data Domain Ownership & Lineage" subtitle="Owner · Steward · Classification · Retention · Storage technology" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] mono uppercase tracking-wider text-muted-foreground">
                {["Domain","Owner","Classification","PII","Retention","Storage","Lineage"].map(h => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATA_DOMAINS.map(d => (
                <tr key={d.domain} className="border-b border-border/40 hover:bg-accent/30 align-top">
                  <td className="px-3 py-2.5 font-semibold mono text-primary whitespace-nowrap">{d.domain}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{d.owner}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: d.classification === "Public" ? "color-mix(in oklab,var(--emerald) 14%,transparent)"
                        : d.classification === "Operational" || d.classification === "Internal" ? "color-mix(in oklab,var(--primary) 14%,transparent)"
                        : d.classification === "Restricted" ? "color-mix(in oklab,var(--amber) 14%,transparent)"
                        : "color-mix(in oklab,var(--rose) 14%,transparent)",
                      color: d.classification === "Public" ? "var(--emerald)"
                        : d.classification === "Operational" || d.classification === "Internal" ? "var(--primary)"
                        : d.classification === "Restricted" ? "var(--amber)"
                        : "var(--rose)",
                    }}>{d.classification}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {d.pii ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--rose)]" />
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-2.5 mono text-muted-foreground whitespace-nowrap">{d.retention}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{d.storage}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-[10px] max-w-[280px]">{d.lineage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Retention chart */}
        <Panel title="Data Retention by Domain" subtitle="Years · capped at 15 for 'Indefinite' · red = PII domains">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RETENTION_CHART} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                <YAxis tick={{ fontSize: 9 }} unit="y" />
                <Tooltip formatter={(v: number) => [v === 15 ? "Indefinite" : `${v} years`]} />
                <Bar dataKey="years" radius={[4, 4, 0, 0]}>
                  {RETENTION_CHART.map((d, i) => (
                    <Cell key={i} fill={`var(--${d.color})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* DPDP data class registry */}
        <Panel title="DPDP Act 2023 — Data Class Registry" subtitle="Lawful basis per data class">
          <div className="divide-y divide-border/40">
            {DPDP_CLASSES.map(c => (
              <div key={c.cls} className="py-2.5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold">{c.cls}</span>
                  <span className="rounded px-1.5 py-0.5 text-[9px] mono font-bold" style={{
                    background: c.risk === "Low" ? "color-mix(in oklab,var(--emerald) 14%,transparent)" : c.risk === "Medium" ? "color-mix(in oklab,var(--amber) 14%,transparent)" : "color-mix(in oklab,var(--rose) 14%,transparent)",
                    color: c.risk === "Low" ? "var(--emerald)" : c.risk === "Medium" ? "var(--amber)" : "var(--rose)",
                  }}>{c.risk} risk</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{c.examples}</div>
                <div className="text-[10px] mono text-primary/80">{c.basis}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ADR */}
      <Panel title="ADR-003 · TimescaleDB for Time-series Storage" subtitle="Architecture Decision Record">
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div><span className="font-semibold text-foreground">Status:</span> <span className="mono rounded px-1.5 py-0.5 text-[10px] font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">ACCEPTED</span> · 2024-11-08</div>
          <div><span className="font-semibold text-foreground">Context:</span> Platform ingests ~380 sensor packets/second continuously. Query patterns are almost exclusively time-range aggregations (hourly/daily/monthly). Multi-year retention at city + pollutant granularity requires efficient compression.</div>
          <div><span className="font-semibold text-foreground">Decision:</span> Use TimescaleDB (PostgreSQL extension) as primary time-series store. Hypertables partitioned by (city_id, month). Native compression gives ~94% reduction after 7 days. Continuous aggregates pre-compute hourly/daily rollups.</div>
          <div><span className="font-semibold text-foreground">Alternatives considered:</span> (1) InfluxDB — rejected: less mature SQL support, harder to join with relational enforcement records; (2) Cassandra — rejected: operational complexity, no native SQL aggregations; (3) Plain PostgreSQL — rejected: poor performance at 10B+ row scale without time-series extensions.</div>
        </div>
      </Panel>
    </div>
  );
}
