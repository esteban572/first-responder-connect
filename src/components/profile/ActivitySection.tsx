import { Link } from 'react-router-dom';
import { Activity } from '@/lib/activityService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Heart, MessageCircle, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivitySectionProps {
  activities: Activity[];
}

const activityIcons = {
  connection: UserPlus,
  like: Heart,
  comment: MessageCircle,
  post: FileText,
};

const activityColors = {
  connection: 'bg-green-500/10 text-green-500',
  like: 'bg-destructive/10 text-destructive',
  comment: 'bg-primary/10 text-primary',
  post: 'bg-accent/10 text-accent',
};

export function ActivitySection({ activities }: ActivitySectionProps) {
  if (activities.length === 0) {
    return (
      <div className="feed-card p-6">
        <h3 className="font-bold text-base mb-4">Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className="feed-card">
      <h3 className="font-bold text-base p-4 pb-2">Activity</h3>
      <div className="divide-y divide-border">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || FileText;
          const colorClass = activityColors[activity.type] || 'bg-muted text-muted-foreground';

          return (
            <div key={activity.id} className="flex items-center gap-3 p-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  {activity.description}
                  {activity.related_user && (
                    <>
                      {' '}
                      <Link
                        to={`/user/${activity.related_user.id}`}
                        className="font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {activity.related_user.full_name}
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              {activity.related_user && (
                <Link to={`/user/${activity.related_user.id}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.related_user.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {activity.related_user.full_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
