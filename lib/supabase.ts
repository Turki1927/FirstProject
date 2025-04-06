import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzopbczkulvliijakfex.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6b3BiY3prdWx2bGlpamFrZmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzA5NTksImV4cCI6MjA1ODcwNjk1OX0.0_OhBYEs2PIakiVrtXn-5Stf83gJpbrEXxCUYEmlsQA'; // 🔁 غيّر هذا

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
