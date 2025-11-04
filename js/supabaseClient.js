// js/supabaseClient.js

const SUPABASE_URL = 'https://umnahyousgddxyfwopsq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbmFoeW91c2dkZHh5ZndvcHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTMyMjUsImV4cCI6MjA3NzIyOTIyNX0.hm4SZ83OWmBAibe-TUlM1myvBwZTSsymvJk-BtWXmVI';

// 🔒 Verificación de seguridad: confirma que el CDN de Supabase está disponible
if (typeof supabase === 'undefined') {
    throw new Error('❌ Supabase no está disponible. Verifica que el script CDN se haya cargado en index.html');
}

// Crear el cliente de Supabase
const { createClient } = supabase;
export const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
