import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { BlogPostCard } from '@/components/BlogPostCard';
import { AboutMe } from '@/components/AboutMe';
import { FeaturedPosts } from '@/components/FeaturedPosts';
import { SocialShare } from '@/components/SocialShare';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { setOGMetaTags, getDefaultOGTags } from '@/lib/og';

export default function Home() {
  const { user } = useAuth();
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

  // Set default OG tags on mount
  useEffect(() => {
    setOGMetaTags(getDefaultOGTags());
  }, []);

  const { data: blogData, isLoading } = trpc.blog.listAll.useQuery();
  const { data: featuredPosts } = trpc.blog.getFeaturedPosts.useQuery();
  const { data: authorBio } = trpc.blog.getAuthorBio.useQuery() as any;

  // Update OG tags when featured posts change
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

  // Separate featured and recent posts
  const recentPosts = useMemo(() => {
    if (!blogData?.posts) return [];
    return blogData.posts.filter(post => post.featured === 0);
  }, [blogData?.posts]);

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

      {/* About Me Section */}
      <section className="bg-background border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
          <AboutMe bio={authorBio} isAdmin={user?.role === 'admin'} />
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts && featuredPosts.length > 0 && (
        <section className="bg-background border-b border-border">
          <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
            <FeaturedPosts posts={featuredPosts} />
          </div>
        </section>
      )}

      {/* Recent Posts Section */}
      <section className="bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground mb-8 uppercase tracking-wider">
            Recent Essays
          </h2>

          {/* Posts Grid */}
          <div className="space-y-8">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id}>
                  <BlogPostCard post={post} />
                  {expandedPostId === post.id && (
                    <SocialShare
                      title={post.title}
                      excerpt={post.excerpt}
                    />
                  )}
                </div>
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
