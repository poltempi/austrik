import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseClient(): SupabaseClient {
  // Accept multiple env var styles; do NOT use SUPABASE_DATABASE_URL (that's a DB connection string)
  const supabaseUrl =
    import.meta.env.PUBLIC_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    (typeof process !== 'undefined' && (process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL));
  const supabaseAnonKey =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_KEY ||
    (typeof process !== 'undefined' && (process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY));

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan variables de entorno: define PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY (o bien SUPABASE_URL y SUPABASE_ANON_KEY). Configúralas en .env y en Netlify.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}


