import { createClient } from '@supabase/supabase-js';

// These are intentionally public browser settings. Do not put a database password,
// service-role key, or any other server secret in a NEXT_PUBLIC_ variable.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && publishableKey
  ? createClient(url, publishableKey)
  : null;

export const supabaseConfigured = Boolean(supabase);

