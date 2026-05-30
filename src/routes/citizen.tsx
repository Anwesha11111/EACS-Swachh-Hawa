import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { IndiaMap } from "@/components/ui-kit/IndiaMap";
import { AqiGauge } from "@/components/ui-kit/AqiGauge";
import { CITIES, aqiCategory } from "@/lib/mock-data";
import { Send, MessageCircle, HeartPulse, Activity, Wind, Footprints } from "lucide-react";

export const Route = createFileRoute("/citizen")({
  head: () => ({ meta: [{ title: "Citizen Portal · Swachh Hawa" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="PUBLIC · Air Quality for Everyone"
        title="Citizen Transparency Portal"
        description="Know the air you breathe. Get health recommendations, file complaints, and chat with AirGPT."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel dense><div className="h-[440px]"><IndiaMap /></div></Panel>
        <div className="space-y-4">
          <Panel title="Your City · Delhi">
            <div className="flex justify-center"><AqiGauge value={387} /></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Tip i={HeartPulse} t="Avoid outdoor exercise" tone="rose" />
              <Tip i={Wind} t="Use N95 outdoors" tone="amber" />
              <Tip i={Footprints} t="Limit kids' play" tone="rose" />
              <Tip i={Activity} t="Run purifier indoors" tone="cyan" />
            </div>
          </Panel>
          <Panel title="AirGPT · Verified AI Assistant">
            <div className="space-y-2 text-xs">
              <div className="rounded-lg bg-[var(--primary)]/8 border border-[var(--primary)]/20 px-3 py-2 text-[10px] text-muted-foreground flex items-start gap-1.5">
                <span className="text-[var(--primary)] font-bold flex-shrink-0">🔐</span>
                <span>All responses grounded strictly on verified sensor telemetry + official CPCB/GRAP policy docs. Never speculative.</span>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">Why is Delhi AQI so high today?</div>
              <div className="rounded-lg bg-primary/12 px-3 py-2 text-foreground leading-relaxed">
                <div className="font-semibold text-[var(--primary)] mb-1 text-[10px] mono">AirGPT · Source: SH-DEL-0042 · 05:48 UTC</div>
                A nocturnal boundary layer (~280m) is trapping emissions overnight. Key contributors: vehicular exhaust (38%), stubble-burn transport from Punjab (31%), industrial sources in Ghaziabad (18%). GRAP Stage III is active — construction and diesel generator use is banned until AQI drops below 400.
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">Is it safe to jog outside?</div>
              <div className="rounded-lg bg-primary/12 px-3 py-2 text-foreground leading-relaxed">
                <div className="font-semibold text-[var(--primary)] mb-1 text-[10px] mono">AirGPT · Source: CPCB Health Guidelines 2025</div>
                Current AQI 387 — <strong>Very Poor</strong>. Outdoor exercise is strongly discouraged for all groups. Children, elderly, and those with asthma/heart conditions should remain indoors. If outdoors is unavoidable, wear a well-fitted N95 mask and limit activity to under 30 min.
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-background/60 p-1.5">
                <MessageCircle className="h-4 w-4 text-primary" />
                <input placeholder="Ask AirGPT about air quality, health, or GRAP rules…" className="w-full bg-transparent text-xs outline-none" />
                <button className="rounded bg-primary p-1.5 text-primary-foreground"><Send className="h-3 w-3" /></button>
              </div>
              <div className="text-[10px] text-muted-foreground">Responses are DP-sanitised (ε=0.5) · DPDP §7(a) compliant · No personal data stored</div>
            </div>
          </Panel>
        </div>
      </div>
      <Panel title="Compare Cities">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {CITIES.slice(0, 8).map((c) => {
            const cat = aqiCategory(c.aqi);
            return (
              <div key={c.name} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="mono text-xs" style={{ color: `var(--${cat.token})` }}>{c.aqi}</div>
                </div>
                <div className="mt-2 h-1.5 rounded bg-muted overflow-hidden">
                  <div className="h-full" style={{ width: `${Math.min(100, c.aqi/5)}%`, background: `var(--${cat.token})` }} />
                </div>
                <div className="mt-1 text-[10px] mono uppercase text-muted-foreground">{cat.label}</div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title="Submit a Complaint" subtitle="Complaints are cross-correlated with sensor data — verified reports auto-escalate to enforcement queue">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm" placeholder="Your location (area / landmark)" />
          <select className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm">
            <option>Industrial smoke</option>
            <option>Burning waste / garbage</option>
            <option>Vehicle smoke</option>
            <option>Construction dust</option>
            <option>Brick kiln</option>
            <option>Other</option>
          </select>
          <input className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm" placeholder="Optional: describe the source" />
          <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Submit · Anonymous OK</button>
        </form>
        <div className="mt-2 text-[10px] text-muted-foreground">
          🔒 Submissions are anonymous by default. Your location is coarsened to neighbourhood level (DPDP §7 compliant). Verified complaints with sensor correlation are escalated to CPCB officers within 4h.
        </div>
      </Panel>
    </div>
  );
}

function Tip({ i: I, t, tone }: any) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2 py-1.5">
      <I className="h-3.5 w-3.5" style={{ color: `var(--${tone})` }} />
      <span>{t}</span>
    </div>
  );
}

