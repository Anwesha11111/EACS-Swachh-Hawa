import type { ReactNode } from "react";

export function Panel({
  title, subtitle, actions, children, className = "", dense = false,
}: {
  title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string; dense?: boolean;
}) {
  return (
    <section className={`relative overflow-hidden rounded-xl border border-border bg-card/70 backdrop-blur-md ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={dense ? "" : "p-4"}>{children}</div>
    </section>
  );
}

export function StatusDot({ tone = "emerald" }: { tone?: "emerald" | "amber" | "rose" | "muted" }) {
  const map: Record<string, string> = {
    emerald: "var(--emerald)", amber: "var(--amber)", rose: "var(--rose)",
    muted: "var(--muted-foreground)",
  };
  const c = map[tone];
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inset-0 animate-ping rounded-full" style={{ background: c, opacity: 0.6 }} />
      <span className="relative h-2 w-2 rounded-full" style={{ background: c }} />
    </span>
  );
}