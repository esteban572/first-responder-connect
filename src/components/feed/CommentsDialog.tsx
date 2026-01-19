import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send, Reply, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Comment } from '@/types/post';
import {
  getPostComments,
  createComment,
  deleteComment,
  reactToComment,
  createMentionNotifications,
} from '@/lib/commentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { MentionInput, renderCommentWithMentions } from './MentionInput';
import { ReactionsPopover } from './ReactionsPopover';

interface CommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentsDialog({ open, onOpenChange, postId, onCommentAdded }: CommentsDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getPostComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting || !user) return;

    setSubmitting(true);
    try {
      await createComment({
        post_id: postId,
        content: newComment.trim(),
      });

      // Create notifications for mentions
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Someone';
      await createMentionNotifications(newComment.trim(), user.id, userName, postId);

      setNewComment('');
      onCommentAdded?.();
      toast.success('Comment added');
      await loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || submitting || !user) return;

    setSubmitting(true);
    try {
      await createComment({
        post_id: postId,
        content: replyContent.trim(),
        parent_id: parentId,
      });

      // Create notifications for mentions
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Someone';
      await createMentionNotifications(replyContent.trim(), user.id, userName, postId);

      setReplyContent('');
      setReplyingTo(null);
      onCommentAdded?.();
      toast.success('Reply added');
      await loadComments();
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string, isReply: boolean, parentId?: string) => {
    try {
      const success = await deleteComment(commentId, postId);
      if (success) {
        if (isReply && parentId) {
          setComments(comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies?.filter(r => r.id !== commentId) || [],
              };
            }
            return comment;
          }));
        } else {
          setComments(comments.filter(c => c.id !== commentId));
        }
        onCommentAdded?.();
        toast.success('Comment deleted');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleReaction = async (commentId: string, type: 'like' | 'dislike', isReply: boolean, parentId?: string) => {
    try {
      const result = await reactToComment(commentId, type);
      if (result.success) {
        // Update the comment in state
        const updateComment = (comment: Comment): Comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes_count: result.newLikesCount,
              dislikes_count: result.newDislikesCount,
              userReaction: result.userReaction,
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(updateComment),
            };
          }
          return comment;
        };

        setComments(comments.map(updateComment));
      }
    } catch (error) {
      console.error('Error reacting to comment:', error);
      toast.error('Failed to react');
    }
  };

  const handleUserClick = (userId: string) => {
    onOpenChange(false);
    navigate(`/user/${userId}`);
  };

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}>
      <img
        src={comment.author?.avatar_url || '/placeholder.svg'}
        alt={comment.author?.full_name || 'User'}
        className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all flex-shrink-0"
        onClick={() => comment.author?.id && handleUserClick(comment.author.id)}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
              onClick={() => comment.author?.id && handleUserClick(comment.author.id)}
            >
              {comment.author?.full_name || 'Unknown User'}
            </span>
            {comment.author?.role && (
              <span className="text-xs text-muted-foreground">{comment.author.role}</span>
            )}
          </div>
          <p className="text-sm mt-1 break-words">
            {renderCommentWithMentions(comment.content, handleUserClick)}
          </p>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>

          {/* Like button */}
          <button
            className={cn(
              'text-xs flex items-center gap-1 transition-colors',
              comment.userReaction === 'like'
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-primary'
            )}
            onClick={() => handleReaction(comment.id, 'like', isReply, parentId)}
          >
            <ThumbsUp className={cn('h-3 w-3', comment.userReaction === 'like' && 'fill-current')} />
            {comment.likes_count > 0 && (
              <ReactionsPopover
                commentId={comment.id}
                likesCount={comment.likes_count}
                dislikesCount={comment.dislikes_count}
              >
                <span className="hover:underline cursor-pointer">{comment.likes_count}</span>
              </ReactionsPopover>
            )}
          </button>

          {/* Dislike button */}
          <button
            className={cn(
              'text-xs flex items-center gap-1 transition-colors',
              comment.userReaction === 'dislike'
                ? 'text-destructive font-medium'
                : 'text-muted-foreground hover:text-destructive'
            )}
            onClick={() => handleReaction(comment.id, 'dislike', isReply, parentId)}
          >
            <ThumbsDown className={cn('h-3 w-3', comment.userReaction === 'dislike' && 'fill-current')} />
            {comment.dislikes_count > 0 && (
              <ReactionsPopover
                commentId={comment.id}
                likesCount={comment.likes_count}
                dislikesCount={comment.dislikes_count}
              >
                <span className="hover:underline cursor-pointer">{comment.dislikes_count}</span>
              </ReactionsPopover>
            )}
          </button>

          {/* Reply button */}
          {!isReply && (
            <button
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}

          {/* Delete button */}
          {user?.id === comment.user_id && (
            <button
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
              onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="flex gap-2 mt-2">
            <MentionInput
              value={replyContent}
              onChange={setReplyContent}
              placeholder="Write a reply... (use @ to mention)"
              className="text-sm flex-1"
            />
            <Button
              size="sm"
              onClick={() => handleSubmitReply(comment.id)}
              disabled={!replyContent.trim() || submitting}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply parentId={comment.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* New comment input */}
        <div className="flex gap-2 pt-4 border-t">
          <MentionInput
            value={newComment}
            onChange={setNewComment}
            placeholder="Write a comment... (use @ to mention)"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
