"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/board/index";

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  colorClass?: string;
}

interface SidebarDropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  valueClass?: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placement?: "top" | "bottom"; // <-- Added placement prop
}

export function SidebarDropdown({
  label,
  icon,
  value,
  valueClass,
  options,
  onSelect,
  placement = "bottom", // <-- Default to bottom
}: SidebarDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref}>
      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#1A1A28] hover:bg-[#1E1E2E] border border-white/5 text-sm transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-white/40">{icon}</span>
            <span className={cn("text-white/80 font-medium", valueClass)}>
              {value}
            </span>
          </div>
          <ChevronDown
            size={13}
            className={cn(
              "text-white/30 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div
            className={cn(
              "absolute left-0 w-full bg-[#13131C] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150",
              // Dynamically apply top or bottom positioning based on the prop
              placement === "bottom"
                ? "top-[calc(100%+6px)] slide-in-from-top-1"
                : "bottom-[calc(100%+6px)] slide-in-from-bottom-1",
            )}
          >
            <div className="max-h-56 overflow-y-auto p-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  {opt.icon && (
                    <span
                      className={cn("text-white/40 shrink-0", opt.colorClass)}
                    >
                      {opt.icon}
                    </span>
                  )}
                  <span
                    className={cn("text-white/70 truncate", opt.colorClass)}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
