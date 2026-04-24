import { cn, PRIORITY_CONFIG } from '@/lib/utils';
import type { Priority } from '@/types';

// ─── Priority badge ───────────────────────────────────────────────────────────

interface PriorityBadgeProps {
  priority:  Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { label, className: styles } = PRIORITY_CONFIG[priority];

  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium', styles, className)}>
      {label}
    </span>
  );
}

// ─── Generic badge ────────────────────────────────────────────────────────────
// For anything that isn't priority: role labels, status, counts, etc.

const variants = {
  default: 'bg-overlay text-secondary border border-[--border-md]',
  accent:  'bg-accent-dim text-accent border border-[--accent-dim]',
  success: 'bg-[--success-dim] text-[--success]',
  warning: 'bg-[--warning-dim] text-[--warning]',
  danger:  'bg-[--danger-dim] text-[--danger]',
};

interface BadgeProps {
  variant?:  keyof typeof variants;
  className?: string;
  children:  React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
