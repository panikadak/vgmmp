import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Create client with error handling
let supabase: ReturnType<typeof createClient<Database>> | null = null

try {
  if (isSupabaseConfigured()) {
    supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  } else {
    console.warn('Supabase environment variables not configured')
  }
} catch (error) {
  console.error('Error creating Supabase client:', error)
}

// Export with fallback
export { supabase }

// Create authenticated client for admin operations
export function createAuthenticatedSupabaseClient(accessToken: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }
  
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}

// Fallback client for development
if (!supabase && typeof window !== 'undefined') {
  console.warn('Using fallback Supabase client - some features may not work')
} 