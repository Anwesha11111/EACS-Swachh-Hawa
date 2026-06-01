import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { motion } from "framer-motion";
import {
  Radio, Network, Cpu, Layers, ShieldCheck, Brain, Database,
  Cloud, Globe, Users, FlaskConical, Building2, Lock,
} from "lucide-react";

export const Route = createFileRoute("/ea-system-architecture")({
  head: () => ({ meta: [{ title: "System Architecture · Swachh Hawa" }] }),
  component: Page,
});

// ----------------------------------------------------------------------------
// Node layout — coordinates are box CENTERS in the 1300×520 viewBox
// ----------------------------------------------------------------------------
type N = {
  id: string; x: number; y: number; w?: number; h?: number;
  title: string; sub: string; color: string; icon: any; live?: boolean;
};

const W = 132, H = 56;

const NODES: N[] = [
  // Field sensors
  { id: "s1", x: 90, y: 130, w: 120, h: 42, title: "PM2.5 / PM10", sub: "Optical sensor", color: "cyan", icon: Radio, live: true },
  { id: "s2", x: 90, y: 230, w: 120, h: 42, title: "Gas Array", sub: "NO₂·SO₂·O₃·CO", color: "cyan", icon: Radio, live: true },
  { id: "s3", x: 90, y: 330, w: 120, h: 42, title: "Met + Mobile", sub: "Drone · vehicle", color: "cyan", icon: Radio, live: true },
  // Mesh
  { id: "lora", x: 280, y: 230, title: "LoRa Mesh GW", sub: "Self-healing backhaul", color: "primary", icon: Network },
  // Edge compute
  { id: "edge", x: 460, y: 230, title: "Edge Node", sub: "Jetson · RPi5 · 72h buffer", color: "primary", icon: Cpu },
  // Ingest
  { id: "kafka", x: 640, y: 230, title: "Kafka Ingest", sub: "8 topics · 380 msg/s", color: "amber", icon: Layers },
  // Cloud processing (stacked)
  { id: "trust", x: 830, y: 120, title: "Trust Engine", sub: "SHA-256 · Merkle", color: "chart-1", icon: Lock },
  { id: "ml", x: 830, y: 230, title: "ML Forecast", sub: "LGBM + LSTM ensemble", color: "primary", icon: Brain },
  { id: "db", x: 830, y: 340, title: "TimescaleDB", sub: "Time-series · 4.8 TB", color: "emerald", icon: Database },
  // Delivery
  { id: "api", x: 1020, y: 230, title: "API Gateway", sub: "REST · WebSocket", color: "cyan", icon: Cloud },
  // Consumers (stacked)
  { id: "pub", x: 1200, y: 95, w: 130, h: 44, title: "Public Dashboard", sub: "National AQI map", color: "emerald", icon: Globe },
  { id: "cit", x: 1200, y: 185, w: 130, h: 44, title: "Citizen Portal", sub: "Alerts · complaints", color: "emerald", icon: Users },
  { id: "pcb", x: 1200, y: 275, w: 130, h: 44, title: "State PCB / CPCB", sub: "Enforcement · GRAP", color: "primary", icon: Building2 },
  { id: "res", x: 1200, y: 365, w: 130, h: 44, title: "Research API", sub: "ε-DP open data", color: "chart-1", icon: FlaskConical },
];

const NODE = Object.fromEntries(NODES.map(n => [n.id, n])) as Record<string, N>;

// edge helpers ---------------------------------------------------------------
const right = (n: N) => ({ x: n.x + (n.w ?? W) / 2, y: n.y });
const left = (n: N) => ({ x: n.x - (n.w ?? W) / 2, y: n.y });

function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
}

// connections: [fromId, toId, packetColor, durSeconds]
const LINKS: [string, string, string, number][] = [
  ["s1", "lora", "cyan", 2.6],
  ["s2", "lora", "cyan", 2.2],
  ["s3", "lora", "cyan", 3.0],
  ["lora", "edge", "primary", 2.0],
  ["edge", "kafka", "amber", 1.8],
  ["kafka", "trust", "chart-1", 2.4],
  ["kafka", "ml", "primary", 2.0],
  ["kafka", "db", "emerald", 2.6],
  ["trust", "api", "chart-1", 2.4],
  ["ml", "api", "primary", 2.0],
  ["db", "api", "emerald", 2.6],
  ["api", "pub", "emerald", 2.2],
  ["api", "cit", "emerald", 2.6],
  ["api", "pcb", "primary", 2.0],
  ["api", "res", "chart-1", 3.0],
];

