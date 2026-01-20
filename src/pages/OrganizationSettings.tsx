// Organization Settings Page
// Manage organization details, members, and billing

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Building2,
  Users,
  CreditCard,
  Palette,
  Mail,
  Trash2,
  Crown,
  Shield,
  User,
  Eye,
  MoreVertical,
  Plus,
  Check,
  X,
  ExternalLink,
  Copy,
  Link as LinkIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useOrganization, RoleGate } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  OrganizationMember,
  OrganizationInvite,
  OrgRole,
  PLAN_FEATURES,
} from '@/types/organization';
import {
  updateOrganization,
  getOrganizationMembers,
  getOrganizationInvites,
  updateMemberRole,
  removeMember,
  createInvite,
  cancelInvite,
  isSlugAvailable,
} from '@/lib/organizationService';
import { generateInviteLink } from '@/lib/emailService';

const ROLE_LABELS: Record<OrgRole, { label: string; icon: typeof Crown }> = {
  owner: { label: 'Owner', icon: Crown },
  admin: { label: 'Admin', icon: Shield },
  member: { label: 'Member', icon: User },
  viewer: { label: 'Viewer', icon: Eye },
};

export default function OrganizationSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, role, isOwner, isAdmin, refreshOrganization, canAddMembers } = useOrganization();

  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f97316');
  const [secondaryColor, setSecondaryColor] = useState('#1e3a5f');
  const [logoUrl, setLogoUrl] = useState('');

  // Dialogs
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('member');
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setSlug(organization.slug);
      setPrimaryColor(organization.primary_color);
      setSecondaryColor(organization.secondary_color);
      setLogoUrl(organization.logo_url || '');
      loadMembers();
    }
  }, [organization?.id]);

  const loadMembers = async () => {
    if (!organization) return;
    setLoading(true);

    const [membersData, invitesData] = await Promise.all([
      getOrganizationMembers(organization.id),
      getOrganizationInvites(organization.id),
    ]);

    setMembers(membersData);
    setInvites(invitesData);
    setLoading(false);
  };

  const handleSaveGeneral = async () => {
    if (!organization) return;

    // Validate slug if changed
    if (slug !== organization.slug) {
      const available = await isSlugAvailable(slug);
      if (!available) {
        setSlugError('This URL is already taken');
        return;
      }
    }

    setSaving(true);
    const updated = await updateOrganization(organization.id, {
      name,
      slug,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl || undefined,
    });
    setSaving(false);

    if (updated) {
      toast.success('Settings saved');
      refreshOrganization();
    } else {
      toast.error('Failed to save settings');
    }
  };

  const handleInvite = async () => {
    if (!organization || !inviteEmail.trim()) return;

    // Check member limit
    if (!canAddMembers(members.length + invites.length)) {
      toast.error('Member limit reached. Upgrade your plan to add more members.');
      return;
    }

    const invite = await createInvite(organization.id, {
      email: inviteEmail,
      role: inviteRole,
    });

    if (invite) {
      // Generate and show the invite link
      const link = generateInviteLink(invite.token);
      setCreatedInviteLink(link);
      toast.success('Invite created! Copy the link to share.');
      loadMembers();
    } else {
      toast.error('Failed to send invite');
    }
  };

  const handleCopyInviteLink = async () => {
    if (!createdInviteLink) return;
    try {
      await navigator.clipboard.writeText(createdInviteLink);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
    setInviteEmail('');
    setInviteRole('member');
    setCreatedInviteLink(null);
  };

  const handleCancelInvite = async (inviteId: string) => {
    const success = await cancelInvite(inviteId);
    if (success) {
      toast.success('Invite canceled');
      loadMembers();
    } else {
      toast.error('Failed to cancel invite');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: OrgRole) => {
    if (!organization) return;

    const success = await updateMemberRole(organization.id, memberId, newRole);
    if (success) {
      toast.success('Role updated');
      loadMembers();
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async () => {
    if (!organization || !removeMemberId) return;

    const success = await removeMember(organization.id, removeMemberId);
    if (success) {
      toast.success('Member removed');
      loadMembers();
    } else {
      toast.error('Failed to remove member');
    }
    setRemoveMemberId(null);
  };

  if (!organization) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="feed-card p-8 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Organization</h2>
            <p className="text-muted-foreground mb-4">
              You need to create or join an organization first.
            </p>
            <Button onClick={() => navigate('/organization/create')}>
              Create Organization
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <h1 className="text-2xl font-bold font-display mb-1">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization's settings and members
          </p>
        </div>

        <div className="px-4 md:px-0">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general" className="gap-2">
                <Building2 className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-2">
                <Palette className="h-4 w-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general">
              <div className="feed-card p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isAdmin}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Organization URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">app.paranet.com/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                        setSlugError(null);
                      }}
                      disabled={!isOwner}
                      className="flex-1"
                    />
                  </div>
                  {slugError && <p className="text-sm text-red-500">{slugError}</p>}
                </div>

                <RoleGate roles={['owner', 'admin']}>
                  <Button onClick={handleSaveGeneral} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </RoleGate>
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <div className="feed-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold">Team Members</h3>
                    <p className="text-sm text-muted-foreground">
                      {members.length} of {organization.max_members} members
                    </p>
                  </div>
                  <RoleGate roles={['owner', 'admin']}>
                    <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Invite Member
                    </Button>
                  </RoleGate>
                </div>

                {/* Members list */}
                <div className="space-y-3">
                  {members.map((member) => {
                    const RoleIcon = ROLE_LABELS[member.role].icon;
                    const isCurrentUser = member.user_id === user?.id;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          {member.user?.avatar_url ? (
                            <img
                              src={member.user.avatar_url}
                              alt={member.user.full_name || ''}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {member.user?.full_name || 'Unknown'}
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground ml-2">(you)</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.user?.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs">
                            <RoleIcon className="h-3 w-3" />
                            {ROLE_LABELS[member.role].label}
                          </span>

                          {isAdmin && !isCurrentUser && member.role !== 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'admin')}
                                  disabled={member.role === 'admin'}
                                >
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'member')}
                                  disabled={member.role === 'member'}
                                >
                                  Make Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'viewer')}
                                  disabled={member.role === 'viewer'}
                                >
                                  Make Viewer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => setRemoveMemberId(member.id)}
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pending invites */}
                {invites.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3">Pending Invites</h4>
                    <div className="space-y-2">
                      {invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{invite.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Invited as {invite.role}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                const link = generateInviteLink(invite.token);
                                try {
                                  await navigator.clipboard.writeText(link);
                                  toast.success('Invite link copied!');
                                } catch {
                                  toast.error('Failed to copy link');
                                }
                              }}
                              title="Copy invite link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelInvite(invite.id)}
                              title="Cancel invite"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding">
              <div className="feed-card p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    type="url"
                    placeholder="https://..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={!isAdmin}
                  />
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="h-16 object-contain mt-2"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 p-1"
                        disabled={!isAdmin}
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        disabled={!isAdmin}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-10 p-1"
                        disabled={!isAdmin}
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        disabled={!isAdmin}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Preview</p>
                  <div
                    className="h-12 rounded-lg flex items-center px-4"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {logoUrl && (
                      <img src={logoUrl} alt="Logo" className="h-8 mr-3" />
                    )}
                    <span className="text-white font-semibold">{name}</span>
                  </div>
                </div>

                <RoleGate roles={['owner', 'admin']}>
                  <Button onClick={handleSaveGeneral} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Branding'}
                  </Button>
                </RoleGate>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <div className="feed-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold">Current Plan</h3>
                    <p className="text-2xl font-bold capitalize">
                      {organization.subscription_plan}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      organization.subscription_status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : organization.subscription_status === 'trialing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {organization.subscription_status}
                  </span>
                </div>

                {/* Plan features */}
                <div className="border rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-3">Plan Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Up to {organization.max_members} team members
                    </li>
                    {PLAN_FEATURES[organization.subscription_plan].features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </li>
                    ))}
                  </ul>
                </div>

                <RoleGate roles={['owner']}>
                  <Button className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Manage Subscription
                  </Button>
                </RoleGate>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={handleCloseInviteDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              {createdInviteLink
                ? 'Share this link with the person you want to invite.'
                : 'Send an invitation to join your organization.'}
            </DialogDescription>
          </DialogHeader>

          {createdInviteLink ? (
            // Show the invite link after creation
            <div className="space-y-4 pb-2">
              <div className="p-3 bg-muted rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm flex-1 break-all">{createdInviteLink}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyInviteLink}
                  className="w-full gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This invite link expires in 7 days. The invited person will be added as a <strong>{inviteRole}</strong>.
              </p>
              <Button onClick={handleCloseInviteDialog} className="w-full sm:w-auto">
                Done
              </Button>
            </div>
          ) : (
            // Show the invite form
            <div className="space-y-4 pb-2">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Can manage members and settings</SelectItem>
                    <SelectItem value="member">Member - Full access to features</SelectItem>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleCloseInviteDialog} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail.trim()} className="w-full sm:w-auto">
                  Create Invite
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={removeMemberId !== null} onOpenChange={() => setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              This person will lose access to your organization. They can be invited again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
