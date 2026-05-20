import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const subscribeMutation = trpc.blog.subscribeNewsletter.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const result = await subscribeMutation.mutateAsync({ email });
      if (result.alreadySubscribed) {
        toast.success("You're already subscribed. Thank you for being here.");
      } else {
        toast.success('Thank you for subscribing. Welcome to the journey.');
      }
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="border border-border rounded-sm p-6 md:p-10 bg-card">
      <div className="max-w-xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-accent" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-3">
          Stay Close to the Words
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Subscribe to receive new essays, gentle reflections, and quiet inspiration delivered straight to your inbox.
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
              'Subscribe'
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
