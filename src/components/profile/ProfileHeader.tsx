import { useState, useRef } from "react";
import { MapPin, Award, Calendar, Camera, ImagePlus, Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    name: string;
    role: string;
    avatar: string;
    coverImage: string;
    location: string;
    credentials: string[];
    joinDate: string;
    postsCount: number;
    connectionsCount: number;
  };
  children?: ReactNode;
  isOwnProfile?: boolean;
  onAvatarUpload?: (file: File) => Promise<void>;
  onCoverUpload?: (file: File) => Promise<void>;
}

export function ProfileHeader({
  user,
  children,
  isOwnProfile = false,
  onAvatarUpload,
  onCoverUpload,
}: ProfileHeaderProps) {
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isOwnProfile && avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleCoverClick = () => {
    if (isOwnProfile && coverInputRef.current) {
      coverInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAvatarUpload) return;

    setAvatarUploading(true);
    try {
      await onAvatarUpload(file);
    } finally {
      setAvatarUploading(false);
      // Reset input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onCoverUpload) return;

    setCoverUploading(true);
    try {
      await onCoverUpload(file);
    } finally {
      setCoverUploading(false);
      // Reset input
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="feed-card overflow-hidden animate-fade-in">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />

      {/* Cover Image */}
      <div
        className={cn(
          "h-40 md:h-56 bg-gradient-hero relative group",
          isOwnProfile && "cursor-pointer"
        )}
        onClick={handleCoverClick}
      >
        {user.coverImage ? (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
        )}

        {/* Cover upload overlay */}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            {coverUploading ? (
              <div className="bg-black/60 rounded-full p-3">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                <div className="bg-black/60 rounded-full p-3">
                  <ImagePlus className="h-6 w-6 text-white" />
                </div>
                <span className="text-white text-sm font-medium bg-black/60 px-2 py-1 rounded">
                  Change Cover
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4">
        {/* Avatar */}
        <div className="absolute -top-16 left-4">
          <div
            className={cn(
              "relative group",
              isOwnProfile && "cursor-pointer"
            )}
            onClick={handleAvatarClick}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-card object-cover shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-card bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {user.name?.substring(0, 2).toUpperCase() || '??'}
                </span>
              </div>
            )}

            {/* Avatar upload overlay */}
            {isOwnProfile && (
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                {avatarUploading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {children && (
          <div className="flex justify-end gap-2 pt-2 mb-12">
            {children}
          </div>
        )}

        {/* Info */}
        <div className={!children ? "pt-20" : ""}>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground font-medium">{user.role}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {user.joinDate}</span>
            </div>
          </div>

          {/* Credentials */}
          {user.credentials && user.credentials.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {user.credentials.map((cred) => (
                <span
                  key={cred}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium"
                >
                  <Award className="h-3 w-3" />
                  {cred}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-border">
            <div>
              <span className="font-bold text-lg">{user.postsCount}</span>
              <span className="text-sm text-muted-foreground ml-1">Posts</span>
            </div>
            <div>
              <span className="font-bold text-lg">{user.connectionsCount}</span>
              <span className="text-sm text-muted-foreground ml-1">Connections</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
