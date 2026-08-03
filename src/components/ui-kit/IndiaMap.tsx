/**
 * IndiaMap
 * ─────────────────────────────────────────────────────────────────────────────
 * Outline: inline <path> from INDIA_PATH_D (Natural Earth 50m, Mercator 800×820).
 *          Rendered directly in SVG so stroke colour uses CSS variables and is
 *          visible in both light and dark mode.
 * Dots:    same Mercator projection, fixed size, no animation.
 */
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, ZoomOut, Maximize2,
  ChevronRight, ChevronLeft,
  TrendingUp, TrendingDown, Minus, Radio,
} from "lucide-react";
import { CITIES, aqiCategory, type CityAqi } from "@/lib/mock-data";
import { INDIA_PATH_D } from "@/lib/india-path";

// ── Canvas dimensions (must match the SVG viewBox in india-outline.svg) ──────
const W = 800;
const H = 820;
const PAD = 24;

// ── Projection constants extracted from gen-india-svg.mjs output ─────────────
const MIN_LON =  68.164882;
const MAX_LON =  97.343173;
const M_MIN_Y =   0.118056;  // mercY(minLat)
const M_MAX_Y =   0.663452;  // mercY(maxLat)

const toRad   = (deg: number) => (deg * Math.PI) / 180;
const mercY   = (lat: number) => Math.log(Math.tan(Math.PI / 4 + toRad(lat) / 2));

/** Map geographic lon/lat → SVG pixel [x, y] */
function project(lon: number, lat: number): [number, number] {
  const x = PAD + ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * (W - 2 * PAD);
  const y = H - PAD - ((mercY(lat) - M_MIN_Y) / (M_MAX_Y - M_MIN_Y)) * (H - 2 * PAD);
  return [x, y];
}

// Pre-compute city pixel positions (module-level constant — computed once)
const CITY_POINTS = new Map<string, [number, number]>(
  CITIES.map((c) => [c.name, project(c.lon, c.lat)])
);

// ── Color modes ───────────────────────────────────────────────────────────────
type ColorMode = "aqi" | "pm25" | "pm10" | "trend";

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "aqi",   label: "AQI"   },
  { id: "pm25",  label: "PM2.5" },
  { id: "pm10",  label: "PM10"  },
  { id: "trend", label: "Trend" },
];

function cityColor(c: CityAqi, mode: ColorMode): string {
  if (mode === "pm25") {
    if (c.pm25 < 30)  return "var(--aqi-good)";
    if (c.pm25 < 60)  return "var(--aqi-moderate)";
    if (c.pm25 < 90)  return "var(--aqi-poor)";
    if (c.pm25 < 150) return "var(--aqi-unhealthy)";
    if (c.pm25 < 220) return "var(--aqi-severe)";
    return "var(--aqi-hazardous)";
  }
  if (mode === "pm10") {
    if (c.pm10 < 50)  return "var(--aqi-good)";
    if (c.pm10 < 100) return "var(--aqi-moderate)";
    if (c.pm10 < 200) return "var(--aqi-poor)";
    if (c.pm10 < 300) return "var(--aqi-unhealthy)";
    if (c.pm10 < 400) return "var(--aqi-severe)";
    return "var(--aqi-hazardous)";
  }
  if (mode === "trend") {
    if (c.trend <= -5) return "var(--aqi-good)";
    if (c.trend < 0)   return "var(--aqi-moderate)";
    if (c.trend === 0) return "var(--aqi-poor)";
    if (c.trend < 8)   return "var(--aqi-unhealthy)";
    return "var(--aqi-severe)";
  }
  return `var(--${aqiCategory(c.aqi).token})`;
}

function cityMetric(c: CityAqi, mode: ColorMode): string {
  if (mode === "pm25")  return `${c.pm25} µg/m³`;
  if (mode === "pm10")  return `${c.pm10} µg/m³`;
  if (mode === "trend") return c.trend > 0 ? `+${c.trend}` : `${c.trend}`;
  return `AQI ${c.aqi}`;
}

const LEGEND: Record<ColorMode, { label: string; token: string }[]> = {
  aqi: [
    { label: "Good",         token: "aqi-good"      },
    { label: "Satisfactory", token: "aqi-moderate"  },
    { label: "Moderate",     token: "aqi-poor"      },
    { label: "Poor",         token: "aqi-unhealthy" },
    { label: "Very Poor",    token: "aqi-severe"    },
    { label: "Severe",       token: "aqi-hazardous" },
  ],
  pm25: [
    { label: "<30",  token: "aqi-good"      },
    { label: "<60",  token: "aqi-moderate"  },
    { label: "<90",  token: "aqi-poor"      },
    { label: "<150", token: "aqi-unhealthy" },
    { label: "<220", token: "aqi-severe"    },
    { label: "220+", token: "aqi-hazardous" },
  ],
  pm10: [
    { label: "<50",  token: "aqi-good"      },
    { label: "<100", token: "aqi-moderate"  },
    { label: "<200", token: "aqi-poor"      },
    { label: "<300", token: "aqi-unhealthy" },
    { label: "<400", token: "aqi-severe"    },
    { label: "400+", token: "aqi-hazardous" },
  ],
  trend: [
    { label: "Fast improvement", token: "aqi-good"      },
    { label: "Improving",        token: "aqi-moderate"  },
    { label: "Stable",           token: "aqi-poor"      },
    { label: "Worsening",        token: "aqi-unhealthy" },
    { label: "Critical rise",    token: "aqi-severe"    },
  ],
};

