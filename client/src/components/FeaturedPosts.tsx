import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

export function FeaturedPosts() {
  const { data: featuredPosts, isLoading } = trpc.blog.getFeaturedPosts.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!featuredPosts || featuredPosts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredPosts.map((post) => (
        <div
          key={post.id}
          className="featured-card group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Featured Badge */}
          <div className="mb-4">
            <span className="featured-badge">Featured</span>
          </div>

          {/* Title */}
          <h3 className="editorial-title text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors">
            {post.title}
          </h3>

          {/* Date */}
          <p className="text-sm text-muted-foreground mb-3">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          {/* Excerpt */}
          <p className="text-foreground/80 text-sm leading-relaxed line-clamp-3 mb-4">
            {post.excerpt}
          </p>


        </div>
      ))}
    </div>
  );
}
