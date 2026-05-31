"use client";

import { Portal } from "@/components/ui/Portal";
import {
  useClearColumncards,
  useDeleteColumn,
  useGetColumn,
  useMoveColumnCards,
} from "@/hooks/useColumns";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { BoardColumn } from "@/types/board.types";
import { ChevronDown, Loader2, PanelRightClose, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type DeleteColumnAction = "move" | "delete";

interface DeleteColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: BoardColumn;
}

export default function DeleteColumnModal({
  isOpen,
  onClose,
  column,
}: DeleteColumnModalProps) {
  const [action, setAction] = useState<DeleteColumnAction>("move");
  const [targetColumnId, setTargetColumnId] = useState<string>("");

  const board = useBoardStore((s) => s.board);
  const { mutateAsync: moveCards, isPending: isMovingCards } =
    useMoveColumnCards();
  const { mutateAsync: deleteColumn, isPending: isDeletingCol } =
    useDeleteColumn();
  const { mutateAsync: clearCards, isPending: isDeletingCards } =
    useClearColumncards();
  const { data: apiColumn, isLoading } = useGetColumn(column.id);

  const availableColumns = board?.columns.filter(
    (c) => c.id !== column?.id,
  ) as BoardColumn[];

  useEffect(() => {
    if (availableColumns.length > 0 && !targetColumnId) {
      setTargetColumnId(availableColumns[0].id);
    }
  }, [availableColumns, targetColumnId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => setAction("move"), 200);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      if (action === "move") {
        await moveCards({ columnId: column.id, targetColumnId });
      } else if (action === "delete") {
        await clearCards(column.id);
      }

      await deleteColumn(column.id);

      toast.success(
        action === "move"
          ? "Cards moved and column deleted"
          : "Column and all cards deleted",
      );

      onClose();
    } catch (error: any) {
      toast.error("Failed to perform this action. Please try again.");
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
        <div className="relative flex w-full max-w-110 flex-col rounded-2xl border border-white/5 bg-[#13131A] shadow-2xl animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            disabled={isDeletingCards || isDeletingCol || isMovingCards}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5">
              <PanelRightClose size={20} />
            </div>

            <h2 className="text-xl font-bold text-white/90 mb-1.5 tracking-tight">
              Delete column
            </h2>
            <p className="text-[13px] text-white/40 leading-relaxed mb-6">
              Choose what happens to the cards in this column before deleting.
            </p>

            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-white/2 mb-6">
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-white/90">
                  {column.name}
                </span>
                <span className="text-[12px] text-white/40 font-medium">
                  {apiColumn?.cardCount}{" "}
                  {apiColumn?.cardCount === 1 ? "card" : "cards"} inside
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="text-[12px] font-bold text-white/40">
                What should happen to the cards?
              </label>

              <button
                type="button"
                onClick={() => setAction("move")}
                className={cn(
                  "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors",
                  action === "move"
                    ? "bg-white/5 border-white/10"
                    : "bg-transparent border-white/5 hover:bg-white/2",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                    action === "move" ? "border-white" : "border-white/20",
                  )}
                >
                  {action === "move" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-white/90 mb-0.5">
                    Move cards to another column
                  </span>
                  <span className="text-[13px] text-white/40">
                    Cards will be preserved and moved to your chosen column.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAction("delete")}
                className={cn(
                  "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors",
                  action === "delete"
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-transparent border-white/5 hover:bg-white/2",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                    action === "delete" ? "border-rose-500" : "border-white/20",
                  )}
                >
                  {action === "delete" && (
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-[14px] font-semibold mb-0.5 transition-colors",
                      action === "delete" ? "text-rose-400" : "text-white/90",
                    )}
                  >
                    Delete all cards
                  </span>
                  <span className="text-[13px] text-white/40">
                    All {apiColumn?.cardCount} cards and their data will be
                    permanently deleted.
                  </span>
                </div>
              </button>
            </div>

            {action === "move" && availableColumns.length > 0 && (
              <div className="space-y-2 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-[12px] font-bold text-white/40">
                  Move to
                </label>
                <div className="relative">
                  <select
                    value={targetColumnId}
                    onChange={(e) => setTargetColumnId(e.target.value)}
                    className="w-full h-11 bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 text-[13px] font-medium text-white appearance-none cursor-pointer focus:outline-none focus:border-[#7C6EF5]/50 transition-colors shadow-inner"
                  >
                    {availableColumns.map((col) => (
                      <option
                        key={col.id}
                        value={col.id}
                        className="bg-[#13131A]"
                      >
                        {col.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                </div>
              </div>
            )}

            {action === "move" && availableColumns.length === 0 && (
              <div className="p-3 mb-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[12px] text-rose-400 font-medium">
                No other columns available. You must delete the cards or create
                a new column first.
              </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isMovingCards || isDeletingCol}
                className="px-5 h-10 rounded-xl text-[13px] font-semibold text-white/70 bg-transparent border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  isMovingCards ||
                  (action === "move" && availableColumns.length === 0)
                }
                className="px-5 h-10 rounded-xl text-[13px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingCol ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete column"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
