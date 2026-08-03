import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { AlertOctagon, CheckCircle2, Clock, FileText, Search, Download, ArrowRight, Shield } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/export";

export const Route = createFileRoute("/enforcement")({
  head: () => ({ meta: [{ title: "Enforcement Dashboard · Swachh Hawa" }] }),
  component: Page,
});

const DOSSIERS = [
  {
    id: "ENF-2026-0341", city: "Delhi – Anand Vihar", source: "Industrial Emission",
    pm25: 356, no2: 118, context: "source_proximate", officer: "Insp. R. Sharma",
    stage: "Dossier Compiled", sla: "2h 14m", breach: "2026-05-30 04:18 UTC",
    hash: "8f3a…d210", chainPos: 4821, severity: "Critical",
  },
  {
    id: "ENF-2026-0340", city: "Ghaziabad – Loni", source: "Construction Dust",
    pm25: 298, no2: 64, context: "source_proximate", officer: "Insp. K. Mehta",
    stage: "Dispatched", sla: "1h 42m", breach: "2026-05-30 05:02 UTC",
    hash: "c9b1…f452", chainPos: 4798, severity: "High",
  },
  {
    id: "ENF-2026-0339", city: "Ludhiana – Industrial Area", source: "Fire / Smoke",
    pm25: 412, no2: 88, context: "source_proximate", officer: "Insp. A. Singh",
    stage: "Resolved", sla: "3h 05m", breach: "2026-05-29 22:41 UTC",
    hash: "2e7c…9b33", chainPos: 4601, severity: "Critical",
  },
  {
    id: "ENF-2026-0338", city: "Patna – Kankarbagh", source: "Brick Kiln",
    pm25: 287, no2: 72, context: "ambient", officer: "Insp. P. Kumar",
    stage: "Investigating", sla: "4h 31m", breach: "2026-05-29 21:15 UTC",
    hash: "5d4e…a178", chainPos: 4582, severity: "High",
  },
  {
    id: "ENF-2026-0337", city: "Kanpur – Industrial Zone", source: "Industrial Emission",
    pm25: 321, no2: 132, context: "source_proximate", officer: "Insp. S. Verma",
    stage: "Breach Detected", sla: "0h 28m", breach: "2026-05-30 05:48 UTC",
    hash: "1a9f…c621", chainPos: 4855, severity: "Critical",
  },
];

const PIPELINE_STEPS = [
  { step: 1, label: "Sense", desc: "Multi-sensor grid detects exceedance. measurement_context = source_proximate.", icon: "📡", color: "var(--chart-1)" },
  { step: 2, label: "Validate & Trust-score", desc: "Hash-chain verified. Trust score ≥ 0.75 required to progress. Low-trust readings quarantined.", icon: "🔐", color: "var(--cyan)" },
  { step: 3, label: "Detect Breach", desc: "PM2.5 > 150 µg/m³ sustained 15 min OR AQI > 300 triggers case. GRAP stage auto-tagged.", icon: "⚡", color: "var(--amber)" },
  { step: 4, label: "Attribute Source", desc: "Wind-vector + dispersion model + satellite SO₂/NO₂ plume identifies polluter. Confidence scored.", icon: "🎯", color: "var(--rose)" },
  { step: 5, label: "Compile Dossier", desc: "Evidence bundle: hash-chained readings, Merkle proof, SHAP attribution, source photos, legal notice draft.", icon: "📋", color: "var(--primary)" },
  { step: 6, label: "Dispatch to Officer", desc: "Push notification + PDF dossier sent to assigned CPCB/SPCB enforcement officer. SLA clock starts.", icon: "👮", color: "var(--chart-2)" },
  { step: 7, label: "Resolve & Publish", desc: "Officer marks compliant / issues penalty. Outcome published on open-data portal (DP-sanitised).", icon: "✅", color: "var(--emerald)" },
];

const SLA_TREND = Array.from({ length: 14 }, (_, i) => ({
  day: `${16 + i} May`,
  avg: 2.8 + Math.sin(i / 2.2) * 0.8 + Math.random() * 0.4,
  target: 4.0,
}));

const RESOLUTION_BY_TYPE = [
  { type: "Industrial", open: 12, resolved: 34 },
  { type: "Construction", open: 8, resolved: 28 },
  { type: "Vehicles", open: 6, resolved: 19 },
  { type: "Biomass", open: 4, resolved: 22 },
  { type: "Fire", open: 9, resolved: 15 },
];

const STAGE_COLOR: Record<string, string> = {
  "Breach Detected": "var(--rose)",
  "Dossier Compiled": "var(--amber)",
  "Dispatched": "var(--chart-1)",
  "Investigating": "var(--cyan)",
  "Resolved": "var(--emerald)",
};

