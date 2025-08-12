import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseClient(): SupabaseClient | null {
  // Accept multiple env var styles; do NOT use SUPABASE_DATABASE_URL (that's a DB connection string)
  const supabaseUrl =
    import.meta.env.PUBLIC_SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_DATABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    import.meta.env.SUPABASE_DATABASE_URL ||
    (typeof process !== 'undefined' && (
      process.env.PUBLIC_SUPABASE_URL ||
      process.env.PUBLIC_SUPABASE_DATABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.SUPABASE_DATABASE_URL
    ));
  const supabaseAnonKey =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_KEY ||
    (typeof process !== 'undefined' && (
      process.env.PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY
    ));

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env missing. URL or ANON KEY not set.');
    return null;
  }

  return createClient(String(supabaseUrl), String(supabaseAnonKey));
}


