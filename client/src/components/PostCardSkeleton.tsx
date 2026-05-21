import { Skeleton } from '@/components/ui/skeleton';

export function PostCardSkeleton() {
  return (
    <div className="border border-border rounded-sm p-6 md:p-8 bg-card space-y-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-4 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
  );
}
