import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/ea-security-dpia")({
  head: () => ({ meta: [{ title: "Security & DPIA · Swachh Hawa" }] }),
  component: Page,
});

// STRIDE threat model
const STRIDE_THREATS = [
  {
    threat: "Spoofing",
    component: "Edge Node Device Identity",
    risk: "High",
    mitigation: "X.509 device certificates issued per device; mTLS on LoRa-to-cloud uplink; device cert revocation via OCSP",
    status: "mitigated",
    residual: "Low",
  },
  {
    threat: "Tampering",
    component: "Sensor Data in Transit (Kafka)",
    risk: "High",
    mitigation: "SHA-256 hash chain per record; TLS 1.3 on all broker connections; Kafka ACL per producer topic",
    status: "mitigated",
    residual: "Low",
  },
  {
    threat: "Tampering",
    component: "TimescaleDB historical records",
    risk: "Critical",
    mitigation: "DB user has INSERT only on raw tables; UPDATE/DELETE blocked at DB ACL level; AuditStore is WORM (no overwrite possible)",
    status: "mitigated",
    residual: "Low",
  },
  {
    threat: "Repudiation",
    component: "Enforcement actions by officers",
    risk: "High",
    mitigation: "Each action hashed and appended to WORM AuditStore; Merkle proof available; JWT officer identity recorded per event",
    status: "mitigated",
    residual: "Low",
  },
  {
    threat: "Information Disclosure",
    component: "Citizen complaint PII",
    risk: "High",
    mitigation: "PII fields tokenised at API boundary; pseudonymised in DB; only case officer + DGC can de-tokenise; field-level encryption for contact details",
    status: "mitigated",
    residual: "Medium",
  },
  {
    threat: "Information Disclosure",
    component: "ML model weights and training data",
    risk: "Medium",
    mitigation: "Model registry access gated by IAM role; training data uses ε-differential privacy (ε=1.0); model output is public AQI only",
    status: "mitigated",
    residual: "Low",
  },
  {
    threat: "Denial of Service",
    component: "API Gateway public endpoints",
    risk: "Medium",
    mitigation: "AWS WAF + Shield Standard; rate limiting per API key (see OpenAPI contracts); Cloudflare DDoS protection on public-facing domains",
    status: "mitigated",
    residual: "Low",
  },
  {
    threat: "Denial of Service",
    component: "LoRa mesh backhaul",
    risk: "Medium",
    mitigation: "Edge node 72h local buffer survives complete cloud connectivity loss; mesh auto-reroutes around failed nodes; battery backup on edge nodes",
    status: "mitigated",
    residual: "Medium",
  },
  {
    threat: "Elevation of Privilege",
    component: "Platform admin access (AWS IAM)",
    risk: "Critical",
    mitigation: "Break-glass accounts with MFA + hardware token; no standing admin — just-in-time IAM access via AWS SSO; all privileged sessions recorded in AuditStore",
    status: "mitigated",
    residual: "Low",
  },
  {
    threat: "Elevation of Privilege",
    component: "RBAC role escalation in application",
    risk: "High",
    mitigation: "RBAC enforced at API GW layer (not just UI); role changes require DGC approval + audit log entry; SRB quarterly privilege review",
    status: "mitigated",
    residual: "Low",
  },
];

