"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Plus, Loader2 } from "lucide-react";
import { cn, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface CreateInputProps {
  onSubmit: (value: string) => Promise<void>;
  placeholder?: string;
  buttonText: string;
  isColumn?: boolean;
}

export function CreateInput({
  onSubmit,
  placeholder = "Enter title...",
  buttonText,
  isColumn = false,
}: CreateInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(trimmed);
      setValue("");
      if (isColumn) setIsEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      setIsEditing(false);
      setValue("");
    }
  };

  if (isEditing) {
    return (
      <div
        className={cn(
          "bg-[#161b22] border border-[#58a6ff] rounded-lg p-2 shadow-lg transition-all",
          isColumn ? "w-[320px] shrink-0" : "w-full",
        )}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!value.trim()) setIsEditing(false);
          }}
          disabled={loading}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[#f0f6fc] placeholder:text-[#8b949e] focus:outline-none mb-2"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setIsEditing(false);
              setValue("");
            }}
            className="px-2 py-1 text-xs font-medium text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            className="flex items-center justify-center min-w-12.5 px-3 py-1 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : "Add"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        "flex items-center justify-center gap-2 py-2 text-sm font-medium transition-all",
        isColumn
          ? "w-[320px] shrink-0 h-14 border-2 border-dashed border-[#30363d] hover:border-[#484f58] rounded-xl text-[#8b949e] hover:text-[#c9d1d9] bg-[#0d1117]/50 hover:bg-[#161b22]"
          : "w-full text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2128] rounded-md",
      )}
    >
      <Plus size={16} /> {buttonText}
    </button>
  );
}
