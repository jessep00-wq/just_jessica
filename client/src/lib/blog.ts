import type { BlogPost } from '../../../drizzle/schema';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function buildPostSlug(post: Pick<BlogPost, 'id' | 'title'>): string {
  return `${post.id}-${slugify(post.title)}`;
}

export function getPostHref(post: Pick<BlogPost, 'id' | 'title'>): string {
  return `/post/${buildPostSlug(post)}`;
}

export function getPostIdFromSlug(slugParam: string): number | null {
  const firstSegment = slugParam.split('-')[0];
  const id = Number(firstSegment);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function estimateReadingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
