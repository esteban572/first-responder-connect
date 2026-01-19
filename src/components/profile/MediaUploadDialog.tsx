import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image as ImageIcon, Video, X } from 'lucide-react';
import { uploadMedia, addMediaItem } from '@/lib/mediaService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaUploaded: () => void;
}

export function MediaUploadDialog({
  open,
  onOpenChange,
  onMediaUploaded,
}: MediaUploadDialogProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error('Please select only image or video files');
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    const fileId = files[index]?.name;
    if (fileId) {
      setCaptions((prev) => {
        const newCaptions = { ...prev };
        delete newCaptions[fileId];
        return newCaptions;
      });
    }
  };

  const handleCaptionChange = (fileId: string, caption: string) => {
    setCaptions((prev) => ({ ...prev, [fileId]: caption }));
  };

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        // Upload file to storage
        const uploadResult = await uploadMedia(file, user.id);
        if (!uploadResult) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Determine file type
        const isVideo = file.type.startsWith('video/');
        const type = isVideo ? ('video' as const) : ('photo' as const);

        // Add to database
        await addMediaItem({
          url: uploadResult.url,
          type,
          caption: captions[file.name] || undefined,
        });
      }

      toast.success(`Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}`);
      setFiles([]);
      setCaptions({});
      onMediaUploaded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFilePreview = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Photos & Videos</DialogTitle>
          <DialogDescription>
            Add photos and videos to your profile wall. You can upload multiple files at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <Label htmlFor="media-upload">Select Files</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                id="media-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: Images (JPG, PNG, GIF) and Videos (MP4, MOV, etc.)
              </p>
            </div>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div className="space-y-4">
              <Label>Selected Files ({files.length})</Label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      {file.type.startsWith('image/') ? (
                        <div className="w-20 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={getFilePreview(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                              {file.type.startsWith('image/') ? (
                                <ImageIcon className="inline h-3 w-3" />
                              ) : (
                                <Video className="inline h-3 w-3" />
                              )}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <Textarea
                          placeholder="Add a caption (optional)"
                          value={captions[file.name] || ''}
                          onChange={(e) => handleCaptionChange(file.name, e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFiles([]);
              setCaptions({});
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
