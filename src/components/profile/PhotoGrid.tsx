import { useState } from 'react';
import { Plus, X, Play, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaItem } from '@/types/media';
import { deleteMediaItem } from '@/lib/mediaService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MediaUploadDialog } from './MediaUploadDialog';
import { useAuth } from '@/contexts/AuthContext';

interface PhotoGridProps {
  photos: MediaItem[];
  onMediaUpdated: () => void;
  isOwnProfile?: boolean;
}

export function PhotoGrid({ photos, onMediaUpdated, isOwnProfile = false }: PhotoGridProps) {
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [hoveredMedia, setHoveredMedia] = useState<string | null>(null);

  const handleDeleteClick = (media: MediaItem) => {
    setMediaToDelete(media);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mediaToDelete) return;

    try {
      const success = await deleteMediaItem(mediaToDelete.id);
      if (success) {
        toast.success('Media deleted successfully');
        onMediaUpdated();
      } else {
        toast.error('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media');
    } finally {
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    }
  };

  const canEdit = isOwnProfile && user;

  return (
    <>
      <div className="feed-card p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">Photos & Videos</h3>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Media
            </Button>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No photos or videos yet</p>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadDialogOpen(true)}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Photo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
            {photos.map((media) => (
              <div
                key={media.id}
                className="aspect-square bg-muted overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                onMouseEnter={() => setHoveredMedia(media.id)}
                onMouseLeave={() => setHoveredMedia(null)}
              >
                {media.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={media.caption || 'Photo'}
                    className="w-full h-full object-cover"
                  />
                )}

                {canEdit && hoveredMedia === media.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(media);
                      }}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <MediaUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onMediaUploaded={onMediaUpdated}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {mediaToDelete?.type}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
