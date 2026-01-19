import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Eye, ThumbsUp, MessageCircle, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SavedArticle } from '@/types/blog';
import { getSavedArticles, toggleSaveArticle } from '@/lib/blogService';

export default function SavedArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedArticles();
  }, []);

  const loadSavedArticles = async () => {
    setLoading(true);
    const data = await getSavedArticles();
    setArticles(data);
    setLoading(false);
  };

  const handleRemove = async (articleId: string, postId: string) => {
    const success = await toggleSaveArticle(postId);
    if (success) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      toast.success('Article removed from saved');
    } else {
      toast.error('Failed to remove article');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/blog')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Articles</h1>
          <p className="text-gray-600">
            Articles you've bookmarked to read later
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-32 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">
                You haven't saved any articles yet
              </p>
              <Link to="/blog">
                <Button>Browse Blog</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((saved) => {
              const post = saved.blog_post;
              if (!post) return null;

              return (
                <Card key={saved.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    {post.cover_image_url ? (
                      <Link to={`/blog/${post.slug}`} className="w-48 flex-shrink-0">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    ) : (
                      <Link
                        to={`/blog/${post.slug}`}
                        className="w-48 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center"
                      >
                        <span className="text-4xl font-bold text-primary/30">
                          {post.title.charAt(0)}
                        </span>
                      </Link>
                    )}
                    <CardContent className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{post.category}</Badge>
                            <span className="text-xs text-gray-500">
                              Saved on {formatDate(saved.created_at)}
                            </span>
                          </div>
                          <Link to={`/blog/${post.slug}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary mb-2 line-clamp-1">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{post.author?.full_name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(post.published_at || post.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{post.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comments_count || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/blog/${post.slug}`}>
                            <Button variant="outline" size="sm">
                              Read
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemove(saved.id, post.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
