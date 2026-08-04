import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { IndiaMap } from "@/components/ui-kit/IndiaMap";
import { Panel, StatusDot } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { aqiCategory, HOURLY_AQI, type CityAqi, CITIES } from "@/lib/mock-data";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Layers, Plane, Truck, Wind, Sun, Moon, Satellite,
  Search, X, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/live-map")({
  head: () => ({ meta: [{ title: "Live GIS Intelligence · Swachh Hawa" }] }),
  component: LiveMap,
});

// Derive unique states with full names
const STATE_ABBR: Record<string, string> = {
  DL: "Delhi", MH: "Maharashtra", WB: "West Bengal", TN: "Tamil Nadu",
  KA: "Karnataka", TG: "Telangana", GJ: "Gujarat", UP: "Uttar Pradesh",
  RJ: "Rajasthan", BR: "Bihar", MP: "Madhya Pradesh", AS: "Assam",
  CH: "Chandigarh", KL: "Kerala",
};
const ALL_STATES = [
  "All States",
  ...Array.from(new Set(CITIES.map(c => STATE_ABBR[c.state] ?? c.state))).sort(),
];
const METRICS    = ["AQI", "PM2.5", "PM10", "Trend"];
const TIME_WINS  = ["Live", "6H Avg", "24H Avg", "7D Avg"];

