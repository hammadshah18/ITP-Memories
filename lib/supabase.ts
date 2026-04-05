import { createClient } from '@supabase/supabase-js'

export const SUPABASE_AUTH_COOKIE = 'sb-access-token'

function getSupabaseEnv() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return { supabaseUrl, supabaseAnonKey }
}

export function createSupabaseServerClient(accessToken?: string) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

let browserClient: ReturnType<typeof createClient> | null = null

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
  browserClient = createClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}
