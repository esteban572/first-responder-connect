// Group Header Component
// Displays group info and actions at the top of the group detail page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Users,
  Lock,
  Globe,
  Settings,
  LogOut,
  UserPlus,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Group } from '@/types/group';
import { joinGroup, leaveGroup, requestToJoin, deleteGroup } from '@/lib/groupService';

interface GroupHeaderProps {
  group: Group;
  onRefresh: () => void;
}

export function GroupHeader({ group, onRefresh }: GroupHeaderProps) {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMember = !!group.membership;
  const isOwner = group.membership?.role === 'owner';
  const isAdmin = group.membership?.role === 'owner' || group.membership?.role === 'admin';

  const handleJoin = async () => {
    setIsJoining(true);

    if (group.visibility === 'public') {
      const success = await joinGroup(group.id);
      if (success) {
        toast.success('You have joined the group');
        onRefresh();
      } else {
        toast.error('Failed to join group');
      }
    } else {
      const success = await requestToJoin(group.id);
      if (success) {
        toast.success('Join request sent');
        onRefresh();
      } else {
        toast.error('Failed to send join request');
      }
    }

    setIsJoining(false);
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    const success = await leaveGroup(group.id);
    setIsLeaving(false);
    setShowLeaveDialog(false);

    if (success) {
      toast.success('You have left the group');
      onRefresh();
    } else {
      toast.error('Failed to leave group');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteGroup(group.id);
    setIsDeleting(false);
    setShowDeleteDialog(false);

    if (success) {
      toast.success('Group deleted');
      navigate('/groups');
    } else {
      toast.error('Failed to delete group');
    }
  };

  return (
    <div className="feed-card overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 md:h-48 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        {group.cover_image_url && (
          <img
            src={group.cover_image_url}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Group Info */}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl md:text-2xl font-bold truncate">{group.name}</h1>
              {group.visibility === 'private' ? (
                <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>

            {group.description && (
              <p className="text-muted-foreground mb-4">{group.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{group.member_count} {group.member_count === 1 ? 'member' : 'members'}</span>
              </div>
              {group.visibility === 'private' && (
                <span className="px-2 py-0.5 bg-muted rounded-full text-xs">Private Group</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isMember && (
              <Button onClick={handleJoin} disabled={isJoining}>
                <UserPlus className="h-4 w-4 mr-2" />
                {isJoining
                  ? 'Joining...'
                  : group.visibility === 'public'
                  ? 'Join Group'
                  : 'Request to Join'}
              </Button>
            )}

            {isMember && !isOwner && (
              <Button variant="outline" onClick={() => setShowLeaveDialog(true)}>
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </Button>
            )}

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Group Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Member Badge */}
        {group.membership && (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              You're a{' '}
              <span className="font-medium text-foreground capitalize">
                {group.membership.role}
              </span>{' '}
              of this group
            </span>
          </div>
        )}
      </div>

      {/* Leave Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave "{group.name}"? You can rejoin later if the group is public.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave} disabled={isLeaving}>
              {isLeaving ? 'Leaving...' : 'Leave Group'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{group.name}"? This action cannot be undone and all
              group data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Group'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
