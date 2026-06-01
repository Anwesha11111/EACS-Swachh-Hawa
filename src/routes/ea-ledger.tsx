import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { CheckCircle2, XCircle, AlertTriangle, Lock } from "lucide-react";

export const Route = createFileRoute("/ea-ledger")({
  head: () => ({ meta: [{ title: "Ledger Design · Swachh Hawa" }] }),
  component: Page,
});

const CONSIDERED_OPTIONS = [
  {
    option: "Public Blockchain (Ethereum / Polygon)",
    chosen: false,
    pros: ["Fully decentralised — no single point of control", "Public auditability without trusting the platform", "Existing tooling and standards (ERC-721, Solidity)"],
    cons: ["Gas fees for every hash anchor (~₹200-800/tx on mainnet)", "Transaction finality latency (12s–5 min) incompatible with real-time ingestion", "PII anchor on public chain violates DPDP §11 (cross-border by default)", "Regulatory uncertainty in India (Crypto Bill, RBI guidance)", "Carbon footprint conflicts with environmental mission"],
    verdict: "REJECTED",
    color: "rose",
  },
  {
    option: "Permissioned Blockchain (Hyperledger Fabric)",
    chosen: false,
    pros: ["Private — DPDP compliant, no cross-border by default", "Established enterprise use cases", "Smart contracts (chaincode) for governance automation"],
    cons: ["High operational complexity — need to run multiple peer nodes", "Requires consortium governance across CPCB + state PCBs to add members", "Performance overhead vs. hash chain for append-only audit use case", "Licensing / support costs for enterprise Fabric", "No benefit over hash chain for non-smart-contract audit trail"],
    verdict: "REJECTED",
    color: "amber",
  },
  {
    option: "SHA-256 Hash Chain + Merkle Anchoring (CHOSEN)",
    chosen: true,
    pros: ["Sub-millisecond hashing per record — zero ingestion overhead", "Each record's integrity is independently verifiable via Merkle proof", "Hourly Merkle root anchored to IPFS (content-addressed, immutable)", "Optional public blockchain checkpoint (monthly root to Polygon PoS) at minimal cost", "Full DPDP compliance — PII never leaves India, anchors are hashes only", "No consortium governance required — CPCB is sole anchor authority"],
    cons: ["Trust in the anchor authority (CPCB) — mitigated by IPFS immutability of anchored roots", "No smart contract execution — enforcement automation must be external", "Monthly blockchain checkpoint creates 30-day window before public verifiability"],
    verdict: "CHOSEN",
    color: "emerald",
  },
];

const HASH_CHAIN_STEPS = [
  { step: "1", title: "Record Ingestion", detail: "Each sensor packet arrives at the Trust Engine via Kafka (sensor.telemetry.raw topic). Packet fields are canonicalised: sorted JSON keys, UTC timestamps, device_id normalised." },
  { step: "2", title: "SHA-256 Hash per Record", detail: "H(r_i) = SHA-256( device_id || ts_utc || pm25 || pm10 || no2 || ... || H(r_{i-1}) ). Previous record's hash is included, making the chain tamper-evident: changing any record invalidates all subsequent hashes." },
  { step: "3", title: "Batch Accumulation (1-minute window)", detail: "Records are accumulated into 1-minute batches per city_id. Batch closes on wall-clock minute boundary. Batch size: typically 380–420 records at peak." },
  { step: "4", title: "Merkle Tree Construction", detail: "Leaf nodes = individual record hashes. Binary Merkle tree built bottom-up with SHA-256 at each internal node. Root = Merkle Root for the batch. Any single record can be proven in O(log n) with a sibling path." },
  { step: "5", title: "IPFS Anchoring (hourly)", detail: "Hourly aggregated Merkle root CID published to IPFS. CID is content-addressed: if the data changes, the CID changes. Published to trust.hash.anchored Kafka topic and stored in AuditStore (WORM)." },
  { step: "6", title: "Blockchain Checkpoint (monthly)", detail: "Monthly Merkle root (hash of hourly roots) anchored to Polygon PoS as OP_RETURN in a low-cost transaction. Provides public, third-party verifiable timestamp without storing any sensor data on-chain." },
];

