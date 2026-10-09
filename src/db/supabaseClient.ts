import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Vite client environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const supabase: SupabaseClient | null = clientInstance;

export interface ConnectionHealth {
  status: 'ok' | 'error' | 'unconfigured';
  database: 'connected' | 'disconnected' | 'unconfigured';
  provider: 'supabase' | 'local_sqlite';
  latencyMs?: number;
  message?: string;
  url?: string;
}

/**
 * Safe connection health check suitable for production & Vercel
 * Never exposes credentials or sensitive secrets.
 */
export async function checkDatabaseConnection(): Promise<ConnectionHealth> {
  if (!isSupabaseConfigured() || !clientInstance) {
    return {
      status: 'unconfigured',
      database: 'unconfigured',
      provider: 'local_sqlite',
      message: 'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. Running in local fallback mode.',
    };
  }

  const start = performance.now();
  try {
    // Perform a lightweight probe query against system_settings or shifts
    const { data, error } = await clientInstance
      .from('system_settings')
      .select('key')
      .limit(1);

    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      // If table doesn't exist yet, try shifts
      const { error: shiftErr } = await clientInstance
        .from('shifts')
        .select('id')
        .limit(1);

      if (shiftErr) {
        return {
          status: 'error',
          database: 'disconnected',
          provider: 'supabase',
          latencyMs,
          message: `Database connected but tables not found: ${error.message || shiftErr.message}. Please run the SQL migration.`,
        };
      }
    }

    return {
      status: 'ok',
      database: 'connected',
      provider: 'supabase',
      latencyMs,
      message: 'Successfully connected to Supabase PostgreSQL production database.',
      url: supabaseUrl.replace(/https?:\/\//, '').split('.')[0] + '...supabase.co',
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: 'error',
      database: 'disconnected',
      provider: 'supabase',
      latencyMs,
      message: err?.message || 'Network error reaching database endpoint.',
    };
  }
}
