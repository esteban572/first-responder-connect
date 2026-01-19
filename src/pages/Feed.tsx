import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementBanner } from "@/components/feed/AnnouncementBanner";
import { CreatePostButton } from "@/components/feed/CreatePostButton";
import { PostCard } from "@/components/feed/PostCard";
import { getFeedPosts } from "@/lib/postService";
import { Post } from "@/types/post";
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const feedPosts = await getFeedPosts();
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostCreated = () => {
    loadPosts();
  };

  // Convert Post to PostCard format
  const convertPostToCardFormat = (post: Post) => {
    return {
      id: post.id,
      authorId: post.author?.id || post.user_id,
      author: {
        name: post.author?.full_name || 'Unknown User',
        role: post.author?.role || '',
        avatar: post.author?.avatar_url || '',
      },
      content: post.content,
      image: post.image_url,
      location: post.location,
      likes: post.likes_count,
      comments: post.comments_count,
      timestamp: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    };
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        <AnnouncementBanner />
        <CreatePostButton onPostCreated={handlePostCreated} />
        
        {loading ? (
          <div className="feed-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-card p-8 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4 px-4 md:px-0">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={convertPostToCardFormat(post)}
                onLikeUpdate={loadPosts}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Feed;