// DPIA entries per processing activity (DPDP Act 2023)
const DPIA_ACTIVITIES = [
  {
    activity: "Citizen complaint intake and routing",
    data_subjects: "Citizens filing complaints",
    personal_data: "Name, contact details, location, complaint description",
    purpose: "Environmental enforcement and grievance resolution",
    legal_basis: "§7(b) — Contractual necessity",
    necessity: "Contact details necessary to notify outcome; location necessary to route to correct state PCB",
    risks: "Disclosure to wrong state PCB; retention beyond resolution",
    controls: "PII tokenisation; access restricted to case officer; deletion 5y post-resolution",
    residual_risk: "Low",
    dpia_required: true,
    dpia_status: "Complete",
  },
  {
    activity: "Enforcement evidence collection",
    data_subjects: "Industrial facility operators / officers",
    personal_data: "Entity name, officer contact, site location, violation details",
    purpose: "Legal enforcement under EPA / Air Act",
    legal_basis: "§7(c) — Legal obligation; §17(2)(b) exemption for enforcement",
    necessity: "Officer identity required for legal accountability of notice issuance",
    risks: "Disclosure of investigation details before notice is served",
    controls: "Confidential classification; restricted to enforcement team + CPCB; WORM record",
    residual_risk: "Low",
    dpia_required: true,
    dpia_status: "Complete",
  },
  {
    activity: "Citizen precise location for complaint",
    data_subjects: "Citizens who opt in to share GPS",
    personal_data: "GPS coordinates (lat/lng ± 10m)",
    purpose: "Improve complaint routing accuracy",
    legal_basis: "§6(1) — Explicit consent (opt-in checkbox)",
    necessity: "Optional — city-level location sufficient for routing; precise location improves hotspot mapping",
    risks: "Inference of home/work location from repeated complaints",
    controls: "Opt-in only; precision degraded to ±500m for display; stored precision not retained >90 days",
    residual_risk: "Medium",
    dpia_required: true,
    dpia_status: "Complete",
  },
  {
    activity: "Academic data export (cross-border)",
    data_subjects: "None (sensor data only, non-personal)",
    personal_data: "None — aggregated AQI, non-personal sensor readings",
    purpose: "Air quality research by international institutions",
    legal_basis: "§7(a) — Legitimate function (open data mandate)",
    necessity: "Non-personal aggregated data; DPDP Chapter II does not apply",
    risks: "Re-identification if combined with rare sensor locations",
    controls: "k-anonymity applied (k≥5 city grouping); Standard Contractual Clauses for international transfers of any metadata",
    residual_risk: "Low",
    dpia_required: false,
    dpia_status: "N/A — non-personal",
  },
];

const STRIDE_COLORS: Record<string, string> = { Low: "emerald", Medium: "amber", High: "rose", Critical: "rose" };

const STRIDE_CHART = ["Spoofing","Tampering","Repudiation","Information Disclosure","Denial of Service","Elevation of Privilege"].map(t => ({
  name: t.split(" ")[0],
  count: STRIDE_THREATS.filter(s => s.threat === t).length,
  mitigated: STRIDE_THREATS.filter(s => s.threat === t && s.status === "mitigated").length,
}));

