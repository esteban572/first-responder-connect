// Group Detail Page
// Shows a single group with header, members, and activity

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GroupHeader } from '@/components/groups/GroupHeader';
import { GroupMembersList } from '@/components/groups/GroupMembersList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Users } from 'lucide-react';
import { Group } from '@/types/group';
import { getGroup } from '@/lib/groupService';
import { toast } from 'sonner';

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    if (!groupId) return;

    setLoading(true);
    const data = await getGroup(groupId);

    if (!data) {
      toast.error('Group not found');
      navigate('/groups');
      return;
    }

    setGroup(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-4 md:py-6">
          <div className="px-4 md:px-0">
            <div className="feed-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading group...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-4 md:py-6">
          <div className="px-4 md:px-0">
            <div className="feed-card p-8 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Group Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This group may have been deleted or you don't have access.
              </p>
              <Link to="/groups">
                <Button>Browse Groups</Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Check if user can view this group
  const canView = group.visibility === 'public' || group.membership;

  if (!canView) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-4 md:py-6">
          <div className="px-4 md:px-0">
            <Link
              to="/groups"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Link>

            <div className="feed-card p-8 text-center">
              <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Private Group</h2>
              <p className="text-muted-foreground mb-4">
                This group is private. You need an invitation to join.
              </p>
              <Link to="/groups">
                <Button>Browse Public Groups</Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 md:py-6">
        <div className="px-4 md:px-0 space-y-4">
          {/* Back Link */}
          <Link
            to="/groups"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>

          {/* Group Header */}
          <GroupHeader group={group} onRefresh={loadGroup} />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4">
              {/* Activity Feed Placeholder */}
              <div className="feed-card p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Group Activity</h3>
                <p className="text-sm text-muted-foreground">
                  {group.membership
                    ? 'Posts and discussions will appear here. This feature is coming soon!'
                    : 'Join this group to see activity and participate in discussions.'}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Members List */}
              {group.membership && <GroupMembersList group={group} />}

              {/* Group Info */}
              <div className="feed-card p-4">
                <h3 className="font-semibold mb-3">About</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created by</span>
                    <span className="font-medium">
                      {group.owner?.full_name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Visibility</span>
                    <span className="capitalize">{group.visibility}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Members</span>
                    <span>{group.member_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
