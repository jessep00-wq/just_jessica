import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { BlogPostCard } from '@/components/BlogPostCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { setOGMetaTags, getDefaultOGTags } from '@/lib/og';

export default function Home() {
  const { user } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Set default OG tags on mount
  useEffect(() => {
    setOGMetaTags(getDefaultOGTags());
  }, []);

  const { data: blogData, isLoading } = trpc.blog.listAll.useQuery();
  const { data: featuredPost } = trpc.blog.getFeatured.useQuery();

  // Update OG tags when featured post changes
  useEffect(() => {
    if (featuredPost) {
      setOGMetaTags({
        title: `${featuredPost.title} - Just Jessica`,
        description: featuredPost.excerpt,
        image: featuredPost.ogImage || undefined,
        url: window.location.href,
        type: 'article'
      });
    }
  }, [featuredPost]);


  // Filter posts by selected category
  const filteredPosts = useMemo(() => {
    if (!blogData?.posts) return [];
    if (selectedCategoryId === null) return blogData.posts;
    return blogData.posts.filter(post => post.categoryId === selectedCategoryId);
  }, [blogData?.posts, selectedCategoryId]);

  // Create category map for quick lookup
  const categoryMap = useMemo(() => {
    if (!blogData?.categories) return {};
    return Object.fromEntries(
      blogData.categories.map(cat => [cat.id, cat])
    );
  }, [blogData?.categories]);

  if (isLoading) {
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
            Just Jessica
          </h1>
          {user?.role === 'admin' && (
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/admin')}
              className="rounded-sm"
            >
              Admin
            </Button>
          )}
          {!user && (
            <Button
              variant="outline"
              onClick={() => (window.location.href = getLoginUrl())}
              className="rounded-sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-foreground leading-tight">
              Stories on Life, Motherhood, and Identity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Personal essays and reflections on parenting, relationships, healthcare operations, and the everyday moments that shape us.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="bg-background border-b border-border">
          <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
            <div className="mb-4">
              <span className="text-xs font-medium text-accent uppercase tracking-wider">
                Featured
              </span>
            </div>
            <BlogPostCard
              post={featuredPost}
              category={categoryMap[featuredPost.categoryId]}
            />
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* Category Filter */}
          <CategoryFilter
            categories={blogData?.categories || []}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />

          {/* Posts Grid */}
          <div className="space-y-8">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  category={categoryMap[post.categoryId]}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No posts yet. Check back soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Jessica. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
