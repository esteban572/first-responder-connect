import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Send,
  Trash2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPost as BlogPostType, BlogComment } from '@/types/blog';
import {
  getPostBySlug,
  getComments,
  createComment,
  deleteComment,
  reactToPost,
  reactToComment,
  toggleSaveArticle,
} from '@/lib/blogService';
import ReactMarkdown from 'react-markdown';

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPostType | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    if (!slug) return;
    setLoading(true);
    const data = await getPostBySlug(slug);
    if (data) {
      setPost(data);
      const commentsData = await getComments(data.id);
      setComments(commentsData);
    } else {
      toast.error('Post not found');
      navigate('/blog');
    }
    setLoading(false);
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user || !post) {
      toast.error('Please sign in to react');
      return;
    }

    const success = await reactToPost(post.id, type);
    if (success) {
      // Update local state
      setPost((prev) => {
        if (!prev) return prev;
        const wasLiked = prev.userReaction === 'like';
        const wasDisliked = prev.userReaction === 'dislike';
        const isSameReaction = prev.userReaction === type;

        let newLikes = prev.likes_count;
        let newDislikes = prev.dislikes_count;

        if (isSameReaction) {
          // Removing reaction
          if (type === 'like') newLikes--;
          else newDislikes--;
        } else {
          // Adding or changing reaction
          if (type === 'like') {
            newLikes++;
            if (wasDisliked) newDislikes--;
          } else {
            newDislikes++;
            if (wasLiked) newLikes--;
          }
        }

        return {
          ...prev,
          likes_count: newLikes,
          dislikes_count: newDislikes,
          userReaction: isSameReaction ? null : type,
        };
      });
    }
  };

  const handleSave = async () => {
    if (!user || !post) {
      toast.error('Please sign in to save articles');
      return;
    }

    const success = await toggleSaveArticle(post.id);
    if (success) {
      setPost((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : prev));
      toast.success(post.isSaved ? 'Removed from saved' : 'Article saved');
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !post) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    const comment = await createComment({
      blog_post_id: post.id,
      content: newComment.trim(),
    });

    if (comment) {
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
      setPost((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev
      );
      toast.success('Comment posted');
    } else {
      toast.error('Failed to post comment');
    }
    setSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !post) {
      toast.error('Please sign in to reply');
      return;
    }
    if (!replyContent.trim()) return;

    setSubmitting(true);
    const comment = await createComment({
      blog_post_id: post.id,
      content: replyContent.trim(),
      parent_id: parentId,
    });

    if (comment) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c
        )
      );
      setReplyTo(null);
      setReplyContent('');
      setPost((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev
      );
      toast.success('Reply posted');
    } else {
      toast.error('Failed to post reply');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string, parentId?: string) => {
    if (!post) return;

    const success = await deleteComment(commentId, post.id);
    if (success) {
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: c.replies?.filter((r) => r.id !== commentId) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
      setPost((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count - 1 } : prev
      );
      toast.success('Comment deleted');
    }
  };

  const handleCommentReaction = async (
    commentId: string,
    type: 'like' | 'dislike',
    parentId?: string
  ) => {
    if (!user) {
      toast.error('Please sign in to react');
      return;
    }

    const success = await reactToComment(commentId, type);
    if (success) {
      const updateReaction = (comment: BlogComment): BlogComment => {
        if (comment.id !== commentId) return comment;

        const wasLiked = comment.userReaction === 'like';
        const wasDisliked = comment.userReaction === 'dislike';
        const isSameReaction = comment.userReaction === type;

        let newLikes = comment.likes_count;
        let newDislikes = comment.dislikes_count;

        if (isSameReaction) {
          if (type === 'like') newLikes--;
          else newDislikes--;
        } else {
          if (type === 'like') {
            newLikes++;
            if (wasDisliked) newDislikes--;
          } else {
            newDislikes++;
            if (wasLiked) newLikes--;
          }
        }

        return {
          ...comment,
          likes_count: newLikes,
          dislikes_count: newDislikes,
          userReaction: isSameReaction ? null : type,
        };
      };

      setComments((prev) =>
        prev.map((c) => {
          if (parentId && c.id === parentId) {
            return {
              ...c,
              replies: c.replies?.map(updateReaction),
            };
          }
          return updateReaction(c);
        })
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Post not found</p>
          <Button className="mt-4" onClick={() => navigate('/blog')}>
            Back to Blog
          </Button>
        </div>
      </AppLayout>
    );
  }

  const CommentComponent = ({
    comment,
    parentId,
  }: {
    comment: BlogComment;
    parentId?: string;
  }) => (
    <div className={`${parentId ? 'ml-8 mt-4' : ''}`}>
      <div className="flex gap-3">
        <Link to={`/user/${comment.author?.id}`}>
          <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary">
            <AvatarImage src={comment.author?.avatar_url} />
            <AvatarFallback>
              {getInitials(comment.author?.full_name || 'U')}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/user/${comment.author?.id}`}
                className="font-semibold text-gray-900 hover:text-primary"
              >
                {comment.author?.full_name || 'Unknown'}
              </Link>
              <Badge variant="outline" className="text-xs">
                {comment.author?.role || 'Member'}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => handleCommentReaction(comment.id, 'like', parentId)}
              className={`flex items-center gap-1 text-sm ${
                comment.userReaction === 'like'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{comment.likes_count || 0}</span>
            </button>
            <button
              onClick={() =>
                handleCommentReaction(comment.id, 'dislike', parentId)
              }
              className={`flex items-center gap-1 text-sm ${
                comment.userReaction === 'dislike'
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{comment.dislikes_count || 0}</span>
            </button>
            {!parentId && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="text-sm text-gray-500 hover:text-primary"
              >
                Reply
              </button>
            )}
            {user?.id === comment.user_id && (
              <button
                onClick={() => handleDeleteComment(comment.id, parentId)}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="flex-1"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies?.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} parentId={comment.id} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/blog')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <article>
          <Badge variant="secondary" className="mb-4">
            {post.category}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Author & Meta */}
          <div className="flex items-center gap-4 mb-6">
            <Link to={`/user/${post.author?.id}`}>
              <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary">
                <AvatarImage src={post.author?.avatar_url} />
                <AvatarFallback>
                  {getInitials(post.author?.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                to={`/user/${post.author?.id}`}
                className="font-semibold text-gray-900 hover:text-primary"
              >
                {post.author?.full_name || 'Unknown'}
              </Link>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.published_at || post.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views_count || 0} views
                </span>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-80 object-cover rounded-lg mb-8"
            />
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Reactions */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleReaction('like')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      post.userReaction === 'like'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span className="font-medium">{post.likes_count || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReaction('dislike')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      post.userReaction === 'dislike'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span className="font-medium">{post.dislikes_count || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-600">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">{post.comments_count || 0}</span>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    post.isSaved
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {post.isSaved ? (
                    <BookmarkCheck className="h-5 w-5" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {post.isSaved ? 'Saved' : 'Save'}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Comments ({post.comments_count || 0})
            </h2>

            {/* New Comment Form */}
            {user ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {getInitials(user.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          onClick={handleSubmitComment}
                          disabled={submitting || !newComment.trim()}
                          className="gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 mb-3">Sign in to leave a comment</p>
                  <Button onClick={() => navigate('/')}>Sign In</Button>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentComponent key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </div>
        </article>
      </div>
    </AppLayout>
  );
}
