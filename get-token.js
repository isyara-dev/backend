import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getToken() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'coba@coba.com', // Ganti dengan email user yang sudah Anda buat
      password: 'coba123' // Ganti dengan password user
    });

    if (error) {
      console.error('Error signing in:', error);
      return;
    }

    console.log('Access Token:', data.session.access_token);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

getToken();
