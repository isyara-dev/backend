import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

// Client untuk operasi yang membutuhkan service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Client untuk operasi biasa
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase, supabaseAdmin };