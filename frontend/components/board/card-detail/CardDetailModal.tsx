"use client";

import { DeleteCardModal } from "@/components/modals/DeleteCardModal";
import { Portal } from "@/components/ui/Portal";
import { useBoard } from "@/hooks/board/index";
import { useMoveCard } from "@/hooks/useCards";
import { useDeleteCard } from "@/hooks/useDeleteCard";
import { useGetProjectBySlug } from "@/hooks/useProjects";
import { useUpdateCard } from "@/hooks/useUpdateCard";
import { cn, formatDateShort } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import {
  Activity,
  AlignLeft,
  CheckSquare,
  ChevronRight,
  Clock,
  Download,
  Edit2,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// --- Helpers to match priority styles ---
const getPriorityStyles = (priority: string) => {
  const p = priority?.toLowerCase() || "none";
  switch (p) {
    case "urgent":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "high":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "low":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-white/5 text-white/40 border-white/10";
  }
};

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: BoardCard;
  columns: BoardColumn[];
  projectSlug: string;
  workspaceSlug: string;
}

export function CardDetailModal({
  isOpen,
  onClose,
  card,
  columns,
  projectSlug,
  workspaceSlug,
}: CardDetailModalProps) {
  useBoard(projectSlug, workspaceSlug);

  const [activeTab, setActiveTab] = useState<"activity" | "comments">(
    "activity",
  );
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(card.description || "");
  const [titleValue, setTitleValue] = useState(card.title);

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const descRef = useRef<HTMLTextAreaElement>(null);

  const { data: project } = useGetProjectBySlug(workspaceSlug, projectSlug);

  const { mutate: moveCard } = useMoveCard();

  const activeCard = useBoardStore(
    (state) =>
      state.board?.columns
        .flatMap((col) => col.cards)
        .find((c) => c.id === card.id) ?? card,
  );

  const { mutate: updateCard } = useUpdateCard(card.id);
  const currentColumn = columns.find((c) =>
    c.cards.some((c2) => c2.id === card.id),
  );
  const { mutate: deleteCard } = useDeleteCard(card.id, currentColumn!.id);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
      if (
        priorityRef.current &&
        !priorityRef.current.contains(e.target as Node)
      ) {
        setIsPriorityMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditingDesc && descRef.current) {
      descRef.current.focus();
      descRef.current.style.height = "auto";
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  }, [isEditingDesc]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isEditingDesc) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isEditingDesc]);

  // Standard Priority Options
  const PRIORITIES = [
    { label: "Urgent", value: "urgent", color: "bg-rose-500" },
    { label: "High", value: "high", color: "bg-purple-500" },
    { label: "Medium", value: "medium", color: "bg-amber-500" },
    { label: "Low", value: "low", color: "bg-emerald-500" },
    { label: "None", value: "none", color: "bg-white/20" },
  ];

  // Helper to find the color dot for the currently active priority
  const currentPriorityInfo =
    PRIORITIES.find(
      (p) => p.value === (card.priority?.toLowerCase() || "none"),
    ) || PRIORITIES[PRIORITIES.length - 1];

  if (!isOpen) return null;

  const handleTitleSave = () => {
    if (!titleValue.trim()) {
      setTitleValue(card.title);
      return;
    }
    if (titleValue !== card.title) updateCard({ title: titleValue });
  };

  const handleDescSave = () => {
    setIsEditingDesc(false);
    if (descValue !== (card.description || ""))
      updateCard({ description: descValue });
  };

  const pStyles = getPriorityStyles(card.priority);

  const columnNames = columns.map((c) => c.name);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-all"
        onClick={onClose}
      >
        {/* DRAWER CONTAINER */}
        <div
          className="w-full max-w-[800px] h-full bg-[#0E0E14] shadow-2xl flex flex-col border-l border-white/5 animate-in slide-in-from-right duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── TOP HEADER (Breadcrumbs & Actions) ── */}
          <header className="h-14 px-6 flex items-center justify-between border-b border-white/[0.06] shrink-0 bg-[#0E0E14]">
            <div className="flex items-center gap-2 text-[13px] font-medium text-white/40">
              <span className="hover:text-white/80 cursor-pointer transition-colors">
                {project?.name}
              </span>
              <ChevronRight size={14} className="opacity-50" />
              <span className="hover:text-white/80 cursor-pointer transition-colors">
                {currentColumn?.name}
              </span>
              <ChevronRight size={14} className="opacity-50" />
              <span className="text-white/80 truncate max-w-50">
                {card.title}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={onClose}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* ── 2-COLUMN SPLIT ── */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* ── LEFT COLUMN (Main Content) ── */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-8 min-h-0 bg-[#0E0E14]">
              {/* Title & Inline Badges */}
              <div className="mb-8">
                <textarea
                  value={titleValue}
                  onChange={(e) => {
                    setTitleValue(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                    if (e.key === "Escape") {
                      setTitleValue(card.title);
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full bg-transparent text-[24px] font-bold text-white border border-transparent hover:border-white/5 focus:border-[#7C6EF5]/50 focus:bg-white/[0.02] rounded-lg px-3 py-1.5 -ml-3 outline-none transition-all resize-none overflow-hidden leading-tight mb-3"
                  rows={1}
                />

                <div className="flex items-center gap-2 flex-wrap">
                  {card.priority && (
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                        pStyles,
                      )}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                      {card.priority}
                    </div>
                  )}

                  <button className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white/30 border border-white/10 hover:bg-white/5 transition-colors border-dashed flex items-center gap-1">
                    <Plus size={10} /> Label
                  </button>
                </div>
              </div>

              <div className="space-y-10">
                {/* Description */}
                <section>
                  <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">
                    Description
                  </div>
                  {isEditingDesc ? (
                    <div className="space-y-3">
                      <textarea
                        ref={descRef}
                        value={descValue}
                        onChange={(e) => {
                          setDescValue(e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        placeholder="Add a description..."
                        className="w-full min-h-[120px] bg-[#13131A] border border-[#7C6EF5]/50 focus:ring-1 focus:ring-[#7C6EF5]/30 rounded-xl p-4 text-[14px] text-white/90 placeholder:text-white/25 outline-none resize-none leading-relaxed"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleDescSave}
                          className="px-4 py-2 bg-[#7C6EF5] hover:bg-[#6B5ED4] text-white text-[13px] font-semibold rounded-lg transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingDesc(false);
                            setDescValue(card.description || "");
                          }}
                          className="px-4 py-2 text-white/40 hover:text-white hover:bg-white/5 text-[13px] font-semibold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingDesc(true)}
                      className="w-full min-h-[100px] bg-[#13131A] hover:bg-[#16161F] border border-white/5 hover:border-white/10 rounded-xl p-5 text-[14px] text-white/70 cursor-text transition-all whitespace-pre-wrap leading-relaxed shadow-sm"
                    >
                      {descValue || (
                        <span className="text-white/25">
                          Add a description...
                        </span>
                      )}
                    </div>
                  )}
                </section>

                {/* MOCK: Attachments (Matches Screenshot exactly) */}
                <section>
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                      Attachments
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                      <Upload size={13} /> Upload
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        name: "button-spec-v4.fig",
                        size: "3.1 MB",
                        user: "Aisha",
                        date: "Apr 26 at 2:18 PM",
                        icon: (
                          <FileText size={20} className="text-purple-400" />
                        ),
                      },
                      {
                        name: "button-a11y-checklist.md",
                        size: "12 KB",
                        user: "James",
                        date: "Apr 25 at 10:02 AM",
                        icon: (
                          <FileText size={20} className="text-emerald-400" />
                        ),
                      },
                      {
                        name: "button-states-reference.png",
                        size: "640 KB",
                        user: "Aisha",
                        date: "Apr 24 at 4:45 PM",
                        icon: (
                          <ImageIcon size={20} className="text-amber-400" />
                        ),
                      },
                    ].map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#13131A] hover:bg-[#16161F] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#1A1A24] flex items-center justify-center border border-white/5">
                            {file.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-semibold text-white/90 group-hover:text-[#7C6EF5] transition-colors cursor-pointer">
                              {file.name}
                            </span>
                            <span className="text-[11px] text-white/40">
                              {file.size} · {file.user} · {file.date}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md">
                            <Download size={14} />
                          </button>
                          <button className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-md">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Dropzone */}
                  <div className="mt-3 w-full border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#7C6EF5]/50 hover:bg-[#7C6EF5]/5 transition-all cursor-pointer">
                    <Upload size={20} className="text-white/20 mb-2" />
                    <span className="text-[13px] font-medium text-white/50">
                      Drop files here or click to upload
                    </span>
                  </div>
                </section>

                {/* Tabs & Stream */}
                <section className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-6 border-b border-white/5 mb-6">
                    {(["activity", "comments"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "pb-3 text-[13px] font-semibold transition-colors relative flex items-center gap-2",
                          activeTab === tab
                            ? "text-white"
                            : "text-white/40 hover:text-white/70",
                        )}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab === "comments" && (
                          <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/70">
                            4
                          </span>
                        )}
                        {activeTab === tab && (
                          <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#7C6EF5] rounded-t-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* MOCK: Activity Stream matching screenshot */}
                  <div className="space-y-6 pb-20">
                    {/* Comment */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                        AM
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="text-[14px] font-bold text-white/90">
                            Aisha
                          </span>
                          <span className="text-[13px] text-white/40">
                            commented on this card
                          </span>
                        </div>
                        <div className="bg-[#13131A] border border-white/5 rounded-xl rounded-tl-none p-4 text-[13px] text-white/80 leading-relaxed">
                          The loading spinner needs to match the size of the
                          button — it&apos;s currently 16px fixed. Should scale
                          with sm/md/lg. Also worth checking the disabled
                          opacity on dark backgrounds.
                        </div>
                        <span className="text-[11px] font-medium text-white/30 mt-2">
                          Apr 27 at 1:42 PM
                        </span>
                      </div>
                    </div>

                    {/* System Activity */}
                    <div className="flex items-center gap-4 py-1">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                        JD
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-white/70">
                          <span className="font-bold text-white/90">James</span>{" "}
                          changed priority from{" "}
                          <span className="text-purple-400">High</span> to{" "}
                          <span className="text-rose-500">Urgent</span>
                        </span>
                        <span className="text-[11px] font-medium text-white/30">
                          Apr 27 at 9:15 AM
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                        JD
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="text-[14px] font-bold text-white/90">
                            James
                          </span>
                          <span className="text-[13px] text-white/40">
                            commented on this card
                          </span>
                        </div>
                        <div className="bg-[#13131A] border border-white/5 rounded-xl rounded-tl-none p-4 text-[13px] text-white/80 leading-relaxed">
                          Heads up — the Figma spec was updated last night (v4).
                          Loading state is now a different spinner. Grab the
                          updated file from attachments before continuing.
                        </div>
                        <span className="text-[11px] font-medium text-white/30 mt-2">
                          Apr 26 at 11:05 PM
                        </span>
                      </div>
                    </div>

                    {/* Add comment box pinned to bottom of list */}
                    <div className="flex gap-4 mt-6">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-1">
                        JD
                      </div>
                      <textarea
                        placeholder="Leave a comment..."
                        rows={1}
                        className="flex-1 min-h-[44px] bg-[#13131A] border border-white/10 hover:border-white/20 focus:border-[#7C6EF5]/50 rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none resize-none transition-all"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </main>

            {/* ── RIGHT COLUMN (Sidebar / Metadata) ── */}
            <aside className="w-[320px] shrink-0 border-l border-white/5 overflow-y-auto custom-scrollbar p-6 bg-[#16161D]">
              {/* Top Stats Buttons */}
              <div className="flex items-center gap-2 mb-8">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[12px] font-medium text-white/70 transition-colors">
                  <MessageSquare size={13} /> {card.commentCount}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[12px] font-medium text-white/70 transition-colors">
                  <Activity size={13} /> {card.activityCount}
                </button>
              </div>

              <div className="space-y-6">
                {/* Status Dropdown */}
                <div className="space-y-2 relative" ref={statusRef}>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Status
                  </label>
                  <button
                    onClick={() => {
                      setIsStatusMenuOpen(!isStatusMenuOpen);
                      setIsPriorityMenuOpen(false); // Close the other one
                    }}
                    className="w-full flex items-center justify-between p-2.5 bg-[#1C1C24] hover:bg-[#22222C] border border-white/5 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* We use getColumnColor helper here if you want colored dots per column, or a standard color */}
                      <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      <span className="text-[13px] font-semibold text-white/90 truncate">
                        {currentColumn?.name || "Unknown"}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className={cn(
                        "text-white/20 transition-transform shrink-0",
                        isStatusMenuOpen && "rotate-90 text-white/60",
                      )}
                    />
                  </button>

                  {/* Status Menu */}
                  {isStatusMenuOpen && (
                    <div className="absolute top-full mt-2 w-full bg-[#18181B] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 py-1.5">
                      {columns.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => {
                            if (col.id !== currentColumn?.id) {
                              moveCard({
                                cardId: card.id,
                                data: {
                                  columnId: col.id,
                                  status: currentColumn!.mappedStatus,
                                  order: 0,
                                },
                              });
                            }
                            setIsStatusMenuOpen(false);
                          }}
                          className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors text-left"
                        >
                          <span className="truncate">{col.name}</span>
                          {col.id === currentColumn?.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C6EF5] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority Dropdown */}
                <div className="space-y-2 relative" ref={priorityRef}>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Priority
                  </label>
                  <button
                    onClick={() => {
                      setIsPriorityMenuOpen(!isPriorityMenuOpen);
                      setIsStatusMenuOpen(false); // Close the other one
                    }}
                    className="w-full flex items-center justify-between p-2.5 bg-[#1C1C24] hover:bg-[#22222C] border border-white/5 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          currentPriorityInfo.color,
                        )}
                      />
                      <span className="text-[13px] font-semibold text-white/90 truncate">
                        {currentPriorityInfo.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className={cn(
                        "text-white/20 transition-transform shrink-0",
                        isPriorityMenuOpen && "rotate-90 text-white/60",
                      )}
                    />
                  </button>

                  {/* Priority Menu */}
                  {isPriorityMenuOpen && (
                    <div className="absolute top-full mt-2 w-full bg-[#18181B] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 py-1.5">
                      {PRIORITIES.map((priority) => (
                        <button
                          key={priority.value}
                          onClick={() => {
                            if (
                              priority.value !== card.priority?.toLowerCase()
                            ) {
                              updateCard({ priority: priority.value });
                            }
                            setIsPriorityMenuOpen(false);
                          }}
                          className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                priority.color,
                              )}
                            />
                            <span className="truncate">{priority.label}</span>
                          </div>
                          {priority.value ===
                            (card.priority?.toLowerCase() || "none") && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C6EF5] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date (Overdue State) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Due Date
                  </label>
                  <button className="w-full flex items-center justify-between p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors group">
                    <div className="flex items-center gap-2 text-rose-500">
                      <Clock size={14} />
                      <span className="text-[13px] font-semibold">
                        Apr 27, 2025
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500">
                      2d overdue
                    </span>
                  </button>
                </div>

                {/* Assignees */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Assignees
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[9px] font-bold text-white">
                        JD
                      </div>
                      <span className="text-[13px] font-medium text-white/80 group-hover:text-white">
                        James Dalton
                      </span>
                    </div>
                    <div className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white">
                        AM
                      </div>
                      <span className="text-[13px] font-medium text-white/80 group-hover:text-white">
                        Aisha Mensah
                      </span>
                    </div>
                    <button className="flex items-center gap-3 text-white/30 hover:text-white/70 transition-colors pt-1">
                      <div className="w-6 h-6 border border-dashed border-white/20 rounded-full flex items-center justify-center">
                        <Plus size={12} />
                      </div>
                      <span className="text-[13px] font-medium">
                        Assign member
                      </span>
                    </button>
                  </div>
                </div>

                {/* Labels */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Labels
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-cyan-400 bg-cyan-400/10">
                      Component
                    </div>
                    <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-purple-400 bg-purple-400/10">
                      Frontend
                    </div>
                    <button className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white/30 border border-white/10 border-dashed hover:bg-white/5 transition-colors">
                      + Label
                    </button>
                  </div>
                </div>

                {/* Metadata Divider */}
                <div className="h-px bg-white/5 my-6" />

                {/* Read-only Metadata */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Created
                    </label>
                    <div className="text-[12px] text-white/40 font-medium">
                      Apr 24, 2025 <span className="opacity-50">by</span> Marcus
                      Reid
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Last Updated
                    </label>
                    <div className="text-[12px] text-white/40 font-medium">
                      Apr 27, 2025{" "}
                      <span className="opacity-50">at 1:42 PM</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Card ID
                    </label>
                    <div className="text-[12px] text-white/30 font-mono">
                      DS-042
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <DeleteCardModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!card.id) return;
          deleteCard();
          onClose();
        }}
        card={activeCard}
        columnName={currentColumn?.name || "Unknown"}
        projectName={project.name}
      />
    </Portal>
  );
}
