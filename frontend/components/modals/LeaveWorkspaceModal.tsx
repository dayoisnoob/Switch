"use client";

import { Portal } from "@/components/ui/Portal";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Loader2, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDangerous?: boolean;
}

export default function LeaveWorkspaceModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  title,
  description,
  confirmLabel = "Confirm",
  isDangerous = false,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-4 transition-all animate-in fade-in duration-200 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      >
        <div
          className="w-full max-w-110 bg-[#111119] border border-white/5 rounded-2xl shadow-2xl flex flex-col p-6 animate-in zoom-in-95 duration-200 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            disabled={isPending}
            className="absolute top-5 right-5 p-1.5 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div
            className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center mb-5 shrink-0",
              isDangerous
                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                : "bg-[#7C6EF5]/10 border-[#7C6EF5]/20 text-[#7C6EF5]",
            )}
          >
            {isDangerous ? (
              <AlertTriangle size={20} strokeWidth={2.5} />
            ) : (
              <Info size={20} strokeWidth={2.5} />
            )}
          </div>

          <h2 className="text-xl font-bold text-white/90 tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-[13px] text-white/50 mb-8 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center justify-end gap-3 mt-auto">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 bg-[#16161D] hover:bg-[#1A1A24] border border-white/10 hover:border-white/20 text-[13px] font-semibold text-white/70 rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={cn(
                "px-5 py-2.5 text-[13px] font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                isDangerous
                  ? "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400"
                  : "bg-[#7C6EF5] hover:bg-[#6b5ee6] text-white shadow-[0_0_15px_rgba(124,110,245,0.2)]",
              )}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {isDangerous ? "Processing..." : "Confirming..."}
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
