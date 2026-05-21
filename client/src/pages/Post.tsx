import { useEffect, useMemo, useRef } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getPostIdFromSlug, estimateReadingTimeMinutes, getPostHref } from '@/lib/blog';
import { setOGMetaTags } from '@/lib/og';
import { SocialShare } from '@/components/SocialShare';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { PostCardSkeleton } from '@/components/PostCardSkeleton';
import { trackUxEvent } from '@/lib/analytics';

export default function PostPage() {
  const [, params] = useRoute<{ slug: string }>('/post/:slug');
  const postId = params?.slug ? getPostIdFromSlug(params.slug) : null;
  const trackedMilestonesRef = useRef<Set<number>>(new Set());

  const {
    data: blogData,
    isLoading,
    isError,
    refetch,
  } = trpc.blog.listAll.useQuery(undefined, {
    staleTime: 60_000,
  });

  const post = useMemo(() => {
    if (!postId || !blogData?.posts) return null;
    return blogData.posts.find(item => item.id === postId) ?? null;
  }, [blogData?.posts, postId]);

  const category = useMemo(() => {
    if (!post || !blogData?.categories) return null;
    return blogData.categories.find(item => item.id === post.categoryId) ?? null;
  }, [blogData?.categories, post]);

  const relatedPosts = useMemo(() => {
    if (!post || !blogData?.posts) return [];

    const sameCategory = blogData.posts.filter(item => item.id !== post.id && item.categoryId === post.categoryId);
    const fallback = blogData.posts.filter(item => item.id !== post.id);

    return [...sameCategory, ...fallback]
      .filter((item, index, arr) => arr.findIndex(other => other.id === item.id) === index)
      .slice(0, 3);
  }, [blogData?.posts, post]);

  useEffect(() => {
    if (!post) return;

    setOGMetaTags({
      title: `${post.title} - Just Jessica`,
      description: post.excerpt,
      image: post.ogImage || undefined,
      url: window.location.href,
      type: 'article',
    });

    trackUxEvent('post_view', { postId: post.id, title: post.title });
  }, [post]);

  useEffect(() => {
    if (!post) return;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScrollable = Math.max(1, documentHeight - viewportHeight);
      const progress = Math.min(100, Math.round((scrollTop / maxScrollable) * 100));

      [25, 50, 75, 100].forEach((milestone) => {
        if (progress >= milestone && !trackedMilestonesRef.current.has(milestone)) {
          trackedMilestonesRef.current.add(milestone);
          trackUxEvent('post_read_depth', { postId: post.id, milestone });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      trackedMilestonesRef.current.clear();
    };
  }, [post]);

  if (!postId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-16 space-y-6">
          <p className="text-muted-foreground">Invalid post link.</p>
          <Link href="/">
            <Button variant="outline">Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-16 space-y-8">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-16 space-y-6">
          <p className="text-muted-foreground">We couldn’t load this essay right now.</p>
          <Button onClick={() => refetch()} variant="outline" className="inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-16 space-y-6">
          <p className="text-muted-foreground">This essay doesn’t exist anymore.</p>
          <Link href="/">
            <Button variant="outline">Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = estimateReadingTimeMinutes(post.body);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <a href="#related" className="text-sm text-muted-foreground hover:text-accent transition-colors">Continue reading</a>
        </div>
      </nav>

      <article className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
        <header className="border-b border-border pb-8 mb-8 space-y-4">
          {category && (
            <p className="text-xs font-medium text-accent uppercase tracking-wider">
              {category.name}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <p>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <span aria-hidden="true">•</span>
            <p className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readingTime} min read
            </p>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground prose-p:leading-8 prose-li:text-foreground">
          {post.body.split('\n').map((line, index) => {
            if (!line.trim()) return <div key={`space-${index}`} className="h-4" />;
            if (line.startsWith('## ')) return <h2 key={`h2-${index}`}>{line.slice(3)}</h2>;
            if (line.startsWith('# ')) return <h3 key={`h3-${index}`}>{line.slice(2)}</h3>;
            if (line.startsWith('- ')) return <li key={`li-${index}`}>{line.slice(2)}</li>;
            return <p key={`p-${index}`}>{line}</p>;
          })}
        </div>

        <SocialShare
          title={post.title}
          excerpt={post.excerpt}
          url={typeof window !== 'undefined' ? window.location.href : undefined}
        />
      </article>

      <section className="container max-w-3xl mx-auto px-4 pb-12 md:pb-16">
        <NewsletterSignup source="post_inline" compact />
      </section>

      <section id="related" className="container max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">Continue reading</h2>
        <div className="space-y-4">
          {relatedPosts.length > 0 ? relatedPosts.map((related) => (
            <Link
              key={related.id}
              href={getPostHref(related)}
              className="block border border-border rounded-sm p-4 bg-card hover:border-accent transition-colors"
              onClick={() => trackUxEvent('related_post_click', { fromPostId: post.id, toPostId: related.id })}
            >
              <p className="font-medium text-foreground">{related.title}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{related.excerpt}</p>
            </Link>
          )) : (
            <p className="text-muted-foreground">No related essays yet.</p>
          )}
        </div>
      </section>

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
