import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';

export default function Admin() {
  const { user, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    body: '',
    categoryId: '',
    featured: 0,
    ogImage: undefined as string | undefined,
  });

  const { data: blogData, isLoading: isLoadingBlog, refetch } = trpc.blog.listAll.useQuery();
  const createMutation = trpc.blog.create.useMutation();
  const deleteMutation = trpc.blog.delete.useMutation();

  // Redirect if not admin
  if (!loading && (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-foreground text-lg">You do not have access to this page.</p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="rounded-sm"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.excerpt || !formData.body || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate featured is 0 or 1
    if (formData.featured !== 0 && formData.featured !== 1) {
      formData.featured = 0;
    }

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        excerpt: formData.excerpt,
        body: formData.body,
        categoryId: parseInt(formData.categoryId),
        featured: formData.featured,
        ogImage: undefined,
      });

      toast.success('Post created successfully');
      setFormData({
        title: '',
        excerpt: '',
        body: '',
        categoryId: '',
        featured: 0,
        ogImage: undefined,
      });
      setIsCreating(false);
      refetch();
    } catch (error) {
      toast.error('Failed to create post');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Post deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete post');
      console.error(error);
    }
  };

  if (loading || isLoadingBlog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            Admin Panel
          </h1>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="rounded-sm"
          >
            Back to Blog
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <section className="container max-w-4xl mx-auto px-4 py-12">
        {/* Create Post Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-semibold text-foreground">
              Create New Post
            </h2>
            {!isCreating && (
              <Button
                onClick={() => setIsCreating(true)}
                className="rounded-sm"
              >
                New Post
              </Button>
            )}
          </div>

          {isCreating && (
            <form onSubmit={handleSubmit} className="border border-border rounded-sm p-6 space-y-6 bg-card">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Post title"
                  className="rounded-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value } as any)}
                >
                  <SelectTrigger className="rounded-sm">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogData?.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Excerpt *
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value } as any)}
                  placeholder="Brief summary of the post"
                  rows={3}
                  className="rounded-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Body *
                </label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value } as any)}
                  placeholder="Full post content (supports markdown-like formatting with #, ##, -, etc.)"
                  rows={10}
                  className="rounded-sm font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured === 1}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? 1 : 0 } as any)}
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm font-medium text-foreground cursor-pointer">
                  Feature this post on homepage
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-sm"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Post'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="rounded-sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Posts List */}
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
            All Posts
          </h2>

          {blogData?.posts && blogData.posts.length > 0 ? (
            <div className="space-y-4">
              {blogData.posts.map((post) => {
                const category = blogData.categories.find(c => c.id === post.categoryId);
                return (
                  <div
                    key={post.id}
                    className="border border-border rounded-sm p-4 flex items-start justify-between bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category?.name} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      {post.featured === 1 && (
                        <span className="inline-block mt-2 text-xs font-medium text-accent uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive/80 rounded-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No posts yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
