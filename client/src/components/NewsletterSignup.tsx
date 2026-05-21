import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { trackUxEvent } from '@/lib/analytics';

type NewsletterSignupProps = {
  source?: 'home' | 'post_inline';
  compact?: boolean;
};

export function NewsletterSignup({ source = 'home', compact = false }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const subscribeMutation = trpc.blog.subscribeNewsletter.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    trackUxEvent('newsletter_submit_attempt', { source });

    try {
      const result = await subscribeMutation.mutateAsync({ email });
      if (result.alreadySubscribed) {
        trackUxEvent('newsletter_already_subscribed', { source });
        toast.success("You're already subscribed. Thank you for being here.");
      } else {
        trackUxEvent('newsletter_subscribe_success', { source });
        toast.success('Thank you for subscribing. Welcome to the journey.');
      }
      setEmail('');
    } catch (error) {
      trackUxEvent('newsletter_subscribe_error', { source });
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="border border-border rounded-sm p-6 md:p-10 bg-card">
      <div className={`${compact ? 'max-w-2xl' : 'max-w-xl'} mx-auto text-center`}>
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-accent" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-3">
          {compact ? 'Enjoying this essay?' : 'Stay Close to the Words'}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {compact
            ? 'Get new essays in your inbox each week—quiet reflections, motherhood stories, and practical encouragement.'
            : 'Subscribe to receive new essays, gentle reflections, and quiet inspiration delivered straight to your inbox.'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="rounded-sm flex-1"
            disabled={subscribeMutation.isPending}
            aria-label="Email address"
          />
          <Button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-sm"
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              compact ? 'Get weekly essays' : 'Subscribe'
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
