// Group Card Component
// Displays a group in list/grid format

import { Link } from 'react-router-dom';
import { Users, Lock, Globe } from 'lucide-react';
import { Group } from '@/types/group';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link to={`/groups/${group.id}`}>
      <article className="feed-card overflow-hidden hover:shadow-md transition-shadow">
        {/* Cover Image */}
        <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 relative">
          {group.cover_image_url && (
            <img
              src={group.cover_image_url}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          )}
          {/* Visibility Badge */}
          <div className="absolute top-2 right-2">
            {group.visibility === 'private' ? (
              <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Private
              </span>
            ) : (
              <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Public
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1 truncate">{group.name}</h3>

          {group.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {group.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{group.member_count} {group.member_count === 1 ? 'member' : 'members'}</span>
            </div>

            {group.membership && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                {group.membership.role}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
