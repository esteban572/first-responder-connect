import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { getCommentReactions } from '@/lib/commentService';
import { CommentReaction } from '@/types/post';

interface ReactionsPopoverProps {
  commentId: string;
  likesCount: number;
  dislikesCount: number;
  children: React.ReactNode;
  onClose?: () => void;
}

export function ReactionsPopover({
  commentId,
  likesCount,
  dislikesCount,
  children,
  onClose,
}: ReactionsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState<CommentReaction[]>([]);
  const [dislikes, setDislikes] = useState<CommentReaction[]>([]);

  useEffect(() => {
    if (open) {
      loadReactions();
    }
  }, [open, commentId]);

  const loadReactions = async () => {
    setLoading(true);
    try {
      const { likes: likeData, dislikes: dislikeData } = await getCommentReactions(commentId);
      setLikes(likeData);
      setDislikes(dislikeData);
    } catch (error) {
      console.error('Error loading reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose?.();
    }
  };

  const totalReactions = likesCount + dislikesCount;
  if (totalReactions === 0) {
    return <>{children}</>;
  }

  const ReactionList = ({ reactions, type }: { reactions: CommentReaction[]; type: 'like' | 'dislike' }) => (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {reactions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          No {type}s yet
        </p>
      ) : (
        reactions.map((reaction) => (
          <Link
            key={reaction.id}
            to={`/user/${reaction.user_id}`}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => handleOpenChange(false)}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={reaction.user?.avatar_url} />
              <AvatarFallback className="text-xs">
                {reaction.user?.full_name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{reaction.user?.full_name || 'Unknown'}</span>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Tabs defaultValue="likes" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="likes" className="gap-1">
              <ThumbsUp className="h-3 w-3" />
              Likes ({likesCount})
            </TabsTrigger>
            <TabsTrigger value="dislikes" className="gap-1">
              <ThumbsDown className="h-3 w-3" />
              Dislikes ({dislikesCount})
            </TabsTrigger>
          </TabsList>
          <div className="p-2">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <TabsContent value="likes" className="mt-0">
                  <ReactionList reactions={likes} type="like" />
                </TabsContent>
                <TabsContent value="dislikes" className="mt-0">
                  <ReactionList reactions={dislikes} type="dislike" />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
