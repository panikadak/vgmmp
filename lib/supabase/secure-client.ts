import { createClient } from '@supabase/supabase-js'
import { Database } from './types'
import { config } from '@/lib/config'

// Server-side client with service role (full access for admin operations)
export const supabaseAdmin = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey || config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Create authenticated client with user's JWT token
export function createAuthenticatedClient(jwt: string) {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    }
  )
}

// Helper to get the right client based on session
export function getSecureSupabaseClient(session?: { supabaseAccessToken?: string }) {
  if (session?.supabaseAccessToken) {
    return createAuthenticatedClient(session.supabaseAccessToken)
  }
  // Return null for unauthenticated requests - let the calling code decide
  return null
} 