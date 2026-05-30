import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/** True when real Supabase credentials are present (live multi-user mode). */
export const CLOUD = Boolean(url && key)

/** The Supabase client, or null in offline-demo mode. */
export const sb: SupabaseClient | null = CLOUD ? createClient(url!, key!) : null
