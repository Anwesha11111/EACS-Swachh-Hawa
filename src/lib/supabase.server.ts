// Server-only Supabase client (service-role key).
// The `.server.ts` suffix keeps this out of the client bundle.
// Returns null when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set —
// every caller must handle the null case and fall back to mock data.

import process from "node:process";

// We import dynamically so the build doesn't fail when the package isn't
// installed yet. The package.json will be updated to include it.
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

let _client: SupabaseClient | null = null;
let _attempted = false;

async function createClient() {
  const { createClient: create } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return create(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Returns the Supabase service-role client, or null if env vars are missing.
 * Cached after first call (within the same server process lifetime).
 */
export async function getSupabaseAdmin(): Promise<SupabaseClient | null> {
  if (_attempted) return _client;
  _attempted = true;
  try {
    _client = await createClient();
  } catch {
    _client = null;
  }
  return _client;
}

/** Quick synchronous check — true only when both env vars are set. */
export function supabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
