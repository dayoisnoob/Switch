import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-accent text-white hover:opacity-90",
  ghost:
    "bg-transparent text-secondary border border-[--border-md] hover:bg-card hover:text-primary",
  danger:
    "bg-[--danger-dim] text-[--danger] border border-[--danger-dim] hover:opacity-90",
};

const sizes = {
  sm: "h-7 px-3 text-xs rounded-md gap-1.5",
  md: "h-8 px-4 text-sm rounded-lg gap-2",
  lg: "h-10 px-5 text-sm rounded-lg gap-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export function Button({
  variant = "ghost",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-sans font-medium",
        "transition-all duration-150 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Dots /> : children}
    </button>
  );
}

// Three-dot loading indicator — simpler than a spinner inside a button
function Dots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
