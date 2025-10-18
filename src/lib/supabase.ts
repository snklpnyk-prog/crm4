import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cugdqifdxmcqrqvokaes.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z2RxaWZkeG1jcXJxdm9rYWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjExMjUsImV4cCI6MjA3NjA5NzEyNX0.iPNrBDwznV8VO9oz9YmcEabDVWIFY69MUp-gId4DXfk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
