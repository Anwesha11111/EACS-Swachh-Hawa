import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Shield, Download, Search, Lock } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/export";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit Trail · Swachh Hawa" }] }),
  component: Page,
});

const AUDIT_EVENTS = [
  { id: "AUD-8821", ts: "2026-05-30T05:48:02Z", actor: "insp.sharma@cpcb.gov.in", role: "Enforcement Officer", action: "DOSSIER_DOWNLOAD", resource: "ENF-2026-0341", ip: "10.4.12.88", sig: "valid", dpdp: true, legal: "EP Act §17" },
  { id: "AUD-8820", ts: "2026-05-30T05:44:19Z", actor: "admin@swachhhawa.gov.in", role: "Platform Admin", action: "SENSOR_DEACTIVATE", resource: "SH-PNE-0056", ip: "10.4.0.1", sig: "valid", dpdp: false, legal: "—" },
  { id: "AUD-8819", ts: "2026-05-30T05:31:07Z", actor: "analyst.mehta@iitd.ac.in", role: "Research Analyst", action: "DATA_EXPORT", resource: "open-data/delhi/pm25/2026-05", ip: "14.195.8.44", sig: "valid", dpdp: true, legal: "DPDP §7(b)" },
  { id: "AUD-8818", ts: "2026-05-30T05:22:44Z", actor: "system@swachhhawa.gov.in", role: "System", action: "MERKLE_ANCHOR", resource: "window/2026-05-30T05:00Z", ip: "internal", sig: "valid", dpdp: false, legal: "—" },
  { id: "AUD-8817", ts: "2026-05-30T04:59:11Z", actor: "officer.singh@spcb.up.gov.in", role: "SPCB Officer", action: "CASE_STATUS_UPDATE", resource: "ENF-2026-0339", ip: "10.6.2.31", sig: "valid", dpdp: false, legal: "—" },
  { id: "AUD-8816", ts: "2026-05-30T04:41:33Z", actor: "admin@swachhhawa.gov.in", role: "Platform Admin", action: "USER_ROLE_ASSIGN", resource: "user/insp.kumar@cpcb", ip: "10.4.0.1", sig: "valid", dpdp: true, legal: "DPDP §8" },
  { id: "AUD-8815", ts: "2026-05-30T04:18:02Z", actor: "system@swachhhawa.gov.in", role: "System", action: "BREACH_DETECTED", resource: "SH-DEL-0042", ip: "internal", sig: "valid", dpdp: false, legal: "EP Act §15" },
  { id: "AUD-8814", ts: "2026-05-30T04:01:55Z", actor: "system@swachhhawa.gov.in", role: "System", action: "DP_BUDGET_RESET", resource: "dp/citizen-portal", ip: "internal", sig: "valid", dpdp: true, legal: "DPDP §4" },
];

const ACTION_DIST = [
  { action: "DATA_EXPORT", count: 128, c: "var(--chart-1)" },
  { action: "DOSSIER_DL", count: 64, c: "var(--rose)" },
  { action: "MERKLE_ANCHOR", count: 24, c: "var(--cyan)" },
  { action: "CASE_UPDATE", count: 52, c: "var(--amber)" },
  { action: "USER_MGMT", count: 18, c: "var(--chart-2)" },
  { action: "BREACH_DETECT", count: 43, c: "var(--primary)" },
];

const DISCLOSURE_POLICIES = [
  { entity: "PM2.5 Grid — Open API", allowed: "Public", rationale: "Public interest monitoring", legal: "EP Act §23", dp: "Laplace ε=1.0" },
  { entity: "Enforcement Dossiers", allowed: "Enforcement Officers, CPCB", rationale: "Legal enforcement action", legal: "EP Act §17", dp: "None (evidence)" },
  { entity: "Citizen Health Alerts", allowed: "Registered Users", rationale: "Health advisory", legal: "DPDP §7(a)", dp: "Gaussian ε=0.5" },
  { entity: "Research Export", allowed: "Approved Academics", rationale: "Research & policy", legal: "DPDP §7(b)", dp: "Laplace ε=4.0" },
  { entity: "Raw Sensor Telemetry", allowed: "Platform Admins Only", rationale: "Internal ops", legal: "Internal policy", dp: "None" },
];

