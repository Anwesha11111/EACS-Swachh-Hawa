import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// Incidents & Enforcement Functions
// ═════════════════════════════════════════════════════════════════════════════

export interface Incident {
  id: string;
  city: string;
  state: string;
  incident_type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "Resolved" | "Closed" | "Escalated";
  location_description: string;
  description: string;
  assigned_officer: string | null;
  detected_at: string;
  resolved_at: string | null;
  enforcement_dossier: string | null;
  source_type: string | null;
}

// Mock incidents
const MOCK_INCIDENTS: Incident[] = [
  { id: "INC-48211", city: "Delhi", state: "DL", incident_type: "Industrial Emission Breach", severity: "Critical", status: "Investigating", location_description: "Wazirpur Industrial Area", description: "PM2.5 spike to 356 µg/m³", assigned_officer: "Insp. R. Khanna", detected_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(), resolved_at: null, enforcement_dossier: "ENF-2026-0341", source_type: "sensor" },
  { id: "INC-48210", city: "Patna", state: "BR", incident_type: "Crop Residue Burning", severity: "High", status: "Open", location_description: "Agricultural fields near Danapur", description: "Multiple fire hotspots detected", assigned_officer: "Insp. S. Mahato", detected_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(), resolved_at: null, enforcement_dossier: null, source_type: "satellite" },
  { id: "INC-48209", city: "Lucknow", state: "UP", incident_type: "Construction Dust Violation", severity: "High", status: "Open", location_description: "Gomti Nagar Extension Site", description: "Construction without dust control", assigned_officer: "Insp. A. Verma", detected_at: new Date(Date.now() - 44 * 60 * 1000).toISOString(), resolved_at: null, enforcement_dossier: null, source_type: "complaint" },
  { id: "INC-48208", city: "Mumbai", state: "MH", incident_type: "Vehicular PM Spike", severity: "Medium", status: "Investigating", location_description: "Western Express Highway", description: "Traffic congestion PM spike", assigned_officer: "Insp. D. Naik", detected_at: new Date(Date.now() - 72 * 60 * 1000).toISOString(), resolved_at: null, enforcement_dossier: null, source_type: "sensor" },
];

/**
 * Get all incidents with filtering
 */
export const getIncidents = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city: z.string().optional(),
    status: z.enum(["Open", "Investigating", "Resolved", "Closed", "Escalated", "all"]).optional(),
    severity: z.enum(["Critical", "High", "Medium", "Low", "all"]).optional(),
    limit: z.number().min(1).max(100).default(50),
  }))
  .handler(async ({ data: filters }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      let incidents = MOCK_INCIDENTS;
      if (filters.city) {
        incidents = incidents.filter(i => i.city.toLowerCase() === filters.city!.toLowerCase());
      }
      if (filters.status && filters.status !== "all") {
        incidents = incidents.filter(i => i.status === filters.status);
      }
      if (filters.severity && filters.severity !== "all") {
        incidents = incidents.filter(i => i.severity === filters.severity);
      }

      return {
        incidents: incidents.slice(0, filters.limit),
        total: incidents.length,
        source: "mock" as const,
      };
    }

    try {
      let query = db
        .from("incidents")
        .select("*", { count: "exact" });

      if (filters.city) {
        query = query.ilike("city", filters.city);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.severity && filters.severity !== "all") {
        query = query.eq("severity", filters.severity);
      }

      const { data, error, count } = await query
        .order("detected_at", { ascending: false })
        .limit(filters.limit);

      if (error) throw error;

      return {
        incidents: (data || []) as Incident[],
        total: count || 0,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[incidents] Fetch error:", err);
      throw new Error("Failed to fetch incidents");
    }
  });

/**
 * Get incident by ID
 */
export const getIncidentById = createServerFn({ method: "POST" })
  .inputValidator(z.object({ incidentId: z.string() }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return MOCK_INCIDENTS.find(i => i.id === input.incidentId) || null;
    }

    try {
      const { data, error } = await db
        .from("incidents")
        .select("*")
        .eq("id", input.incidentId)
        .single();

      if (error) throw error;
      return data as Incident | null;
    } catch (err) {
      console.error("[incidents] Fetch by ID error:", err);
      return null;
    }
  });

