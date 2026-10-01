import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const configured = Boolean(url && key)
export const SUPABASE_URL = url || 'https://placeholder.supabase.co'
export const SUPABASE_KEY = key || 'placeholder-key'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Convierte la respuesta de Supabase en datos o lanza el error
export async function q<T = any>(p: PromiseLike<{ data: T; error: any }>): Promise<T> {
  const { data, error } = await p
  if (error) throw error
  return data
}
