import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Shield, Lock, Eye, UserCheck } from "lucide-react";

export const Route = createFileRoute("/access")({
  head: () => ({ meta: [{ title: "Access Control · Swachh Hawa" }] }),
  component: Page,
});

const ROLES = [
  { role: "Platform Admin", tier: "Federal", users: 4, capabilities: ["All read/write", "Key rotation", "User mgmt", "System config", "Audit log read"], dp: "None (internal)" },
  { role: "CPCB Enforcement Officer", tier: "Federal", users: 28, capabilities: ["Dossier download", "Case update", "Enforcement issue", "Sensor read"], dp: "None (enforcement exempt)" },
  { role: "SPCB State Officer", tier: "State", users: 84, capabilities: ["State data read", "Local dossier", "Complaint review"], dp: "ε=2.0 for exports" },
  { role: "Research Analyst", tier: "Institutional", users: 312, capabilities: ["Historical data export", "API access", "Report download"], dp: "ε=4.0 per query" },
  { role: "City Dashboard User", tier: "City", users: 842, capabilities: ["City AQI read", "Alert subscription", "Public reports"], dp: "ε=1.0" },
  { role: "Citizen (Registered)", tier: "Public", users: 48210, capabilities: ["Live AQI", "Personal alerts", "Complaint submit", "AirGPT"], dp: "ε=0.5" },
  { role: "Anonymous", tier: "Public", users: null, capabilities: ["Open API (rate-limited)", "Public reports"], dp: "ε=1.0" },
];

const POLICIES = [
  { resource: "Raw sensor telemetry", read: "Admin", write: "System only", note: "Never exposed via public API" },
  { resource: "Enforcement dossiers", read: "CPCB/SPCB Officers", write: "Enforcement Officers", note: "Exempt from DPDP §7 DP requirement" },
  { resource: "AQI grid (ambient)", read: "Public (DP)", write: "System only", note: "Laplace ε=1.0 applied at boundary" },
  { resource: "Hash-chain & proofs", read: "Public (no DP)", write: "System only", note: "Proofs are public by design" },
  { resource: "Citizen complaint data", read: "CPCB/SPCB + Admin", write: "Citizen (own)", note: "DPDP §8 deletion rights honoured" },
  { resource: "User PII", read: "Admin only", write: "System + User (own)", note: "DPDP §7(a) consent required" },
  { resource: "Audit log", read: "Admin + Auditor", write: "System only (append-only)", note: "Immutable — no delete" },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ADMIN · Access Control"
        title="Role-Based Access Control (RBAC)"
        description="Zero-trust enforcement: every request authenticated, every data access role-checked, every sensitive operation audit-logged. Seven roles across four tiers: Federal → State → City → Public."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Defined Roles", v: "7", c: "primary" },
          { l: "Active Sessions", v: "1,284", c: "cyan" },
          { l: "Permission Grants 24h", v: "48,210", c: "emerald" },
          { l: "Denied Requests 24h", v: "12", c: "rose" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title="Role Hierarchy & Capabilities" subtitle="Capabilities + DP treatment per role · zero-trust: deny by default" dense>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Role","Tier","Users","Capabilities","DP Treatment"].map(h => (
                  <th key={h} className="px-4 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map(r => (
                <tr key={r.role} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-4 py-3 font-semibold">{r.role}</td>
                  <td className="px-4 py-3">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono" style={{
                      background: r.tier === "Federal" ? "color-mix(in oklab,var(--primary) 16%,transparent)"
                        : r.tier === "State" ? "color-mix(in oklab,var(--cyan) 16%,transparent)"
                        : r.tier === "City" ? "color-mix(in oklab,var(--chart-1) 16%,transparent)"
                        : "color-mix(in oklab,var(--muted-foreground) 16%,transparent)",
                      color: r.tier === "Federal" ? "var(--primary)" : r.tier === "State" ? "var(--cyan)" : r.tier === "City" ? "var(--chart-1)" : "var(--muted-foreground)",
                    }}>{r.tier}</span>
                  </td>
                  <td className="px-4 py-3 mono text-muted-foreground">{r.users?.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.capabilities.slice(0, 3).map(c => (
                        <span key={c} className="rounded px-1 py-0.5 text-[9px] bg-[var(--accent)] text-muted-foreground">{c}</span>
                      ))}
                      {r.capabilities.length > 3 && <span className="text-[9px] text-muted-foreground">+{r.capabilities.length - 3} more</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 mono text-[10px]" style={{ color: r.dp.includes("None") ? "var(--muted-foreground)" : "var(--cyan)" }}>{r.dp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Resource Access Policy Matrix" subtitle="DisclosurePolicy entity: read/write permissions + DPDP rationale per resource">
        <div className="divide-y divide-border">
          {POLICIES.map(p => (
            <div key={p.resource} className="flex items-start gap-3 py-3 px-1">
              <Lock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-semibold">{p.resource}</div>
                <div className="flex gap-4 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                  <span><span className="text-foreground">Read:</span> {p.read}</span>
                  <span><span className="text-foreground">Write:</span> {p.write}</span>
                  <span className="text-[var(--cyan)]">{p.note}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Zero-Trust Architecture Principles" subtitle="All traffic authenticated · no implicit trust inside the network perimeter">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Verify Explicitly", desc: "Every API call requires JWT or API key. mTLS between services. No implicit trust.", icon: <UserCheck className="h-5 w-5" />, c: "primary" },
            { title: "Least Privilege", desc: "Roles grant minimum required capabilities. Elevation requires MFA + audit log entry.", icon: <Shield className="h-5 w-5" />, c: "cyan" },
            { title: "Assume Breach", desc: "Anomaly detection on all access patterns. Automated isolation on trust score drop.", icon: <Eye className="h-5 w-5" />, c: "amber" },
            { title: "Audit Everything", desc: "100% of access events logged to immutable audit trail with HMAC-SHA256 signature.", icon: <Lock className="h-5 w-5" />, c: "emerald" },
          ].map(t => (
            <div key={t.title} className="rounded-xl border border-border bg-card/60 p-3">
              <span style={{ color: `var(--${t.c})` }} className="mb-2 block">{t.icon}</span>
              <div className="text-xs font-semibold">{t.title}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{t.desc}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
