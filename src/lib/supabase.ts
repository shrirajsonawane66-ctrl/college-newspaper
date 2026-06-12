import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

export function getSupabase(): SupabaseClient {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createBrowserClient(url, key)
}

const STORAGE_BUCKET = 'article-images'

export async function uploadArticleThumbnail(file: File): Promise<string> {
  const supabase = getSupabase()
  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
  const filePath = `articles/${fileName}`

  console.log(`[uploadArticleThumbnail] Uploading to "${STORAGE_BUCKET}" path "${filePath}"`, {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  })

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    console.error('[uploadArticleThumbnail] Upload failed:', error)
    throw new Error(`Failed to upload thumbnail: ${error.message}`)
  }

  console.log('[uploadArticleThumbnail] Upload success:', data)

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath)

  console.log('[uploadArticleThumbnail] Public URL:', urlData.publicUrl)

  return urlData.publicUrl
}
