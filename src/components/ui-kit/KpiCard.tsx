import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

export function KpiCard({
  label, value, suffix, delta, icon: Icon, accent = "primary", sparkline,
}: {
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  icon?: LucideIcon;
  accent?: "primary" | "emerald" | "amber" | "rose" | "cyan";
  sparkline?: number[];
}) {
  const accentColor = `var(--${accent === "primary" ? "primary" : accent})`;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/70 p-4 backdrop-blur-md transition-shadow hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px"
           style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
      <div className="flex items-start justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md"
               style={{ background: `color-mix(in oklab, ${accentColor} 14%, transparent)`, color: accentColor }}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <div className="mono text-3xl font-semibold tracking-tight" style={{ color: accentColor }}>
          <AnimatedCounter value={value} />
        </div>
        {suffix && <div className="text-xs text-muted-foreground">{suffix}</div>}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {typeof delta === "number" && (
          <div className={`inline-flex items-center gap-1 text-[11px] mono ${
            delta >= 0 ? "text-[var(--rose)]" : "text-[var(--emerald)]"
          }`}>
            {delta >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
        {sparkline && <Sparkline data={sparkline} color={accentColor} />}
      </div>
    </motion.div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 22;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="opacity-80">
      <polyline fill="none" stroke={color} strokeWidth="1.6" points={pts} />
    </svg>
  );
}