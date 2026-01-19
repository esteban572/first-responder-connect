import { AppLayout } from "@/components/layout/AppLayout";
import { AnnouncementBanner } from "@/components/feed/AnnouncementBanner";
import { CreatePostButton } from "@/components/feed/CreatePostButton";
import { PostCard } from "@/components/feed/PostCard";
import { mockPosts } from "@/data/mockData";

const Index = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        <AnnouncementBanner />
        <CreatePostButton />
        
        <div className="space-y-4 px-4 md:px-0">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
