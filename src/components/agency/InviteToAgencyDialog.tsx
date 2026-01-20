// Invite to Agency Dialog
// Allows agency owners/admins to invite users directly from posts or profiles

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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganization } from '@/contexts/OrganizationContext';
import { createDirectInvite } from '@/lib/organizationService';
import { OrgRole } from '@/types/organization';

interface InviteToAgencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function InviteToAgencyDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: InviteToAgencyDialogProps) {
  const { organization } = useOrganization();
  const [role, setRole] = useState<OrgRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!organization) {
      toast.error('No agency selected');
      return;
    }

    setIsInviting(true);
    try {
      const invite = await createDirectInvite(organization.id, userId, role);

      if (invite) {
        toast.success(`Invitation sent to ${userName}`);
        onOpenChange(false);
      } else {
        toast.error('Failed to send invitation. User may already be a member or have a pending invite.');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  if (!organization) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite to Agency
          </DialogTitle>
          <DialogDescription>
            Invite <span className="font-medium text-foreground">{userName}</span> to join your agency.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Agency Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <p className="font-medium">{organization.name}</p>
              {organization.city && organization.state && (
                <p className="text-xs text-muted-foreground">
                  {organization.city}, {organization.state}
                </p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Assign Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as OrgRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex flex-col items-start">
                    <span>Member</span>
                    <span className="text-xs text-muted-foreground">Can access agency features</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span>Admin</span>
                    <span className="text-xs text-muted-foreground">Can manage members and settings</span>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex flex-col items-start">
                    <span>Viewer</span>
                    <span className="text-xs text-muted-foreground">Read-only access</span>
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
            disabled={isInviting}
          >
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isInviting}>
            {isInviting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
