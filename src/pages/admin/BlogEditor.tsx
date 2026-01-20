import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { BlogPostCreate, BLOG_CATEGORIES } from '@/types/blog';
import { getPostById, createPost, updatePost } from '@/lib/blogService';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [category, setCategory] = useState(BLOG_CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    if (!id) return;
    const post = await getPostById(id);
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setCoverImageUrl(post.cover_image_url || '');
      setCategory(post.category);
      setTags(post.tags?.join(', ') || '');
      setIsPublished(post.is_published);
    } else {
      toast.error('Post not found');
      navigate('/admin/blog');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!excerpt.trim()) {
      toast.error('Excerpt is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setSaving(true);

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    const data: BlogPostCreate = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      cover_image_url: coverImageUrl.trim() || undefined,
      category,
      tags: tagArray,
      is_published: isPublished,
    };

    let result;
    if (isEditing && id) {
      result = await updatePost(id, data);
    } else {
      result = await createPost(data);
    }

    setSaving(false);

    if (result) {
      toast.success(isEditing ? 'Post updated' : 'Post created');
      navigate('/admin/blog');
    } else {
      toast.error('Failed to save post');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {isEditing ? 'Update blog post' : 'Create a new blog post'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description for preview cards..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="EMS, Training, Safety"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverImage">Image URL</Label>
                <Input
                  id="coverImage"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {coverImageUrl && (
                <div className="relative">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {!coverImageUrl && (
                <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <Image className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Enter an image URL above</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post content here... (Markdown supported)"
                rows={20}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Markdown formatting is supported for rich text content.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Publish</Label>
                  <p className="text-sm text-gray-500">
                    Make this post visible to all users
                  </p>
                </div>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/blog')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
