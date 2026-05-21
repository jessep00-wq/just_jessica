import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { BlogPostCard } from '@/components/BlogPostCard';
import { AboutMe } from '@/components/AboutMe';
import { FeaturedPosts } from '@/components/FeaturedPosts';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { Facebook, ArrowDown } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { setOGMetaTags, getDefaultOGTags } from '@/lib/og';

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    setOGMetaTags(getDefaultOGTags());
  }, []);

  const { data: blogData, isLoading } = trpc.blog.listAll.useQuery();
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

  // Extract posts array from blogData structure
  const allPosts = Array.isArray(blogData) ? blogData : blogData?.posts || [];
  const recentPosts = allPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sign In */}
      {!user && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg"
          >
            Sign In
          </Button>
        </div>
      )}

      {/* HERO SECTION - Dramatic, oversized, gradient-rich */}
      <section className="relative orb-gradient min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(0.62 0.22 25) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite'
          }}
        />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(0.35 0.18 310) 0%, transparent 70%)',
            animation: 'float 10s ease-in-out infinite 1s'
          }}
        />

        <div className="relative z-10 container max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="space-y-8 mb-12">
            <h1 className="hero-headline text-foreground leading-tight">
              Just Jessica
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed font-light">
              Stories on life, motherhood, and identity. Personal essays and reflections on parenting, relationships, self-care, and self-worth.
            </p>
          </div>

          {/* Newsletter Signup in Hero */}
          <div className="max-w-md mx-auto mb-12">
            <NewsletterSignup />
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-16 animate-bounce">
            <ArrowDown className="w-6 h-6 text-accent" />
          </div>
        </div>
      </section>

      {/* About Me Section */}
      {authorBio && (
        <section className="bg-card border-b border-border">
          <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
            <AboutMe bio={authorBio} />
          </div>
        </section>
      )}

      {/* Featured Essays Section */}
      {featuredPosts && featuredPosts.length > 0 && (
        <section className="bg-gradient-to-b from-background via-muted/30 to-background border-b border-border">
          <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
            <div className="mb-12">
              <h2 className="editorial-title text-foreground mb-2">Featured Essays</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-accent to-secondary rounded-full" />
            </div>
            <FeaturedPosts />
          </div>
        </section>
      )}

      {/* Recent Essays Section */}
      <section className="bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="mb-12">
            <h2 className="editorial-title text-foreground mb-2">Recent Essays</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-secondary to-accent rounded-full" />
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="space-y-6">
              {recentPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No essays yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup Section (Secondary) */}
      <section className="bg-gradient-to-b from-background to-muted/20 border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 py-16 md:py-20">
          <NewsletterSignup />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center gap-6">
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
      `}</style>
    </div>
  );
}
