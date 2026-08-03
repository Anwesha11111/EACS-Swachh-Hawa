// Client-safe Supabase client (anon key only).
// Used for real-time subscriptions in the browser.
// All writes must go through server functions (createServerFn) — never
// write from the browser with the anon key.

let _client: ReturnType<typeof buildClient> | null = null;

async function buildClient() {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, key);
  } catch {
    return null;
  }
}

/**
 * Returns the Supabase browser client (anon key), or null if not configured.
 * Singleton — safe to call repeatedly.
 */
export function getSupabaseClient() {
  if (_client === undefined) {
    _client = buildClient();
  }
  return _client;
}

/** True when the browser-side Supabase env vars are set. */
export function supabaseClientConfigured(): boolean {
  return !!(
    (import.meta as any).env?.VITE_SUPABASE_URL &&
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
  );
}
