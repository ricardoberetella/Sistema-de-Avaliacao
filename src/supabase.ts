// src/supabase.ts
import { createClient } from '@supabase/supabase-client';

// Puxa as variáveis de ambiente configuradas na Netlify
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