function LiveMap() {
  const [sel, setSel]               = useState<CityAqi>(CITIES[0]);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    Layers: true, Satellite: false, Wind: true, Drones: false, MVU: false,
  });

  // Filter state
  const [stateFilter, setStateFilter] = useState("All States");
  const [search,      setSearch]      = useState("");
  const [metric,      setMetric]      = useState("AQI");
  const [timeWin,     setTimeWin]     = useState("Live");
  const [liveMode,    setLiveMode]    = useState(true);
  const [expanded,    setExpanded]    = useState(false);

  // Derived filtered cities (used by sidebar list)
  const filteredCities = useMemo(() => {
    let list = CITIES;
    if (stateFilter !== "All States") {
      list = list.filter(c => (STATE_ABBR[c.state] ?? c.state) === stateFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        (STATE_ABBR[c.state] ?? "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (metric === "PM2.5") return b.pm25 - a.pm25;
      if (metric === "PM10")  return b.pm10 - a.pm10;
      if (metric === "Trend") return b.trend - a.trend;
      return b.aqi - a.aqi;
    });
  }, [stateFilter, search, metric]);

  const toggleLayer = (label: string) => {
    setActiveLayers(prev => ({ ...prev, [label]: !prev[label] }));
    toast.info(`${label} layer ${activeLayers[label] ? "hidden" : "shown"}`);
  };

  const cat = aqiCategory(sel.aqi);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="GEO · Command Surface"
        title="Live GIS Intelligence Map"
        description="Multi-layer geospatial command surface — sensors, wind, propagation, drones, industrial corridors."
        actions={
          <div className="flex items-center gap-2 text-[11px] mono">
            <StatusDot /> <span className="text-muted-foreground">SAT · ISRO-BHUVAN · 22 layers</span>
          </div>
        }
      />

      {/* ── Filter toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2">

        {/* Search */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 min-w-[180px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search city…"
            className="w-full bg-transparent text-xs outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* State filter */}
        <div className="relative">
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-background/60 pl-2.5 pr-6 py-1.5 text-xs outline-none cursor-pointer"
          >
            {ALL_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        </div>

        {/* Metric */}
        <div className="flex gap-1 rounded-lg border border-border bg-background/60 p-0.5">
          {METRICS.map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: metric === m ? "var(--primary)" : "transparent",
                color: metric === m ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Time window */}
        <div className="flex gap-1 rounded-lg border border-border bg-background/60 p-0.5">
          {TIME_WINS.map(t => (
            <button
              key={t}
              onClick={() => setTimeWin(t)}
              className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: timeWin === t ? "var(--primary)" : "transparent",
                color: timeWin === t ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Live toggle */}
        <button
          onClick={() => {
            setLiveMode(v => !v);
            toast.info(liveMode ? "Live updates paused" : "Live updates resumed");
          }}
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            borderColor: liveMode ? "color-mix(in oklab,var(--emerald) 40%,transparent)" : "var(--border)",
            background:  liveMode ? "color-mix(in oklab,var(--emerald) 12%,transparent)" : "var(--background)",
            color:       liveMode ? "var(--emerald)" : "var(--muted-foreground)",
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: liveMode ? "var(--emerald)" : "var(--muted-foreground)",
              animation: liveMode ? "pulse 2s infinite" : "none",
            }}
          />
          {liveMode ? "Live" : "Paused"}
        </button>

        {/* Fullscreen */}
        <button
          onClick={() => {
            setExpanded(v => !v);
            toast.info(expanded ? "Compact view" : "Expanded view");
          }}
          className="ml-auto rounded-lg border border-border bg-background/60 p-1.5 hover:bg-accent/50 transition-colors"
        >
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {expanded
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4M15 9l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4M15 15l5 5m0 0v-4m0 4h-4" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5M20 8V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5M20 16v4m0 0h-4m4 0l-5-5" />
            }
          </svg>
        </button>

        {/* Result count */}
        <span className="text-[11px] text-muted-foreground mono">
          {filteredCities.length} city{filteredCities.length !== 1 ? "ies" : ""}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel dense className="relative">
          <div className="relative" style={{ height: expanded ? "80vh" : "720px" }}>
            <IndiaMap 
              onSelect={setSel} 
              activeLayers={activeLayers} 
              colorMode={metric === "AQI" ? "aqi" : metric === "PM2.5" ? "pm25" : metric === "PM10" ? "pm10" : "trend"} 
            />

            {/* Floating overlay layer controls */}
            <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
              <FloatBtn icon={Layers}    label="Layers"    active={activeLayers.Layers}    onClick={() => toggleLayer("Layers")} />
              <FloatBtn icon={Satellite} label="Satellite" active={activeLayers.Satellite} onClick={() => toggleLayer("Satellite")} />
              <FloatBtn icon={Wind}      label="Wind"      active={activeLayers.Wind}      onClick={() => toggleLayer("Wind")} />
              <FloatBtn icon={Plane}     label="Drones"    active={activeLayers.Drones}    onClick={() => toggleLayer("Drones")} />
              <FloatBtn icon={Truck}     label="MVU"       active={activeLayers.MVU}       onClick={() => toggleLayer("MVU")} />
            </div>

            {/* Timeline scrubber */}
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-1.5 text-[11px] mono backdrop-blur z-10">
              <Sun className="h-3 w-3 text-[var(--amber)]" />
              <input type="range" min={0} max={23} defaultValue={14} className="w-32 accent-[var(--primary)]" />
              <Moon className="h-3 w-3 text-[var(--cyan)]" />
              <span className="text-muted-foreground">14:00 IST</span>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          {/* Selected city detail */}
          <Panel title="Selected City" subtitle={`${sel.name}, ${sel.state}`}>
            <div className="flex items-baseline justify-between">
              <div className="mono text-4xl font-semibold" style={{ color: `var(--${cat.token})` }}>{sel.aqi}</div>
              <div className="rounded px-2 py-0.5 text-[10px] font-bold mono"
                   style={{ background: `color-mix(in oklab, var(--${cat.token}) 18%, transparent)`, color: `var(--${cat.token})` }}>
                {cat.label.toUpperCase()}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] mono">
              <div className="rounded border border-border bg-background/50 p-2"><div className="text-muted-foreground">PM2.5</div><div className="text-sm">{sel.pm25}</div></div>
              <div className="rounded border border-border bg-background/50 p-2"><div className="text-muted-foreground">PM10</div><div className="text-sm">{sel.pm10}</div></div>
              <div className="rounded border border-border bg-background/50 p-2"><div className="text-muted-foreground">Δ 24h</div><div className="text-sm">{sel.trend >= 0 ? "+" : ""}{sel.trend}%</div></div>
            </div>
            <div className="mt-3 h-24">
              <ResponsiveContainer>
                <AreaChart data={HOURLY_AQI}>
                  <defs><linearGradient id="ga" x1="0" y1="0" x2="1"><stop stopColor="var(--primary)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 11 }} />
                  <Area dataKey="delhi" stroke="var(--primary)" fill="url(#ga)" strokeWidth={1.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Filtered city list */}
          <Panel
            title={`${metric} Ranking`}
            subtitle={`${filteredCities.length} cities · ${stateFilter} · ${timeWin}`}
            dense
          >
            {filteredCities.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No cities match "<span className="font-medium">{search}</span>"
              </div>
            ) : (
              <ul className="max-h-[340px] divide-y divide-border/60 overflow-y-auto text-xs">
                {filteredCities.map((c, i) => {
                  const ccat = aqiCategory(c.aqi);
                  const val  = metric === "PM2.5" ? c.pm25 : metric === "PM10" ? c.pm10 : metric === "Trend" ? c.trend : c.aqi;
                  return (
                    <li
                      key={c.name}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-accent/40 transition-colors"
                      style={{ background: sel.name === c.name ? "color-mix(in oklab,var(--primary) 8%,transparent)" : undefined }}
                      onClick={() => setSel(c)}
                    >
                      <span className="mono w-5 text-muted-foreground/60 text-[10px]">{i + 1}</span>
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: `var(--${ccat.token})` }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground mono truncate">{STATE_ABBR[c.state] ?? c.state}</div>
                      </div>
                      <span className="mono font-bold text-sm" style={{ color: `var(--${ccat.token})` }}>{val}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Device Telemetry" dense>
            <ul className="divide-y divide-border/60 text-xs mono">
              {["Battery 92%","Signal -68 dBm","Uptime 99.94%","Last sync 2s ago","Firmware 4.2.1","TLS handshake OK","Edge inference 18ms"].map((r) => (
                <li key={r} className="flex items-center justify-between px-4 py-2"><span>{r}</span><StatusDot /></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

interface FloatBtnProps { icon: any; label: string; active: boolean; onClick: () => void; }

function FloatBtn({ icon: I, label, active, onClick }: FloatBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] backdrop-blur transition-all ${
        active
          ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.25)]"
          : "border-border bg-card/85 text-muted-foreground hover:text-foreground hover:border-primary/40"
      }`}
    >
      <I className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <span className="mono">{label}</span>
    </button>
  );
}