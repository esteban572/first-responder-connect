import { supabase } from './supabase';
import { Credential, CredentialCreate, CredentialUpdate } from '@/types/credential';

const STORAGE_BUCKET = 'credentials';

/**
 * Get all credentials for the current user
 */
export async function getCredentials(): Promise<Credential[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('user_id', user.id)
    .order('expiration_date', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching credentials:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single credential by ID
 */
export async function getCredentialById(id: string): Promise<Credential | null> {
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching credential:', error);
    return null;
  }

  return data;
}

/**
 * Get public credentials for a user (for showcase view)
 */
export async function getPublicCredentials(userId: string): Promise<Credential[]> {
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .eq('status', 'valid')
    .order('credential_name', { ascending: true });

  if (error) {
    console.error('Error fetching public credentials:', error);
    return [];
  }

  return data || [];
}

/**
 * Get credentials expiring within notification window
 */
export async function getExpiringCredentials(): Promise<Credential[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['expiring_soon', 'expired'])
    .order('expiration_date', { ascending: true });

  if (error) {
    console.error('Error fetching expiring credentials:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new credential
 */
export async function createCredential(credential: CredentialCreate): Promise<Credential | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('credentials')
    .insert({
      ...credential,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating credential:', error);
    return null;
  }

  return data;
}

/**
 * Update an existing credential
 */
export async function updateCredential(id: string, updates: CredentialUpdate): Promise<Credential | null> {
  const { data, error } = await supabase
    .from('credentials')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating credential:', error);
    return null;
  }

  return data;
}

/**
 * Delete a credential
 */
export async function deleteCredential(id: string): Promise<boolean> {
  // First get the credential to check if there's a file to delete
  const credential = await getCredentialById(id);

  if (credential?.document_path) {
    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([credential.document_path]);

    if (storageError) {
      console.error('Error deleting credential document:', storageError);
      // Continue to delete the record even if file deletion fails
    }
  }

  const { error } = await supabase
    .from('credentials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting credential:', error);
    return false;
  }

  return true;
}

/**
 * Upload a credential document
 */
export async function uploadCredentialDocument(
  file: File,
  userId: string
): Promise<{ url: string; path: string } | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading credential document:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error) {
    console.error('Error in uploadCredentialDocument:', error);
    return null;
  }
}

/**
 * Delete a credential document from storage
 */
export async function deleteCredentialDocument(path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Error deleting credential document:', error);
    return false;
  }

  return true;
}

/**
 * Check for expiring credentials and create notifications
 * Call this on login and app visibility change
 */
export async function checkExpiringCredentialsAndNotify(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const expiringCredentials = await getExpiringCredentials();

  for (const credential of expiringCredentials) {
    // Check if notification already exists for this credential
    const notificationType = credential.status === 'expired'
      ? 'credential_expired'
      : 'credential_expiring';

    // Check for existing recent notification (within last 24 hours)
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', notificationType)
      .eq('related_credential_id', credential.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (existingNotifications && existingNotifications.length > 0) {
      continue; // Skip if notification already sent recently
    }

    // Create notification
    const title = credential.status === 'expired'
      ? `${credential.credential_name} has expired`
      : `${credential.credential_name} expires soon`;

    const description = credential.status === 'expired'
      ? `Your ${credential.credential_name} credential expired on ${new Date(credential.expiration_date!).toLocaleDateString()}`
      : `Your ${credential.credential_name} credential expires on ${new Date(credential.expiration_date!).toLocaleDateString()}`;

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: notificationType,
      title,
      description,
      related_credential_id: credential.id,
    });
  }
}

/**
 * Get credential counts by status
 */
export async function getCredentialCounts(): Promise<{ valid: number; expiring_soon: number; expired: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { valid: 0, expiring_soon: 0, expired: 0 };

  const { data, error } = await supabase
    .from('credentials')
    .select('status')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching credential counts:', error);
    return { valid: 0, expiring_soon: 0, expired: 0 };
  }

  const counts = { valid: 0, expiring_soon: 0, expired: 0 };
  for (const credential of data || []) {
    if (credential.status === 'valid') counts.valid++;
    else if (credential.status === 'expiring_soon') counts.expiring_soon++;
    else if (credential.status === 'expired') counts.expired++;
  }

  return counts;
}

/**
 * Get expiring/expired credentials count for badge display
 */
export async function getExpiringCredentialsCount(): Promise<number> {
  const counts = await getCredentialCounts();
  return counts.expiring_soon + counts.expired;
}