const PATHS = LINKS.map(([from, to, color, dur], i) => ({
  id: `p${i}`,
  d: curve(right(NODE[from]), left(NODE[to])),
  color, dur,
}));

const TIERS = [
  { x: 90, label: "FIELD SENSORS" },
  { x: 280, label: "MESH" },
  { x: 460, label: "EDGE COMPUTE" },
  { x: 640, label: "INGEST" },
  { x: 830, label: "CLOUD PROCESSING" },
  { x: 1020, label: "DELIVERY" },
  { x: 1200, label: "CONSUMERS" },
];

function NodeBox({ n, idx }: { n: N; idx: number }) {
  const w = n.w ?? W, h = n.h ?? H;
  const Icon = n.icon;
  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
    >
      {/* glow for live nodes */}
      {n.live && (
        <rect x={n.x - w / 2} y={n.y - h / 2} width={w} height={h} rx={10}
          fill="none" stroke={`var(--${n.color})`} strokeWidth={1}>
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.4s" repeatCount="indefinite" />
        </rect>
      )}
      <rect
        x={n.x - w / 2} y={n.y - h / 2} width={w} height={h} rx={10}
        fill="color-mix(in oklab, var(--card) 92%, transparent)"
        stroke="var(--border)" strokeWidth={1}
      />
      {/* accent bar */}
      <rect x={n.x - w / 2} y={n.y - h / 2} width={4} height={h} rx={2} fill={`var(--${n.color})`} />
      {/* icon chip */}
      <circle cx={n.x - w / 2 + 22} cy={n.y} r={11}
        fill={`color-mix(in oklab, var(--${n.color}) 18%, transparent)`} />
      <foreignObject x={n.x - w / 2 + 13} y={n.y - 9} width={18} height={18}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 18 }}>
          <Icon size={12} style={{ color: `var(--${n.color})` }} />
        </div>
      </foreignObject>
      <text x={n.x - w / 2 + 40} y={n.y - 3} fontSize={11} fontWeight={700}
        fill="var(--foreground)" style={{ fontFamily: "var(--font-sans)" }}>{n.title}</text>
      <text x={n.x - w / 2 + 40} y={n.y + 11} fontSize={8}
        fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-mono)" }}>{n.sub}</text>
    </motion.g>
  );
}

