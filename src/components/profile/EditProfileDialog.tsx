import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { upsertUserProfile } from '@/lib/userService';
import { toast } from 'sonner';
import { UserProfile } from '@/types/user';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().optional(),
  avatar_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  cover_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  credentials: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile | null;
  onProfileUpdated: () => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const { user } = useAuth();
  const [credentialInput, setCredentialInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      role: '',
      location: '',
      bio: '',
      avatar_url: '',
      cover_image_url: '',
      credentials: [],
    },
  });

  const credentials = watch('credentials');

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        role: profile.role || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        cover_image_url: profile.cover_image_url || '',
        credentials: profile.credentials || [],
      });
    } else if (user) {
      // Initialize with auth user data
      reset({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        role: '',
        location: '',
        bio: '',
        avatar_url: user.user_metadata?.avatar_url || '',
        cover_image_url: '',
        credentials: [],
      });
    }
  }, [profile, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await upsertUserProfile(data);
      toast.success('Profile updated successfully!');
      onProfileUpdated();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    }
  };

  const addCredential = () => {
    if (credentialInput.trim() && !credentials.includes(credentialInput.trim())) {
      setValue('credentials', [...credentials, credentialInput.trim()]);
      setCredentialInput('');
    }
  };

  const removeCredential = (cred: string) => {
    setValue(
      'credentials',
      credentials.filter((c) => c !== cred)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information to help others find and connect with you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="John Doe"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role/Title</Label>
            <Input
              id="role"
              {...register('role')}
              placeholder="Flight Nurse, CCRN"
            />
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <LocationAutocomplete
              value={watch('location')}
              onChange={(value) => setValue('location', value)}
              placeholder="Start typing a city..."
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell others about yourself..."
              rows={4}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              {...register('avatar_url')}
              placeholder="https://example.com/avatar.jpg"
            />
            {errors.avatar_url && (
              <p className="text-sm text-destructive">{errors.avatar_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL</Label>
            <Input
              id="cover_image_url"
              {...register('cover_image_url')}
              placeholder="https://example.com/cover.jpg"
            />
            {errors.cover_image_url && (
              <p className="text-sm text-destructive">{errors.cover_image_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Credentials</Label>
            <div className="flex gap-2">
              <Input
                value={credentialInput}
                onChange={(e) => setCredentialInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCredential();
                  }
                }}
                placeholder="e.g., CCRN, CEN, FP-C"
              />
              <Button type="button" onClick={addCredential} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {credentials.map((cred) => (
                <Badge key={cred} variant="secondary" className="gap-1">
                  {cred}
                  <button
                    type="button"
                    onClick={() => removeCredential(cred)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
