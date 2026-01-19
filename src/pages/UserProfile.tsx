import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PhotoGrid } from '@/components/profile/PhotoGrid';
import { ActivitySection } from '@/components/profile/ActivitySection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { PostCard } from '@/components/feed/PostCard';
import { getUserProfile, checkConnection, sendConnectionRequest, getConnectionsCount } from '@/lib/userService';
import { getUserMedia } from '@/lib/mediaService';
import { getUserPosts } from '@/lib/postService';
import { getUserActivities, Activity } from '@/lib/activityService';
import { getUserPublicExperiences } from '@/lib/experienceService';
import { UserProfile } from '@/types/user';
import { MediaItem } from '@/types/media';
import { Post } from '@/types/post';
import { Experience } from '@/types/experience';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserPlus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending' | 'none'>('none');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate('/search');
      return;
    }

    if (userId === currentUser?.id) {
      navigate('/profile');
      return;
    }

    loadProfile();
  }, [userId, currentUser]);

  const loadProfile = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [userProfile, userMedia, userPosts, userActivities, userExperiences, connCount] = await Promise.all([
        getUserProfile(userId),
        getUserMedia(userId),
        getUserPosts(userId),
        getUserActivities(userId),
        getUserPublicExperiences(userId),
        getConnectionsCount(userId),
      ]);

      if (!userProfile) {
        toast.error('User not found');
        navigate('/search');
        return;
      }
      setProfile(userProfile);
      setMedia(userMedia);
      setPosts(userPosts);
      setActivities(userActivities);
      setExperiences(userExperiences);
      setConnectionsCount(connCount);

      // Check connection status
      if (currentUser) {
        const status = await checkConnection(currentUser.id, userId);
        setConnectionStatus(status);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!userId || !currentUser) return;

    setIsConnecting(true);
    try {
      const success = await sendConnectionRequest(userId);
      if (success) {
        setConnectionStatus('pending');
        toast.success('Connection request sent!');
      } else {
        toast.error('Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = () => {
    // Navigate to messages with this user
    navigate(`/messages?user=${userId}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-4 md:py-6">
          <div className="feed-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return null;
  }

  // Convert UserProfile to ProfileHeader format
  const profileHeaderData = {
    name: profile.full_name,
    role: profile.role,
    avatar: profile.avatar_url || '',
    coverImage: profile.cover_image_url || '',
    location: profile.location,
    credentials: profile.credentials || [],
    joinDate: format(new Date(profile.created_at), 'MMMM yyyy'),
    postsCount: posts.length,
    connectionsCount: connectionsCount,
  };

  // Convert Post to PostCard format
  const convertPostToCardFormat = (post: Post) => ({
    id: post.id,
    authorId: post.author?.id || post.user_id,
    author: {
      name: post.author?.full_name || profile.full_name,
      role: post.author?.role || profile.role || '',
      avatar: post.author?.avatar_url || profile.avatar_url || '',
    },
    content: post.content,
    image: post.image_url,
    location: post.location,
    likes: post.likes_count,
    comments: post.comments_count,
    timestamp: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
  });

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        <div className="px-4 md:px-0 space-y-4">
          <ProfileHeader
            user={profileHeaderData}
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleMessage}
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
            {connectionStatus === 'none' && (
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90 gap-2"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                <UserPlus className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
            {connectionStatus === 'pending' && (
              <Button size="sm" variant="outline" disabled className="gap-2">
                <Check className="h-4 w-4" />
                Request Sent
              </Button>
            )}
            {connectionStatus === 'connected' && (
              <Button size="sm" variant="outline" disabled className="gap-2">
                <Check className="h-4 w-4" />
                Connected
              </Button>
            )}
          </ProfileHeader>

          {profile.bio && (
            <div className="feed-card p-4">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Experience Section (public only) */}
          {experiences.length > 0 && (
            <ExperienceSection
              experiences={experiences}
              isOwnProfile={false}
              onExperienceUpdated={() => {}}
            />
          )}

          <PhotoGrid
            photos={media}
            onMediaUpdated={() => {}}
            isOwnProfile={false}
          />

          {/* Activity Section */}
          <ActivitySection activities={activities} />

          {/* User's Posts */}
          <div>
            <h3 className="font-bold text-base mb-4 px-1">Recent Posts</h3>
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={convertPostToCardFormat(post)}
                    onLikeUpdate={loadProfile}
                  />
                ))
              ) : (
                <div className="feed-card p-8 text-center">
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserProfilePage;
