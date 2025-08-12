import type { APIRoute } from 'astro';
import { getSupabaseClient } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  const env = {
    PUBLIC_SUPABASE_DATABASE_URL: Boolean(
      import.meta.env.PUBLIC_SUPABASE_DATABASE_URL || process.env.PUBLIC_SUPABASE_DATABASE_URL
    ),
    PUBLIC_SUPABASE_URL: Boolean(
      import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL
    ),
    SUPABASE_DATABASE_URL: Boolean(
      import.meta.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DATABASE_URL
    ),
    SUPABASE_URL: Boolean(
      import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL
    ),
    PUBLIC_SUPABASE_ANON_KEY: Boolean(
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY
    ),
    SUPABASE_ANON_KEY: Boolean(
      import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    ),
    SUPABASE_KEY: Boolean(
      import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY
    )
  };

  let clientAvailable = false;
  try {
    clientAvailable = Boolean(getSupabaseClient());
  } catch (e) {
    clientAvailable = false;
  }

  return new Response(
    JSON.stringify({ env, clientAvailable, now: new Date().toISOString() }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
};


