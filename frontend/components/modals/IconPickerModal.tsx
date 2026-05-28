"use client";

import { cn } from "@/lib/utils";
import { Portal } from "../ui/Portal";
import { PROJECT_ICON_MAP } from "./CreateProjectModal";
import { Loader2 } from "lucide-react";
import { memo } from "react";

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconKey: string) => void;
  currentIcon: string;
  isUpdating?: boolean;
}

export const IconPickerModal = memo(
  ({
    isOpen,
    onClose,
    onSelect,
    currentIcon,
    isUpdating,
  }: IconPickerModalProps) => {
    if (!isOpen) return null;

    return (
      <Portal>
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full max-w-[320px] bg-[#0A0A0A] border border-white/8 rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-200",
              isUpdating && "opacity-50 pointer-events-none",
            )}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-[13px] font-bold text-white uppercase tracking-wider">
                Select Icon
              </h4>
              {isUpdating && (
                <Loader2 size={14} className="animate-spin text-[#7C6EF5]" />
              )}
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {Object.entries(PROJECT_ICON_MAP).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  className={cn(
                    "w-full aspect-square rounded-xl flex items-center justify-center transition-all",
                    currentIcon === key
                      ? "bg-[#7C6EF5] text-white shadow-[0_0_15px_rgba(124,110,245,0.2)]"
                      : "bg-white/3 text-white/30 hover:text-white hover:bg-white/8",
                  )}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Portal>
    );
  },
);

IconPickerModal.displayName = "IconPickerModal";
