"use client";

import { Portal } from "@/components/ui/Portal";
import { cn } from "@/lib/utils";
import { BoardCard } from "@/types/board.types";
import { AlertTriangle, ChevronRight, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  card: BoardCard;
  columnName: string;
  projectName: string;
}

export function DeleteCardModal({
  isOpen,
  onClose,
  onConfirm,
  card,
  columnName,
  projectName,
}: DeleteCardModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error: any) {
      toast.error("Failed to delete card:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase() || "none";
    switch (p) {
      case "urgent":
        return "bg-rose-500/20 text-rose-500";
      case "high":
        return "bg-purple-500/20 text-purple-400";
      case "medium":
        return "bg-amber-500/20 text-amber-500";
      case "low":
        return "bg-emerald-500/20 text-emerald-500";
      default:
        return "bg-white/10 text-white/40";
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-4 transition-all animate-in fade-in duration-200"
        onClick={!isDeleting ? onClose : undefined}
      >
        <div
          className="w-full max-w-120 bg-[#111119] border border-white/5 rounded-2xl shadow-2xl flex flex-col p-6 animate-in zoom-in-95 duration-200 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-5 right-5 p-1.5 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>

          {/* Header Icon */}
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-5 shrink-0">
            <Trash2 size={20} strokeWidth={2.5} />
          </div>

          {/* Titles */}
          <h2 className="text-xl font-bold text-white/90 tracking-tight mb-1.5">
            Delete card
          </h2>
          <p className="text-[13px] text-white/50 mb-6">
            This card and all its data will be permanently removed.
          </p>

          {/* Card Preview Box */}
          <div className="bg-white/2 border border-white/5 rounded-xl p-4 mb-4">
            <h3 className="text-[14px] font-semibold text-white/90 mb-2 truncate">
              {card.title}
            </h3>
            <div className="flex items-center gap-2">
              {card.priority && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    getPriorityColor(card.priority),
                  )}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  {card.priority}
                </div>
              )}
              <span className="flex items-center text-[12px] font-medium text-white/30 truncate">
                {projectName} <ChevronRight size={14} /> {columnName}
              </span>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle
              size={16}
              className="text-rose-500/70 mt-0.5 shrink-0"
            />
            <p className="text-[13px] leading-relaxed text-rose-200/60 font-medium">
              All comments, attachments, and activity on this card will be
              permanently deleted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-auto">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 bg-[#16161D] hover:bg-[#1A1A24] border border-white/10 hover:border-white/20 text-[13px] font-semibold text-white/70 rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[13px] font-bold text-rose-400 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete card"
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
