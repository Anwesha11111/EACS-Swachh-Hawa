import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Shield, AlertTriangle, CheckCircle2, Lock, Eye, Zap } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Security · Swachh Hawa" }] }),
  component: Page,
});

const THREATS = [
  {
    id: "T1", name: "Data Tampering", category: "Integrity",
    likelihood: "Medium", impact: "Critical",
    mitigation: "SHA-256 hash chains per device + HMAC-SHA256 per-key signing + Merkle root hourly anchoring.",
    residual: "Low", icon: "🔐",
  },
  {
    id: "T2", name: "Sensor Spoofing", category: "Integrity",
    likelihood: "High", impact: "High",
    mitigation: "Trust score consensus model rejects outliers. Neighbour agreement threshold. Satellite cross-validation.",
    residual: "Low", icon: "📡",
  },
  {
    id: "T3", name: "Privacy Breach", category: "Privacy",
    likelihood: "Medium", impact: "High",
    mitigation: "Differential privacy at publish boundary. DisclosurePolicy entity enforces role-based access. DPDP §8 opt-out.",
    residual: "Low", icon: "🔒",
  },
  {
    id: "T4", name: "Platform Availability", category: "Availability",
    likelihood: "Low", impact: "High",
    mitigation: "LoRa-Mesh fallback backhaul. Edge nodes buffer 72h offline. Multi-AZ cloud deployment. CDN edge caching.",
    residual: "Very Low", icon: "⚡",
  },
];

const HMAC_KEYS = [
  { keyId: "DEL-KEY-0041", devices: 128, created: "2026-05-01", expires: "2026-07-01", status: "Active" },
  { keyId: "GZB-KEY-0012", devices: 44, created: "2026-04-15", expires: "2026-06-15", status: "Active" },
  { keyId: "LDH-KEY-0031", devices: 62, created: "2026-05-10", expires: "2026-07-10", status: "Active" },
  { keyId: "PNE-KEY-0021", devices: 39, created: "2026-03-01", expires: "2026-06-01", status: "Expiring Soon" },
  { keyId: "LEGACY-KEY-0001", devices: 0, created: "2025-01-01", expires: "2025-07-01", status: "Revoked" },
];

const SECURITY_EVENTS = [
  { ts: "2026-05-30T05:22:11Z", type: "HMAC_VERIFY_FAIL", severity: "High", device: "SH-GZB-0099", detail: "HMAC mismatch — device clock skew >30s. Auto-quarantine.", resolved: true },
  { ts: "2026-05-30T03:14:08Z", type: "ANOMALOUS_BURST", severity: "Medium", device: "SH-DEL-0078", detail: "1,200 readings in 60s — rate limit triggered, sensor quarantined.", resolved: true },
  { ts: "2026-05-29T22:08:44Z", type: "TRUST_SCORE_DROP", severity: "Medium", device: "SH-PNE-0056", detail: "Trust score dropped below 0.5 — moved to quarantine queue.", resolved: false },
  { ts: "2026-05-29T18:31:22Z", type: "LOGIN_BRUTE_FORCE", severity: "High", device: "N/A", detail: "5 failed logins from 103.87.21.4 — IP blocked.", resolved: true },
];

const OWASP_RESULTS = [
  { id: "A01", name: "Broken Access Control", status: "pass", detail: "RBAC enforced at API layer. DisclosurePolicy gate on all data endpoints." },
  { id: "A02", name: "Cryptographic Failures", status: "pass", detail: "TLS 1.3 everywhere. SHA-256 hash chains. HMAC-SHA256 per device." },
  { id: "A03", name: "Injection", status: "pass", detail: "Parameterised queries + ORM. Input validation at all boundaries." },
  { id: "A04", name: "Insecure Design", status: "pass", detail: "Threat model reviewed quarterly. TOGAF ADM security capability." },
  { id: "A05", name: "Security Misconfiguration", status: "pass", detail: "Infrastructure-as-code. Secrets in Vault. No defaults in prod." },
  { id: "A07", name: "Auth & Session Management", status: "pass", detail: "JWT + refresh rotation. MFA for admin roles. Session inactivity 15min." },
  { id: "A09", name: "Logging & Monitoring", status: "pass", detail: "Immutable audit trail. SIEM alerts on anomaly patterns." },
  { id: "A10", name: "SSRF", status: "watch", detail: "Drone/external API calls proxied through allow-listed endpoints — under review." },
];