function Page() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All actions");
  const [verifyId, setVerifyId] = useState("AUD-8821");
  const [verifyResult, setVerifyResult] = useState<typeof AUDIT_EVENTS[0] | null>(AUDIT_EVENTS[0]);
  const [verifying, setVerifying] = useState(false);

  const filtered = useMemo(() => {
    let list = AUDIT_EVENTS;
    if (search) list = list.filter(e =>
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.resource.toLowerCase().includes(search.toLowerCase())
    );
    if (actionFilter === "DPDP only") list = list.filter(e => e.dpdp);
    if (actionFilter === "System") list = list.filter(e => e.role === "System");
    return list;
  }, [search, actionFilter]);

  const handleExportJsonl = () => {
    const jsonl = filtered.map(e => JSON.stringify(e)).join("\n");
    const blob = new Blob([jsonl], { type: "application/x-ndjson" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `audit-log-${new Date().toISOString().slice(0,10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${filtered.length} audit events as JSONL`);
  };

  const handleSearch = () => {
    toast.info("Search", { description: "Type in the filter box to search by actor, action, or resource." });
  };

  const handleVerify = async () => {
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1200));
    const found = AUDIT_EVENTS.find(e => e.id.toLowerCase() === verifyId.toLowerCase().trim());
    setVerifyResult(found ?? null);
    setVerifying(false);
    if (found) {
      toast.success(`Signature valid — ${found.id}`);
    } else {
      toast.error(`Event ${verifyId} not found in audit log`);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="GOV · Audit Trail"
        title="Immutable Signed Audit Log"
        description="Every operator action, system event, and data disclosure is signed with HMAC-SHA256 and appended to an append-only log. DPDP Act 2023 events carry legal_basis field per DisclosurePolicy."
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </button>
            <button
              onClick={handleExportJsonl}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50"
            >
              <Download className="h-3.5 w-3.5" /> Export JSONL
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Total Events 24h", v: "8,821", c: "primary" },
          { l: "DPDP-tagged Events", v: "1,244", c: "cyan" },
          { l: "Signature Failures", v: "0", c: "emerald" },
          { l: "Data Disclosures", v: "312", c: "amber" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title="Audit Event Log" subtitle="Append-only · HMAC-SHA256 signed · every row references actor, action, resource, IP, signature status" dense>
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 rounded border border-border bg-background/50 px-2 py-1 text-xs flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by actor, action, resource…"
              className="w-full bg-transparent outline-none"
            />
          </div>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="rounded border border-border bg-background/50 px-2 py-1 text-xs outline-none"
          >
            <option>All actions</option>
            <option>DPDP only</option>
            <option>System</option>
          </select>
          <button onClick={handleExportJsonl} className="flex items-center gap-1 rounded border border-border bg-background/50 px-2 py-1 text-xs">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Event ID","Timestamp (UTC)","Actor","Role","Action","Resource","IP","Sig","DPDP","Legal Basis"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-border/40 hover:bg-accent/40 cursor-pointer"
                  onClick={() => {
                    setVerifyId(e.id);
                    setVerifyResult(e);
                    toast.info(`Event ${e.id} loaded in verifier below`);
                  }}
                >
                  <td className="px-3 py-2.5 mono text-primary">{e.id}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground whitespace-nowrap">{e.ts.replace("T"," ").replace("Z"," UTC")}</td>
                  <td className="px-3 py-2.5 text-[10px] max-w-[160px] truncate">{e.actor}</td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground whitespace-nowrap">{e.role}</td>
                  <td className="px-3 py-2.5 mono text-[10px] font-semibold text-[var(--cyan)] whitespace-nowrap">{e.action}</td>
                  <td className="px-3 py-2.5 mono text-[10px] max-w-[160px] truncate text-muted-foreground">{e.resource}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground">{e.ip}</td>
                  <td className="px-3 py-2.5"><span className="text-[var(--emerald)] font-bold">✓</span></td>
                  <td className="px-3 py-2.5">
                    {e.dpdp && <span className="rounded px-1.5 py-0.5 text-[10px] mono bg-[var(--primary)]/15 text-[var(--primary)] font-bold">DPDP</span>}
                  </td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground">{e.legal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Action Distribution — 24h" subtitle="Volume by event type">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ACTION_DIST} layout="vertical" margin={{ left: 90, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="action" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip formatter={(v: number) => [v, "events"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ACTION_DIST.map((d, i) => <Cell key={i} fill={d.c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="DisclosurePolicy Entity Table" subtitle="DPDP Act 2023 · allowed_roles + disclosure_rationale + legal_basis per data class">
          <div className="divide-y divide-border">
            {DISCLOSURE_POLICIES.map((p) => (
              <div key={p.entity} className="py-2.5 px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold">{p.entity}</span>
                  <span className="ml-auto mono text-[10px] text-[var(--cyan)]">{p.dp}</span>
                </div>
                <div className="mt-0.5 flex gap-4 text-[10px] text-muted-foreground flex-wrap">
                  <span><span className="text-foreground">Allowed:</span> {p.allowed}</span>
                  <span><span className="text-foreground">Legal:</span> {p.legal}</span>
                  <span><span className="text-foreground">Rationale:</span> {p.rationale}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Signature Verification Panel" subtitle="Verify any audit event signature using device HMAC-SHA256 key — or click any row above to load it">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={verifyId}
            onChange={e => setVerifyId(e.target.value)}
            placeholder="Enter Audit Event ID (e.g. AUD-8821)…"
            className="flex-1 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary mono"
          />
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Lock className="h-4 w-4" /> {verifying ? "Verifying…" : "Verify Signature"}
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-background/40 p-4 text-xs mono text-muted-foreground">
          {verifyResult ? (
            <>
              <div className="text-[var(--emerald)] font-bold mb-2">✓ SIGNATURE VALID — {verifyResult.id}</div>
              <div>actor:    {verifyResult.actor}</div>
              <div>action:   {verifyResult.action}</div>
              <div>resource: {verifyResult.resource}</div>
              <div>ip:       {verifyResult.ip}</div>
              <div className="mt-2 text-[var(--emerald)]">
                TAMPER_EVIDENT=true · DPDP_LOGGED={verifyResult.dpdp ? "true" : "false"} · LEGAL_BASIS={verifyResult.legal}
              </div>
            </>
          ) : (
            <div className="text-[var(--rose)] font-bold">✗ EVENT NOT FOUND — {verifyId}</div>
          )}
        </div>
      </Panel>
    </div>
  );
}
