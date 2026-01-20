import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Trash2, Flag, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { likePost, hasUserLikedPost, deletePost } from "@/lib/postService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CommentsDialog } from "./CommentsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createReport } from "@/lib/reportService";
import { REPORT_REASONS } from "@/types/report";
import { useOrganization } from "@/contexts/OrganizationContext";
import { InviteToAgencyDialog } from "@/components/agency/InviteToAgencyDialog";

interface PostCardProps {
  post: {
    id: string;
    authorId?: string;
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
  onLikeUpdate?: () => void;
}

export function PostCard({ post, onLikeUpdate }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, isOwner, isAdmin } = useOrganization();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [isLiking, setIsLiking] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const isOwnPost = user?.id === post.authorId;
  const canInvite = !isOwnPost && organization && (isOwner || isAdmin) && post.authorId;

  useEffect(() => {
    // Check if user has liked this post
    const checkLikeStatus = async () => {
      const hasLiked = await hasUserLikedPost(post.id);
      setLiked(hasLiked);
    };
    checkLikeStatus();
  }, [post.id]);

  // Sync counts with props when they change
  useEffect(() => {
    setLikeCount(post.likes);
    setCommentCount(post.comments);
  }, [post.likes, post.comments]);

  const handleAuthorClick = () => {
    if (post.authorId) {
      navigate(`/user/${post.authorId}`);
    }
  };

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
    onLikeUpdate?.();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deletePost(post.id);
      if (success) {
        toast.success('Post deleted');
        onLikeUpdate?.();
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason');
      return;
    }

    setIsReporting(true);
    try {
      const success = await createReport({
        post_id: post.id,
        reason: reportReason,
        description: reportDescription || undefined,
      });

      if (success) {
        toast.success('Report submitted. Thank you for helping keep our community safe.');
        setReportDialogOpen(false);
        setReportReason('');
        setReportDescription('');
      } else {
        toast.error('You have already reported this post');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Failed to submit report');
    } finally {
      setIsReporting(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const previousLiked = liked;
    const previousCount = likeCount;

    // Optimistic update
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const success = await likePost(post.id);
      if (!success) {
        // Revert on error
        setLiked(previousLiked);
        setLikeCount(previousCount);
        toast.error('Failed to update like');
      } else {
        onLikeUpdate?.();
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="feed-card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar || '/placeholder.svg'}
            alt={post.author.name}
            className={cn(
              "w-11 h-11 rounded-full object-cover ring-2 ring-border",
              post.authorId && "cursor-pointer hover:ring-primary transition-all"
            )}
            onClick={handleAuthorClick}
          />
          <div>
            <h4
              className={cn(
                "font-semibold text-sm",
                post.authorId && "cursor-pointer hover:text-primary transition-colors"
              )}
              onClick={handleAuthorClick}
            >
              {post.author.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{post.author.role}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>
        {isOwnPost ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canInvite && (
                <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite to Agency
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 h-9 px-3"
            onClick={() => setCommentsOpen(true)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{commentCount}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-9 px-3">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments Dialog */}
      <CommentsDialog
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        postId={post.id}
        onCommentAdded={handleCommentAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Help us understand what's wrong with this post. Your report is anonymous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for reporting *</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional details (optional)</Label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide any additional context..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
              disabled={isReporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReport}
              disabled={isReporting || !reportReason}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isReporting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite to Agency Dialog */}
      {canInvite && post.authorId && (
        <InviteToAgencyDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          userId={post.authorId}
          userName={post.author.name}
        />
      )}
    </article>
  );
}
