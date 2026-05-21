import { Share2, Facebook, Twitter, Pin, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trackUxEvent } from '@/lib/analytics';

interface SocialShareProps {
  title: string;
  excerpt: string;
  url?: string;
}

export function SocialShare({ title, excerpt, url }: SocialShareProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?description=${encodedExcerpt}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const width = 600;
    const height = 400;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    trackUxEvent('post_share_click', { platform, title });

    window.open(
      shareLinks[platform],
      'Share',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    trackUxEvent('post_share_copy_link', { title });
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Share:
      </span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('facebook')}
          title="Share on Facebook"
          className="p-2 h-auto hover:text-accent transition-colors"
        >
          <Facebook className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('twitter')}
          title="Share on Twitter"
          className="p-2 h-auto hover:text-accent transition-colors"
        >
          <Twitter className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('pinterest')}
          title="Share on Pinterest"
          className="p-2 h-auto hover:text-accent transition-colors"
        >
          <Pin className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('linkedin')}
          title="Share on LinkedIn"
          className="p-2 h-auto hover:text-accent transition-colors"
        >
          <Linkedin className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          title="Copy link"
          className="p-2 h-auto hover:text-accent transition-colors ml-2 border-l border-border pl-2"
        >
          <span className="text-xs font-medium">Copy Link</span>
        </Button>
      </div>
    </div>
  );
}
