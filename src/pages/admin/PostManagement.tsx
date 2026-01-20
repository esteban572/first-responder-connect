import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Check } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Post } from '@/types/post';
import { getAllPosts, updatePost, deletePost } from '@/lib/adminService';

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (searchQuery?: string) => {
    setLoading(true);
    const data = await getAllPosts(searchQuery);
    setPosts(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts(search);
  };

  const handleStartEdit = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    const success = await updatePost(editingPost.id, editContent);
    if (success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id ? { ...p, content: editContent } : p
        )
      );
      toast.success('Post updated');
      handleCancelEdit();
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage all user posts</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch('');
                  loadPosts();
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>

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
              <p className="text-gray-500">
                {search ? 'No posts found matching your search' : 'No posts yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author?.avatar_url} />
                      <AvatarFallback>
                        {post.author ? getInitials(post.author.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {post.author?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {post.author?.role} · {formatDate(post.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingPost?.id === post.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={handleSaveEdit}>
                                <Check className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartEdit(post)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteId(post.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {editingPost?.id === post.id ? (
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="mt-3"
                          rows={4}
                        />
                      ) : (
                        <p className="mt-3 text-gray-700 whitespace-pre-wrap">
                          {post.content}
                        </p>
                      )}

                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Post image"
                          className="mt-3 rounded-lg max-h-64 object-cover"
                        />
                      )}

                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.likes_count} likes</span>
                        <span>{post.comments_count} comments</span>
                        {post.location && <span>{post.location}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone
              and will also delete all associated comments and likes.
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
