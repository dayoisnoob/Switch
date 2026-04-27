"use client";

import { useRef, useState } from "react";
import { Tag, CheckCircle2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLabelClasses } from "@/lib/utils";
import { useClickOutside } from "@/hooks/board";

interface Label {
  id: string;
  name: string;
  color?: string;
  colour?: string;
}

interface SidebarLabelDropdownProps {
  projectLabels: Label[];
  selectedLabels: Label[];
  onToggleLabel: (labelId: string) => void;
  onCreateLabel: (name: string) => void;
}

export function SidebarLabelDropdown({
  projectLabels,
  selectedLabels,
  onToggleLabel,
  onCreateLabel,
}: SidebarLabelDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    setOpen(false);
    setSearch("");
  });

  const filtered = projectLabels.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );
  const exactMatch = projectLabels.some(
    (l) => l.name.toLowerCase() === search.toLowerCase(),
  );

  return (
    <div ref={ref} className="relative">
      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
        Labels
      </p>

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-2 px-3 py-2 rounded-lg bg-[#1A1A28] hover:bg-[#1E1E2E] border border-white/5 text-sm transition-colors min-h-[38px]"
      >
        <Tag size={14} className="text-white/40 shrink-0 mt-0.5" />
        {selectedLabels.length === 0 ? (
          <span className="text-white/40 font-medium">None</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedLabels.map((label) => {
              const hex = label.colour || label.color || "";
              return (
                <span
                  key={label.id}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md border font-medium",
                    getLabelClasses(hex),
                  )}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#13131C] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-white/5">
            <input
              autoFocus
              type="text"
              placeholder="Search or create..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A1A28] border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C6EF5]/40"
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.map((label) => {
              const isSelected = selectedLabels.some((l) => l.id === label.id);
              const hex = label.colour || label.color || "";
              return (
                <button
                  key={label.id}
                  onClick={() => onToggleLabel(label.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md border font-medium",
                      getLabelClasses(hex),
                    )}
                  >
                    {label.name}
                  </span>
                  {isSelected && (
                    <CheckCircle2 size={13} className="text-[#7C6EF5]" />
                  )}
                </button>
              );
            })}

            {search.trim() && !exactMatch && (
              <button
                onClick={() => {
                  onCreateLabel(search.trim());
                  setSearch("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-[#7C6EF5] font-medium transition-colors"
              >
                <Plus size={13} /> Create &quot;{search.trim()}&quot;
              </button>
            )}

            {filtered.length === 0 && !search.trim() && (
              <p className="text-center text-xs text-white/30 py-3">
                No labels yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
