import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { BlogPostCard } from '@/components/BlogPostCard';
import { AboutMe } from '@/components/AboutMe';
import { FeaturedPosts } from '@/components/FeaturedPosts';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Loader2, Facebook, RefreshCw } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { setOGMetaTags, getDefaultOGTags } from '@/lib/og';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PostCardSkeleton } from '@/components/PostCardSkeleton';
import { trackUxEvent } from '@/lib/analytics';

type SortMode = 'newest' | 'oldest' | 'title';

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    setOGMetaTags(getDefaultOGTags());
  }, []);

  const {
    data: blogData,
    isLoading,
    isError,
    refetch,
  } = trpc.blog.listAll.useQuery(undefined, {
    staleTime: 60_000,
  });

  const { data: featuredPosts } = trpc.blog.getFeaturedPosts.useQuery();
  const { data: authorBio } = trpc.blog.getAuthorBio.useQuery() as any;

  useEffect(() => {
    if (featuredPosts && featuredPosts.length > 0) {
      const firstFeatured = featuredPosts[0];
      setOGMetaTags({
        title: `${firstFeatured.title} - Just Jessica`,
        description: firstFeatured.excerpt,
        image: firstFeatured.ogImage || undefined,
        url: window.location.href,
        type: 'article'
      });
    }
  }, [featuredPosts]);

  const recentPosts = useMemo(() => {
    if (!blogData?.posts) return [];

    const filtered = blogData.posts
      .filter(post => post.featured === 0)
      .filter(post => {
        if (!selectedCategoryId) return true;
        return post.categoryId === selectedCategoryId;
      })
      .filter(post => {
        if (!searchQuery.trim()) return true;
        const text = `${post.title} ${post.excerpt} ${post.body}`.toLowerCase();
        return text.includes(searchQuery.trim().toLowerCase());
      });

    return filtered.sort((a, b) => {
      if (sortMode === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortMode === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [blogData?.posts, selectedCategoryId, searchQuery, sortMode]);

  const categories = blogData?.categories ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-16 space-y-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">We couldn’t load essays right now.</p>
          <Button onClick={() => refetch()} variant="outline" className="inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" id="top">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            Just Jessica
          </h1>
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-accent transition-colors">About</a>
            <a href="#featured" className="hover:text-accent transition-colors">Featured</a>
            <a href="#recent" className="hover:text-accent transition-colors">Recent</a>
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </nav>

      <section className="bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-foreground leading-tight">
              Stories on Life, Motherhood, and Identity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Personal essays and reflections on parenting, relationships, self-care, self-worth, and the everyday moments that shape us.
            </p>
          </div>
        </div>
      </section>

      <section id="about" className="bg-background border-b border-border scroll-mt-20">
        <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
          <AboutMe bio={authorBio} isAdmin={user?.role === 'admin'} />
        </div>
      </section>

      {featuredPosts && featuredPosts.length > 0 && (
        <section id="featured" className="bg-background border-b border-border scroll-mt-20">
          <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
            <FeaturedPosts posts={featuredPosts} />
          </div>
        </section>
      )}

      <section id="recent" className="bg-background scroll-mt-20">
        <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground uppercase tracking-wider">
              Recent Essays
            </h2>
            <span className="text-sm text-muted-foreground">{recentPosts.length} results</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3 mb-6">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  trackUxEvent('home_search', { queryLength: e.target.value.length });
                }
              }}
              placeholder="Search essays by title, excerpt, or content"
              aria-label="Search essays"
              className="rounded-sm"
            />
            <Select
              value={sortMode}
              onValueChange={(value: SortMode) => {
                setSortMode(value);
                trackUxEvent('home_sort_change', { sort: value });
              }}
            >
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={(id) => {
                setSelectedCategoryId(id);
                trackUxEvent('home_category_filter', { categoryId: id ?? 'all' });
              }}
            />
          )}

          <div className="space-y-8">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} category={categories.find(c => c.id === post.categoryId)} />
              ))
            ) : (
              <div className="text-center py-12 border border-border rounded-sm bg-card">
                <p className="text-muted-foreground text-lg mb-3">
                  No essays match this filter yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId(null);
                    setSortMode('newest');
                  }}
                >
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-background border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
          <NewsletterSignup source="home" />
        </div>
      </section>

      <footer className="bg-card border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 py-10">
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://www.facebook.com/jessica.pettigrew3/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:text-accent transition-colors group"
              aria-label="Connect with Jessica on Facebook"
            >
              <Facebook className="w-5 h-5" />
              <span className="font-medium">Connect on Facebook</span>
            </a>
            <p className="text-sm text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} Just Jessica. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <a
        href="#top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 right-4 md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-foreground"
        aria-label="Back to top"
      >
        ↑
      </a>
    </div>
  );
}
