import { useState } from 'react';
import { ChevronDown, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '../../../drizzle/schema';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialShare } from './SocialShare';
import { Link } from 'wouter';
import { estimateReadingTimeMinutes, getPostHref } from '@/lib/blog';
import { trackUxEvent } from '@/lib/analytics';

interface BlogPostCardProps {
  post: BlogPost;
  category?: { name: string; slug: string };
}

export function BlogPostCard({ post, category }: BlogPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const readingTime = estimateReadingTimeMinutes(`${post.excerpt}\n${post.body}`);

  const handleToggleExpand = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    if (nextExpanded) {
      trackUxEvent('post_expand', { postId: post.id, title: post.title });
    }
  };

  const handleOpenPost = () => {
    trackUxEvent('post_open_click', { postId: post.id, title: post.title });
  };

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
    <article className="border border-border rounded-lg p-6 md:p-8 bg-card hover:shadow-lg transition-all duration-200">
      {/* Top Share Buttons */}
      <div className="flex justify-end mb-4 opacity-60 hover:opacity-100 transition-opacity">
        <SocialShare title={post.title} excerpt={post.excerpt} url={typeof window !== 'undefined' ? `${window.location.origin}${getPostHref(post)}` : undefined} />
      </div>

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

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
        <p>
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <span aria-hidden="true">•</span>
        <p className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {readingTime} min read
        </p>
      </div>

      <p className="text-base leading-relaxed text-foreground mb-6">
        {post.excerpt}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleToggleExpand}
          className="group inline-flex items-center gap-2 text-accent hover:text-accent/80 p-0 h-auto font-medium transition-colors"
        >
          <span>{isExpanded ? 'Read Less' : 'Quick Preview'}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </Button>

        <Link href={getPostHref(post)} onClick={handleOpenPost} className="inline-flex">
          <Button variant="outline" className="rounded-sm inline-flex items-center gap-2">
            Read Full Essay
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </div>

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

      {/* Bottom Share Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-6 pt-6 border-t border-border"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Share this essay</p>
                <SocialShare title={post.title} excerpt={post.excerpt} url={typeof window !== 'undefined' ? `${window.location.origin}${getPostHref(post)}` : undefined} />
              </div>
              
              {/* Newsletter CTA inside expanded content */}
              <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg p-4 border border-secondary/20">
                <p className="text-sm font-medium text-foreground mb-2">Loved this essay?</p>
                <p className="text-xs text-foreground/70 mb-3">Subscribe to receive new essays like this delivered to your inbox.</p>
                <a href="#newsletter" className="text-accent hover:text-accent/80 text-sm font-medium transition-colors">
                  Join the newsletter →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