export default function Page() {
  const [search, setSearch] = useState("");
  const [activating, setActivating] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(DOSSIERS[0]);

  const filtered = useMemo(() =>
    search ? DOSSIERS.filter(d =>
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.source.toLowerCase().includes(search.toLowerCase())
    ) : DOSSIERS,
    [search]
  );

  const handleActivateStrikeTeams = async () => {
    setActivating(true);
    toast.loading("Activating Strike Teams…", { id: "strike-teams" });
    await new Promise(r => setTimeout(r, 1800));
    setActivating(false);
    toast.success("Strike Teams Activated", {
      id: "strike-teams",
      description: "2 Critical CPCB rapid-response teams dispatched. ETA 18 min to Anand Vihar, 26 min to Ghaziabad-Loni.",
      duration: 6000,
    });
  };

  const handleExport = () => {
    downloadCsv(
      filtered.map(d => ({
        "Case ID": d.id, Location: d.city, "Source Type": d.source,
        "PM2.5": d.pm25, "NO2": d.no2, Stage: d.stage,
        Officer: d.officer, "SLA": d.sla, "Hash": d.hash,
        "Chain Pos": d.chainPos, "Breach Time": d.breach,
      })),
      `enforcement-dossiers-${new Date().toISOString().slice(0,10)}.csv`
    );
    toast.success(`Exported ${filtered.length} enforcement dossiers as CSV`);
  };

  const handleDownloadDossier = (d: typeof DOSSIERS[0]) => {
    toast.success(`Downloading ${d.id}.pdf`, {
      description: `Evidence bundle: hash-chain readings, Merkle proof, SHAP attribution. Chain pos: ${d.chainPos}.`,
      duration: 5000,
    });
  };

  const handleIssueLegalNotice = (d: typeof DOSSIERS[0]) => {
    toast.warning("Legal Notice Issued", {
      description: `Notice under EP Act §17 issued for ${d.id} — ${d.city}. Officer ${d.officer} notified.`,
      duration: 5000,
    });
  };

  const handleAssignStrikeTeam = (d: typeof DOSSIERS[0]) => {
    toast.info("Strike Team Assigned", {
      description: `CPCB Rapid Response Team 3 assigned to ${d.id} — ${d.city}. ETA: 22 min.`,
      duration: 5000,
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--rose)]/40 bg-[var(--rose)]/8 px-4 py-3 flex items-center gap-3">
        <AlertOctagon className="h-5 w-5 text-[var(--rose)]" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-[var(--rose)]">ENFORCEMENT ACTIVE · 5 cases open · 2 critical</div>
          <div className="text-xs text-muted-foreground mono">GRAP Stage III in effect — Delhi-NCR · CPCB joint enforcement window active</div>
        </div>
        <button
          onClick={handleActivateStrikeTeams}
          disabled={activating}
          className="rounded bg-[var(--rose)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {activating ? "Activating…" : "Activate Strike Teams"}
        </button>
      </div>

      <PageHeader
        eyebrow="GOV · Enforcement Dashboard"
        title="Breach-to-Enforcement Pipeline"
        description="End-to-end value stream: Sense → Validate → Detect → Attribute → Dossier → Dispatch → Resolve → Publish. Every dossier is cryptographically bound to the originating sensor chain."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => toast.info("Search Cases", { description: "Type in the search box below to filter by case ID, city, or source type." })}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50"
            >
              <Search className="h-3.5 w-3.5" /> Search Cases
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Open Cases", v: 28, c: "rose", icon: <AlertOctagon className="h-4 w-4" /> },
          { l: "Investigating", v: 14, c: "amber", icon: <Clock className="h-4 w-4" /> },
          { l: "Resolved 24h", v: 92, c: "emerald", icon: <CheckCircle2 className="h-4 w-4" /> },
          { l: "SLA Compliance", v: "91%", c: "primary", icon: <Shield className="h-4 w-4" /> },
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

      <Panel title="7-Step Breach-to-Enforcement Value Stream" subtitle="Architectural thesis: any breach traceable from raw sensor hash to published enforcement outcome">
        <div className="flex flex-wrap gap-2 p-2">
          {PIPELINE_STEPS.map((s, idx) => (
            <div key={s.step} className="flex items-center gap-1">
              <div className="rounded-xl border border-border bg-card/60 p-3 min-w-[140px] max-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{s.icon}</span>
                  <span className="mono text-[10px] font-bold" style={{ color: s.color }}>STEP {s.step}</span>
                </div>
                <div className="text-xs font-semibold">{s.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Active Enforcement Dossiers" subtitle="Cryptographic fields included — hash-chain position verifiable via Data Trust Engine" dense>
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 rounded border border-border bg-background/50 px-2 py-1 text-xs flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, city, or source…"
              className="w-full bg-transparent outline-none"
            />
          </div>
          <button onClick={handleExport} className="flex items-center gap-1 rounded border border-border bg-background/50 px-2 py-1 text-xs">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs table-sticky-col">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              <tr className="border-b border-border">
                {["Case ID", "Location", "Source Type", "PM2.5", "Context", "Stage", "Officer", "Hash (trunc)", "Chain Pos", "SLA", "Breach Time"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-border/40 hover:bg-accent/40 cursor-pointer"
                  onClick={() => setSelectedDossier(d)}
                  style={{ outline: selectedDossier.id === d.id ? "1px solid var(--primary)" : undefined }}
                >
                  <td className="px-3 py-2.5 mono text-primary font-semibold whitespace-nowrap">{d.id}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{d.city}</td>
                  <td className="px-3 py-2.5">{d.source}</td>
                  <td className="px-3 py-2.5 mono font-semibold" style={{ color: d.pm25 > 300 ? "var(--rose)" : "var(--amber)" }}>{d.pm25}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono" style={{
                      background: d.context === "source_proximate" ? "color-mix(in oklab,var(--rose) 18%,transparent)" : "color-mix(in oklab,var(--cyan) 18%,transparent)",
                      color: d.context === "source_proximate" ? "var(--rose)" : "var(--cyan)",
                    }}>{d.context}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] mono font-bold" style={{
                      background: `color-mix(in oklab,${STAGE_COLOR[d.stage] ?? "var(--primary)"} 16%,transparent)`,
                      color: STAGE_COLOR[d.stage] ?? "var(--primary)",
                    }}>{d.stage}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{d.officer}</td>
                  <td className="px-3 py-2.5 mono text-[10px]">{d.hash}</td>
                  <td className="px-3 py-2.5 mono text-muted-foreground">{d.chainPos}</td>
                  <td className="px-3 py-2.5 mono text-[var(--amber)]">{d.sla}</td>
                  <td className="px-3 py-2.5 mono text-[10px] text-muted-foreground whitespace-nowrap">{d.breach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={`Dossier Detail — ${selectedDossier.id} · ${selectedDossier.city}`} subtitle="Complete evidence bundle with cryptographic provenance — click any row above to view">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-2">Measurement Context</div>
            {[
              ["Device ID", "SH-DEL-0042"],
              ["measurement_context", selectedDossier.context],
              ["PM2.5 sustained", `${selectedDossier.pm25} µg/m³`],
              ["NO2", `${selectedDossier.no2} µg/m³`],
              ["Wind vector", "WSW 3.2 m/s"],
              ["Source confidence", "94.2%"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border/30 pb-1 text-xs">
                <span className="text-muted-foreground">{k}</span>
                <span className="mono font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-2">Cryptographic Provenance</div>
            {[
              ["Hash", selectedDossier.hash],
              ["Chain position", `${selectedDossier.chainPos} (HEAD)`],
              ["Merkle window", "2026-05-30 04:00 UTC"],
              ["Merkle root", "4e7d…9f12"],
              ["Ledger ref", "IPFS:QmT6v…8ba1"],
              ["Verification", "CHAIN_VALID · MERKLE_VALID"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border/30 pb-1 text-xs">
                <span className="text-muted-foreground">{k}</span>
                <span className="mono font-medium text-[var(--emerald)]">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            onClick={() => handleDownloadDossier(selectedDossier)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <FileText className="h-3.5 w-3.5" /> Download Dossier PDF
          </button>
          <button
            onClick={() => handleIssueLegalNotice(selectedDossier)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-accent/50"
          >
            Issue Legal Notice
          </button>
          <button
            onClick={() => handleAssignStrikeTeam(selectedDossier)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-accent/50"
          >
            Assign Strike Team
          </button>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Average Resolution Time — 14-day Trend" subtitle="Target SLA: 4h from breach detection to officer dispatch">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SLA_TREND} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "monospace" }} interval={2} />
                <YAxis tick={{ fontSize: 9 }} unit="h" />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}h`]} />
                <Line type="monotone" dataKey="avg" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} name="Avg resolution" />
                <Line type="monotone" dataKey="target" stroke="var(--rose)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="SLA target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Case Resolution by Pollution Type" subtitle="Open vs resolved in last 30 days">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RESOLUTION_BY_TYPE} layout="vertical" margin={{ left: 80, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="resolved" name="Resolved" fill="var(--emerald)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="open" name="Open" fill="var(--rose)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