const VERIFICATION_FLOW = [
  { actor: "Auditor / Researcher", action: "Requests Merkle proof for specific sensor reading via GET /v2/trust/{batch}/proof" },
  { actor: "API Gateway", action: "Returns: original record + sibling hashes for Merkle path + root CID" },
  { actor: "Auditor", action: "Independently recomputes SHA-256 chain from record → root using sibling path" },
  { actor: "IPFS", action: "Fetches the anchored root by CID — confirms root matches proof" },
  { actor: "Blockchain (optional)", action: "Checks Polygon PoS for monthly checkpoint — confirms IPFS CID was published on-chain at known timestamp" },
];

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ENTERPRISE ARCHITECTURE · Ledger Design"
        title="Distributed Ledger Design"
        description="Explicit ADR comparing public blockchain, permissioned blockchain, and SHA-256 hash chain with Merkle anchoring. Explains why hash chain was chosen and how tamper-evidence is achieved without a public ledger. Responds to Dr. Nayak's Point 6."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Hashing Algorithm", v: "SHA-256", c: "primary" },
          { l: "Anchor Frequency", v: "Hourly (IPFS)", c: "cyan" },
          { l: "Public Checkpoint", v: "Monthly (Polygon)", c: "emerald" },
          { l: "Proof Complexity", v: "O(log n)", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Options comparison */}
      <div className="space-y-3">
        {CONSIDERED_OPTIONS.map(opt => (
          <Panel key={opt.option} title={opt.option} subtitle={`Decision: ${opt.verdict}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-1">
              <div>
                <div className="text-[10px] mono uppercase tracking-wider text-[var(--emerald)] mb-2">Advantages</div>
                <ul className="space-y-1">
                  {opt.pros.map(p => (
                    <li key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--emerald)] shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] mono uppercase tracking-wider text-[var(--rose)] mb-2">Drawbacks</div>
                <ul className="space-y-1">
                  {opt.cons.map(c => (
                    <li key={c} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5 text-[var(--rose)] shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-3">
              <span className="rounded px-2 py-0.5 text-[10px] mono font-bold" style={{
                background: `color-mix(in oklab,var(--${opt.color}) 16%,transparent)`,
                color: `var(--${opt.color})`,
              }}>{opt.verdict}</span>
            </div>
          </Panel>
        ))}
      </div>

      {/* Hash chain mechanics */}
      <Panel title="Hash Chain & Merkle Anchor — Step-by-Step" subtitle="How tamper-evidence is implemented in the Trust Engine">
        <div className="space-y-1 mt-1">
          {HASH_CHAIN_STEPS.map(s => (
            <div key={s.step} className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
              <div className="mono text-xs font-bold w-6 text-center rounded bg-primary/10 text-primary py-0.5 shrink-0">{s.step}</div>
              <div>
                <div className="text-xs font-semibold">{s.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Verification flow */}
      <Panel title="Independent Audit Verification Flow" subtitle="How a third-party auditor verifies data integrity without trusting the platform">
        <div className="space-y-1 mt-1">
          {VERIFICATION_FLOW.map((v, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
              <Lock className="h-3.5 w-3.5 text-primary shrink-0 mt-1" />
              <div>
                <div className="text-xs font-semibold">{v.actor}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{v.action}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ADR */}
      <Panel title="ADR-005 · SHA-256 Hash Chain over Public/Permissioned Blockchain" subtitle="Architecture Decision Record — primary rationale document">
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <div><span className="font-semibold text-foreground">Status:</span> <span className="mono rounded px-1.5 py-0.5 text-[10px] font-bold bg-[var(--emerald)]/15 text-[var(--emerald)]">ACCEPTED</span> · 2024-12-03</div>
          <div><span className="font-semibold text-foreground">Context:</span> Platform requires tamper-evident data provenance for legal and regulatory credibility (NCAP enforcement, court evidence). Stakeholders initially assumed a public blockchain was needed. Architecture review required formal evaluation of options.</div>
          <div><span className="font-semibold text-foreground">Decision:</span> Use SHA-256 hash chain per record, Merkle tree per batch, hourly IPFS CID anchoring, and optional monthly Polygon PoS checkpoint. No full public or permissioned blockchain for day-to-day operations.</div>
          <div><span className="font-semibold text-foreground">Key drivers for rejection of blockchain:</span> (1) DPDP §11 cross-border risk on public chains; (2) Gas cost at 380 records/second is prohibitive; (3) Regulatory uncertainty in India; (4) Permissioned blockchain adds consortium governance overhead with no benefit over hash chain for this use case.</div>
          <div><span className="font-semibold text-foreground">Review schedule:</span> Re-evaluate when India Blockchain Policy (MeitY) is finalised, expected Q2 2026. If permissioned NeSL/NIC blockchain becomes available for government data, hybrid approach may be revisited.</div>
        </div>
      </Panel>
    </div>
  );
}