export default function Page() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ENTERPRISE ARCHITECTURE · System Diagram"
        title="Hybrid Cloud-Edge System Architecture"
        description="End-to-end data flow from field sensors through the LoRa mesh, edge inference, Kafka ingestion, cloud trust/ML/storage tier, and the API gateway out to public, civic, regulatory, and research consumers. Animated packets trace live data movement; cross-cutting bands show platform-wide security and governance controls."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Architecture Tiers", v: "7", c: "primary" },
          { l: "Edge Nodes Active", v: "46", c: "cyan" },
          { l: "E2E Latency p50", v: "58ms", c: "emerald" },
          { l: "Data In-flight", v: "1.2 TB/day", c: "amber" },
        ].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 mono text-xl font-semibold" style={{ color: `var(--${s.c})` }}>{s.v}</div>
          </div>
        ))}
      </div>

      <Panel title="Live System Data Flow" subtitle="Three-tier hybrid architecture · packets animate real-time telemetry movement">
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 1300 520" className="w-full min-w-[640px]" style={{ height: "auto" }}>
            <defs>
              {/* soft glow filter for packets */}
              <filter id="pktGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* tier headers */}
            {TIERS.map(t => (
              <text key={t.label} x={t.x} y={50} fontSize={9.5} fontWeight={700}
                textAnchor="middle" fill="var(--muted-foreground)"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
                {t.label}
              </text>
            ))}

            {/* connection paths (drawn behind nodes) */}
            {PATHS.map(p => (
              <motion.path
                key={p.id} id={p.id} d={p.d} fill="none"
                stroke="var(--border)" strokeWidth={1.5} strokeOpacity={0.7}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            ))}

            {/* animated data packets travelling along each path */}
            {PATHS.map(p => (
              [0, 1, 2].map(k => (
                <circle key={`${p.id}-${k}`} r={3.4} fill={`var(--${p.color})`} filter="url(#pktGlow)">
                  <animateMotion dur={`${p.dur}s`} repeatCount="indefinite"
                    begin={`${(p.dur / 3) * k}s`} rotate="auto">
                    <mpath href={`#${p.id}`} />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0"
                    dur={`${p.dur}s`} begin={`${(p.dur / 3) * k}s`} repeatCount="indefinite" />
                </circle>
              ))
            ))}

            {/* nodes */}
            {NODES.map((n, i) => <NodeBox key={n.id} n={n} idx={i} />)}

            {/* cross-cutting bands */}
            {[
              { y: 430, label: "ZERO-TRUST SECURITY", detail: "mTLS · X.509 device certs · RBAC · SIEM · STRIDE-mitigated", color: "rose", icon: ShieldCheck },
              { y: 474, label: "DATA GOVERNANCE & DPDP", detail: "Consent · lineage · retention · ε-DP at publish boundary · WORM audit", color: "chart-1", icon: Lock },
            ].map(band => {
              const BIcon = band.icon;
              return (
                <g key={band.label}>
                  <rect x={28} y={band.y} width={1244} height={34} rx={8}
                    fill={`color-mix(in oklab, var(--${band.color}) 8%, transparent)`}
                    stroke={`var(--${band.color})`} strokeOpacity={0.45} strokeWidth={1}
                    strokeDasharray="5 4" />
                  <foreignObject x={42} y={band.y + 8} width={18} height={18}>
                    <div style={{ display: "flex", alignItems: "center", height: 18 }}>
                      <BIcon size={13} style={{ color: `var(--${band.color})` }} />
                    </div>
                  </foreignObject>
                  <text x={66} y={band.y + 22} fontSize={10.5} fontWeight={700}
                    fill={`var(--${band.color})`} style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                    {band.label}
                  </text>
                  <text x={250} y={band.y + 22} fontSize={9.5}
                    fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-mono)" }}>
                    {band.detail}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] mono text-muted-foreground border-t border-border/40 pt-3">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--cyan)" }} /> Edge / sensing tier</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} /> Compute / inference</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--amber)" }} /> Ingestion bus</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--chart-1)" }} /> Trust / provenance</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--emerald)" }} /> Storage / delivery</span>
          <span className="ml-auto flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--cyan)" }} /> moving dots = live data packets</span>
        </div>
      </Panel>

      {/* Tier responsibilities */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[
          { t: "Edge Tier", c: "cyan", d: "Fixed + mobile sensors stream over a self-healing LoRa mesh. Edge nodes (Jetson/RPi5) run local inference and buffer 72h offline, so connectivity loss never drops data." },
          { t: "Ingestion", c: "amber", d: "Kafka decouples producers from consumers across 8 topics. Edge nodes replay buffered packets in order on reconnect; consumer groups track lag independently." },
          { t: "Cloud Processing", c: "primary", d: "Trust Engine hash-chains every record; the LGBM+LSTM ensemble forecasts AQI; TimescaleDB stores compressed time-series. All three fan into the API gateway." },
          { t: "Delivery", c: "emerald", d: "REST + WebSocket gateway publishes to consumers with per-key auth and rate limits. Differential privacy is injected only here, at the public boundary." },
          { t: "Trust & Provenance", c: "chart-1", d: "SHA-256 hash chain → hourly Merkle root anchored to IPFS → monthly Polygon checkpoint, giving independently verifiable, tamper-evident data lineage." },
          { t: "Cross-cutting", c: "rose", d: "Zero-trust security (mTLS, X.509, RBAC, SIEM) and DPDP-aligned data governance (consent, retention, WORM audit) apply across every tier, not as an afterthought." },
        ].map(card => (
          <div key={card.t} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--${card.c})` }} />
              <div className="text-sm font-semibold">{card.t}</div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{card.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
