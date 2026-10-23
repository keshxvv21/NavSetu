import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Automatically load environment variables from .env.local or .env in Node runtime
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

let _client: SupabaseClient | null = null;

/**
 * Returns the lazily initialized server-side Supabase client.
 * Uses the privileged service key. Never import in client components.
 */
export const getServiceClient = (): SupabaseClient => {
  if (!_client) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local'
      );
    }
    _client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _client;
};

/**
 * Lazy proxy to SupabaseClient instance.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getServiceClient();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
