"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  high: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  none: "bg-white/5 text-white/40 border-white/10",
};

interface CardTitleProps {
  title: string;
  priority: string;
  onSave: (title: string) => void;
}

export function CardTitle({ title, priority, onSave }: CardTitleProps) {
  const [value, setValue] = useState(title);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "0px";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSave = () => {
    if (!value.trim()) {
      setValue(title);
      return;
    }
    if (value !== title) onSave(value);
  };

  const p = priority?.toLowerCase() || "none";
  const pStyle = PRIORITY_STYLES[p] ?? PRIORITY_STYLES.none;

  return (
    <div className="mb-8">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            setValue(title);
            e.currentTarget.blur();
          }
        }}
        className="w-full bg-transparent text-[24px] font-bold text-white border border-transparent hover:border-white/5 focus:border-[#7C6EF5]/50 focus:bg-white/2 rounded-lg px-3 py-1.5 -ml-3 outline-none transition-all resize-none overflow-hidden leading-tight mb-3"
        rows={1}
      />
      {priority && priority !== "none" && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border",
            pStyle,
          )}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
          {priority}
        </div>
      )}
    </div>
  );
}
