import { MapPin, Award, Calendar } from "lucide-react";
import { ReactNode } from "react";

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
}

export function ProfileHeader({ user, children }: ProfileHeaderProps) {
  return (
    <div className="feed-card overflow-hidden animate-fade-in">
      {/* Cover Image */}
      <div className="h-32 md:h-44 bg-gradient-hero relative">
        <img
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4">
        {/* Avatar */}
        <div className="absolute -top-12 left-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-card object-cover"
          />
        </div>

        {/* Actions */}
        {children && (
          <div className="flex justify-end gap-2 pt-2 mb-8">
            {children}
          </div>
        )}

        {/* Info */}
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground font-medium">{user.role}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {user.joinDate}</span>
            </div>
          </div>

          {/* Credentials */}
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
