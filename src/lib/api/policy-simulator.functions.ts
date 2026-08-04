import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// Policy Simulator Functions
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Run policy simulation with selected levers
 * Input: {selected_policies: string[]}
 * Output: {projected_aqi, aqi_reduction, impact_details}
 */
export const runSimulation = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    selected_policies: z.array(z.string()).min(1, "At least one policy is required"),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    // Policy impact map
    const impactMap: Record<string, number> = {
      "odd-even": -18,
      "industry-50": -35,
      "stubble": -45,
      "ev-fleet": -12,
      "green-belt": -8,
      "coal-ban": -28,
    };

    // Calculate total impact
    const totalReduction = input.selected_policies.reduce((acc, policyId) => {
      return acc + (impactMap[policyId] || 0);
    }, 0);

    const baselineAqi = 230;
    const projectedAqi = Math.max(30, baselineAqi + totalReduction);

    if (db) {
      try {
        // Log simulation if database available
        await db
          .from("audit_log")
          .insert({
            action: "simulation_run",
            entity_type: "simulation",
            entity_id: `SIM-${Date.now()}`,
            details: {
              policies: input.selected_policies,
              baseline_aqi: baselineAqi,
              projected_aqi: projectedAqi,
              reduction: Math.abs(totalReduction),
            },
            created_at: new Date().toISOString(),
          })
          .catch(() => {
            // Ignore audit log errors
          });
      } catch (err) {
        console.error("[simulation] Audit log error:", err);
      }
    }

    return {
      projected_aqi: projectedAqi,
      aqi_reduction: Math.abs(totalReduction),
      baseline_aqi: baselineAqi,
      impact_details: input.selected_policies.map((id) => ({
        policy_id: id,
        impact: impactMap[id] || 0,
      })),
      source: db ? "database" : "demo",
    };
  });

/**
 * Save a scenario for later use
 * Input: {policy_ids: string[], scenario_name: string}
 * Output: {scenario_id, created_at}
 */
export const saveScenario = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    policy_ids: z.array(z.string()).min(1),
    scenario_name: z.string().min(1, "Scenario name is required"),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    const scenario_id = `SCENARIO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const created_at = new Date().toISOString();

    if (db) {
      try {
        await db
          .from("scenarios")
          .insert({
            scenario_id,
            name: input.scenario_name,
            policies: input.policy_ids,
            created_at,
            updated_at: created_at,
          })
          .catch(() => {
            // Continue if table doesn't exist
          });

        // Log to audit
        await db
          .from("audit_log")
          .insert({
            action: "scenario_saved",
            entity_type: "scenario",
            entity_id: scenario_id,
            details: {
              name: input.scenario_name,
              policies: input.policy_ids,
            },
            created_at,
          })
          .catch(() => {
            // Ignore audit log errors
          });
      } catch (err) {
        console.error("[saveScenario] Database error:", err);
      }
    }

    return {
      scenario_id,
      created_at,
      source: db ? "database" : "demo",
    };
  });

/**
 * Generate a shareable URL for a scenario
 * Input: {policy_ids: string[]}
 * Output: {short_url}
 */
export const generateShareUrl = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    policy_ids: z.array(z.string()).min(1),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    const share_id = `SHARE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const created_at = new Date().toISOString();

    if (db) {
      try {
        await db
          .from("scenario_shares")
          .insert({
            share_id,
            policies: input.policy_ids,
            created_at,
          })
          .catch(() => {
            // Continue if table doesn't exist
          });
      } catch (err) {
        console.error("[generateShareUrl] Database error:", err);
      }
    }

    // Generate short URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://swachhhawa.gov.in";
    const shortUrl = `${baseUrl}/s/${share_id}`;

    return {
      short_url: shortUrl,
      share_id,
      source: db ? "database" : "demo",
    };
  });
