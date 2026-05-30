import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Bell, Globe, Moon, Sliders, Webhook, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Swachh Hawa" }] }),
  component: Page,
});

export default function Page() {
  const [alertThreshold, setAlertThreshold] = useState(200);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [locale, setLocale] = useState("en-IN");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ADMIN · Settings"
        title="Platform Preferences & Integrations"
        description="Notification thresholds, locale settings, alert routing, and webhook integrations."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Alert Thresholds" subtitle="Notification triggers by AQI and pollutant level" actions={<Bell className="h-4 w-4 text-muted-foreground" />}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium">AQI Alert Threshold</span>
                <span className="mono font-semibold text-[var(--amber)]">{alertThreshold}</span>
              </div>
              <input type="range" min={100} max={400} step={10} value={alertThreshold}
                onChange={e => setAlertThreshold(Number(e.target.value))}
                className="w-full accent-primary h-2 cursor-pointer" />
              <div className="flex justify-between text-[10px] text-muted-foreground mono mt-0.5">
                <span>100 (Moderate)</span><span>400 (Severe)</span>
              </div>
            </div>
            {[["PM2.5 Alert (µg/m³)", "60"], ["NO₂ Alert (µg/m³)", "100"], ["SO₂ Alert (µg/m³)", "80"]].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <input defaultValue={val} className="mono w-20 rounded border border-border bg-background/60 px-2 py-1 text-right text-xs outline-none focus:border-primary" />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Notification Routing" subtitle="Choose where alerts are delivered" actions={<Bell className="h-4 w-4 text-muted-foreground" />}>
          <div className="space-y-3">
            {[
              { label: "Email notifications", sub: "a.verma@cpcb.gov.in", val: notifEmail, set: setNotifEmail },
              { label: "SMS alerts", sub: "+91 98XXX XXXXX", val: notifSMS, set: setNotifSMS },
              { label: "Push notifications", sub: "Browser + mobile app", val: notifPush, set: setNotifPush },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/50">
                <div>
                  <div className="text-xs font-medium">{n.label}</div>
                  <div className="text-[10px] text-muted-foreground mono">{n.sub}</div>
                </div>
                <button onClick={() => n.set(!n.val)}
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{ background: n.val ? "var(--primary)" : "var(--border)" }}>
                  <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                    style={{ left: n.val ? "calc(100% - 22px)" : "2px" }} />
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Locale & Display" subtitle="Language, timezone, and unit preferences" actions={<Globe className="h-4 w-4 text-muted-foreground" />}>
          <div className="space-y-3">
            {[
              { label: "Language", options: [["en-IN", "English (India)"], ["hi-IN", "हिन्दी"]], val: locale, set: setLocale },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{s.label}</span>
                <select value={s.val} onChange={e => s.set(e.target.value)}
                  className="rounded border border-border bg-background/60 px-2 py-1 text-xs outline-none focus:border-primary">
                  {s.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            {[["Timezone", "Asia/Kolkata (IST, UTC+5:30)"], ["AQI Standard", "CPCB India (6-pollutant)"], ["Units", "µg/m³ · mg/m³ · ppb"]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border/30 pb-2 text-xs">
                <span className="text-muted-foreground">{k}</span>
                <span className="mono font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Webhook Integrations" subtitle="Push events to external systems (CPCB portal, Slack, IFTTT)" actions={<Webhook className="h-4 w-4 text-muted-foreground" />}>
          <div className="space-y-2">
            {[
              { name: "CPCB ENVIS Portal", url: "https://envis.cpcb.gov.in/webhook", events: "breach, resolve", status: "Active" },
              { name: "Internal Slack #air-alerts", url: "https://hooks.slack.com/…", events: "Critical breach", status: "Active" },
              { name: "IFTTT Emergency", url: "https://maker.ifttt.com/…", events: "AQI > 400", status: "Disabled" },
            ].map(w => (
              <div key={w.name} className="rounded-lg border border-border bg-background/50 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{w.name}</span>
                  <span className="rounded px-1.5 py-0.5 mono text-[10px] font-bold" style={{
                    background: w.status === "Active" ? "color-mix(in oklab,var(--emerald) 16%,transparent)" : "color-mix(in oklab,var(--muted-foreground) 12%,transparent)",
                    color: w.status === "Active" ? "var(--emerald)" : "var(--muted-foreground)",
                  }}>{w.status}</span>
                </div>
                <div className="mono text-[10px] text-muted-foreground mt-0.5">{w.url}</div>
                <div className="text-[10px] text-muted-foreground">Events: {w.events}</div>
              </div>
            ))}
            <button className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              + Add webhook
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
