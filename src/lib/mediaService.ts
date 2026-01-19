import { supabase } from './supabase';
import { MediaItem, MediaItemCreate } from '@/types/media';

const STORAGE_BUCKET = 'profile-media';

/**
 * Initialize storage bucket (run once in Supabase dashboard)
 */
export async function initializeStorageBucket() {
  // This should be done in Supabase dashboard, but we can check if it exists
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
    return false;
  }

  const bucketExists = data?.some((bucket) => bucket.name === STORAGE_BUCKET);
  if (!bucketExists) {
    console.warn(`Bucket ${STORAGE_BUCKET} does not exist. Please create it in Supabase dashboard.`);
  }
  return bucketExists;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadMedia(
  file: File,
  userId: string
): Promise<{ url: string; path: string } | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Determine file type
    const isVideo = file.type.startsWith('video/');
    const type = isVideo ? 'video' : 'photo';

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    return null;
  }
}

/**
 * Get all media for a user
 */
export async function getUserMedia(userId: string): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user media:', error);
    return [];
  }

  return data || [];
}

/**
 * Get current user's media
 */
export async function getCurrentUserMedia(): Promise<MediaItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return getUserMedia(user.id);
}

/**
 * Add media item to database
 */
export async function addMediaItem(media: MediaItemCreate): Promise<MediaItem | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('media')
    .insert({
      user_id: user.id,
      ...media,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding media item:', error);
    throw error;
  }

  return data;
}

/**
 * Delete media item
 */
export async function deleteMediaItem(mediaId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get media item to find file path
  const { data: mediaItem, error: fetchError } = await supabase
    .from('media')
    .select('url')
    .eq('id', mediaId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !mediaItem) {
    console.error('Error fetching media item:', fetchError);
    return false;
  }

  // Extract path from URL
  // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
  try {
    const url = new URL(mediaItem.url);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf(STORAGE_BUCKET);
    
    if (bucketIndex === -1) {
      // Try alternative: path might be after 'public'
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
        const filePath = pathParts.slice(publicIndex + 2).join('/');
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      }
    } else {
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue to delete from database even if storage delete fails
      }
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
    // Continue to delete from database
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId)
    .eq('user_id', user.id);

  if (dbError) {
    console.error('Error deleting media item:', dbError);
    return false;
  }

  return true;
}

/**
 * Update media caption
 */
export async function updateMediaCaption(
  mediaId: string,
  caption: string
): Promise<MediaItem | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('media')
    .update({ caption })
    .eq('id', mediaId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating media caption:', error);
    throw error;
  }

  return data;
}
