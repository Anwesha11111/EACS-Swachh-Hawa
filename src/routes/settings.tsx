import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit/Panel";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Bell, Globe, Webhook, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getSettings, saveSettings, getUserWebhooks } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { WebhookModal } from "@/components/modals/WebhookModal";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Swachh Hawa" }] }),
  component: Page,
});

export default function Page() {
  const { user } = useAuth();
  const userEmail = user?.email ?? "admin@swachhhawa.gov.in";

  const [alertThreshold, setAlertThreshold] = useState(200);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [locale, setLocale] = useState("en-IN");
  const [pm25, setPm25] = useState(60);
  const [no2, setNo2] = useState(100);
  const [so2, setSo2] = useState(80);
  const [saving, setSaving] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);

  useEffect(() => {
    getSettings({ data: { userEmail } }).then(res => {
      if (res.settings) {
        setAlertThreshold(res.settings.alertThreshold);
        setNotifEmail(res.settings.notifEmail);
        setNotifSMS(res.settings.notifSms);
        setNotifPush(res.settings.notifPush);
        setLocale(res.settings.locale);
        setPm25(res.settings.pm25Threshold);
        setNo2(res.settings.no2Threshold);
        setSo2(res.settings.so2Threshold);
      }
    }).catch(() => {});

    loadWebhooks();
  }, [userEmail]);

  const loadWebhooks = async () => {
    setWebhooksLoading(true);
    try {
      const result = await getUserWebhooks({ data: { userEmail } });
      setWebhooks(result.webhooks || []);
    } catch (err) {
      console.error("Failed to load webhooks:", err);
    } finally {
      setWebhooksLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveSettings({
        data: {
          userEmail,
          settings: {
            alertThreshold,
            notifEmail,
            notifSms: notifSMS,
            notifPush,
            locale,
            pm25Threshold: pm25,
            no2Threshold: no2,
            so2Threshold: so2,
          }
        }
      });
      if (res.ok) {
        toast.success(res.mode === "live" ? "Settings saved to Supabase!" : "Settings updated (demo session)");
      } else {
        toast.error(res.error ?? "Failed to save settings");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ADMIN · Settings"
        title="Platform Preferences & Integrations"
        description="Notification thresholds, locale settings, alert routing, and webhook integrations."
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Saving..." : "Save Changes"}
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
            {[
              { label: "PM2.5 Alert (µg/m³)", val: pm25, set: setPm25 },
              { label: "NO₂ Alert (µg/m³)",   val: no2,  set: setNo2 },
              { label: "SO₂ Alert (µg/m³)",   val: so2,  set: setSo2 },
            ].map(({ label, val, set }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <input
                  type="number"
                  value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="mono w-20 rounded border border-border bg-background/60 px-2 py-1 text-right text-xs outline-none focus:border-primary"
                />
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
            {webhooksLoading ? (
              <div className="text-xs text-muted-foreground p-4 text-center">Loading webhooks...</div>
            ) : webhooks.length > 0 ? (
              webhooks.map(w => (
                <div key={w.webhook_id} className="rounded-lg border border-border bg-background/50 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{w.url}</span>
                    <span className="rounded px-1.5 py-0.5 mono text-[10px] font-bold" style={{
                      background: w.status === "active" ? "color-mix(in oklab,var(--emerald) 16%,transparent)" : "color-mix(in oklab,var(--muted-foreground) 12%,transparent)",
                      color: w.status === "active" ? "var(--emerald)" : "var(--muted-foreground)",
                    }}>{w.status}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">Events: {w.events.join(", ")}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground p-4 text-center">No webhooks configured</div>
            )}
            <button 
              onClick={() => setShowWebhookModal(true)}
              className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              + Add webhook
            </button>
          </div>
        </Panel>
      </div>

      <WebhookModal
        open={showWebhookModal}
        onOpenChange={setShowWebhookModal}
        userEmail={userEmail}
        existingWebhooks={webhooks}
        onSuccess={() => {
          loadWebhooks();
          setShowWebhookModal(false);
        }}
      />
    </div>
  );
}
