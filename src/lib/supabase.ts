import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan variables de entorno PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY. Configúralas en tu entorno local (.env) y en Netlify.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}


