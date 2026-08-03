import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { ShieldCheck, Link2, Lock, Eye, Database, Hash } from "lucide-react";

export const Route = createFileRoute("/data-trust")({
  head: () => ({ meta: [{ title: "Data Trust Engine · Swachh Hawa" }] }),
  component: Page,
});

const HASH_CHAIN = Array.from({ length: 10 }, (_, i) => ({
  seq: 2480 + i,
  deviceId: `SH-${["DEL-0042", "DEL-0043", "GZB-0011", "LDH-0088", "PNE-0056"][i % 5]}`,
  ts: `2026-05-30T${String(6 + i).padStart(2, "0")}:14:${String(i * 7 % 60).padStart(2, "0")}Z`,
  pm25: 62 + i * 3,
  context: ["ambient", "ambient", "source_proximate", "ambient", "indoor", "ambient", "ambient", "source_proximate", "ambient", "ambient"][i],
  hashTrunc: `a${(0xf3b2 + i * 0x1a7f).toString(16).padStart(4, "0")}…c${(0x9e01 + i * 0x22ab).toString(16).slice(-4)}`,
  prevTrunc: i === 0 ? "GENESIS" : `a${(0xf3b2 + (i - 1) * 0x1a7f).toString(16).padStart(4, "0")}…c${(0x9e01 + (i - 1) * 0x22ab).toString(16).slice(-4)}`,
  valid: i !== 5,
}));

const MERKLE_ANCHORS = [
  { window: "2026-05-30 06:00 UTC", root: "7f3a…e891", records: 1248, ledgerRef: "IPFS:Qm9xK…f44a", status: "anchored" },
  { window: "2026-05-30 05:00 UTC", root: "b2c1…d037", records: 1192, ledgerRef: "IPFS:QmR8p…12cf", status: "anchored" },
  { window: "2026-05-30 04:00 UTC", root: "4e7d…9f12", records: 1231, ledgerRef: "IPFS:QmT6v…8ba1", status: "anchored" },
  { window: "2026-05-30 03:00 UTC", root: "c6a8…3b44", records: 1178, ledgerRef: "IPFS:QmW2j…5d7c", status: "anchored" },
  { window: "2026-05-30 02:00 UTC", root: "9d2f…7e56", records: 1209, ledgerRef: "IPFS:QmB4n…a2e8", status: "anchored" },
];

const TRUST_DIST = [
  { range: "0.9–1.0", count: 1482, label: "Excellent" },
  { range: "0.8–0.9", count: 618, label: "Good" },
  { range: "0.7–0.8", count: 214, label: "Fair" },
  { range: "0.5–0.7", count: 89, label: "Marginal" },
  { range: "< 0.5", count: 48, label: "Flagged" },
];

const DP_BUDGET = [
  { class: "Open-data API", epsilon: 1.0, delta: "1e-5", consumed: 0.72 },
  { class: "Hyperlocal Alerts", epsilon: 0.5, delta: "1e-6", consumed: 0.31 },
  { class: "Citizen Portal", epsilon: 2.0, delta: "1e-5", consumed: 1.44 },
  { class: "Academic Export", epsilon: 4.0, delta: "1e-4", consumed: 2.18 },
];

const NOISE_TIMELINE = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  laplace: +(1.2 + 0.4 * Math.sin(i / 3.8) + Math.random() * 0.3).toFixed(2),
  gaussian: +(0.9 + 0.3 * Math.sin(i / 4.2 + 1) + Math.random() * 0.2).toFixed(2),
}));

const CONTEXT_PIE = [
  { name: "Ambient", value: 1842, color: "var(--chart-1)" },
  { name: "Source-proximate", value: 384, color: "var(--rose)" },
  { name: "Indoor", value: 225, color: "var(--chart-3)" },
];

