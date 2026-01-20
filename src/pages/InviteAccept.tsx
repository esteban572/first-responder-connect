// Invite Acceptance Page
// Handles organization invite link flow

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getInviteByToken, acceptInvite } from '@/lib/organizationService';
import { OrganizationInvite } from '@/types/organization';

interface InviteWithOrg extends OrganizationInvite {
  organizations?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [invite, setInvite] = useState<InviteWithOrg | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadInvite();
    }
  }, [token]);

  const loadInvite = async () => {
    if (!token) return;

    setLoading(true);
    const data = await getInviteByToken(token);

    if (data) {
      setInvite(data as InviteWithOrg);
    } else {
      setError('This invite link is invalid or has expired.');
    }
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    const success = await acceptInvite(token);

    if (success) {
      toast.success(`Welcome to ${invite?.organizations?.name || 'the organization'}!`);
      navigate('/feed');
    } else {
      toast.error('Failed to accept invite. Please try again.');
      setAccepting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading invite...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <div className="bg-card rounded-xl border p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Invalid Invite</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/feed')}>Go to Feed</Button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - prompt to sign up or log in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <div className="bg-card rounded-xl border p-8">
            {/* Organization info */}
            <div className="text-center mb-6">
              {invite?.organizations?.logo_url ? (
                <img
                  src={invite.organizations.logo_url}
                  alt={invite.organizations.name}
                  className="h-16 w-16 rounded-lg object-cover mx-auto mb-4"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}
              <h1 className="text-xl font-semibold mb-2">
                You're invited to join {invite?.organizations?.name}
              </h1>
              <p className="text-muted-foreground">
                Sign in or create an account to accept this invitation.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link to={`/auth?redirect=/invite/${token}`}>Sign In</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/auth?mode=signup&redirect=/invite/${token}`}>Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - show accept/decline options
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-xl border p-8">
          {/* Organization info */}
          <div className="text-center mb-6">
            {invite?.organizations?.logo_url ? (
              <img
                src={invite.organizations.logo_url}
                alt={invite.organizations.name}
                className="h-16 w-16 rounded-lg object-cover mx-auto mb-4"
              />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            )}
            <h1 className="text-xl font-semibold mb-2">
              Join {invite?.organizations?.name}
            </h1>
            <p className="text-muted-foreground">
              You've been invited to join as a <strong>{invite?.role}</strong>.
            </p>
          </div>

          {/* Invite details */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Invited as</span>
              <span className="font-medium capitalize">{invite?.role}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => navigate('/feed')}
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {accepting ? 'Joining...' : 'Accept'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
