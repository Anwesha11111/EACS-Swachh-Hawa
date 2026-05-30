import {
  ScanEye, Radio, Brain, FlaskConical, Database, ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: ScanEye,
    label: "Explainable AI",
    desc: "Transparency in every prediction",
    color: "var(--primary)",
  },
  {
    icon: Radio,
    label: "Real-time Monitoring",
    desc: "Live data from 2500+ sensor nodes",
    color: "var(--cyan)",
  },
  {
    icon: Brain,
    label: "AI-Powered Insights",
    desc: "Advanced analytics & pattern detection",
    color: "var(--emerald)",
  },
  {
    icon: FlaskConical,
    label: "Policy Simulator",
    desc: "Test policies before implementation",
    color: "var(--amber)",
  },
  {
    icon: Database,
    label: "Open Data Access",
    desc: "APIs for researchers & developers",
    color: "var(--rose)",
  },
  {
    icon: ShieldCheck,
    label: "Secure & Compliant",
    desc: "DPDP Act 2023 Compliant",
    color: "var(--primary)",
  },
];

export function FeatureStrip() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {FEATURES.map((f) => {
        const Icon = f.icon;
        return (
          <button
            key={f.label}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 text-left transition hover:border-primary/40 hover:bg-accent/50 hover:shadow-[var(--shadow-elevated)] backdrop-blur-md"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: `color-mix(in oklab, ${f.color} 14%, transparent)`,
                color: f.color,
              }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-foreground">{f.label}</div>
              <div className="truncate text-[10px] text-muted-foreground">{f.desc}</div>
            </div>
            <span className="ml-auto shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition text-xs">›</span>
          </button>
        );
      })}
    </div>
  );
}
