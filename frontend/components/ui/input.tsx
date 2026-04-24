import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={cn(
          "h-10 w-full rounded-lg bg-card border border-[--border-md] px-3",
          "text-sm text-primary placeholder:text-muted",
          "transition-colors duration-150",
          "hover:border-[--border-lg]",
          "focus:outline-none focus:border-accent",
          error && "border-[--danger] focus:border-[--danger]",
          className,
        )}
        {...props}
      />

      {error && <p className="text-xs text-[--danger]">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

// Textarea follows the same pattern as Input
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-secondary">
          {label}
        </label>
      )}

      <textarea
        id={inputId}
        className={cn(
          "w-full rounded-lg bg-card border border-[--border-md] px-3 py-2",
          "text-sm text-primary placeholder:text-muted resize-none",
          "transition-colors duration-150",
          "hover:border-[--border-lg]",
          "focus:outline-none focus:border-accent",
          error && "border-[--danger]",
          className,
        )}
        {...props}
      />

      {error && <p className="text-xs text-[--danger]">{error}</p>}
    </div>
  );
}
