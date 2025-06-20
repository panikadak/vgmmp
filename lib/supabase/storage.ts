import { supabase } from './client'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload an image file to Supabase Storage
 */
export async function uploadGameImage(file: File, gameSlug: string): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size too large (max 10MB)' }
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${gameSlug}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type)

    // Upload file
    const { data, error } = await supabase.storage
      .from('game-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'No data returned from upload' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('game-images')
      .getPublicUrl(data.path)

    console.log('Upload successful:', urlData.publicUrl)

    return { 
      success: true, 
      url: urlData.publicUrl 
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Upload multiple image files
 */
export async function uploadMultipleGameImages(files: File[], gameSlug: string): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  
  console.log(`Starting upload of ${files.length} files for game: ${gameSlug}`)
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`)
    
    const result = await uploadGameImage(file, gameSlug)
    results.push(result)
    
    // Small delay between uploads
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log('Upload results:', results)
  return results
}

/**
 * Delete an image from storage
 */
export async function deleteGameImage(imagePath: string): Promise<boolean> {
  try {
    // Extract path from URL if full URL is provided
    const path = imagePath.includes('/storage/v1/object/public/game-images/') 
      ? imagePath.split('/storage/v1/object/public/game-images/')[1]
      : imagePath

    const { error } = await supabase.storage
      .from('game-images')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * List all images for a specific game
 */
export async function listGameImages(gameSlug: string) {
  try {
    const { data, error } = await supabase.storage
      .from('game-images')
      .list(gameSlug)

    if (error) {
      console.error('List error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('List error:', error)
    return []
  }
} 