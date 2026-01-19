import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Maximize2, Minimize2, Share2, Copy } from "lucide-react";
import { Credential } from "@/types/credential";
import { UserProfile } from "@/types/user";
import { getCredentials, getPublicCredentials } from "@/lib/credentialService";
import { getCurrentUserProfile, getUserProfile } from "@/lib/userService";
import { VirtualIDCard } from "@/components/credentials/VirtualIDCard";

const CredentialShowcase = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId, authUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      let profileData: UserProfile | null = null;
      let credentialsData: Credential[] = [];

      if (userId) {
        // Viewing someone else's credentials
        profileData = await getUserProfile(userId);
        credentialsData = await getPublicCredentials(userId);
        setIsOwnProfile(authUser?.id === userId);
      } else {
        // Viewing own credentials
        profileData = await getCurrentUserProfile();
        if (profileData) {
          // Get all valid public credentials for showcase
          const allCredentials = await getCredentials();
          credentialsData = allCredentials.filter(
            (c) => c.is_public && c.status === "valid"
          );
          setIsOwnProfile(true);
        }
      }

      setProfile(profileData);
      setCredentials(credentialsData);
    } catch (error) {
      console.error("Error loading showcase data:", error);
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialClick = (credential: Credential) => {
    if (credential.document_url) {
      window.open(credential.document_url, "_blank");
    }
  };

  const handleShare = async () => {
    const shareUrl = userId
      ? `${window.location.origin}/user/${userId}/credentials`
      : `${window.location.origin}/user/${authUser?.id}/credentials`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name}'s Credentials`,
          text: "Check out my professional credentials on ParaNet",
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const toggleFullScreen = () => {
    if (!fullScreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullScreen(!fullScreen);
  };

  // Full screen presentation mode
  if (fullScreen && profile) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
          onClick={toggleFullScreen}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>
        <VirtualIDCard
          user={profile}
          credentials={credentials}
          onCredentialClick={handleCredentialClick}
          fullScreen
        />
      </div>
    );
  }

  // Public view without auth (for shared links)
  if (!authUser && userId) {
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading credentials...</p>
          </div>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
            <p className="text-muted-foreground mb-4">
              This profile doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                ParaNet
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={toggleFullScreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 flex items-center">
            <VirtualIDCard
              user={profile}
              credentials={credentials}
              onCredentialClick={handleCredentialClick}
              fullScreen
            />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Powered by ParaNet
          </p>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/credentials">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-display">Virtual ID</h1>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Show your credentials on the go"
                    : `${profile?.full_name}'s credentials`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleFullScreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="px-4 md:px-0">
          {loading ? (
            <div className="feed-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          ) : profile ? (
            <div className="space-y-4">
              <VirtualIDCard
                user={profile}
                credentials={credentials}
                onCredentialClick={handleCredentialClick}
              />

              {isOwnProfile && (
                <div className="feed-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Share your credentials</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone with the link can view your public credentials
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const url = `${window.location.origin}/user/${authUser?.id}/credentials`;
                        copyToClipboard(url);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}

              {isOwnProfile && credentials.length === 0 && (
                <div className="feed-card p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    No public credentials to display. Mark credentials as public in
                    your vault to show them here.
                  </p>
                  <Link to="/credentials">
                    <Button variant="outline" size="sm">
                      Manage Credentials
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="feed-card p-8 text-center">
              <p className="text-muted-foreground">Profile not found</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CredentialShowcase;