const THREAT_HISTORY = Array.from({ length: 14 }, (_, i) => ({
  day: `${16 + i} May`,
  events: 4 + Math.round(Math.random() * 6),
  resolved: 3 + Math.round(Math.random() * 5),
}));

export default function Page() {
  const [events, setEvents] = useState(SECURITY_EVENTS);
  const [rotating, setRotating] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--emerald)]/30 bg-[var(--emerald)]/6 px-4 py-3 flex items-center gap-3">
        <Shield className="h-5 w-5 text-[var(--emerald)]" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-[var(--emerald)]">SECURITY POSTURE · All critical threats mitigated · 0 open P1 issues</div>
          <div className="text-xs text-muted-foreground mono">OWASP Top 10 scanned 2026-05-01 · HMAC key rotation current · Chain integrity 99.98%</div>
        </div>
        <span className="rounded bg-[var(--emerald)]/15 px-3 py-1 text-xs font-semibold text-[var(--emerald)] mono">SECURE</span>
      </div>

      <PageHeader
        eyebrow="ADMIN · Security"
        title="Threat Model & Security Posture"
        description="Four primary threat categories: Data Tampering, Sensor Spoofing, Privacy Breach, Platform Availability. HMAC key health, recent security events, and OWASP Top 10 scan results."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Open P1 Issues", v: "0", c: "emerald", icon: <CheckCircle2 className="h-4 w-4" /> },
          { l: "Security Events 24h", v: "4", c: "amber", icon: <AlertTriangle className="h-4 w-4" /> },
          { l: "HMAC Keys Active", v: "3", c: "primary", icon: <Lock className="h-4 w-4" /> },
          { l: "OWASP Scan", v: "7/8 Pass", c: "cyan", icon: <Eye className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4 flex items-start gap-3">
            <span style={{ color: `var(--${s.c})` }} className="mt-0.5">{s.icon}</span>
            <div>
              <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
              <div className="mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Threat model */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {THREATS.map((t) => (
          <Panel key={t.id} title={`${t.icon}  ${t.name}`} subtitle={`${t.category} · Likelihood: ${t.likelihood} · Impact: ${t.impact}`}>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase mono tracking-wider text-muted-foreground">Mitigation</span>
                <p className="mt-0.5 text-foreground">{t.mitigation}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase mono tracking-wider text-muted-foreground">Residual Risk</span>
                <span className="rounded px-2 py-0.5 mono text-[10px] font-bold" style={{
                  background: t.residual === "Very Low" || t.residual === "Low" ? "color-mix(in oklab,var(--emerald) 18%,transparent)" : "color-mix(in oklab,var(--amber) 18%,transparent)",
                  color: t.residual === "Very Low" || t.residual === "Low" ? "var(--emerald)" : "var(--amber)",
                }}>{t.residual}</span>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* HMAC keys + event timeline */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="HMAC-SHA256 Key Health" subtitle="Per-device-group keys · 60-day rotation policy" dense>
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Key ID","Devices","Created","Expires","Status"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HMAC_KEYS.map((k) => (
                <tr key={k.keyId} className="border-b border-border/40 hover:bg-accent/40">
                  <td className="px-3 py-2.5 mono text-primary">{k.keyId}</td>
                  <td className="px-3 py-2.5 mono">{k.devices}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground text-[10px]">{k.created}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground text-[10px]">{k.expires}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                        background: k.status === "Active" ? "color-mix(in oklab,var(--emerald) 16%,transparent)"
                          : k.status === "Expiring Soon" ? "color-mix(in oklab,var(--amber) 16%,transparent)"
                          : "color-mix(in oklab,var(--rose) 16%,transparent)",
                        color: k.status === "Active" ? "var(--emerald)" : k.status === "Expiring Soon" ? "var(--amber)" : "var(--rose)",
                      }}>{k.status}</span>
                      {k.status !== "Revoked" && (
                        <button
                          onClick={async () => {
                            setRotating(k.keyId);
                            await new Promise(r => setTimeout(r, 1500));
                            setRotating(null);
                            toast.success(`Key ${k.keyId} rotated`, { description: `New 60-day key issued. ${k.devices} devices will re-authenticate on next heartbeat.` });
                          }}
                          disabled={rotating === k.keyId}
                          className="text-[10px] text-primary hover:underline disabled:opacity-60"
                        >
                          {rotating === k.keyId ? "Rotating…" : "Rotate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Security Event Trend — 14 Days" subtitle="Events detected vs. resolved">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={THREAT_HISTORY} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={2} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="events" fill="var(--rose)" name="Detected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="var(--emerald)" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Security events */}
      <Panel title="Recent Security Events" subtitle="Auto-detected by anomaly engine + HMAC validator" dense>
        <div className="divide-y divide-border">
          {events.map((e) => (
            <div key={e.ts} className="flex items-start gap-3 p-3">
              <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: e.severity === "High" ? "var(--rose)" : "var(--amber)" }} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="mono text-xs font-semibold text-[var(--primary)]">{e.type}</span>
                  <span className="mono text-[10px] text-muted-foreground">{e.device}</span>
                  <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                    background: e.severity === "High" ? "color-mix(in oklab,var(--rose) 18%,transparent)" : "color-mix(in oklab,var(--amber) 18%,transparent)",
                    color: e.severity === "High" ? "var(--rose)" : "var(--amber)",
                  }}>{e.severity}</span>
                  <span className="ml-auto mono text-[10px]" style={{ color: e.resolved ? "var(--emerald)" : "var(--rose)" }}>
                    {e.resolved ? "RESOLVED" : "OPEN"}
                  </span>
                  {!e.resolved && (
                    <button
                      onClick={() => {
                        setEvents(prev => prev.map(ev => ev.ts === e.ts ? { ...ev, resolved: true } : ev));
                        toast.success(`${e.type} resolved`, { description: `Event on ${e.device} marked as resolved.` });
                      }}
                      className="rounded bg-[var(--emerald)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--emerald)] hover:bg-[var(--emerald)]/25"
                    >
                      Resolve
                    </button>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{e.detail}</div>
                <div className="mt-0.5 mono text-[10px] text-muted-foreground">{e.ts.replace("T"," ").replace("Z"," UTC")}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* OWASP */}
      <Panel
        title="OWASP Top 10 — Last Scan: 2026-05-01"
        subtitle="Automated + manual security review against OWASP Application Security Verification Standard"
        actions={
          <button
            onClick={async () => {
              setScanning(true);
              toast.loading("Running OWASP security scan…", { id: "owasp" });
              await new Promise(r => setTimeout(r, 2500));
              setScanning(false);
              toast.success("OWASP scan complete — 7/8 pass, 1 watch", { id: "owasp", description: "A10 SSRF remains under review. All critical items pass." });
            }}
            disabled={scanning}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50 disabled:opacity-60"
          >
            {scanning ? "Scanning…" : "Run Scan"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OWASP_RESULTS.map((r) => (
            <div key={r.id} className="flex items-start gap-2 rounded-lg border border-border bg-background/50 p-2.5">
              {r.status === "pass"
                ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-[var(--emerald)] flex-shrink-0" />
                : <AlertTriangle className="h-4 w-4 mt-0.5 text-[var(--amber)] flex-shrink-0" />}
              <div>
                <div className="text-[10px] font-semibold mono">{r.id} · {r.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
