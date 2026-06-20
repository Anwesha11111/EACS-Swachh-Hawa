// Shared auth types + role helpers.
// No secrets here — safe to import from both client and server code.

export type Role = "Administrator" | "Analyst" | "Field Officer" | "Viewer";

export type AuthProvider = "password" | "phone" | "google" | "facebook" | "twitter";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  role: Role;
  provider: AuthProvider;
  avatar?: string;
}

/** Higher rank = more privilege. Used for "minimum role" route gating. */
export const ROLE_RANK: Record<Role, number> = {
  Viewer: 0,
  "Field Officer": 1,
  Analyst: 2,
  Administrator: 3,
};

/** Routes that require at least the given role. Longest-prefix wins. */
export const ROUTE_MIN_ROLE: Record<string, Role> = {
  "/users": "Administrator",
  "/access": "Administrator",
  "/security": "Administrator",
  "/system": "Administrator",
  "/enforcement": "Field Officer",
  "/audit": "Analyst",
};

export function roleAtLeast(role: Role | undefined | null, min: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

/** Returns the minimum role required to view a path, or null if open to any signed-in user. */
export function minRoleForPath(pathname: string): Role | null {
  let match: Role | null = null;
  let matchLen = -1;
  for (const [prefix, role] of Object.entries(ROUTE_MIN_ROLE)) {
    if ((pathname === prefix || pathname.startsWith(prefix + "/")) && prefix.length > matchLen) {
      match = role;
      matchLen = prefix.length;
    }
  }
  return match;
}
