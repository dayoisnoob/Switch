import { cn } from '@/lib/utils';

const sizes = {
  sm: 'w-3 h-3 border',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-2',
};

interface SpinnerProps {
  size?:      keyof typeof sizes;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full border-surface border-t-accent animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

// Full-page loading state — used in Suspense boundaries and loading.tsx files
export function PageLoader() {
  return (
    <div className="flex items-center justify-center flex-1 h-full min-h-[200px]">
      <Spinner size="md" />
    </div>
  );
}
