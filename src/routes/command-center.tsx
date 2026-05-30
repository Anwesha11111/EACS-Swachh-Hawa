import { createFileRoute } from "@tanstack/react-router";
import { Panel, StatusDot } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { IndiaMap } from "@/components/ui-kit/IndiaMap";
import { AlertFeed } from "@/components/ui-kit/AlertFeed";
import { AqiGauge } from "@/components/ui-kit/AqiGauge";
import { TelemetryTicker } from "@/components/ui-kit/TelemetryTicker";
import { Radar, Plane, Satellite, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/command-center")({
  head: () => ({ meta: [{ title: "Smart Command Center · Swachh Hawa" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="OPS · NATIONAL COMMAND · CLASSIFIED-AMBER"
        title="Smart Environmental Command Center"
        description="Real-time national threat matrix · autonomous patrol grid · satellite-linked emergency response."
        actions={
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-[var(--rose)]/40 bg-[var(--rose)]/10 px-3 py-1.5 text-[11px] mono uppercase tracking-wider text-[var(--rose)]">DEFCON-3 · NCR</span>
            <StatusDot tone="rose" />
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[280px_1fr_320px]">
        <div className="space-y-4">
          <Panel title="National Threat Matrix" dense>
            <ul className="divide-y divide-border/60 text-xs">
              {[
                ["NCR Pollution Inversion","CRITICAL","rose"],
                ["Surat Refinery Anomaly","HIGH","amber"],
                ["Punjab Burning Surge","HIGH","amber"],
                ["Kolkata Sensor Drift","MED","cyan"],
                ["Mumbai Port Spike","MED","cyan"],
              ].map(([t,s,c]) => (
                <li key={t as string} className="flex items-center justify-between px-4 py-2">
                  <span>{t}</span>
                  <span className="mono text-[10px]" style={{ color: `var(--${c})` }}>{s}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Patrol Grid">
            <div className="grid grid-cols-2 gap-2">
              {[
                { i: Plane, l: "Drone Swarms", v: "12 active" },
                { i: Satellite, l: "Sat Links",   v: "6 live" },
                { i: Radar, l: "Radar Sweeps", v: "42 grids" },
                { i: ShieldAlert, l: "Strike Teams", v: "8 deployed" },
              ].map(({ i: I, l, v }) => (
                <div key={l} className="rounded-md border border-border bg-background/40 p-2.5">
                  <I className="h-4 w-4 text-primary" />
                  <div className="mt-1 text-[10px] uppercase mono text-muted-foreground">{l}</div>
                  <div className="text-xs">{v}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Composite AQI">
            <div className="flex justify-center"><AqiGauge value={248} size={160} /></div>
          </Panel>
        </div>

        <Panel title="GIS Operational Surface" dense
               actions={<span className="text-[11px] mono text-muted-foreground">22 layers · 14.8k nodes</span>}>
          <div className="h-[720px]"><IndiaMap /></div>
        </Panel>

        <div className="space-y-4">
          <Panel title="AI Mission Brief" subtitle="Auto-generated 18:00 IST">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="text-foreground">Forecast models converge</span> on a severe NCR inversion window between 18:00–22:00 IST. PM2.5 expected to peak at 312 µg/m³.
              <span className="text-foreground"> Recommended action:</span> activate stubble-burning drone grid 7B, dispatch 4 mobile monitoring vehicles to Anand Vihar corridor, escalate Surat refinery anomaly to Tier-2 enforcement.
            </p>
          </Panel>
          <Panel title="Emergency Feed" dense actions={<StatusDot tone="rose" />}>
            <div className="max-h-[260px] overflow-y-auto scrollbar-thin"><AlertFeed /></div>
          </Panel>
          <Panel title="Drone Feed · GRID-7B" dense>
            <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-black/60">
              <div className="absolute inset-0 grid-bg opacity-40" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-[var(--emerald)] opacity-60 animate-scan" />
              <div className="absolute left-2 top-2 mono text-[10px] text-[var(--emerald)]">REC ● 22:14:08 · LAT 30.71 LON 76.69 · ALT 142m</div>
              <div className="absolute right-2 bottom-2 mono text-[10px] text-[var(--emerald)]">THERMAL · 14 hotspots</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full border border-[var(--emerald)]/60 animate-pulse-ring" />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <TelemetryTicker />
    </div>
  );
}

