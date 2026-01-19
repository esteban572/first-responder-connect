# Supabase Storage Setup Guide

## Setting Up the Storage Bucket

To enable photo and video uploads, you need to create a storage bucket in Supabase:

### 1. Create the Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `profile-media`
   - **Public bucket**: ✅ Check this (so images/videos are publicly accessible)
   - **File size limit**: Set as needed (e.g., 10MB for images, 50MB for videos)
   - **Allowed MIME types**: 
     - For images: `image/*`
     - For videos: `video/*`
     - Or leave empty to allow all types

5. Click **Create bucket**

### 2. Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security policies:

1. Go to **Storage** → **Policies** → Select `profile-media` bucket
2. Click **New Policy**
3. Create the following policies:

#### Policy 1: Allow authenticated users to upload
- **Policy name**: "Users can upload their own media"
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 2: Allow users to view all media
- **Policy name**: "Anyone can view media"
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
bucket_id = 'profile-media'
```

#### Policy 3: Allow users to delete their own media
- **Policy name**: "Users can delete their own media"
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]
```

### 3. Alternative: Use SQL Editor

You can also set up policies using SQL:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view media
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## File Structure

Files are stored in the following structure:
```
profile-media/
  {user_id}/
    {timestamp}-{random}.{extension}
```

Example:
```
profile-media/
  abc123-def456-ghi789/
    1704067200000-a1b2c3.jpg
    1704067300000-d4e5f6.mp4
```

## Troubleshooting

### "Bucket does not exist" error
- Make sure you've created the `profile-media` bucket
- Check that the bucket name matches exactly (case-sensitive)

### "Permission denied" error
- Verify that the storage policies are set up correctly
- Make sure the user is authenticated
- Check that the bucket is set to public if you want public access

### Files not uploading
- Check file size limits
- Verify MIME type restrictions
- Check browser console for detailed error messages

### Files not displaying
- Ensure the bucket is set to public
- Check that the URL is correct
- Verify CORS settings if accessing from a different domain