/**
 * Get incident statistics
 */
export const getIncidentStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        total: MOCK_INCIDENTS.length,
        open: MOCK_INCIDENTS.filter(i => i.status === "Open").length,
        investigating: MOCK_INCIDENTS.filter(i => i.status === "Investigating").length,
        resolved: MOCK_INCIDENTS.filter(i => i.status === "Resolved").length,
        critical: MOCK_INCIDENTS.filter(i => i.severity === "Critical").length,
        high: MOCK_INCIDENTS.filter(i => i.severity === "High").length,
        source: "mock" as const,
      };
    }

    try {
      const { data, error } = await db
        .from("incidents")
        .select("status, severity");

      if (error) throw error;

      return {
        total: data?.length || 0,
        open: data?.filter(i => i.status === "Open").length || 0,
        investigating: data?.filter(i => i.status === "Investigating").length || 0,
        resolved: data?.filter(i => i.status === "Resolved").length || 0,
        critical: data?.filter(i => i.severity === "Critical").length || 0,
        high: data?.filter(i => i.severity === "High").length || 0,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[incidents] Stats error:", err);
      throw new Error("Failed to get incident statistics");
    }
  });

/**
 * Create a new manual incident case
 * Input: {city, type, description, severity, location_desc}
 * Output: {id, created_at, status}
 */
export const createIncident = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city: z.string().min(1, "City is required"),
    type: z.string().min(1, "Incident type is required"),
    description: z.string().min(1, "Description is required"),
    severity: z.enum(["Critical", "High", "Medium", "Low"], {
      errorMap: () => ({ message: "Severity must be one of: Critical, High, Medium, Low" }),
    }),
    location_desc: z.string().min(1, "Location description is required"),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      const id = `INC-${Date.now()}`;
      const created_at = new Date().toISOString();
      console.log("[incidents/demo] Would create incident:", input);
      return {
        id,
        created_at,
        status: "Open",
        source: "demo" as const,
      };
    }

    try {
      const id = `INC-${Date.now()}`;
      const created_at = new Date().toISOString();

      // Insert into incidents table
      const { data: incidentData, error: insertError } = await db
        .from("incidents")
        .insert({
          id,
          city: input.city,
          incident_type: input.type,
          description: input.description,
          severity: input.severity,
          location_description: input.location_desc,
          status: "Open",
          detected_at: created_at,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Log to audit_log
      try {
        await db.from("audit_log").insert({
          action: "incident_created",
          entity_type: "incident",
          entity_id: id,
          details: {
            city: input.city,
            severity: input.severity,
            type: input.type,
          },
          created_at: created_at,
        });
      } catch (auditErr) {
        console.warn("[incidents] Audit log error:", auditErr);
      }

      return {
        id,
        created_at,
        status: "Open",
        source: "database" as const,
      };
    } catch (err) {
      console.error("[incidents] Create error:", err);
      throw new Error(`Failed to create incident: ${String(err)}`);
    }
  });

/**
 * Update incident status
 */
export const updateIncidentStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    incidentId: z.string(),
    status: z.enum(["Open", "Investigating", "Resolved", "Closed", "Escalated"]),
    notes: z.string().optional(),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      console.log("[incidents/demo] Would update status:", input);
      return { ok: true, mode: "demo" as const };
    }

    try {
      const updates: any = {
        status: input.status,
        updated_at: new Date().toISOString(),
      };

      if (input.status === "Resolved" || input.status === "Closed") {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await db
        .from("incidents")
        .update(updates)
        .eq("id", input.incidentId);

      if (error) throw error;

      return { ok: true, mode: "live" as const };
    } catch (err) {
      console.error("[incidents] Update error:", err);
      return { ok: false, error: String(err), mode: "live" as const };
    }
  });
