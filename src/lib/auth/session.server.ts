// Server-only session helpers. The `.server.ts` suffix keeps the server-only
// imports (@tanstack/react-start/server cookie helpers, node:process) out of
// the client bundle — importing them at module scope in a client-reachable
// file breaks the client (React resolves to null).
import process from "node:process";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";

import { signSession, verifySession } from "./crypto.server";
import type { AuthUser } from "../auth-roles";

const SESSION_COOKIE = "sh_session";
const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days

export async function setSessionCookie(user: AuthUser): Promise<void> {
  const token = await signSession({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S });
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    // Must be false on http://localhost or the browser drops the cookie.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
}

export async function readSession(): Promise<AuthUser | null> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) return null;
  const { exp: _exp, ...user } = payload;
  return user;
}

export function clearSessionCookie(): void {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export function smsConfigured(): boolean {
  return !!process.env.TWILIO_AUTH_TOKEN;
}
