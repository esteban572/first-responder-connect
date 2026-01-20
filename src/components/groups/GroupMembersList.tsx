// Group Members List Component
// Displays members of a group with management options

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, UserMinus, Ban, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Group, GroupMember, GroupMemberRole } from '@/types/group';
import {
  getGroupMembers,
  updateMemberRole,
  removeMember,
  banMember,
} from '@/lib/groupService';

interface GroupMembersListProps {
  group: Group;
}

export function GroupMembersList({ group }: GroupMembersListProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = group.membership?.role === 'owner' || group.membership?.role === 'admin';

  useEffect(() => {
    loadMembers();
  }, [group.id]);

  const loadMembers = async () => {
    setLoading(true);
    const data = await getGroupMembers(group.id);
    setMembers(data);
    setLoading(false);
  };

  const handleRoleChange = async (memberId: string, role: GroupMemberRole) => {
    const success = await updateMemberRole(group.id, memberId, role);
    if (success) {
      toast.success('Member role updated');
      loadMembers();
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (memberId: string) => {
    const success = await removeMember(group.id, memberId);
    if (success) {
      toast.success('Member removed');
      loadMembers();
    } else {
      toast.error('Failed to remove member');
    }
  };

  const handleBan = async (memberId: string) => {
    const success = await banMember(group.id, memberId);
    if (success) {
      toast.success('Member banned');
      loadMembers();
    } else {
      toast.error('Failed to ban member');
    }
  };

  const getRoleBadge = (role: GroupMemberRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Owner
          </span>
        );
      case 'admin':
        return (
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
            Moderator
          </span>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="feed-card p-4">
        <h3 className="font-semibold mb-4">Members</h3>
        <div className="text-center py-8 text-muted-foreground">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="feed-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Members ({members.length})</h3>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50"
          >
            <Link
              to={`/user/${member.user_id}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.user?.avatar_url || undefined} />
                <AvatarFallback>{getInitials(member.user?.full_name || null)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {member.user?.full_name || 'Unknown'}
                </p>
                {member.user?.role && (
                  <p className="text-xs text-muted-foreground truncate">{member.user.role}</p>
                )}
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {getRoleBadge(member.role)}

              {isAdmin && member.role !== 'owner' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role !== 'admin' && (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                    )}
                    {member.role !== 'moderator' && (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'moderator')}>
                        Make Moderator
                      </DropdownMenuItem>
                    )}
                    {member.role !== 'member' && (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                        Make Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleRemove(member.id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleBan(member.id)}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No members yet</div>
      )}
    </div>
  );
}
