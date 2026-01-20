// Create Group Dialog
// Modal for creating a new group

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createGroup, isGroupSlugAvailable } from '@/lib/groupService';
import { GroupVisibility } from '@/types/group';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: (groupId: string) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onGroupCreated,
}: CreateGroupDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<GroupVisibility>('public');
  const [isCreating, setIsCreating] = useState(false);
  const [slugError, setSlugError] = useState('');

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    const newSlug = generateSlug(value);
    setSlug(newSlug);
    setSlugError('');
  };

  const handleSlugChange = (value: string) => {
    const sanitized = generateSlug(value);
    setSlug(sanitized);
    setSlugError('');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (!slug.trim()) {
      toast.error('Please enter a URL slug');
      return;
    }

    setIsCreating(true);

    // Check if slug is available
    const available = await isGroupSlugAvailable(slug);
    if (!available) {
      setSlugError('This URL is already taken');
      setIsCreating(false);
      return;
    }

    const group = await createGroup({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      visibility,
    });

    setIsCreating(false);

    if (group) {
      toast.success('Group created successfully');
      onOpenChange(false);
      onGroupCreated?.(group.id);
      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setVisibility('public');
    } else {
      toast.error('Failed to create group');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
          <DialogDescription>
            Create a space for your community to connect and share.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Metro Fire Department"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/groups/</span>
              <Input
                id="slug"
                placeholder="metro-fire-department"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={slugError ? 'border-destructive' : ''}
              />
            </div>
            {slugError && (
              <p className="text-xs text-destructive">{slugError}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as GroupVisibility)}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex flex-col items-start">
                    <span>Public</span>
                    <span className="text-xs text-muted-foreground">
                      Anyone can find and join this group
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex flex-col items-start">
                    <span>Private</span>
                    <span className="text-xs text-muted-foreground">
                      Only invited members can join
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
            {isCreating ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