function Page() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/6 px-4 py-3 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-[var(--primary)]">DATA INTEGRITY · All 2,451 sensors cryptographically verified</div>
          <div className="text-xs text-muted-foreground mono">Merkle root anchored every hour · SHA-256 hash chain per device · HMAC-SHA256 per-key signing</div>
        </div>
        <span className="rounded bg-[var(--emerald)]/15 px-3 py-1 text-xs font-semibold text-[var(--emerald)] mono">CHAIN VALID</span>
      </div>

      <PageHeader
        eyebrow="INTEGRITY · Data Trust Engine"
        title="Cryptographic Data Provenance"
        description="Every measurement carries an unbroken SHA-256 hash chain. Merkle roots are anchored to a tamper-evident ledger every hour. Differential privacy is applied exclusively at publish boundaries."
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50">
              <Hash className="h-3.5 w-3.5" /> Verify Proof
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50">
              <Database className="h-3.5 w-3.5" /> Audit Anchor
            </button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Hash Chain Integrity", v: "99.98%", c: "emerald", icon: <Link2 className="h-4 w-4" /> },
          { l: "Anchored Windows", v: "1,440", c: "primary", icon: <Database className="h-4 w-4" /> },
          { l: "Avg Trust Score", v: "0.93", c: "cyan", icon: <ShieldCheck className="h-4 w-4" /> },
          { l: "DP ε Budget Used", v: "72%", c: "amber", icon: <Lock className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4 flex items-start gap-3">
            <span style={{ color: `var(--${s.c})` }} className="mt-0.5">{s.icon}</span>
            <div>
              <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
              <div className="mt-1 mono text-2xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Hash chain + Merkle anchors */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title="Live Hash Chain — SHA-256 per Device" subtitle="Most recent 10 records across fleet · tamper=true shown in red" dense>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
                  <tr className="border-b border-border">
                    {["Seq", "Device", "Timestamp (UTC)", "PM2.5", "Context", "Hash (trunc)", "Prev Hash", "Valid"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HASH_CHAIN.map((r) => (
                    <tr key={r.seq} className={`border-b border-border/40 hover:bg-accent/40 ${!r.valid ? "bg-[var(--rose)]/5" : ""}`}>
                      <td className="px-3 py-2 mono text-muted-foreground">{r.seq}</td>
                      <td className="px-3 py-2 mono text-primary font-semibold">{r.deviceId}</td>
                      <td className="px-3 py-2 mono text-[10px] text-muted-foreground">{r.ts}</td>
                      <td className="px-3 py-2 mono">{r.pm25}</td>
                      <td className="px-3 py-2">
                        <span className="rounded px-1.5 py-0.5 text-[10px] mono" style={{
                          background: r.context === "source_proximate" ? "color-mix(in oklab,var(--rose) 18%,transparent)"
                            : r.context === "indoor" ? "color-mix(in oklab,var(--amber) 18%,transparent)"
                            : "color-mix(in oklab,var(--cyan) 18%,transparent)",
                          color: r.context === "source_proximate" ? "var(--rose)"
                            : r.context === "indoor" ? "var(--amber)"
                            : "var(--cyan)",
                        }}>{r.context}</span>
                      </td>
                      <td className="px-3 py-2 mono text-[10px]">{r.hashTrunc}</td>
                      <td className="px-3 py-2 mono text-[10px] text-muted-foreground">{r.prevTrunc}</td>
                      <td className="px-3 py-2">
                        {r.valid
                          ? <span className="text-[var(--emerald)] font-bold">✓</span>
                          : <span className="text-[var(--rose)] font-bold mono">TAMPER</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel title="measurement_context Distribution" subtitle="Source-proximate excluded from public AQI aggregation">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CONTEXT_PIE} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {CONTEXT_PIE.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [v, "sensors"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {CONTEXT_PIE.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                  <span>{e.name}</span>
                </div>
                <span className="mono text-muted-foreground">{e.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-[var(--amber)]/30 bg-[var(--amber)]/8 p-2.5 text-[11px] text-[var(--amber)]">
            <strong>Important:</strong> Source-proximate readings are routed to enforcement dossiers only — never used in public AQI aggregation. This prevents industrial sensors from inflating or masking grid averages.
          </div>
        </Panel>
      </div>

      {/* AuditAnchor / Merkle */}
      <Panel title="AuditAnchor Table — Hourly Merkle Root Ledger" subtitle="Each window's Merkle root is pinned to IPFS + hash registered in the tamper-evident ledger" dense>
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            <tr className="border-b border-border">
              {["Time Window (UTC)", "Merkle Root (trunc)", "Records", "Ledger Ref (IPFS CID)", "Status"].map((h) => (
                <th key={h} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MERKLE_ANCHORS.map((a) => (
              <tr key={a.window} className="border-b border-border/40 hover:bg-accent/40">
                <td className="px-4 py-2.5 mono text-muted-foreground">{a.window}</td>
                <td className="px-4 py-2.5 mono text-primary font-semibold">{a.root}</td>
                <td className="px-4 py-2.5 mono">{a.records.toLocaleString()}</td>
                <td className="px-4 py-2.5 mono text-[10px] text-cyan-400">{a.ledgerRef}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded px-2 py-0.5 text-[10px] mono font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">
                    {a.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Trust score + DP budget */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Trust Score Distribution" subtitle="Composite: neighbour consensus + calibration R² + forecast accuracy + satellite cross-val">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TRUST_DIST} layout="vertical" margin={{ left: 60, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="range" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip formatter={(v: number) => [v, "sensors"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {TRUST_DIST.map((d, i) => (
                    <Cell key={i} fill={
                      d.label === "Excellent" ? "var(--emerald)"
                      : d.label === "Good" ? "var(--chart-1)"
                      : d.label === "Fair" ? "var(--amber)"
                      : d.label === "Marginal" ? "color-mix(in oklab,var(--rose) 70%,var(--amber))"
                      : "var(--rose)"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 rounded-lg border border-border bg-background/50 p-3 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Trust score components:</span> Neighbour consensus (35%) · Reference co-location R² (30%) · Forecast vs. actual residual (20%) · Satellite/ground cross-validation (15%)
          </div>
        </Panel>

        <Panel title="Differential Privacy ε-Budget by Data Class" subtitle="Laplace/Gaussian noise injected at publish boundary only — never on internal data, enforcement evidence, or forecasting inputs">
          <div className="space-y-3 mt-1">
            {DP_BUDGET.map((d) => (
              <div key={d.class}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{d.class}</span>
                  <span className="mono text-muted-foreground">ε={d.epsilon} δ={d.delta}</span>
                </div>
                <div className="relative h-5 rounded bg-border/40 overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(d.consumed / d.epsilon) * 100}%`,
                      background: (d.consumed / d.epsilon) > 0.85 ? "var(--rose)"
                        : (d.consumed / d.epsilon) > 0.65 ? "var(--amber)"
                        : "var(--chart-1)",
                    }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] mono font-semibold">
                    {d.consumed} / {d.epsilon} consumed
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/6 p-2.5 text-[11px]">
            <span className="text-[var(--primary)] font-semibold">DPDP Act 2023 compliance:</span> <span className="text-muted-foreground">All citizen-facing data classes use per-query DP budgets with cryptographically enforced ε-accounting. Budget refresh every 24h UTC.</span>
          </div>
        </Panel>
      </div>

      {/* Noise timeline */}
      <Panel title="DP Noise Magnitude — Last 24h" subtitle="Laplace σ and Gaussian σ at publish boundary (lower = more data utility, higher = more privacy)">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={NOISE_TIMELINE} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="h" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={3} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 2]} />
              <Tooltip />
              <Line type="monotone" dataKey="laplace" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Laplace σ" />
              <Line type="monotone" dataKey="gaussian" stroke="var(--cyan)" strokeWidth={2} dot={false} name="Gaussian σ" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Proof lookup */}
      <Panel title="Cryptographic Proof Lookup" subtitle="Verify any measurement's hash chain membership and Merkle proof">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="Enter device ID (e.g. SH-DEL-0042) or measurement hash…"
            className="flex-1 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary mono"
          />
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Eye className="h-4 w-4" /> Verify Proof
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-background/40 p-4 text-xs mono text-muted-foreground">
          <div className="text-[var(--emerald)] font-bold mb-2">✓ VERIFICATION RESULT — SH-DEL-0042 · seq 2489</div>
          <div>hash:      a3f2…c4e1</div>
          <div>prev_hash: a2d1…b3d9</div>
          <div>chain_pos: 2489 / 2489 (HEAD)</div>
          <div>merkle_proof: [7 sibling hashes omitted]</div>
          <div>merkle_root: 7f3a…e891</div>
          <div>ledger_ref: IPFS:Qm9xK…f44a</div>
          <div className="mt-2 text-[var(--emerald)]">CHAIN_VALID=true · MERKLE_PROOF_VALID=true · NOT_TAMPERED</div>
        </div>
      </Panel>
    </div>
  );
}
