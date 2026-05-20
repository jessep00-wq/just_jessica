import { BlogPostCard } from './BlogPostCard';
import type { BlogPost } from '../../../drizzle/schema';

interface FeaturedPostsProps {
  posts: BlogPost[];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground mb-6 uppercase tracking-wider">
        Featured Essays
      </h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
