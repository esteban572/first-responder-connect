import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PhotoGrid } from '@/components/profile/PhotoGrid';
import { ActivitySection } from '@/components/profile/ActivitySection';
import { PostCard } from '@/components/feed/PostCard';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserProfile, getConnectionsCount } from '@/lib/userService';
import { getCurrentUserMedia } from '@/lib/mediaService';
import { getUserPosts } from '@/lib/postService';
import { getUserActivities, Activity } from '@/lib/activityService';
import { UserProfile } from '@/types/user';
import { MediaItem } from '@/types/media';
import { Post } from '@/types/post';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [authUser]);

  const loadProfile = async () => {
    if (!authUser) return;

    setLoading(true);
    try {
      const [userProfile, userMedia, userPosts, userActivities, connCount] = await Promise.all([
        getCurrentUserProfile(),
        getCurrentUserMedia(),
        getUserPosts(authUser.id),
        getUserActivities(authUser.id),
        getConnectionsCount(authUser.id),
      ]);

      setActivities(userActivities);
      setConnectionsCount(connCount);

      if (!userProfile) {
        // Create initial profile from auth user
        const initialProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: '',
          location: '',
          bio: '',
          avatar_url: authUser.user_metadata?.avatar_url || '',
          cover_image_url: '',
          credentials: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(initialProfile);
      } else {
        setProfile(userProfile);
      }

      setMedia(userMedia);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = () => {
    loadProfile();
  };

  const handleMediaUpdated = () => {
    loadProfile();
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
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-4 md:py-6">
          <div className="feed-card p-8 text-center">
            <p className="text-muted-foreground">No profile found. Please create one.</p>
            <Button onClick={() => setEditDialogOpen(true)} className="mt-4">
              Create Profile
            </Button>
          </div>
        </div>
      </AppLayout>
    );
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
          <ProfileHeader user={profileHeaderData}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </ProfileHeader>

          {profile.bio && (
            <div className="feed-card p-4">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          <PhotoGrid
            photos={media}
            onMediaUpdated={handleMediaUpdated}
            isOwnProfile={true}
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

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
      />
    </AppLayout>
  );
};

export default Profile;
