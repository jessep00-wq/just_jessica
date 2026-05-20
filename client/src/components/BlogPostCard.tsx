import { useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '../../../drizzle/schema';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPostCardProps {
  post: BlogPost;
  category?: { name: string; slug: string };
}

export function BlogPostCard({ post, category }: BlogPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Enhanced markdown-like rendering for rich text
  const renderBody = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = (): void => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside ml-2 mb-4 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-foreground">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line: string, idx: number) => {
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${idx}`} className="text-xl font-serif font-semibold mt-4 mb-2">
            {line.slice(2)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h4 key={`h4-${idx}`} className="text-lg font-serif font-semibold mt-3 mb-2">
            {line.slice(3)}
          </h4>
        );
      } else if (line.startsWith('- ')) {
        listItems.push(line.slice(2));
      } else if (line.trim() === '') {
        flushList();
        elements.push(<div key={`spacer-${idx}`} className="h-2" />);
      } else {
        flushList();
        elements.push(
          <p key={`p-${idx}`} className="mb-3 text-foreground">
            {line}
          </p>
        );
      }
    });

    flushList();
    return elements as React.ReactNode[];
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

      {/* Expanded content with animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mt-6 pt-6 border-t border-border space-y-4 text-foreground overflow-hidden"
          >
            {renderBody(post.body)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read More / Read Less button */}
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 group inline-flex items-center gap-2 text-accent hover:text-accent/80 p-0 h-auto font-medium transition-colors"
        >
          <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </Button>
      </motion.div>
    </article>
  );
}