export default function Page() {
  const mitigatedCount = STRIDE_THREATS.filter(s => s.status === "mitigated").length;
  const residualHigh = STRIDE_THREATS.filter(s => s.residual === "High" || s.residual === "Critical").length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ENTERPRISE ARCHITECTURE · Security & DPIA"
        title="Security Architecture & DPIA"
        description="STRIDE threat model for 10 attack vectors, Data Protection Impact Assessment (DPIA) per DPDP Act 2023 Rules 2025, zero-trust control summary. Responds to Dr. Nayak's Point 4: 'Security and DPDP compliance posture?'"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "STRIDE Threats Identified", v: String(STRIDE_THREATS.length), c: "rose" },
          { l: "Threats Mitigated", v: `${mitigatedCount} / ${STRIDE_THREATS.length}`, c: "emerald" },
          { l: "Residual High/Critical", v: String(residualHigh), c: "amber" },
          { l: "DPIA Assessments", v: "3 complete", c: "primary" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* STRIDE threat model table */}
      <Panel title="STRIDE Threat Model" subtitle="10 threats × 6 STRIDE categories — risk, mitigation controls, residual risk" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] mono uppercase tracking-wider text-muted-foreground">
                {["STRIDE","Component","Initial Risk","Mitigation Controls","Residual"].map(h => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STRIDE_THREATS.map((t, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-accent/30 align-top">
                  <td className="px-3 py-2.5 mono font-bold whitespace-nowrap" style={{ color: `var(--${STRIDE_COLORS[t.risk]})` }}>{t.threat}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{t.component}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[9px] mono font-bold" style={{
                      background: `color-mix(in oklab,var(--${STRIDE_COLORS[t.risk]}) 16%,transparent)`,
                      color: `var(--${STRIDE_COLORS[t.risk]})`,
                    }}>{t.risk}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-[11px] max-w-[300px]">{t.mitigation}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[9px] mono font-bold" style={{
                      background: `color-mix(in oklab,var(--${STRIDE_COLORS[t.residual]}) 16%,transparent)`,
                      color: `var(--${STRIDE_COLORS[t.residual]})`,
                    }}>{t.residual}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* DPIA */}
      <Panel title="Data Protection Impact Assessment (DPIA)" subtitle="DPDP Act 2023 + Rules 2025 · three high-risk processing activities assessed">
        <div className="space-y-4 mt-1">
          {DPIA_ACTIVITIES.map(a => (
            <div key={a.activity} className="rounded-lg border border-border/60 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="text-xs font-semibold">{a.activity}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded px-1.5 py-0.5 text-[9px] mono font-bold" style={{
                    background: a.dpia_required ? "color-mix(in oklab,var(--primary) 14%,transparent)" : "color-mix(in oklab,var(--muted-foreground) 14%,transparent)",
                    color: a.dpia_required ? "var(--primary)" : "var(--muted-foreground)",
                  }}>{a.dpia_status}</span>
                  <span className="rounded px-1.5 py-0.5 text-[9px] mono font-bold" style={{
                    background: `color-mix(in oklab,var(--${STRIDE_COLORS[a.residual_risk]}) 14%,transparent)`,
                    color: `var(--${STRIDE_COLORS[a.residual_risk]})`,
                  }}>{a.residual_risk} residual</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 text-[10px]">
                {[
                  ["Data Subjects", a.data_subjects],
                  ["Personal Data", a.personal_data],
                  ["Legal Basis", a.legal_basis],
                  ["Necessity Test", a.necessity],
                  ["Identified Risks", a.risks],
                  ["Controls Applied", a.controls],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-muted-foreground">{label}: </span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Zero-trust principles */}
      <Panel title="Zero-Trust Architecture Principles" subtitle="Applied across all platform tiers">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { principle: "Never Trust, Always Verify", detail: "Every API call requires a valid JWT or API key; service-to-service calls use mTLS; no implicit trust based on network location (VPC membership is not sufficient)." },
            { principle: "Least Privilege Access", detail: "IAM roles scoped to minimum required actions per service; DB users have only INSERT on raw telemetry, no UPDATE/DELETE; Kafka ACLs per producer/consumer pair." },
            { principle: "Assume Breach", detail: "All inter-service traffic logged to AuditStore; anomaly detection via SIEM on access patterns; blast radius limited by service mesh network policies (deny-by-default)." },
            { principle: "Explicit Verification", detail: "Device identity via X.509 certificates; human identity via OAuth 2.0 + MFA; workload identity via AWS IAM Roles for Service Accounts (IRSA); no password-based service accounts." },
          ].map(p => (
            <div key={p.principle} className="rounded-lg border border-border/60 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <div className="text-xs font-semibold">{p.principle}</div>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">{p.detail}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ADR */}
      <Panel title="ADR-006 · mTLS for Edge-to-Cloud Communication" subtitle="Architecture Decision Record">
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div><span className="font-semibold text-foreground">Status:</span> <span className="mono rounded px-1.5 py-0.5 text-[10px] font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">ACCEPTED</span> · 2025-01-15</div>
          <div><span className="font-semibold text-foreground">Context:</span> Edge nodes (Jetson Nano / RPi5) connect over cellular or LoRa-to-WiFi backhaul to the Kafka ingest endpoint. Without device authentication, a compromised or rogue device could inject false sensor readings that would corrupt AQI calculations and potentially trigger or suppress enforcement actions.</div>
          <div><span className="font-semibold text-foreground">Decision:</span> Each edge node has a unique X.509 client certificate issued by the platform CA. mTLS required on all Kafka producer connections. Certificate provisioned via zero-touch provisioning (AWS IoT Core + Lambda) during device onboarding. Compromised certs revocable within 15 minutes via OCSP stapling.</div>
          <div><span className="font-semibold text-foreground">Alternatives considered:</span> (1) API key per device — rejected: keys are symmetric, cannot prove device identity, no revocation mechanism; (2) No device auth (rely on network isolation) — rejected: contradicts zero-trust principle, VPN compromise would expose all devices.</div>
        </div>
      </Panel>
    </div>
  );
}
