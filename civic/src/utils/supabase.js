// ============================================
// Supabase Client
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_PROJECT_ID')) {
  console.error(
    'Supabase credentials not configured. Please update .env with your Supabase URL and Anon Key.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for issue images
export const STORAGE_BUCKET = 'reports-images';
