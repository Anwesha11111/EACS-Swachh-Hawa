// Server functions for authentication. Only client-safe imports may live at
// module scope here (this file is imported by the client to call the RPCs).
// All server-only logic (cookies, env, crypto) is behind `.server.ts` modules.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { findSeedUser } from "../auth/users.server";
import { verifyPassword } from "../auth/crypto.server";
import { setSessionCookie, readSession, clearSessionCookie, smsConfigured } from "../auth/session.server";
import type { AuthUser, Role } from "../auth-roles";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;
const OTP_TTL_MS = 5 * 60 * 1000;

// In-memory state. Resets on server restart; fine for a single-node demo.
// (On multi-node Workers this would move to KV — noted for later.)
const attempts = new Map<string, { count: number; until: number }>();
const otps = new Map<string, { code: string; until: number }>();

export const loginWithPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const key = data.email.trim().toLowerCase();
    const now = Date.now();
    const rec = attempts.get(key);
    if (rec && rec.until > now) {
      const secs = Math.ceil((rec.until - now) / 1000);
      return { ok: false as const, error: `Too many attempts. Try again in ${secs}s.` };
    }

    const seed = findSeedUser(key);
    const valid = seed ? await verifyPassword(data.password, seed.salt, seed.hash) : false;

    if (!seed || !valid) {
      const count = (rec?.count ?? 0) + 1;
      if (count >= MAX_ATTEMPTS) {
        attempts.set(key, { count: 0, until: now + LOCKOUT_MS });
      } else {
        attempts.set(key, { count, until: 0 });
      }
      return { ok: false as const, error: "Invalid email or password." };
    }

    attempts.delete(key);
    const user: AuthUser = {
      email: seed.email,
      name: seed.name,
      role: seed.role,
      initials: seed.initials,
      provider: "password",
    };
    await setSessionCookie(user);
    return { ok: true as const, user };
  });

export const requestOtp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ phone: z.string().min(10) }))
  .handler(async ({ data }) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otps.set(data.phone, { code, until: Date.now() + OTP_TTL_MS });
    // No SMS provider configured → surface the code so the demo can proceed.
    const hasSms = smsConfigured();
    return { ok: true as const, demo: !hasSms, code: hasSms ? undefined : code };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ phone: z.string().min(10), otp: z.string().length(6) }))
  .handler(async ({ data }) => {
    const rec = otps.get(data.phone);
    if (!rec || rec.until < Date.now() || rec.code !== data.otp) {
      return { ok: false as const, error: "Invalid or expired code." };
    }
    otps.delete(data.phone);
    const user: AuthUser = {
      email: `+91 ${data.phone}`,
      name: "Rajesh Kumar",
      role: "Field Officer" as Role,
      initials: "RK",
      provider: "phone",
    };
    await setSessionCookie(user);
    return { ok: true as const, user };
  });

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const user = await readSession();
  return { user };
});

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  clearSessionCookie();
  return { ok: true as const };
});
