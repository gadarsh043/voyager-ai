import { supabase } from './supabase'

const AVATARS_BUCKET = 'avatars'

/**
 * Upload a profile image and return its public URL.
 * Uses path {userId}/avatar.{ext} so each user has one avatar (upsert).
 * Requires a public bucket named "avatars" in Supabase Storage.
 */
export async function uploadAvatar(userId, file) {
  if (!userId || !file?.type?.startsWith('image/')) {
    throw new Error('Invalid user or file; image required')
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
  const path = `${userId}/avatar.${safeExt}`

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) {
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('bucket') && (msg.includes('not found') || msg.includes('missing'))) {
      throw new Error(
        "Storage bucket 'avatars' not found. In Supabase Dashboard go to Storage → New bucket → name: avatars → set Public → Save."
      )
    }
    throw error
  }

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}