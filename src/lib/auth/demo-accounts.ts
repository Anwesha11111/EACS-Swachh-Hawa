// Public demo-account list for the login screen (display + one-click sign-in).
// These are demo credentials meant to be shown. Real validation still happens
// server-side against the PBKDF2 hashes in users.server.ts.
import type { Role } from "../auth-roles";

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
  name: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "admin@swachhhawa.gov.in", password: "Admin@2026", role: "Administrator", name: "Priya Sharma" },
  { email: "analyst@swachhhawa.gov.in", password: "Analyst@2026", role: "Analyst", name: "Arjun Mehta" },
  { email: "officer@swachhhawa.gov.in", password: "Officer@2026", role: "Field Officer", name: "Rajesh Kumar" },
  { email: "viewer@swachhhawa.gov.in", password: "Viewer@2026", role: "Viewer", name: "Neha Gupta" },
];
