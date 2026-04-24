"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

// 4-box OTP input — auto-advances on input, auto-retreats on backspace
export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return; // digits only

    const next = value.split("");
    next[index] = char.slice(-1); // take last char in case of paste of a single digit
    const updated = next.join("").slice(0, length);
    onChange(updated);

    // Advance focus to next box
    if (char && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      // Move back on backspace when current box is empty
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(pasted);
    // Focus the box after the last pasted digit
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "flex-1 h-14 rounded-lg border bg-card text-center text-xl font-medium text-primary",
            "transition-colors duration-150 outline-none",
            value[i]
              ? "border-[--border-lg] text-accent"
              : "border-[--border-md]",
            "focus:border-accent",
          )}
        />
      ))}
    </div>
  );
}
