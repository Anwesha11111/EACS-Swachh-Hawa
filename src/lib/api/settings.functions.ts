import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { crypto } from "node:crypto";
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

// ── Webhook Management ─────────────────────────────────────────────────────

export interface Webhook {
  webhook_id: string;
  status: "active" | "inactive";
  created_at: string;
  url: string;
  events: string[];
}

export interface WebhookResponse {
  webhook_id: string;
  status: "active" | "inactive";
  created_at: string;
}

/**
 * Create a new webhook for event notifications
 * Input: {url, events: string[]}
 * Output: {webhook_id, status: 'active', created_at}
 */
export const createWebhook = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userEmail: z.string().email(),
    webhook_url: z.string().url("Invalid webhook URL"),
    trigger_events: z.array(z.string()).min(1, "At least one event is required"),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    const webhook_id = `WH-${crypto.randomUUID()}`;
    const created_at = new Date().toISOString();

    if (!db) {
      console.log("[settings/demo] Would create webhook:", input);
      return {
        webhook_id,
        status: "active" as const,
        created_at,
        source: "demo" as const,
      };
    }

    try {
      // Insert webhook record
      const { error: insertError } = await db
        .from("webhooks")
        .insert({
          id: webhook_id,
          user_email: input.userEmail,
          url: input.webhook_url,
          events: input.trigger_events,
          status: "active",
          created_at,
        });

      if (insertError) throw insertError;

      // Log to audit_log
      try {
        await db.from("audit_log").insert({
          action: "webhook_created",
          entity_type: "webhook",
          entity_id: webhook_id,
          details: {
            user_email: input.userEmail,
            events: input.trigger_events,
          },
          created_at,
        });
      } catch (auditErr) {
        console.warn("[settings] Audit log error:", auditErr);
      }

      return {
        webhook_id,
        status: "active" as const,
        created_at,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[settings] Webhook create error:", err);
      throw new Error(`Failed to create webhook: ${String(err)}`);
    }
  });

/**
 * Delete a webhook
 * Input: {webhook_id}
 * Output: {success: boolean}
 */
export const deleteWebhook = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userEmail: z.string().email(),
    webhook_id: z.string().min(1),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      console.log("[settings/demo] Would delete webhook:", input.webhook_id);
      return { success: true, source: "demo" as const };
    }

    try {
      // Verify ownership before deleting
      const { data: webhook, error: fetchError } = await db
        .from("webhooks")
        .select("id, user_email")
        .eq("id", input.webhook_id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!webhook) {
        throw new Error("Webhook not found");
      }
      if (webhook.user_email !== input.userEmail) {
        throw new Error("Unauthorized: webhook does not belong to this user");
      }

      // Delete webhook
      const { error: deleteError } = await db
        .from("webhooks")
        .delete()
        .eq("id", input.webhook_id);

      if (deleteError) throw deleteError;

      // Log to audit_log
      try {
        await db.from("audit_log").insert({
          action: "webhook_deleted",
          entity_type: "webhook",
          entity_id: input.webhook_id,
          details: {
            user_email: input.userEmail,
          },
          created_at: new Date().toISOString(),
        });
      } catch (auditErr) {
        console.warn("[settings] Audit log error:", auditErr);
      }

      return { success: true, source: "database" as const };
    } catch (err) {
      console.error("[settings] Webhook delete error:", err);
      throw new Error(`Failed to delete webhook: ${String(err)}`);
    }
  });

/**
 * Get all webhooks for a user
 */
export const getUserWebhooks = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userEmail: z.string().email(),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        webhooks: [],
        source: "mock" as const,
      };
    }

    try {
      const { data, error } = await db
        .from("webhooks")
        .select("*")
        .eq("user_email", input.userEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return {
        webhooks: (data || []) as Webhook[],
        source: "database" as const,
      };
    } catch (err) {
      console.error("[settings] Webhooks fetch error:", err);
      throw new Error("Failed to fetch webhooks");
    }
  });
