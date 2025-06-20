import { supabase } from './client'
import { Rating, RatingInsert, RatingSession, RatingSessionInsert } from './types'

// Check if supabase is available
function checkSupabase() {
  if (!supabase) {
    throw new Error('Supabase client not configured')
  }
  return supabase
}

// Generate a unique session ID for the user
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create a session for the user
export async function getOrCreateSession(): Promise<string> {
  try {
    const client = checkSupabase()
    
    // Check if session exists in localStorage
    let sessionId = localStorage.getItem('rating_session_id')
    
    if (!sessionId) {
      sessionId = generateSessionId()
      localStorage.setItem('rating_session_id', sessionId)
    }

    // Create or update session in database
    const sessionData: RatingSessionInsert = {
      session_id: sessionId,
      user_agent: navigator.userAgent,
      last_activity: new Date().toISOString()
    }

    const { error } = await client
      .from('rating_sessions')
      .upsert(sessionData, { 
        onConflict: 'session_id',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Error creating/updating session:', error)
    }

    return sessionId
  } catch (error) {
    console.error('Error in getOrCreateSession:', error)
    // Return a fallback session ID
    return localStorage.getItem('rating_session_id') || generateSessionId()
  }
}

// Check if user has already rated a game
export async function hasUserRatedGame(gameId: string, sessionId: string): Promise<boolean> {
  try {
    const client = checkSupabase()
    
    const { data, error } = await client
      .from('ratings')
      .select('id')
      .eq('game_id', gameId)
      .eq('session_id', sessionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking existing rating:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in hasUserRatedGame:', error)
    return false
  }
}

// Submit or update a rating
export async function submitRating(gameId: string, rating: number): Promise<{ success: boolean; error?: string }> {
  try {
    const client = checkSupabase()
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' }
    }

    // Get session
    const sessionId = await getOrCreateSession()

    // Use the database function to handle everything
    const { data, error } = await client.rpc('submit_game_rating', {
      p_game_id: gameId,
      p_rating: rating,
      p_session_id: sessionId,
      p_user_agent: navigator.userAgent
    })

    if (error) {
      console.error('Error submitting rating:', error)
      return { success: false, error: 'Failed to submit rating' }
    }

    // Parse the JSON response
    const result = data as { success: boolean; error?: string }
    
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to submit rating' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in submitRating:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get user's rating for a game
export async function getUserRating(gameId: string): Promise<number | null> {
  try {
    const client = checkSupabase()
    const sessionId = localStorage.getItem('rating_session_id')
    if (!sessionId) return null

    const { data, error } = await client
      .from('ratings')
      .select('rating')
      .eq('game_id', gameId)
      .eq('session_id', sessionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user rating:', error)
      return null
    }

    return data?.rating || null
  } catch (error) {
    console.error('Error in getUserRating:', error)
    return null
  }
}

// Get game rating statistics
export async function getGameRatingStats(gameId: string): Promise<{
  averageRating: number
  totalRatings: number
  ratingDistribution: { [key: number]: number }
}> {
  try {
    const client = checkSupabase()
    
    // Get game stats from games table
    const { data: gameData, error: gameError } = await client
      .from('games')
      .select('average_rating, total_ratings')
      .eq('id', gameId)
      .single()

    if (gameError) {
      console.error('Error getting game stats:', gameError)
      return { averageRating: 0, totalRatings: 0, ratingDistribution: {} }
    }

    // Get rating distribution
    const { data: ratingsData, error: ratingsError } = await client
      .from('ratings')
      .select('rating')
      .eq('game_id', gameId)

    if (ratingsError) {
      console.error('Error getting ratings distribution:', ratingsError)
      return { 
        averageRating: gameData.average_rating || 0, 
        totalRatings: gameData.total_ratings || 0, 
        ratingDistribution: {} 
      }
    }

    // Calculate distribution
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingsData.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1
    })

    return {
      averageRating: gameData.average_rating || 0,
      totalRatings: gameData.total_ratings || 0,
      ratingDistribution: distribution
    }
  } catch (error) {
    console.error('Error in getGameRatingStats:', error)
    return { averageRating: 0, totalRatings: 0, ratingDistribution: {} }
  }
}

// Get all ratings for a game (admin function)
export async function getGameRatings(gameId: string): Promise<Rating[]> {
  try {
    const client = checkSupabase()
    
    const { data, error } = await client
      .from('ratings')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting game ratings:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getGameRatings:', error)
    return []
  }
} 