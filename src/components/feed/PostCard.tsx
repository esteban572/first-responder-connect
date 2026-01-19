import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    author: {
      name: string;
      role: string;
      avatar: string;
    };
    content: string;
    image?: string;
    location?: string;
    likes: number;
    comments: number;
    timestamp: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <article className="feed-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-border"
          />
          <div>
            <h4 className="font-semibold text-sm">{post.author.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{post.author.role}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed">{post.content}</p>
        {post.location && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{post.location}</span>
          </div>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 h-9 px-3",
              liked && "text-destructive"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            <span className="text-sm font-medium">{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 h-9 px-3">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{post.comments}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-9 px-3">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
