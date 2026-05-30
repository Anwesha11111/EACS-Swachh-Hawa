import { aqiCategory } from "@/lib/mock-data";

export function AqiGauge({ value, size = 180 }: { value: number; size?: number }) {
  const cat = aqiCategory(value);
  const pct = Math.min(1, value / 500);
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--border)" strokeWidth="10" fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={`var(--${cat.token})`}
          strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mono">National AQI</div>
        <div className="mono text-5xl font-semibold tracking-tight" style={{ color: `var(--${cat.token})` }}>
          {value}
        </div>
        <div className="rounded-full px-2 py-0.5 text-[10px] font-bold mono tracking-wider"
             style={{ background: `color-mix(in oklab, var(--${cat.token}) 18%, transparent)`, color: `var(--${cat.token})` }}>
          {cat.label.toUpperCase()}
        </div>
      </div>
    </div>
  );
}