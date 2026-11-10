import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
// Reject privileged keys even if they are accidentally supplied as build variables.
function isPublicKey(value: string | undefined) {
  if (!value || value.startsWith('sb_secret_')) return false;
  if (value.startsWith('sb_publishable_')) return true;
  try { return JSON.parse(atob(value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'anon'; } catch { return false; }
}
export const supabase = url && /^https:\/\//.test(url) && isPublicKey(key)
  ? createClient(url, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null;
export function requireSupabase() {
  if (!supabase) throw new Error('Подключение каталога ещё не настроено.');
  return supabase;
}
export const IMAGE_BUCKET = 'product-images';
