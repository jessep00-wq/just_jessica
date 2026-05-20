import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '../../../drizzle/schema';

interface BlogPostCardProps {
  post: BlogPost;
  category?: { name: string; slug: string };
}

export function BlogPostCard({ post, category }: BlogPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Simple markdown-like rendering for rich text
  const renderBody = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">{line.slice(2)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h4 key={idx} className="text-lg font-semibold mt-3 mb-2">{line.slice(3)}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="ml-4">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="mb-3">{line}</p>;
    });
  };

  return (
    <article className="border border-border rounded-sm p-6 md:p-8 bg-card hover:shadow-sm transition-shadow duration-200">
      {/* Header with category and date */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex flex-col gap-2">
          {category && (
            <span className="inline-block text-xs font-medium text-accent uppercase tracking-wider w-fit">
              {category.name}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
            {post.title}
          </h2>
        </div>
      </div>

      {/* Date */}
      <p className="text-sm text-muted-foreground mb-4">
        {new Date(post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>

      {/* Excerpt */}
      <p className="text-base leading-relaxed text-foreground mb-6">
        {post.excerpt}
      </p>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-border space-y-4 text-foreground">
          {renderBody(post.body)}
        </div>
      )}

      {/* Read More / Read Less button */}
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 group inline-flex items-center gap-2 text-accent hover:text-accent/80 p-0 h-auto font-medium"
      >
        <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </Button>
    </article>
  );
}
