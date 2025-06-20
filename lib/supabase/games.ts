import { supabase } from './client'
import { supabaseAdmin, createAuthenticatedClient } from './secure-client'
import { Game, GameInsert, GameUpdate } from './types'
import { isAuthorizedAdmin } from '@/lib/config'

// Check if supabase is available
function checkSupabase() {
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }
  return supabase
}

// Get appropriate client for admin operations
function getClientForAdmin(walletAddress?: string, supabaseAccessToken?: string) {
  if (walletAddress && isAuthorizedAdmin(walletAddress)) {
    console.log('Using admin client for authorized wallet:', walletAddress)
    
    if (supabaseAccessToken) {
      // Use authenticated client with Supabase JWT token (preferred for RLS)
      console.log('Using authenticated Supabase client with JWT token')
      return createAuthenticatedClient(supabaseAccessToken)
    } else {
      // Fallback to service role client
      console.log('Using service role client as fallback')
      return supabaseAdmin
    }
  }
  // Use regular client for non-admin operations
  return checkSupabase()
}

// Get all games
export async function getAllGames() {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching games:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllGames:', error)
    return []
  }
}

// Get all games for admin (including inactive)
export async function getAllGamesForAdmin() {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching games for admin:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllGamesForAdmin:', error)
    return []
  }
}

// Get game by slug
export async function getGameBySlug(slug: string) {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('games')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      // Only log if it's not a "no rows" error (which is expected for invalid slugs)
      if (error.code !== 'PGRST116') {
        console.error('Error fetching game:', error)
      }
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getGameBySlug:', error)
    return null
  }
}

// Get games by category
export async function getGamesByCategory(category: string) {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('games')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching games by category:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getGamesByCategory:', error)
    return []
  }
}

// Search games
export async function searchGames(query: string) {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('games')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,source.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching games:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in searchGames:', error)
    return []
  }
}

// Create a new game
export async function createGame(game: GameInsert, walletAddress?: string, supabaseAccessToken?: string) {
  try {
    // Use appropriate client based on wallet authorization
    const client = getClientForAdmin(walletAddress, supabaseAccessToken)
    
    const { data, error } = await client
      .from('games')
      .insert(game)
      .select()
      .single()

    if (error) {
      console.error('Error creating game:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error: error
      })
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createGame:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error,
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

// Update a game
export async function updateGame(id: string, updates: GameUpdate, walletAddress?: string, supabaseAccessToken?: string) {
  try {
    // Debug logging
    console.log('updateGame called with:', { id, updates, walletAddress, hasToken: !!supabaseAccessToken })
    
    // Use appropriate client based on wallet authorization
    const client = getClientForAdmin(walletAddress, supabaseAccessToken)
    
    // First, check if the game exists
    console.log('Checking if game exists...')
    const { data: existingGame, error: checkError } = await client
      .from('games')
      .select('*')
      .eq('id', id)
      .single()
    
    console.log('Game exists check:', { existingGame, checkError })
    
    if (checkError && checkError.code === 'PGRST116') {
      throw new Error(`Game with ID ${id} not found`)
    }
    
    // Test the admin function if available
    try {
      console.log('Testing admin authorization function...')
      
      // Try v3 first, then fallback to v2
      let { data: adminCheck, error: adminError } = await client
        .rpc('is_authorized_admin_v3')
      
      if (adminError && adminError.message?.includes('function')) {
        console.log('v3 function not found, trying v2...')
        const result = await client.rpc('is_authorized_admin_v2')
        adminCheck = result.data
        adminError = result.error
      }
      
      console.log('Admin check result:', { adminCheck, adminError })
      console.log('Admin check value:', adminCheck)
      console.log('Is admin check true?', adminCheck === true)
      console.log('Admin check type:', typeof adminCheck)
      
      // Debug function removed for production security
    } catch (err) {
      console.log('Admin function test failed (expected if migration not applied):', err)
    }
    
    console.log('About to execute Supabase update query')
    
    // Try without .single() first to see if update works
    const { data: updateData, error: updateError } = await client
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
    
    console.log('Update without .single():', { updateData, updateError })
    
    // If update succeeded but returned multiple/no rows, handle it
    if (!updateError && updateData) {
      if (updateData.length === 0) {
        throw new Error(`No rows were updated. Game with ID ${id} may not exist or access was denied.`)
      } else if (updateData.length === 1) {
        console.log('Update successful, returning single row')
        return updateData[0]
      } else {
        console.log('Update returned multiple rows, returning first one')
        return updateData[0]
      }
    }
    
    // If there was an error, use the original approach
    const { data, error } = await client
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    console.log('Supabase update result:', { data, error })

    if (error) {
      // More robust error logging
      console.error('Error updating game - Supabase error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      console.error('Error message:', error?.message)
      console.error('Error code:', error?.code)
      console.error('Error details field:', error?.details)
      throw error
    }

    return data
  } catch (error) {
    // More robust error logging
    console.error('Error in updateGame - caught error:', error)
    console.error('Error type:', typeof error)
    console.error('Error constructor:', error?.constructor?.name)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    try {
      console.error('Error JSON:', JSON.stringify(error, null, 2))
    } catch (e) {
      console.error('Could not stringify error:', e)
    }
    throw error
  }
}

// Delete a game (soft delete by setting is_active to false)
export async function deleteGame(id: string, walletAddress?: string, supabaseAccessToken?: string) {
  try {
    // Use appropriate client based on wallet authorization
    const client = getClientForAdmin(walletAddress, supabaseAccessToken)
    
    const { data, error } = await client
      .from('games')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting game:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error: error
      })
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in deleteGame:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error,
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

// Get unique categories
export async function getCategories() {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('games')
      .select('category')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    // Get unique categories
    const uniqueCategories = [...new Set(data?.map((item: { category: string }) => item.category) || [])]
    return uniqueCategories.sort()
  } catch (error) {
    console.error('Error in getCategories:', error)
    return []
  }
}

// Get game counts by category
export async function getCategoryCounts() {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('games')
      .select('category')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching category counts:', error)
      return {}
    }

    // Count games by category
    const counts: Record<string, number> = {}
    data?.forEach((game: { category: string }) => {
      counts[game.category] = (counts[game.category] || 0) + 1
    })

    // Debug: log actual categories from database
    console.log('Actual categories from database:', Object.keys(counts))
    console.log('Category counts:', counts)

    return counts
  } catch (error) {
    console.error('Error in getCategoryCounts:', error)
    return {}
  }
}

// Increment plays count for a game
export async function incrementGamePlays(gameId: string) {
  try {
    const client = checkSupabase()
    
    // Use the database function to increment plays
    const { data, error } = await client.rpc('increment_game_plays', {
      game_id: gameId
    })

    if (error) {
      console.error('Error incrementing game plays:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error in incrementGamePlays:', error)
    throw error
  }
}

// Get games by category excluding a specific game
export async function getGamesByCategoryExcluding(category: string, excludeGameId: string) {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('games')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .neq('id', excludeGameId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching games by category:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getGamesByCategoryExcluding:', error)
    return []
  }
} 