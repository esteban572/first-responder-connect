import { Plus, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreatePostDialog } from "./CreatePostDialog";
import { useAuth } from "@/contexts/AuthContext";

interface CreatePostButtonProps {
  onPostCreated?: () => void;
}

export function CreatePostButton({ onPostCreated }: CreatePostButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  const handlePostCreated = () => {
    onPostCreated?.();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="feed-card p-4 mx-4 md:mx-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Share from the field..."
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none cursor-pointer"
              readOnly
              onClick={() => setDialogOpen(true)}
            />
          </div>
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90 text-white gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Post</span>
          </Button>
        </div>
      </div>

      <CreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}
