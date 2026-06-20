// Server-only crypto for auth. The `.server.ts` suffix keeps this out of the
// client bundle. Uses the Web Crypto API (globalThis.crypto.subtle) so it runs
// identically on Node (dev) and Cloudflare Workers (prod) — no `node:crypto`,
// no native bcrypt.
import process from "node:process";

import type { AuthUser } from "../auth-roles";

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_BITS = 256; // 32 bytes — matches the seed-hash generator
const enc = new TextEncoder();
const dec = new TextDecoder();

// ── base64 / base64url helpers (Workers-safe: btoa/atob, no Buffer) ──────────
function bytesToB64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decodes standard base64 OR base64url into bytes. */
function b64ToBytes(b64: string): Uint8Array {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ── Password hashing (PBKDF2-HMAC-SHA256) ────────────────────────────────────
async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    PBKDF2_BITS,
  );
  return new Uint8Array(bits);
}

/** Verify a plaintext password against a stored base64 salt + base64 hash. */
export async function verifyPassword(
  password: string,
  saltB64: string,
  hashB64: string,
): Promise<boolean> {
  const computed = await pbkdf2(password, b64ToBytes(saltB64));
  return timingSafeEqual(computed, b64ToBytes(hashB64));
}

// ── Session tokens (HMAC-SHA256 signed, tamper-evident) ──────────────────────
export interface SessionPayload extends AuthUser {
  /** Expiry as epoch seconds. */
  exp: number;
}

function getAuthSecret(): string {
  // Read per-request (Workers binds env at request time).
  return process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me";
}

async function hmacSign(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return new Uint8Array(sig);
}

/** Produce `base64url(payload).base64url(hmac)`. */
export async function signSession(payload: SessionPayload): Promise<string> {
  const body = bytesToB64url(enc.encode(JSON.stringify(payload)));
  const sig = bytesToB64url(await hmacSign(body));
  return `${body}.${sig}`;
}

/** Verify signature + return payload, or null if tampered/malformed. */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = bytesToB64url(await hmacSign(body));
  if (!timingSafeEqual(b64ToBytes(sig), b64ToBytes(expected))) return null;
  try {
    return JSON.parse(dec.decode(b64ToBytes(body))) as SessionPayload;
  } catch {
    return null;
  }
}
