import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { BlogPost, BLOG_CATEGORIES } from '@/types/blog';
import { getAllPosts, togglePublish, deletePost } from '@/lib/blogService';

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getAllPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const success = await togglePublish(id, !currentStatus);
    if (success) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_published: !currentStatus } : p))
      );
      toast.success(`Post ${!currentStatus ? 'published' : 'unpublished'}`);
    } else {
      toast.error('Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await deletePost(deleteId);
    if (success) {
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Post deleted');
    } else {
      toast.error('Failed to delete post');
    }
    setDeleteId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
            <p className="text-gray-600 mt-1">Manage blog posts</p>
          </div>
          <Link to="/admin/blog/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No blog posts yet</p>
              <Link to="/admin/blog/new">
                <Button>Create your first post</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <div className="flex">
                  {post.cover_image_url && (
                    <div className="w-48 flex-shrink-0">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {post.title}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {post.category}
                          </span>
                          {post.is_published ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>By {post.author?.full_name || 'Unknown'}</span>
                          <span>Created: {formatDate(post.created_at)}</span>
                          {post.published_at && (
                            <span>Published: {formatDate(post.published_at)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <span>{post.views_count || 0} views</span>
                          <span>{post.likes_count || 0} likes</span>
                          <span>{post.comments_count || 0} comments</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {post.is_published ? (
                            <Eye className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <Switch
                            checked={post.is_published}
                            onCheckedChange={() =>
                              handleTogglePublish(post.id, post.is_published)
                            }
                          />
                        </div>
                        {post.is_published && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        <Link to={`/admin/blog/${post.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(post.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be
              undone and will also delete all comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
