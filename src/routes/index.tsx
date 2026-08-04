import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle, Flame, Maximize2,
  ChevronDown, ArrowUp, ArrowDown,
  HeartPulse, ShieldAlert, Leaf, Bell,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { Panel, StatusDot } from "@/components/ui-kit/Panel";
import { IndiaMap } from "@/components/ui-kit/IndiaMap";
import { HeatmapIndia } from "@/components/ui-kit/HeatmapIndia";
import { FeatureStrip } from "@/components/ui-kit/FeatureStrip";
import {
  CITIES, aqiCategory,
  FORECAST_DELHI, FORECAST_HOURLY,
  ACTIVE_INCIDENTS_DASH,
  AQI_TREND_WEEKLY,
  TOP_POLLUTED_DASH, LIVE_UPDATES_DASH,
  POLLUTION_SOURCES,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "National Dashboard · Swachh Hawa" },
      { name: "description", content: "Real-time national air quality, AI forecasts, sensor health and enforcement across India." },
    ],
  }),
  component: Index,
});

const POLLUTANT_KEYS = [
  { key: "aqi",  label: "AQI",   color: "var(--chart-4)" },
  { key: "pm25", label: "PM2.5", color: "var(--chart-2)" },
  { key: "pm10", label: "PM10",  color: "var(--amber)" },
  { key: "no2",  label: "NO₂",   color: "var(--chart-1)" },
  { key: "co",   label: "CO",    color: "var(--chart-5)" },
] as const;

const STAT_ROW = [
  { label: "Average AQI",       sub: "India",        value: "128",   delta: +12, up: true  },
  { label: "PM2.5 (µg/m³)",     sub: "India Avg.",   value: "89.4",  delta: +9,  up: true  },
  { label: "Monitoring Stations", sub: "",            value: "2,451", delta: +24, up: true  },
  { label: "Data Points (24H)", sub: "",              value: "8.24M", delta: +18, up: true  },
  { label: "Compliance Score",  sub: "",              value: "92%",   delta: +3,  up: true  },
  { label: "Response Time",     sub: "",              value: "8.4 min", delta: -15, up: false },
];

