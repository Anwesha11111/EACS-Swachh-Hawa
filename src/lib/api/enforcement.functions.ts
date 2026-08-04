import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// Enforcement & Strike Teams Functions
// ═════════════════════════════════════════════════════════════════════════════

export interface StrikeTeamDispatch {
  teams_count: number;
  eta_minutes: number[];
  dispatch_status: "dispatched" | "en_route" | "delayed";
}

/**
 * Activate and dispatch enforcement strike teams to a location
 * Input: {city}
 * Output: {teams_count, eta_minutes: [18, 24, 31], dispatch_status}
 * Pseudo-logic: Return 3 teams with realistic ETA spread
 */
export const activateStrikeTeams = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city: z.string().min(1, "City is required"),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    // Generate realistic ETA spread (18-35 minutes)
    const baseEta = 18 + Math.floor(Math.random() * 8);
    const eta_minutes = [
      baseEta,
      baseEta + 6 + Math.floor(Math.random() * 3),
      baseEta + 13 + Math.floor(Math.random() * 3),
    ];

    const teams_count = 3;
    const dispatch_status = Math.random() > 0.1 ? "dispatched" : "delayed";

    if (!db) {
      console.log("[enforcement/demo] Would dispatch strike teams to", input.city);
      return {
        teams_count,
        eta_minutes,
        dispatch_status,
        source: "demo" as const,
      };
    }

    try {
      const dispatch_id = `DISP-${Date.now()}`;
      const created_at = new Date().toISOString();

      // Insert dispatch record
      const { error: insertError } = await db
        .from("enforcement_dispatches")
        .insert({
          id: dispatch_id,
          city: input.city,
          teams_count,
          eta_minutes: eta_minutes,
          status: dispatch_status,
          created_at,
        });

      if (insertError) throw insertError;

      // Log to audit_log
      try {
        await db.from("audit_log").insert({
          action: "strike_teams_dispatched",
          entity_type: "enforcement_dispatch",
          entity_id: dispatch_id,
          details: {
            city: input.city,
            teams_count,
            eta_minutes,
          },
          created_at,
        });
      } catch (auditErr) {
        console.warn("[enforcement] Audit log error:", auditErr);
      }

      return {
        teams_count,
        eta_minutes,
        dispatch_status,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[enforcement] Dispatch error:", err);
      throw new Error(`Failed to dispatch strike teams: ${String(err)}`);
    }
  });

/**
 * Get dispatch history for a city
 */
export const getDispatchHistory = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city: z.string(),
    limit: z.number().min(1).max(50).default(20),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        dispatches: [],
        source: "mock" as const,
      };
    }

    try {
      const { data, error } = await db
        .from("enforcement_dispatches")
        .select("*")
        .eq("city", input.city)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) throw error;

      return {
        dispatches: data || [],
        source: "database" as const,
      };
    } catch (err) {
      console.error("[enforcement] History fetch error:", err);
      throw new Error("Failed to fetch dispatch history");
    }
  });
