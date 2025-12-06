
import { createClient } from '@supabase/supabase-js';

// Credenciais do Projeto Supabase
const SUPABASE_URL = 'https://jciyukggacavhdfzahtn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaXl1a2dnYWNhdmhkZnphaHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2Mjc4ODgsImV4cCI6MjA3NjIwMzg4OH0.3dJrjr4r-TMOi6lurNFJi6l_d6GHEupy-kkt0YkYtWk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
