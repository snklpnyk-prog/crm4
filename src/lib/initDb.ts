import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    const { data, error } = await supabase.from('leads').select('count').limit(1);

    if (error && error.message.includes('relation "public.leads" does not exist')) {
      console.error('Database tables do not exist. Please run the migration file.');
      console.error('Migration file: supabase/migrations/20251015_create_leads_tables.sql');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database initialization check failed:', error);
    return false;
  }
}