// ── Live data jitter ──────────────────────────────────────────────────────────
function jitter(v: number, pct = 0.04) {
  return Math.max(1, Math.round(v * (1 + (Math.random() - 0.5) * pct)));
}
function liveUpdate(cs: CityAqi[]): CityAqi[] {
  return cs.map((c) => ({
    ...c,
    aqi:   jitter(c.aqi,  0.05),
    pm25:  jitter(c.pm25, 0.06),
    pm10:  jitter(c.pm10, 0.06),
    trend: Math.round(c.trend + (Math.random() - 0.5) * 2),
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────
export function IndiaMap({
  onSelect,
  compact = false,
  activeLayers = {},
}: {
  onSelect?: (c: CityAqi) => void;
  compact?: boolean;
  activeLayers?: Record<string, boolean>;
}) {
  const [zoom,      setZoom]      = useState(1);
  const [pan,       setPan]       = useState({ x: 0, y: 0 });
  const [hover,     setHover]     = useState<CityAqi | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("aqi");
  const [liveOn,    setLiveOn]    = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [cities,    setCities]    = useState<CityAqi[]>(CITIES);

  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  // ── Live updates (silent — no animations on dots) ─────────────────────────
  useEffect(() => {
    if (!liveOn) return;
    const id = setInterval(() => setCities(liveUpdate), 3000);
    return () => clearInterval(id);
  }, [liveOn]);

  // ── Pan / zoom ────────────────────────────────────────────────────────────
  const onPtrDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
  }, [pan]);

  const onPtrMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    setPan({
      x: drag.current.px + (e.clientX - drag.current.sx) / zoom,
      y: drag.current.py + (e.clientY - drag.current.sy) / zoom,
    });
  }, [zoom]);

  const onPtrUp  = useCallback(() => { drag.current = null; }, []);

  const onWheel  = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom((z) => Math.min(8, Math.max(0.5, z * (e.deltaY < 0 ? 1.12 : 1 / 1.12))));
  }, []);

  const zoomBy    = (f: number) => setZoom((z) => Math.min(8, Math.max(0.5, z * f)));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── Sorted top cities ─────────────────────────────────────────────────────
  const topCities = useMemo(() =>
    [...cities].sort((a, b) => {
      if (colorMode === "pm25")  return b.pm25  - a.pm25;
      if (colorMode === "pm10")  return b.pm10  - a.pm10;
      if (colorMode === "trend") return b.trend - a.trend;
      return b.aqi - a.aqi;
    }).slice(0, 8),
  [cities, colorMode]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card/40 to-card/10 select-none">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      {/* ── Map SVG — outline image + city dots, same 800×820 coordinate space ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={onPtrDown}
        onPointerMove={onPtrMove}
        onPointerUp={onPtrUp}
        onPointerLeave={onPtrUp}
        onWheel={onWheel}
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>

          {/* ── India outline — inline path, theme-aware colours ─────────── */}
          <path
            d={INDIA_PATH_D}
            fill="color-mix(in oklab, var(--primary) 8%, transparent)"
            stroke="var(--foreground)"
            strokeWidth={1.2 / zoom}
            strokeLinejoin="round"
            opacity={0.85}
          />

          {/* ── City dots — fixed size, no animation, no glow ────────────── */}
          {cities.map((c) => {
            const pt = CITY_POINTS.get(c.name);
            if (!pt) return null;
            const [cx, cy] = pt;
            const color = cityColor(c, colorMode);

            return (
              <g
                key={c.name}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(c)}
                onMouseLeave={() => setHover(null)}
                onClick={(e) => { e.stopPropagation(); onSelect?.(c); }}
              >
                {/* Fixed-size dot — r never changes so there is no visual pop */}
                <circle cx={cx} cy={cy} r={5} fill={color} />
                <circle cx={cx} cy={cy} r={2.5} fill="var(--background)" opacity={0.5} />
                {/* Label — always visible, scales with zoom */}
                {!compact && (
                  <>
                    {/* White/dark halo for legibility on any background */}
                    <text
                      x={cx + 7} y={cy + 4}
                      fontSize={10 / zoom}
                      fill="var(--background)"
                      fontFamily="var(--font-mono)"
                      fontWeight={700}
                      strokeWidth={3 / zoom}
                      stroke="var(--background)"
                      pointerEvents="none"
                    >
                      {c.name}
                    </text>
                    {/* Actual label text */}
                    <text
                      x={cx + 7} y={cy + 4}
                      fontSize={10 / zoom}
                      fill="var(--foreground)"
                      fontFamily="var(--font-mono)"
                      fontWeight={600}
                      pointerEvents="none"
                    >
                      {c.name}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── Hover tooltip ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hover && (
          <motion.div
            key={hover.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute left-4 top-4 z-20 w-44 rounded-lg border border-border bg-card/96 px-3 py-2 text-xs backdrop-blur-md shadow-[var(--shadow-elevated)]"
          >
            <div className="font-semibold text-foreground">{hover.name}, {hover.state}</div>
            <div className="mono mt-0.5 font-bold" style={{ color: cityColor(hover, colorMode) }}>
              {cityMetric(hover, colorMode)}
            </div>
            {colorMode === "aqi" && (
              <div className="text-[11px] text-muted-foreground">{aqiCategory(hover.aqi).label}</div>
            )}
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] mono text-muted-foreground">
              <span>AQI&nbsp;&nbsp;&nbsp;{hover.aqi}</span>
              <span>Trend {hover.trend > 0 ? "+" : ""}{hover.trend}</span>
              <span>PM2.5 {hover.pm25}</span>
              <span>PM10&nbsp;{hover.pm10}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zoom controls ─────────────────────────────────────────────────── */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
        {([
          [ZoomIn,    "Zoom in",    () => zoomBy(1.3)   ],
          [ZoomOut,   "Zoom out",   () => zoomBy(1/1.3) ],
          [Maximize2, "Reset view", resetView            ],
        ] as const).map(([Icon, title, fn]) => (
          <button
            key={title} title={title} onClick={fn}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card/90 text-muted-foreground hover:text-foreground hover:bg-accent backdrop-blur-md transition shadow-sm"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <div className="mt-0.5 text-center text-[9px] mono text-muted-foreground">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* ── Bottom bar: color mode + live toggle + panel toggle ───────────── */}
      <div className="absolute bottom-3 left-3 right-3 z-10 space-y-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-1.5 backdrop-blur-md">
          <span className="shrink-0 text-[10px] mono uppercase tracking-wider text-muted-foreground">View</span>
          <div className="flex gap-1">
            {COLOR_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setColorMode(m.id)}
                className={`rounded px-2 py-0.5 text-[10px] mono font-semibold transition ${
                  colorMode === m.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setLiveOn((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] mono font-semibold transition ${
                liveOn
                  ? "border-[var(--emerald)]/40 bg-[var(--emerald)]/10 text-[var(--emerald)]"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {liveOn
                ? <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)]"
                  />
                : <Radio className="h-3 w-3" />
              }
              {liveOn ? "Live" : "Paused"}
            </button>
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-border bg-card/80 px-2.5 py-0.5 text-[10px] mono text-muted-foreground hover:text-foreground transition"
            >
              Top cities
              {panelOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card/85 px-3 py-1.5 text-[10px] mono backdrop-blur-md">
          {LEGEND[colorMode].map((x) => (
            <div key={x.label} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: `var(--${x.token})` }} />
              <span className="uppercase tracking-wider text-muted-foreground">{x.label}</span>
            </div>
          ))}
          <span className="ml-auto text-muted-foreground/50">Natural Earth · CPCB</span>
        </div>
      </div>

      {/* ── Top Polluted Cities panel ──────────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && !compact && (
          <motion.aside
            initial={{ x: "110%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "110%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="absolute right-3 top-3 z-10 w-48 rounded-xl border border-border bg-card/96 backdrop-blur-xl shadow-[var(--shadow-elevated)] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground font-semibold">
                Top {topCities.length} · {colorMode.toUpperCase()}
              </span>
              <button onClick={() => setPanelOpen(false)}
                className="text-muted-foreground hover:text-foreground transition">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="divide-y divide-border/40">
              {topCities.map((c, i) => {
                const color = cityColor(c, colorMode);
                return (
                  <li
                    key={c.name}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-accent/40 transition"
                    onClick={() => { onSelect?.(c); setHover(c); }}
                  >
                    <span className="w-4 shrink-0 text-[10px] mono text-muted-foreground/50">{i + 1}</span>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                    <span className="flex-1 truncate text-[11px] text-foreground">{c.name}</span>
                    <span className="mono text-[10px] font-semibold shrink-0" style={{ color }}>
                      {colorMode === "aqi"   ? c.aqi
                       : colorMode === "pm25" ? c.pm25
                       : colorMode === "pm10" ? c.pm10
                       : c.trend > 0 ? `+${c.trend}` : c.trend}
                    </span>
                    {c.trend > 3  ? <TrendingUp   className="h-3 w-3 shrink-0 text-[var(--rose)]"    /> :
                     c.trend < -3 ? <TrendingDown  className="h-3 w-3 shrink-0 text-[var(--emerald)]" /> :
                                    <Minus         className="h-3 w-3 shrink-0 text-muted-foreground" />}
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border px-3 py-2 text-center">
              <button
                onClick={() => setLiveOn((v) => !v)}
                className={`text-[10px] mono transition ${liveOn ? "text-[var(--emerald)]" : "text-muted-foreground"}`}
              >
                {liveOn ? "● Live" : "○ Paused"}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Re-open panel button */}
      <AnimatePresence>
        {!panelOpen && !compact && (
          <motion.button
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            onClick={() => setPanelOpen(true)}
            className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[10px] mono text-muted-foreground hover:text-foreground backdrop-blur-md transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Top cities
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
