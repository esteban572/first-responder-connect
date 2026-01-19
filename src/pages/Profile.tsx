import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PhotoGrid } from "@/components/profile/PhotoGrid";
import { PostCard } from "@/components/feed/PostCard";
import { mockUser, mockPhotos, mockPosts } from "@/data/mockData";

const Profile = () => {
  // Filter posts to show only the current user's posts
  const userPosts = mockPosts.filter(
    (post) => post.author.name === mockUser.name
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        <div className="px-4 md:px-0 space-y-4">
          <ProfileHeader user={mockUser} />
          <PhotoGrid photos={mockPhotos} />
          
          {/* User's Posts */}
          <div>
            <h3 className="font-bold text-base mb-4 px-1">Recent Posts</h3>
            <div className="space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => <PostCard key={post.id} post={post} />)
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

export default Profile;
