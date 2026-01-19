// Organization Setup Page
// Create or join an organization

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Plus, Users, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { createOrganization, isSlugAvailable, acceptInvite } from '@/lib/organizationService';

export default function OrganizationSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshOrganization } = useOrganization();

  // Create org state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [creating, setCreating] = useState(false);

  // Join org state
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    setSlug(generatedSlug);
    if (generatedSlug) {
      checkSlugAvailability(generatedSlug);
    } else {
      setSlugStatus('idle');
    }
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    setSlug(cleanSlug);
    if (cleanSlug) {
      checkSlugAvailability(cleanSlug);
    } else {
      setSlugStatus('idle');
    }
  };

  const checkSlugAvailability = async (slugToCheck: string) => {
    setSlugStatus('checking');
    const available = await isSlugAvailable(slugToCheck);
    setSlugStatus(available ? 'available' : 'taken');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      toast.error('Please enter a name and URL');
      return;
    }

    if (slugStatus !== 'available') {
      toast.error('Please choose an available URL');
      return;
    }

    setCreating(true);
    const org = await createOrganization({ name, slug });
    setCreating(false);

    if (org) {
      toast.success('Organization created!');
      await refreshOrganization();
      navigate('/meetings');
    } else {
      toast.error('Failed to create organization');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setJoining(true);
    const success = await acceptInvite(inviteCode.trim());
    setJoining(false);

    if (success) {
      toast.success('Joined organization!');
      await refreshOrganization();
      navigate('/meetings');
    } else {
      toast.error('Invalid or expired invite code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Get Started</h1>
          <p className="text-muted-foreground">
            Create a new organization or join an existing one
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-xl border shadow-lg p-6">
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="gap-2">
                <Plus className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="join" className="gap-2">
                <Users className="h-4 w-4" />
                Join
              </TabsTrigger>
            </TabsList>

            {/* Create Tab */}
            <TabsContent value="create">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Metro EMS, County Fire Dept"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Organization URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      paranet.com/
                    </span>
                    <div className="relative flex-1">
                      <Input
                        id="slug"
                        placeholder="metro-ems"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={`pr-10 ${
                          slugStatus === 'available'
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : slugStatus === 'taken'
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : ''
                        }`}
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {slugStatus === 'checking' && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {slugStatus === 'available' && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {slugStatus === 'taken' && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  {slugStatus === 'taken' && (
                    <p className="text-sm text-red-500">This URL is already taken</p>
                  )}
                  {slugStatus === 'available' && (
                    <p className="text-sm text-green-600">URL is available!</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={creating || slugStatus !== 'available'}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Organization
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  You'll be the owner and can invite team members after setup
                </p>
              </form>
            </TabsContent>

            {/* Join Tab */}
            <TabsContent value="join">
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Paste your invite code here"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask your organization admin for an invite code
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={joining || !inviteCode.trim()}
                  >
                    {joining ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join Organization
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Skip link */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => navigate('/feed')}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
