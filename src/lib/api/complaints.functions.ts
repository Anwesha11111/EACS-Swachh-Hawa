import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin, supabaseConfigured } from "../supabase.server";

// Seed complaints used when Supabase is not configured.
const SEED_COMPLAINTS = [
  { id: "CMP-4821", citizen: "Rahul M., Delhi",     type: "Industrial Smoke",  location: "Wazirpur Industrial Area", city: "Delhi",     verified: true,  status: "Escalated to Enforcement", correlation: "Sensor SH-DEL-0042 corroborates — PM2.5 spike 356 µg/m³", dossier: "ENF-2026-0341", created_at: "2026-05-30T04:11:00Z" },
  { id: "CMP-4820", citizen: "Priya S., Ghaziabad", type: "Construction Dust", location: "NH-9 Bypass Site",         city: "Ghaziabad", verified: true,  status: "Under Investigation",      correlation: "SH-GZB-0018 PM10 elevated 3× baseline",                       dossier: "ENF-2026-0340", created_at: "2026-05-30T03:48:00Z" },
  { id: "CMP-4819", citizen: null,                   type: "Garbage Burning",   location: "Yamuna Khadar",            city: "Delhi",     verified: false, status: "Drone Dispatched",         correlation: "No sensor within 500m — drone survey dispatched",               dossier: null,            created_at: "2026-05-30T02:22:00Z" },
  { id: "CMP-4818", citizen: "Amit K., Patna",       type: "Brick Kiln Smoke", location: "Phulwari Sharif",          city: "Patna",     verified: true,  status: "Dossier Compiled",         correlation: "SH-PNA-0031 PM2.5 287 µg/m³ sustained 45 min",                dossier: "ENF-2026-0338", created_at: "2026-05-29T22:01:00Z" },
  { id: "CMP-4817", citizen: "Sunita D., Bengaluru", type: "Vehicle Emission",  location: "Outer Ring Road",          city: "Bengaluru", verified: false, status: "Pending Verification",     correlation: "No fixed sensor — flagged for mobile vehicle check",           dossier: null,            created_at: "2026-05-29T19:44:00Z" },
];

// Citizen complaints — submit and retrieve.
// With Supabase configured: persists to the `complaints` table.
// Without Supabase: submitComplaint logs to console; getComplaints returns
// the static mock array so the /complaints page always has data.

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Complaint {
  id: string;
  citizen: string | null;
  type: string;
  location: string;
  description?: string | null;
  city?: string | null;
  verified: boolean;
  status: string;
  correlation?: string | null;
  dossier?: string | null;
  created_at: string;
}

// ── Submit a new complaint ────────────────────────────────────────────────────

export const submitComplaint = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      type: z.string().min(1),
      location: z.string().min(1),
      description: z.string().optional(),
      city: z.string().optional(),
      citizen: z.string().optional(), // anonymous by default
    }),
  )
  .handler(async ({ data }) => {
    const db = await getSupabaseAdmin();

    if (db) {
      const { error } = await db.from("complaints").insert({
        citizen: data.citizen ?? null,
        type: data.type,
        location: data.location,
        description: data.description ?? null,
        city: data.city ?? null,
        verified: false,
        status: "Pending Verification",
      });

      if (error) {
        console.error("[complaints] insert error:", error.message);
        return { ok: false, error: error.message, mode: "live" as const };
      }

      return { ok: true, mode: "live" as const };
    }

    // Demo mode — no Supabase
    console.log(
      `[complaints/demo] type="${data.type}" location="${data.location}"`,
    );
    return { ok: true, mode: "demo" as const };
  });

// ── Get all complaints (admin/officer view) ────────────────────────────────────

export const getComplaints = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await getSupabaseAdmin();

    if (db) {
      const { data, error } = await db
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        return {
          complaints: data as Complaint[],
          source: "live" as const,
          configured: true,
        };
      }
      if (error) {
        console.error("[complaints] fetch error:", error.message);
      }
      // Table exists but is empty — show seed data so the page isn't blank
      return { complaints: SEED_COMPLAINTS, source: "mock" as const, configured: true };
    }

    // Supabase not configured — serve static seed data
    return { complaints: SEED_COMPLAINTS, source: "mock" as const, configured: false };
  },
);
