import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { CITIES, aqiCategory } from "@/lib/mock-data";
import { useState, useRef, useCallback } from "react";
import { Layers, Download } from "lucide-react";
import { exportSvgAsPng } from "@/lib/export";

export const Route = createFileRoute("/heatmaps")({
  head: () => ({ meta: [{ title: "Pollution Heatmaps · Swachh Hawa" }] }),
  component: Page,
});

const POLLUTANTS = ["AQI", "PM2.5", "PM10", "NO₂", "SO₂", "O₃"];
const TIME_WINDOWS = ["Live", "6h avg", "24h avg", "7d avg", "Monthly"];

function aqiToColor(aqi: number, alpha = 0.85) {
  if (aqi <= 50)  return `rgba(80,200,120,${alpha})`;
  if (aqi <= 100) return `rgba(200,220,60,${alpha})`;
  if (aqi <= 200) return `rgba(240,160,40,${alpha})`;
  if (aqi <= 300) return `rgba(220,60,60,${alpha})`;
  if (aqi <= 400) return `rgba(160,40,160,${alpha})`;
  return `rgba(120,20,20,${alpha})`;
}

function IndiaHeatmap({ pollutant, svgRef }: { pollutant: string; svgRef?: React.Ref<SVGSVGElement> }) {
  const data = CITIES.map(c => ({
    ...c,
    val: pollutant === "PM2.5" ? c.pm25 : pollutant === "PM10" ? c.pm10 : c.aqi,
  }));

  return (
    <svg ref={svgRef} viewBox="0 0 800 900" className="w-full h-full" style={{ maxHeight: 480 }}>
      <defs>
        <filter id="blur-heat">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feComposite in="blur" in2="blur" operator="over" />
        </filter>
        <filter id="blur-soft">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id="india-clip">
          <rect x="155" y="95" width="490" height="710" rx="36" />
        </clipPath>
        {data.map(c => (
          <radialGradient key={c.name} id={`g-${c.name}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={aqiToColor(c.val, 1.0)} />
            <stop offset="55%" stopColor={aqiToColor(c.val, 0.7)} />
            <stop offset="100%" stopColor={aqiToColor(c.val, 0)} />
          </radialGradient>
        ))}
      </defs>

      {/* India outline */}
      <rect x="155" y="95" width="490" height="710" rx="36" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />

      {/* Heat blobs — clipped to India bounds, two-pass for depth */}
      <g clipPath="url(#india-clip)">
        {/* Outer soft glow layer */}
        <g filter="url(#blur-heat)" opacity="0.75">
          {data.map(c => (
            <ellipse key={c.name} cx={c.x} cy={c.y} rx={90} ry={90} fill={`url(#g-${c.name})`} />
          ))}
        </g>
        {/* Inner sharp core layer */}
        <g filter="url(#blur-soft)" opacity="0.85">
          {data.map(c => (
            <ellipse key={`core-${c.name}`} cx={c.x} cy={c.y} rx={32} ry={32} fill={aqiToColor(c.val, 0.85)} />
          ))}
        </g>
      </g>

      {/* City dots + labels */}
      {data.map(c => {
        const cat = aqiCategory(c.val);
        return (
          <g key={c.name}>
            <circle cx={c.x} cy={c.y} r={6} fill={aqiToColor(c.val, 1)} stroke="var(--background)" strokeWidth="2" />
            <circle cx={c.x} cy={c.y} r={2.5} fill="var(--background)" opacity="0.7" />
            <text x={c.x + 10} y={c.y + 4} fontSize="10" fill="var(--background)" fontFamily="monospace" fontWeight="800"
              stroke="var(--background)" strokeWidth="3" paintOrder="stroke">
              {c.name}
            </text>
            <text x={c.x + 10} y={c.y + 4} fontSize="10" fill="var(--foreground)" fontFamily="monospace" fontWeight="600">
              {c.name}
            </text>
            <text x={c.x + 10} y={c.y + 15} fontSize="9" fill={aqiToColor(c.val, 1)} fontFamily="monospace" fontWeight="700">
              {c.val}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(20,820)">
        {["Good ≤50","Sat ≤100","Mod ≤200","Poor ≤300","V.Poor ≤400","Severe"].map((l, i) => (
          <g key={l} transform={`translate(${i * 128}, 0)`}>
            <rect width="120" height="14" rx="3" fill={aqiToColor([25,75,150,250,350,450][i], 0.9)} />
            <text x="4" y="11" fontSize="9" fill="white" fontFamily="monospace">{l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function Page() {
  const [pollutant, setPollutant] = useState("AQI");
  const [timeWindow, setTimeWindow] = useState("Live");
  const svgRef = useRef<SVGSVGElement>(null);

  const handleExport = useCallback(async () => {
    if (!svgRef.current) return;
    await exportSvgAsPng(svgRef.current, `heatmap-${pollutant.toLowerCase()}-${timeWindow.toLowerCase().replace(/\s/g, "-")}.png`);
  }, [pollutant, timeWindow]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="GEO · Pollution Heatmaps"
        title="Spatio-Temporal Pollution Heatmaps"
        description="Radial gradient heatmap overlaid on national grid. Switch pollutant and time window to explore spatial distribution patterns."
        actions={
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/50"
          >
            <Download className="h-3.5 w-3.5" /> Export PNG
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card/70 p-1">
          <Layers className="h-4 w-4 ml-2 text-muted-foreground" />
          {POLLUTANTS.map(p => (
            <button key={p} onClick={() => setPollutant(p)}
              className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ background: pollutant === p ? "var(--primary)" : "transparent", color: pollutant === p ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card/70 p-1">
          {TIME_WINDOWS.map(t => (
            <button key={t} onClick={() => setTimeWindow(t)}
              className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{ background: timeWindow === t ? "var(--primary)" : "transparent", color: timeWindow === t ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel title={`India · ${pollutant} Heatmap · ${timeWindow}`} subtitle="Radial gradient per station · intensity = pollutant concentration">
            <IndiaHeatmap pollutant={pollutant} svgRef={svgRef} />
          </Panel>
        </div>

        <Panel title="Hotspot Ranking" subtitle={`Top cities by ${pollutant} right now`} dense>
          <div className="divide-y divide-border">
            {[...CITIES]
              .sort((a, b) => b.aqi - a.aqi)
              .slice(0, 12)
              .map((c, i) => {
                const val = pollutant === "PM2.5" ? c.pm25 : pollutant === "PM10" ? c.pm10 : c.aqi;
                return (
                  <div key={c.name} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="mono text-[10px] w-5 text-muted-foreground">{i + 1}</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground mono">{c.state}</div>
                    </div>
                    <span className="mono text-sm font-bold" style={{ color: aqiToColor(val, 1).replace(/,[\d.]+\)/, ",1)") }}>
                      {val}
                    </span>
                  </div>
                );
              })}
          </div>
        </Panel>
      </div>

      <Panel title="Spatial Statistics" subtitle="Distribution analysis of current heatmap layer">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { l: "National Mean AQI", v: Math.round(CITIES.reduce((s, c) => s + c.aqi, 0) / CITIES.length) },
            { l: "Max (Patna)", v: Math.max(...CITIES.map(c => c.aqi)) },
            { l: "Min (Kochi)", v: Math.min(...CITIES.map(c => c.aqi)) },
            { l: "Cities > 200", v: CITIES.filter(c => c.aqi > 200).length },
          ].map(s => (
            <div key={s.l} className="rounded-lg border border-border bg-background/50 p-3 text-center">
              <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">{s.l}</div>
              <div className="mono text-2xl font-bold mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
