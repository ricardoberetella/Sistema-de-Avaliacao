// src/supabase.ts
import { createClient } from '@supabase/supabase-client';

// O Vite e a Netlify vão ler essas variáveis automaticamente das configurações que você já tem prontas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
