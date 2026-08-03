import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// User settings — load and persist per-user preferences.
// With Supabase: reads/writes the `user_settings` table keyed by user email.
// Without Supabase: getSettings returns defaults; saveSettings is a no-op
// (state lives in React component, identical to the previous behaviour).

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserSettings {
  alertThreshold: number;
  notifEmail: boolean;
  notifSms: boolean;
  notifPush: boolean;
  locale: string;
  pm25Threshold: number;
  no2Threshold: number;
  so2Threshold: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  alertThreshold: 200,
  notifEmail: true,
  notifSms: false,
  notifPush: true,
  locale: "en-IN",
  pm25Threshold: 60,
  no2Threshold: 100,
  so2Threshold: 80,
};

const SettingsSchema = z.object({
  userEmail: z.string().email(),
  settings: z.object({
    alertThreshold: z.number().int().min(100).max(400),
    notifEmail: z.boolean(),
    notifSms: z.boolean(),
    notifPush: z.boolean(),
    locale: z.string().min(1),
    pm25Threshold: z.number().int().min(0).max(500),
    no2Threshold: z.number().int().min(0).max(500),
    so2Threshold: z.number().int().min(0).max(500),
  }),
});

// ── Load settings ─────────────────────────────────────────────────────────────

export const getSettings = createServerFn({ method: "POST" })
  .inputValidator(z.object({ userEmail: z.string().email() }))
  .handler(async ({ data }) => {
    const db = await getSupabaseAdmin();

    if (db) {
      const { data: row, error } = await db
        .from("user_settings")
        .select("*")
        .eq("user_email", data.userEmail)
        .maybeSingle();

      if (!error && row) {
        return {
          settings: {
            alertThreshold: row.alert_threshold ?? DEFAULT_SETTINGS.alertThreshold,
            notifEmail:     row.notif_email     ?? DEFAULT_SETTINGS.notifEmail,
            notifSms:       row.notif_sms       ?? DEFAULT_SETTINGS.notifSms,
            notifPush:      row.notif_push      ?? DEFAULT_SETTINGS.notifPush,
            locale:         row.locale          ?? DEFAULT_SETTINGS.locale,
            pm25Threshold:  row.pm25_threshold  ?? DEFAULT_SETTINGS.pm25Threshold,
            no2Threshold:   row.no2_threshold   ?? DEFAULT_SETTINGS.no2Threshold,
            so2Threshold:   row.so2_threshold   ?? DEFAULT_SETTINGS.so2Threshold,
          } satisfies UserSettings,
          source: "live" as const,
        };
      }
      if (error) console.error("[settings] fetch error:", error.message);
    }

    // No Supabase or no row yet — return defaults
    return { settings: DEFAULT_SETTINGS, source: "default" as const };
  });

// ── Save settings ─────────────────────────────────────────────────────────────

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator(SettingsSchema)
  .handler(async ({ data }) => {
    const db = await getSupabaseAdmin();

    if (db) {
      const { error } = await db.from("user_settings").upsert(
        {
          user_email:      data.userEmail,
          alert_threshold: data.settings.alertThreshold,
          notif_email:     data.settings.notifEmail,
          notif_sms:       data.settings.notifSms,
          notif_push:      data.settings.notifPush,
          locale:          data.settings.locale,
          pm25_threshold:  data.settings.pm25Threshold,
          no2_threshold:   data.settings.no2Threshold,
          so2_threshold:   data.settings.so2Threshold,
          updated_at:      new Date().toISOString(),
        },
        { onConflict: "user_email" },
      );

      if (error) {
        console.error("[settings] upsert error:", error.message);
        return { ok: false, error: error.message, mode: "live" as const };
      }

      return { ok: true, mode: "live" as const };
    }

    // Demo mode — no Supabase; settings only live in the browser for this session
    console.log(`[settings/demo] saved for ${data.userEmail}`);
    return { ok: true, mode: "demo" as const };
  });
