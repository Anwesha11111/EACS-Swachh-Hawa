import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// AirGPT chat history — persist and load per-session conversation.
// session_key is the user's email (authenticated) or an anonymous token
// stored in sessionStorage on the client side.
//
// With Supabase: messages are stored in `chat_history` table.
// Without Supabase: saveChatMessage is a no-op; getChatHistory returns []
// (the component will then fall back to SEED_MESSAGES as before).

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

// ── Save a single message ─────────────────────────────────────────────────────

export const saveChatMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sessionKey: z.string().min(1),
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = await getSupabaseAdmin();

    if (db) {
      const { error } = await db.from("chat_history").insert({
        session_key: data.sessionKey,
        role:        data.role,
        content:     data.content,
      });
      if (error) console.error("[chat] insert error:", error.message);
    }
    // Always return ok — chat must never block on persistence errors
    return { ok: true };
  });

// ── Load history for a session ────────────────────────────────────────────────

export const getChatHistory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionKey: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = await getSupabaseAdmin();

    if (db) {
      const { data: rows, error } = await db
        .from("chat_history")
        .select("role, content, created_at")
        .eq("session_key", data.sessionKey)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!error && rows) {
        return {
          messages: rows.map((r: { role: string; content: string }) => ({
            role:    r.role as "user" | "assistant",
            content: r.content,
          })),
          source: "live" as const,
        };
      }
      if (error) console.error("[chat] fetch error:", error.message);
    }

    // No Supabase or fetch error — caller falls back to SEED_MESSAGES
    return { messages: [] as { role: "user" | "assistant"; content: string }[], source: "default" as const };
  });

// ── Save a full exchange (user + assistant) atomically ─────────────────────────

export const saveChatExchange = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sessionKey:      z.string().min(1),
      userMessage:     MessageSchema,
      assistantMessage: MessageSchema,
    }),
  )
  .handler(async ({ data }) => {
    const db = await getSupabaseAdmin();

    if (db) {
      const { error } = await db.from("chat_history").insert([
        { session_key: data.sessionKey, role: data.userMessage.role,      content: data.userMessage.content },
        { session_key: data.sessionKey, role: data.assistantMessage.role, content: data.assistantMessage.content },
      ]);
      if (error) console.error("[chat] exchange insert error:", error.message);
    }
    return { ok: true };
  });
