import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

// The standard Tailwind class utility — use this everywhere
// cn('px-4', isActive && 'bg-accent', className)
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// "2 hours ago", "3 days ago"
export const timeAgo = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

// "Dec 18, 2024"
export const formatDate = (date: string | Date) =>
  format(new Date(date), "MMM d, yyyy");

// "Dec 18"
export const formatDateShort = (date: string | Date) =>
  format(new Date(date), "MMM d");

export const formattedTime = (date: string) => format(new Date(date), "h:mm a");

// First letter of first + last name → "AO"
export const initials = (firstName: string, lastName?: string | null) =>
  `${firstName[0]}${lastName?.[0] ?? ""}`.toUpperCase();

// Fractional index: midpoint between two order values
// Used when calculating where to drop a card between two others
export const midpoint = (a: number, b: number) => (a + b) / 2;

// Priority → display config
export const PRIORITY_CONFIG = {
  none: {
    label: "None",
    className: "bg-[--overlay] text-[--text-muted] border border-[--border-md]",
  },
  low: {
    label: "Low",
    className:
      "bg-[--success-dim] text-[--success] border border-[--success-dim]",
  },
  medium: {
    label: "Medium",
    className:
      "bg-[--warning-dim] text-[--warning] border border-[--warning-dim]",
  },
  high: {
    label: "High",
    className: "bg-[--danger-dim] text-[--danger] border border-[--danger-dim]",
  },
  urgent: {
    label: "Urgent",
    className: "bg-[--danger-dim] text-[--danger] border border-[--danger-dim]",
  },
} as const;

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export const LABEL_COLORS = [
  { hex: "#FF7070", classes: "bg-red-500/10 text-red-400 border-red-500/20" },
  {
    hex: "#4ABA85",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    hex: "#7C6EF5",
    classes: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  {
    hex: "#E5A23A",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    hex: "#60A5FA",
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
];

// utils.ts or labels.ts
const SEMANTIC_LABEL_COLORS: Record<string, string> = {
  bug: "#FF7070",
  error: "#FF7070",
  fix: "#FF7070",
  feature: "#7C6EF5",
  enhancement: "#7C6EF5",
  design: "#E5A23A",
  ui: "#E5A23A",
  docs: "#60A5FA",
  documentation: "#60A5FA",
  test: "#4ABA85",
  testing: "#4ABA85",
  urgent: "#FF7070",
  blocked: "#FF7070",
  chore: "#94A3B8",
};

export const pickLabelColor = (
  name: string,
  existingColors: string[],
): string => {
  // Check semantic match first
  const semantic = SEMANTIC_LABEL_COLORS[name.toLowerCase().trim()];
  if (semantic && !existingColors.includes(semantic)) return semantic;

  // Fall back to first color not already used
  const available = LABEL_COLORS.filter((c) => !existingColors.includes(c.hex));
  const pool = available.length > 0 ? available : LABEL_COLORS; // reset if all used

  return pool[Math.floor(Math.random() * pool.length)].hex;
};

export const getLabelClasses = (hex: string) =>
  LABEL_COLORS.find((c) => c.hex === hex)?.classes ??
  "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

export const getInitials = (text: string) => {
  if (!text.trim()) return "SW";
  const words = text.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return text.substring(0, 2).toUpperCase();
};

export const getConsistentColor = (id: string) => {
  const colors = [
    "#38bdf8",
    "#818cf8",
    "#a855f7",
    "#fb7185",
    "#fbbf24",
    "#34d399",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const handleDownload = async (fileUrl: string, fileName: string) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    toast.error("Failed to download file");
  }
};
