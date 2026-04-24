import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

// The standard Tailwind class utility — use this everywhere
// cn('px-4', isActive && 'bg-accent', className)
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// "2 hours ago", "3 days ago"
export const timeAgo = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

// "Dec 18, 2024"
export const formatDate = (date: string | Date) =>
  format(new Date(date), 'MMM d, yyyy');

// "Dec 18"
export const formatDateShort = (date: string | Date) =>
  format(new Date(date), 'MMM d');

// First letter of first + last name → "AO"
export const initials = (firstName: string, lastName?: string | null) =>
  `${firstName[0]}${lastName?.[0] ?? ''}`.toUpperCase();

// Fractional index: midpoint between two order values
// Used when calculating where to drop a card between two others
export const midpoint = (a: number, b: number) => (a + b) / 2;

// Priority → display config
export const PRIORITY_CONFIG = {
  none:   { label: 'None',   className: 'bg-[--overlay] text-[--text-muted] border border-[--border-md]' },
  low:    { label: 'Low',    className: 'bg-[--success-dim] text-[--success] border border-[--success-dim]' },
  medium: { label: 'Medium', className: 'bg-[--warning-dim] text-[--warning] border border-[--warning-dim]' },
  high:   { label: 'High',   className: 'bg-[--danger-dim] text-[--danger] border border-[--danger-dim]' },
  urgent: { label: 'Urgent', className: 'bg-[--danger-dim] text-[--danger] border border-[--danger-dim]' },
} as const;
