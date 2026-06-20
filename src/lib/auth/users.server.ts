// Server-only seeded user store. The `.server.ts` suffix keeps password
// material out of the client bundle.
//
// These are DEMO accounts — their passwords are intentionally shown on the
// login screen so a jury can sign in. Validation is still REAL: each password
// is verified by re-deriving PBKDF2-HMAC-SHA256 (100k iters, 32-byte key) and
// comparing against the stored hash below. A wrong password is genuinely
// rejected.
//
// Hashes were generated with:
//   node -e "const c=require('crypto');const s=c.randomBytes(16);
//     console.log(s.toString('base64'),
//     c.pbkdf2Sync(PASSWORD,s,100000,32,'sha256').toString('base64'))"
//
// To replace with real users later, swap this for a DB / Supabase Auth lookup
// in auth.functions.ts — the rest of the auth flow stays the same.
import type { Role } from "../auth-roles";

export interface SeedUser {
  email: string;
  name: string;
  role: Role;
  initials: string;
  /** base64 */
  salt: string;
  /** base64 — PBKDF2-HMAC-SHA256 of the demo password */
  hash: string;
  /** Plain demo password, shown on the login screen (demo only). */
  demoPassword: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    email: "admin@swachhhawa.gov.in",
    name: "Priya Sharma",
    role: "Administrator",
    initials: "PS",
    salt: "4Qu9+UMLPgklCfwdcyD/2g==",
    hash: "rLe7nPoFcJw17/XCyYlEPZUmktE18DwE0RCfTlmDUAM=",
    demoPassword: "Admin@2026",
  },
  {
    email: "analyst@swachhhawa.gov.in",
    name: "Arjun Mehta",
    role: "Analyst",
    initials: "AM",
    salt: "1ee3bVPQVVp25QJ9nza4dQ==",
    hash: "ExtvGeuWMhx8KGzFx4PVdrr0N2nwlmt8r3RBMNSuqLA=",
    demoPassword: "Analyst@2026",
  },
  {
    email: "officer@swachhhawa.gov.in",
    name: "Rajesh Kumar",
    role: "Field Officer",
    initials: "RK",
    salt: "N9EXY/9o/RPoFVluC1Hy+w==",
    hash: "Wv2BoFhhaS1qfdR0dK1gnGaOU3MGDAlG2H3jAhKimRw=",
    demoPassword: "Officer@2026",
  },
  {
    email: "viewer@swachhhawa.gov.in",
    name: "Neha Gupta",
    role: "Viewer",
    initials: "NG",
    salt: "SKv6/Tg4iTisR5fxMmbCmg==",
    hash: "R/wHIrnbYnSKtptn1wXKX6UxHNlpMCTZrDmUGVjktis=",
    demoPassword: "Viewer@2026",
  },
];

export function findSeedUser(email: string): SeedUser | null {
  const e = email.trim().toLowerCase();
  return SEED_USERS.find((u) => u.email.toLowerCase() === e) ?? null;
}
