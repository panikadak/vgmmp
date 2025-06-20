import { supabase } from './client'
import { Comment, CommentInsert, CommentUpdate } from './types'
import { supabaseAdmin } from './secure-client'
import { createClient } from '@supabase/supabase-js'

// Check if supabase is available
function checkSupabase() {
  if (!supabase) {
    console.warn('Standard Supabase client not configured, using admin client')
    return supabaseAdmin
  }
  return supabase
}

// For authenticated operations, use appropriate client based on operation
function getAuthenticatedClient() {
  return supabaseAdmin // Only for admin operations
}

// For normal user operations, use standard client with RLS
function getUserClient(walletAddress?: string) {
  const client = checkSupabase()
  
  // If wallet address provided, set it in headers for RLS
  if (walletAddress && client) {
    // Create client with wallet address header
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            'x-wallet-address': walletAddress
          }
        }
      }
    )
  }
  
  return client
}

// Create a client with user context for RLS
function createUserContextClient(walletAddress: string) {
  // For normal operations, use standard client
  const client = checkSupabase()
  
  // Set the wallet address in the context for RLS policies
  if (client && walletAddress) {
    // Note: This will work with our current RLS setup
    return client
  }
  
  return supabaseAdmin
}

// Basic profanity filter - common bad words
const PROFANITY_LIST = [
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 'piss',
  'cock', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger',
  'retard', 'gay', 'homo', 'nazi', 'hitler', 'kill yourself', 'kys'
]

// Content sanitization and validation
function sanitizeContent(content: string): string {
  // Remove HTML tags
  const withoutHtml = content.replace(/<[^>]*>/g, '')
  
  // Trim whitespace
  const trimmed = withoutHtml.trim()
  
  // Replace multiple spaces with single space
  const normalized = trimmed.replace(/\s+/g, ' ')
  
  return normalized
}

function containsProfanity(content: string): boolean {
  const lowerContent = content.toLowerCase()
  return PROFANITY_LIST.some(word => lowerContent.includes(word))
}

function validateComment(content: string): { isValid: boolean; error?: string } {
  const sanitized = sanitizeContent(content)
  
  if (!sanitized || sanitized.length === 0) {
    return { isValid: false, error: 'Comment cannot be empty' }
  }
  
  if (sanitized.length > 1000) {
    return { isValid: false, error: 'Comment is too long (max 1000 characters)' }
  }
  
  if (containsProfanity(sanitized)) {
    return { isValid: false, error: 'Comment contains inappropriate language' }
  }
  
  return { isValid: true }
}

// Get comments for a game
export async function getGameComments(gameId: string): Promise<Comment[]> {
  try {
    const client = checkSupabase()
    const { data, error } = await client
      .from('comments')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getGameComments:', error)
    return []
  }
}

// Create a new comment
export async function createComment(
  gameId: string, 
  content: string, 
  walletAddress: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    // Validate content
    const validation = validateComment(content)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const sanitizedContent = sanitizeContent(content)
    
    // Validate gameId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(gameId)) {
      console.error('Invalid gameId format:', gameId)
      return { success: false, error: 'Invalid game ID format' }
    }
    
    // Use normal client for user operations (with RLS protection)
    const client = getUserClient(walletAddress)
    
    const commentData: CommentInsert = {
      game_id: gameId,
      content: sanitizedContent,
      wallet_address: walletAddress
    }
    
    const { data, error } = await client
      .from('comments')
      .insert(commentData)
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      
      // Handle specific errors
      if (error.code === '23503') {
        return { success: false, error: 'Game not found' }
      }
      
      return { success: false, error: `Failed to create comment: ${error.message || JSON.stringify(error)}` }
    }

    return { success: true, comment: data }
  } catch (error) {
    console.error('Error in createComment:', error)
    return { success: false, error: 'Failed to create comment' }
  }
}

// Update a comment
export async function updateComment(
  commentId: string,
  content: string,
  walletAddress: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    // Validate content
    const validation = validateComment(content)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const sanitizedContent = sanitizeContent(content)
    
    // Use normal client for user operations (with RLS protection)
    const client = getUserClient(walletAddress)
    
    // Check ownership in RLS (secure)
    if (!walletAddress) {
      return { success: false, error: 'Wallet address required' }
    }
    
    const updateData: CommentUpdate = {
      content: sanitizedContent,
      updated_at: new Date().toISOString(),
      is_edited: true
    }
    
    const { data, error } = await client
      .from('comments')
      .update(updateData)
      .eq('id', commentId)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error updating comment:', error)
      return { success: false, error: `Failed to update comment: ${error.message || JSON.stringify(error)}` }
    }

    if (!data) {
      return { success: false, error: 'Comment not found or could not be updated' }
    }

    return { success: true, comment: data }
  } catch (error) {
    console.error('Error in updateComment:', error)
    return { success: false, error: 'Failed to update comment' }
  }
}

// Delete a comment
export async function deleteComment(
  commentId: string,
  walletAddress: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Deleting comment:', { commentId, walletAddress })
    
    // Use normal client for user operations (with RLS protection)
    const client = getUserClient(walletAddress)
    
    // Check ownership in RLS (secure)
    if (!walletAddress) {
      return { success: false, error: 'Wallet address required' }
    }
    
    console.log('Attempting to delete comment...')
    const { error } = await client
      .from('comments')
      .delete()
      .eq('id', commentId)

    console.log('Delete result:', { error })

    if (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: `Failed to delete comment: ${error.message || JSON.stringify(error)}` }
    }

    console.log('Comment deleted successfully')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteComment:', error)
    return { success: false, error: 'Failed to delete comment' }
  }
}

// Get comment count for a game
export async function getGameCommentCount(gameId: string): Promise<number> {
  try {
    const client = checkSupabase()
    const { count, error } = await client
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)

    if (error) {
      console.error('Error fetching comment count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error in getGameCommentCount:', error)
    return 0
  }
} 