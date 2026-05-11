'use client';

// TARAYICI TARAFI — Sadece Client Component'larda import et.
// API route ve Server Component'larda @/lib/supabase kullan.
//
// @supabase/ssr'ın createBrowserClient'ı Next.js App Router için
// tasarlanmıştır; vanilla createClient'ın EventEmitter/addListener
// hatasını üretmez.
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let instance: SupabaseClient | null = null;

// Singleton — her render'da yeni client açılmasını engeller
export function getSupabaseClient(): SupabaseClient {
  if (!instance) {
    instance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return instance;
}
