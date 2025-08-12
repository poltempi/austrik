import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl =
    import.meta.env.PUBLIC_SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
  const supabaseAnonKey =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan variables de entorno: define PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY (o bien SUPABASE_URL y SUPABASE_KEY). Configúralas en .env y en Netlify.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}


