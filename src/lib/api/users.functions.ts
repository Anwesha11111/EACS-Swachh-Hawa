import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { crypto } from "node:crypto";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// User Management Functions
// ═════════════════════════════════════════════════════════════════════════════

export interface UserInvitation {
  invitation_sent: boolean;
  expires_at: string;
  invitation_token: string;
}

/**
 * Generate a random UUID for invitation tokens
 */
function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Invite a new user to the system
 * Input: {email, role: 'officer' | 'admin' | 'citizen'}
 * Output: {invitation_sent: true, expires_at, invitation_token}
 * Generates a token and sets expiry to 48 hours from now
 */
export const inviteUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["officer", "admin", "citizen"], {
      errorMap: () => ({ message: "Role must be one of: officer, admin, citizen" }),
    }),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    const invitation_token = generateToken();
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    if (!db) {
      console.log("[users/demo] Would invite user:", { email: input.email, role: input.role });
      return {
        invitation_sent: true,
        expires_at,
        invitation_token,
        source: "demo" as const,
      };
    }

    try {
      const created_at = new Date().toISOString();

      // Insert invitation record
      const { error: insertError } = await db
        .from("user_invitations")
        .insert({
          email: input.email,
          role: input.role,
          token: invitation_token,
          expires_at,
          created_at,
          used: false,
        });

      if (insertError) throw insertError;

      // Log to audit_log
      try {
        await db.from("audit_log").insert({
          action: "user_invited",
          entity_type: "user_invitation",
          entity_id: input.email,
          details: {
            email: input.email,
            role: input.role,
          },
          created_at,
        });
      } catch (auditErr) {
        console.warn("[users] Audit log error:", auditErr);
      }

      return {
        invitation_sent: true,
        expires_at,
        invitation_token,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[users] Invite error:", err);
      throw new Error(`Failed to invite user: ${String(err)}`);
    }
  });

/**
 * Get user by email
 */
export const getUserByEmail = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email: z.string().email(),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return null;
    }

    try {
      const { data, error } = await db
        .from("auth.users")
        .select("id, email, user_metadata")
        .eq("email", input.email)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (err) {
      console.error("[users] Fetch by email error:", err);
      return null;
    }
  });

/**
 * List all users with optional filtering
 */
export const listUsers = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    role: z.enum(["officer", "admin", "citizen"]).optional(),
    limit: z.number().min(1).max(100).default(50),
  }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();

    if (!db) {
      return {
        users: [],
        total: 0,
        source: "mock" as const,
      };
    }

    try {
      let query = db
        .from("auth.users")
        .select("id, email, user_metadata", { count: "exact" });

      if (input.role) {
        query = query.eq("user_metadata->role", input.role);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) throw error;

      return {
        users: data || [],
        total: count || 0,
        source: "database" as const,
      };
    } catch (err) {
      console.error("[users] List error:", err);
      throw new Error("Failed to list users");
    }
  });
