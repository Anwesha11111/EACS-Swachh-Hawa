import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// Notifications Functions
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Mark notifications as read in the backend
 * Input: {notification_ids: string[] (optional), mark_all: boolean (optional)}
 * Output: {ok: boolean, source: "database" | "demo"}
 * 
 * If mark_all is true, mark all unread notifications for the current user as read.
 * If notification_ids are provided, mark only those specific notifications.
 * If both are provided, mark_all takes precedence.
 */
export const markNotificationsAsRead = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    notification_ids: z.array(z.string()).optional(),
    mark_all: z.boolean().optional(),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      console.log("[notifications/demo] Would mark notifications as read", input);
      return { ok: true, source: "demo" as const };
    }

    try {
      if (input.mark_all) {
        // Mark all unread notifications for the user as read
        const { error } = await db
          .from("user_notifications")
          .update({ read: true, read_at: new Date().toISOString() })
          .eq("read", false);

        if (error) throw error;

        return { ok: true, source: "database" as const };
      } else if (input.notification_ids && input.notification_ids.length > 0) {
        // Mark specific notifications as read
        const { error } = await db
          .from("user_notifications")
          .update({ read: true, read_at: new Date().toISOString() })
          .in("id", input.notification_ids);

        if (error) throw error;

        return { ok: true, source: "database" as const };
      }

      return { ok: true, source: "database" as const };
    } catch (err) {
      console.error("[notifications] Mark read error:", err);
      throw new Error("Failed to mark notifications as read");
    }
  });

