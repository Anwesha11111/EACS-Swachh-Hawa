import { TELEMETRY_FEED } from "@/lib/mock-data";

export function TelemetryTicker() {
  const items = [...TELEMETRY_FEED, ...TELEMETRY_FEED];
  return (
    <div className="ticker-mask overflow-hidden border-y border-border bg-card/40">
      <div className="animate-ticker flex w-max gap-6 py-2 px-4 mono text-[11px]">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className={`h-1.5 w-1.5 rounded-full ${t.ok ? "bg-[var(--emerald)]" : "bg-[var(--rose)]"}`} />
            <span className="text-muted-foreground">{t.node}</span>
            <span>PM2.5 <span className="text-foreground">{t.pm25}</span></span>
            <span>CO₂ <span className="text-foreground">{t.co2}</span></span>
            <span>NOx <span className="text-foreground">{t.nox}</span></span>
            <span className="text-muted-foreground">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}