function Index() {
  const [activePollutant, setActivePollutant] = useState<string>("aqi");
  const [selectedCountry, setSelectedCountry] = useState<string>("India");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [selectedMetric, setSelectedMetric] = useState<string>("AQI");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("24H S");
  const [selectedHeatmapMetric, setSelectedHeatmapMetric] = useState<string>("PM2.5");
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<string>("7 Days");
  const [selectedForecastCity, setSelectedForecastCity] = useState<string>("Delhi");
  
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get unique states from CITIES
  const states = ["All States", ...new Set(CITIES.map(c => c.state))].sort();
  
  // Get cities for selected state
  const citiesForState = selectedState === "All States" 
    ? CITIES 
    : CITIES.filter(c => c.state === selectedState);
  
  const cityNames = ["All Cities", ...citiesForState.map(c => c.name)].sort();

  // Handle state change - reset city to "All Cities"
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity("All Cities");
    setOpenDropdown(null);
  };
  
  // Toggle dropdown
  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };
  
  // Close dropdown on click outside
  const closeDropdown = () => setOpenDropdown(null);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Row 1: Map + Right Panel ─────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1fr_300px] 2xl:grid-cols-[1fr_320px]">

        {/* Map Card */}
        <section className="relative overflow-hidden rounded-xl border border-border bg-card/70 backdrop-blur-md flex flex-col">
          {/* Card header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
            <div>
              <div className="text-xs text-muted-foreground mono uppercase tracking-wider">Air Quality Index</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="mono text-3xl font-bold" style={{ color: "var(--aqi-unhealthy)" }}>162</span>
                <span className="text-sm font-semibold" style={{ color: "var(--aqi-unhealthy)" }}>Unhealthy</span>
                <MiniSparkline />
                <span className="text-[11px] text-[var(--rose)] mono flex items-center gap-0.5">
                  <ArrowUp className="h-3 w-3" />18% vs yesterday
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Country Dropdown */}
              <div className="relative">
                <FilterPill label={selectedCountry} onClick={() => setOpenDropdown(openDropdown === "country" ? null : "country")} />
                {openDropdown === "country" && (
                  <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[120px]">
                    <button onClick={() => { setSelectedCountry("India"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">India</button>
                    <button onClick={() => { setSelectedCountry("World"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">World</button>
                  </div>
                )}
              </div>

              {/* State Dropdown */}
              <div className="relative">
                <FilterPill label={selectedState} onClick={() => setOpenDropdown(openDropdown === "state" ? null : "state")} />
                {openDropdown === "state" && (
                  <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[150px] max-h-64 overflow-y-auto">
                    {states.map(state => (
                      <button key={state} onClick={() => handleStateChange(state)} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent whitespace-nowrap">
                        {state}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City Dropdown */}
              <div className="relative">
                <FilterPill label={selectedCity} onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")} />
                {openDropdown === "city" && (
                  <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[160px] max-h-64 overflow-y-auto">
                    {cityNames.map(city => (
                      <button key={city} onClick={() => { setSelectedCity(city); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent whitespace-nowrap">
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Metric Dropdown */}
              <div className="relative">
                <FilterPill label={selectedMetric} onClick={() => setOpenDropdown(openDropdown === "metric" ? null : "metric")} />
                {openDropdown === "metric" && (
                  <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[120px]">
                    {POLLUTANT_KEYS.map(p => (
                      <button key={p.key} onClick={() => { setSelectedMetric(p.label); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Period Dropdown */}
              <div className="relative">
                <FilterPill label={selectedPeriod} onClick={() => setOpenDropdown(openDropdown === "period" ? null : "period")} />
                {openDropdown === "period" && (
                  <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[120px]">
                    <button onClick={() => { setSelectedPeriod("24H S"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">24H S</button>
                    <button onClick={() => { setSelectedPeriod("7D"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">7 Days</button>
                    <button onClick={() => { setSelectedPeriod("30D"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">30 Days</button>
                  </div>
                )}
              </div>
              <button className="flex items-center gap-1.5 rounded-md bg-[var(--emerald)] px-3 py-1.5 text-[11px] font-semibold text-white mono">
                <StatusDot tone="emerald" />
                Live
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-accent transition">
                <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="relative flex-1" style={{ minHeight: 340 }}>
            <IndiaMap />

            {/* Top Polluted Cities — overlay top right of map */}
            <div className="absolute right-14 top-3 w-48 rounded-lg border border-border bg-card/90 backdrop-blur-md p-3 shadow-[var(--shadow-elevated)]">
              <div className="mb-2 text-[11px] font-semibold text-foreground">Top Polluted Cities</div>
              <ul className="space-y-1.5">
                {TOP_POLLUTED_DASH.map((c) => {
                  const cat = aqiCategory(c.aqi);
                  return (
                    <li key={c.name} className="flex items-center justify-between cursor-pointer hover:bg-accent/50 px-2 py-1 rounded transition" onClick={() => setSelectedCity(c.name)}>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: `var(--${cat.token})` }} />
                        <span className="text-xs text-foreground">{c.name}</span>
                      </div>
                      <span className="mono text-xs font-semibold" style={{ color: `var(--${cat.token})` }}>{c.aqi}</span>
                    </li>
                  );
                })}
              </ul>
              <button onClick={() => window.location.href = '/live-aqi'} className="mt-2 w-full text-center text-[10px] text-primary hover:underline transition">View All Cities →</button>
            </div>

            {/* Live Updates — overlay bottom right of map */}
            <div className="absolute bottom-14 right-14 w-52 rounded-lg border border-border bg-card/90 backdrop-blur-md p-3 shadow-[var(--shadow-elevated)]">
              <div className="mb-2 text-[11px] font-semibold text-foreground">Live Updates</div>
              <ul className="space-y-2">
                {LIVE_UPDATES_DASH.map((u, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <UpdateIcon tone={u.tone as any} />
                    <div>
                      <div className="text-[11px] text-foreground leading-snug">{u.text}</div>
                      <div className="text-[10px] text-muted-foreground">{u.ago}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <div className="flex flex-col gap-4">
          {/* Air Quality Forecast */}
          <Panel
            title="Air Quality Forecast"
            actions={
              <div className="relative">
                <button onClick={() => setOpenDropdown(openDropdown === "forecast" ? null : "forecast")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
                  {selectedForecastCity} <ChevronDown className="h-3 w-3" />
                </button>
                {openDropdown === "forecast" && (
                  <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[140px]">
                    <button onClick={() => { setSelectedForecastCity("Delhi"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">Delhi</button>
                    <button onClick={() => { setSelectedForecastCity("Mumbai"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">Mumbai</button>
                    <button onClick={() => { setSelectedForecastCity("Bangalore"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">Bangalore</button>
                    <button onClick={() => { setSelectedForecastCity("Chennai"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">Chennai</button>
                  </div>
                )}
              </div>
            }
          >
            <div className="flex justify-between gap-1 mb-3">
              {FORECAST_DELHI.map((d) => {
                const cat = aqiCategory(d.aqi);
                return (
                  <div key={d.day} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                    <span className="text-base">
                      {d.icon === "sun" ? "☀️" : d.icon === "cloud-sun" ? "⛅" : d.icon === "cloud" ? "☁️" : "🌧️"}
                    </span>
                    <span className="mono text-sm font-bold" style={{ color: `var(--${cat.token})` }}>
                      {d.aqi}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-[100px]">
              <ResponsiveContainer>
                <AreaChart data={FORECAST_HOURLY} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fcAqi" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fcPm25" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="h" tick={{ fontSize: 8, fill: "var(--muted-foreground)" }} interval={5} />
                  <YAxis tick={{ fontSize: 8, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} />
                  <Area type="monotone" dataKey="aqi"  stroke="var(--chart-4)" fill="url(#fcAqi)"  strokeWidth={1.5} dot={false} name="AQI" />
                  <Area type="monotone" dataKey="pm25" stroke="var(--chart-2)" fill="url(#fcPm25)" strokeWidth={1.5} dot={false} name="PM2.5 µg/m³" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[10px] mono text-muted-foreground">
              <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 bg-[var(--chart-4)]"/>AQI</span>
              <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 bg-[var(--chart-2)]"/>PM2.5 µg/m³</span>
            </div>
          </Panel>

          {/* Active Incidents */}
          <Panel
            title="Active Incidents"
            actions={
              <span className="flex h-5 w-6 items-center justify-center rounded-full bg-[var(--rose)] text-[9px] font-bold text-white mono">12</span>
            }
          >
            <ul className="space-y-2">
              {ACTIVE_INCIDENTS_DASH.map((inc) => (
                <li key={inc.location} className="flex items-start gap-2 rounded-lg border border-border/50 bg-background/40 px-2.5 py-2">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--rose)]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">{inc.location}</div>
                    <div className="text-[10px] text-muted-foreground mono">PM2.5 {inc.pm25} µg/m³</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-medium" style={{ color: "var(--amber)" }}>{inc.type}</div>
                    <div className="text-[9px] text-muted-foreground">{inc.ago}</div>
                  </div>
                </li>
              ))}
            </ul>
            <button className="mt-2 w-full text-center text-[11px] text-primary hover:underline">View All Incidents →</button>
          </Panel>

          {/* Environmental Impact */}
          <Panel title="Environmental Impact" subtitle="Today">
            <div className="grid grid-cols-2 gap-2">
              <ImpactCell icon={HeartPulse} label="Lives Protected"      value="1,245" color="var(--emerald)" />
              <ImpactCell icon={ShieldAlert} label="Incidents Detected"  value="48"    color="var(--rose)" />
              <ImpactCell icon={Leaf}  label="Emission Reduced (Est.)"   value="520 T" color="var(--emerald)" />
              <ImpactCell icon={Bell}  label="Alerts Sent"               value="3,827" color="var(--amber)" />
            </div>
          </Panel>

          {/* Sensor Network */}
          <Panel title="Sensor Network">
            <div className="flex items-center gap-4">
              <SensorDonut />
              <div className="space-y-1.5">
                <SensorLegendRow label="Operational" count={2101} pct={86} color="var(--emerald)" />
                <SensorLegendRow label="Warning"     count={210}  pct={8}  color="var(--amber)" />
                <SensorLegendRow label="Offline"     count={140}  pct={6}  color="var(--rose)" />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* ── Row 2: Stat strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_ROW.map((s) => (
          <div
            key={s.label}
            className="flex flex-col justify-between rounded-xl border border-border bg-card/70 px-4 py-3 backdrop-blur-md hover:shadow-[var(--shadow-elevated)] transition"
          >
            <div className="flex items-start justify-between gap-1">
              <div>
                <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
                {s.sub && <div className="text-[9px] text-muted-foreground/60 mono">{s.sub}</div>}
              </div>
              <button className="text-muted-foreground/40 hover:text-muted-foreground transition">
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="mono text-2xl font-bold text-foreground">{s.value}</span>
              <span className={`mono text-[11px] font-semibold flex items-center gap-0.5 ${s.up ? "text-[var(--rose)]" : "text-[var(--emerald)]"}`}>
                {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(s.delta)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 3: Heatmap + Trend + Source/Health ────────────── */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr_220px]">

        {/* AQI Heatmap */}
        <Panel
          title="AQI Heatmap (India)"
          actions={
            <div className="relative">
              <button onClick={() => setOpenDropdown(openDropdown === "heatmap" ? null : "heatmap")} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition">
                {selectedHeatmapMetric} <ChevronDown className="h-3 w-3" />
              </button>
              {openDropdown === "heatmap" && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[120px]">
                  <button onClick={() => { setSelectedHeatmapMetric("PM2.5"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">PM2.5</button>
                  <button onClick={() => { setSelectedHeatmapMetric("AQI"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">AQI</button>
                  <button onClick={() => { setSelectedHeatmapMetric("PM10"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">PM10</button>
                  <button onClick={() => { setSelectedHeatmapMetric("NO₂"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">NO₂</button>
                </div>
              )}
            </div>
          }
          dense
        >
          <div className="h-[260px]"><HeatmapIndia /></div>
        </Panel>

        {/* AQI Trend */}
        <Panel
          title="AQI Trend (India Average)"
          actions={
            <div className="relative flex items-center gap-1">
              <button onClick={() => setOpenDropdown(openDropdown === "trend" ? null : "trend")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
                {selectedTrendPeriod}
                <ChevronDown className="h-3 w-3" />
              </button>
              {openDropdown === "trend" && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[120px]">
                  <button onClick={() => { setSelectedTrendPeriod("24H"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">24H</button>
                  <button onClick={() => { setSelectedTrendPeriod("7 Days"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">7 Days</button>
                  <button onClick={() => { setSelectedTrendPeriod("30 Days"); setOpenDropdown(null); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-accent">30 Days</button>
                </div>
              )}
            </div>
          }
        >
          {/* Pollutant tabs */}
          <div className="mb-3 flex gap-1">
            {POLLUTANT_KEYS.map((p) => (
              <button
                key={p.key}
                onClick={() => setActivePollutant(p.key)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium mono transition ${
                  activePollutant === p.key
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-accent border border-transparent"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer>
              <LineChart data={AQI_TREND_WEEKLY} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                />
                {POLLUTANT_KEYS.map((p) => (
                  <Line
                    key={p.key}
                    type="monotone"
                    dataKey={p.key}
                    stroke={p.color}
                    strokeWidth={activePollutant === p.key ? 2.5 : 1.5}
                    dot={{ r: 3, strokeWidth: 0, fill: p.color }}
                    activeDot={{ r: 5 }}
                    opacity={activePollutant === p.key || activePollutant === "aqi" ? 1 : 0.3}
                    name={p.label}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Source Contribution + Health Risk */}
        <div className="flex flex-col gap-4">
          <Panel title="Source Contribution" subtitle="India">
            <div className="h-[150px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={POLLUTION_SOURCES}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={62}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {POLLUTION_SOURCES.map((s) => (
                      <Cell key={s.name} fill={s.color} stroke="var(--background)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-1">
              {POLLUTION_SOURCES.slice(0, 4).map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </span>
                  <span className="mono font-semibold text-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Health Risk" subtitle="At-Risk Population">
            <div className="flex flex-col items-center gap-2 py-1">
              <HeartPulse className="h-8 w-8" style={{ color: "var(--rose)" }} />
              <div className="mono text-3xl font-bold" style={{ color: "var(--rose)" }}>23.6M</div>
              <div className="text-[11px] text-center text-muted-foreground">People exposed to unhealthy air</div>
              <div className="text-[10px] font-semibold" style={{ color: "var(--rose)" }}>
                ↑ 1.14% vs yesterday
              </div>
              <div className="mt-1 flex gap-2">
                {[...Array(8)].map((_, i) => (
                  <HeartPulse key={i} className="h-4 w-4" style={{ color: i < 6 ? "var(--rose)" : "var(--muted-foreground)", opacity: i < 6 ? 0.9 : 0.25 }} />
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* ── Row 4: Feature strip ──────────────────────────────── */}
      <FeatureStrip />
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────

function MiniSparkline() {
  const pts = [140, 148, 155, 152, 158, 162].map((v, i) => `${i * 12},${20 - (v - 140) / 2}`).join(" ");
  return (
    <svg width="60" height="22" className="inline-block">
      <polyline fill="none" stroke="var(--aqi-unhealthy)" strokeWidth="1.8" points={pts} />
    </svg>
  );
}

function FilterPill({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 rounded-md border border-border bg-card/60 px-2.5 py-1 text-[11px] text-foreground hover:bg-accent transition">
      {label} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
    </button>
  );
}

function UpdateIcon({ tone }: { tone: "rose" | "amber" | "emerald" }) {
  const map = {
    rose:    { Icon: AlertTriangle, color: "var(--rose)" },
    amber:   { Icon: Flame,         color: "var(--amber)" },
    emerald: { Icon: CheckCircle,   color: "var(--emerald)" },
  };
  const { Icon, color } = map[tone];
  return (
    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)` }}>
      <Icon className="h-3 w-3" style={{ color }} />
    </div>
  );
}

function ImpactCell({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 p-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <div className="text-[9px] text-muted-foreground leading-tight">{label}</div>
        <div className="mono text-sm font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function SensorDonut() {
  const data = [
    { name: "Operational", value: 86, color: "var(--emerald)" },
    { name: "Warning",     value: 8,  color: "var(--amber)" },
    { name: "Offline",     value: 6,  color: "var(--rose)" },
  ];
  return (
    <div className="relative h-[80px] w-[80px] shrink-0">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={26} outerRadius={38} paddingAngle={2} startAngle={90} endAngle={-270}>
            {data.map((d) => <Cell key={d.name} fill={d.color} stroke="var(--background)" strokeWidth={2} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="mono text-[11px] font-bold text-foreground">2,451</div>
        <div className="text-[8px] text-muted-foreground">Total</div>
      </div>
    </div>
  );
}

function SensorLegendRow({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[11px] text-muted-foreground flex-1">{label}</span>
      <span className="mono text-[11px] text-foreground font-medium">{count.toLocaleString()}</span>
      <span className="mono text-[10px] text-muted-foreground">({pct}%)</span>
    </div>
  );
}
