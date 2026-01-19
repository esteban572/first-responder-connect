// Agency Setup Page
// Create or join an agency (organization)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Plus, Users, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { createOrganization, isSlugAvailable, acceptInvite } from '@/lib/organizationService';
import {
  AGENCY_TYPES,
  SERVICE_AREAS,
  EMPLOYEE_COUNTS,
  US_STATES,
  OrganizationCreate,
} from '@/types/organization';

export default function AgencySetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshOrganization } = useOrganization();

  // Create agency state
  const [formData, setFormData] = useState<OrganizationCreate>({
    name: '',
    slug: '',
    city: '',
    state: '',
    agency_type: undefined,
    service_area: undefined,
    website_url: '',
    employee_count: '',
    is_public: true,
  });
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [creating, setCreating] = useState(false);

  // Join agency state
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    setFormData(prev => ({ ...prev, slug: generatedSlug }));
    if (generatedSlug) {
      checkSlugAvailability(generatedSlug);
    } else {
      setSlugStatus('idle');
    }
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    setFormData(prev => ({ ...prev, slug: cleanSlug }));
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

    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Please enter an agency name and URL');
      return;
    }

    if (slugStatus !== 'available') {
      toast.error('Please choose an available URL');
      return;
    }

    setCreating(true);
    const org = await createOrganization(formData);
    setCreating(false);

    if (org) {
      toast.success('Agency created successfully!');
      await refreshOrganization();
      navigate('/agency/settings');
    } else {
      toast.error('Failed to create agency');
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
      toast.success('Joined agency successfully!');
      await refreshOrganization();
      navigate('/feed');
    } else {
      toast.error('Invalid or expired invite code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Your Agency</h1>
          <p className="text-muted-foreground">
            Set up your agency on ParaNet or join an existing one
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-xl border shadow-lg p-6">
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Agency
              </TabsTrigger>
              <TabsTrigger value="join" className="gap-2">
                <Users className="h-4 w-4" />
                Join Agency
              </TabsTrigger>
            </TabsList>

            {/* Create Tab */}
            <TabsContent value="create">
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Agency Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Metro EMS, County Fire Rescue"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Agency URL *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      paranet.com/
                    </span>
                    <div className="relative flex-1">
                      <Input
                        id="slug"
                        placeholder="metro-ems"
                        value={formData.slug}
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
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="San Diego"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Agency Type & Service Area */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Agency Type</Label>
                    <Select
                      value={formData.agency_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, agency_type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {AGENCY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Area</Label>
                    <Select
                      value={formData.service_area}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, service_area: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_AREAS.map((area) => (
                          <SelectItem key={area.value} value={area.value}>
                            {area.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Employee Count */}
                <div className="space-y-2">
                  <Label>Employee Count</Label>
                  <Select
                    value={formData.employee_count}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employee_count: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_COUNTS.map((count) => (
                        <SelectItem key={count.value} value={count.value}>
                          {count.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.yourems.com"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  />
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
                        Create Agency
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Your agency will be visible in the public directory. You can invite team members after setup.
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
                    Ask your agency administrator for an invite code
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
                        Join Agency
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
