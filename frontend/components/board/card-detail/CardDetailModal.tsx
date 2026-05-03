"use client";

import { DeleteCardModal } from "@/components/modals/DeleteCardModal";
import { Portal } from "@/components/ui/Portal";
import { formatAvatarUrls } from "@/components/workspace/WorkspaceCard";
import { useBoard } from "@/hooks/board/index";
import { useGetCard, useMoveCard } from "@/hooks/useCards";
import { useDeleteCard } from "@/hooks/useDeleteCard";
import { useGetProjectBySlug } from "@/hooks/useProjects";
import { ActivityTab } from "./ActivityTab"; // Adjust path as needed
import { useUpdateCard } from "@/hooks/useUpdateCard";
import {
  differenceInCalendarDays,
  format,
  isBefore,
  startOfDay,
} from "date-fns";
import {
  cn,
  formatDate,
  formatDateShort,
  getConsistentColor,
} from "@/lib/utils";
import { CardPriority } from "@/services/card.service";
import { useBoardStore } from "@/store/board.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { CardComments } from "./CardComments"; // Adjust path as needed
import { BoardAssignee, BoardCard, BoardColumn } from "@/types/board.types";
import {
  Activity,
  AlignLeft,
  Check,
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
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGetMembers } from "@/hooks/useWorkspace";
import { useToggleAssignee } from "@/hooks/useToggleAssignee";
import { useCreateLabel, useToggleLabel } from "@/hooks/useCreateLabel";
import { useMe } from "@/hooks/useAuth";

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
  const { data: detailedCard, isLoading: isCardLoading } = useGetCard(card.id);

  const [activeTab, setActiveTab] = useState<"activity" | "comments">(
    "activity",
  );

  const { data: currentUser, isLoading } = useMe();

  const isEditingDescRef = useRef(false);
  const isEditingTitleRef = useRef(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [descValue, setDescValue] = useState(card.description || "");
  const [titleValue, setTitleValue] = useState(card.title);

  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);

  // Make sure you are fetching your members here!
  const { data: workspaceMembers, isLoading: membersLoading } =
    useGetMembers(workspaceSlug);

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const labelRef = useRef<HTMLDivElement>(null);

  // Hook up your new mutations
  const { mutate: toggleLabel } = useToggleLabel(card.id);
  const { mutate: createLabel, isPending: isCreatingLabel } =
    useCreateLabel(workspaceSlug);

  // NOTE: Replace this with your actual role-checking logic!
  const currentMember = workspaceMembers?.find(
    (m) => m.userId === currentUser?.id,
  );
  const canCreateLabels = ["Owner", "Admin"].includes(
    currentMember?.role || "Member",
  );

  // Make sure you fetch workspace labels somewhere!
  // const { data: workspaceLabels } = useGetWorkspaceLabels(workspaceSlug);

  const { mutate: toggleAssignee } = useToggleAssignee(card.id);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const { data: project } = useGetProjectBySlug(workspaceSlug, projectSlug);

  const { mutate: moveCard } = useMoveCard();

  const currentDueDate = detailedCard?.dueDate || card.dueDate;
  const dueDateObj = currentDueDate ? new Date(currentDueDate) : null;
  const today = new Date();

  // differenceInCalendarDays handles timezone shifts and daylight savings perfectly
  const diffDays = dueDateObj ? differenceInCalendarDays(dueDateObj, today) : 0;

  // startOfDay ensures we don't accidentally mark something overdue if it's due at 11:59 PM today
  const isOverdue = dueDateObj
    ? isBefore(startOfDay(dueDateObj), startOfDay(today))
    : false;

  // Native HTML5 date input requires strict YYYY-MM-DD format
  const dateInputValue = dueDateObj ? format(dueDateObj, "yyyy-MM-dd") : "";

  const activeCard = useBoardStore(
    (state) =>
      state.board?.columns
        .flatMap((col) => col.cards)
        .find((c) => c.id === card.id) ?? card,
  );

  const handleSetEditingDesc = (val: boolean) => {
    isEditingDescRef.current = val;
    setIsEditingDesc(val);
  };
  const handleSetEditingTitle = (val: boolean) => {
    isEditingTitleRef.current = val;
    setIsEditingTitle(val);
  };

  const workspaceLabels = useBoardStore((s) => s.workspaceLabels);

  const { mutate: updateCard } = useUpdateCard(card.id);
  const currentColumn = columns.find((c) =>
    c.cards.some((c2) => c2.id === card.id),
  );
  const { mutate: deleteCard } = useDeleteCard(
    card.id,
    currentColumn!.id ?? "",
  );

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "0px"; // Reset first to shrink if deleting text
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [titleValue]);

  // Add this useEffect below your useState hooks
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 1. Status Menu
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }

      // 2. Priority Menu
      if (
        priorityRef.current &&
        !priorityRef.current.contains(e.target as Node)
      ) {
        setIsPriorityMenuOpen(false);
      }

      // 3. Assignees Menu
      if (
        assigneeRef.current &&
        !assigneeRef.current.contains(e.target as Node)
      ) {
        setIsAssigneeMenuOpen(false);
      }

      // 4. Labels Menu
      if (labelRef.current && !labelRef.current.contains(e.target as Node)) {
        setIsLabelMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      if (
        assigneeRef.current &&
        !assigneeRef.current.contains(e.target as Node)
      )
        setIsAssigneeMenuOpen(false);
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

  console.log(detailedCard);

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
          className="w-full max-w-[860px] h-full bg-[#0E0E14] shadow-2xl flex flex-col border-l border-white/5 animate-in slide-in-from-right duration-200"
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
                  ref={titleRef}
                  value={titleValue}
                  onFocus={() => handleSetEditingTitle(true)}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={(e) => {
                    handleSetEditingTitle(false);
                    handleTitleSave();
                  }}
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

                {/* Comment */}
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
                            {card.commentCount || 0} {/* Make this dynamic! */}
                          </span>
                        )}
                        {activeTab === tab && (
                          <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#7C6EF5] rounded-t-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Render the active tab content */}
                  <div className="pb-10">
                    {activeTab === "comments" ? (
                      // BOOM! Your new dynamic comments component goes here
                      <CardComments cardId={card.id} />
                    ) : (
                      // Your Activity Stream component/mock goes here
                      <ActivityTab cardId={card.id} />
                    )}
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
                              updateCard({
                                priority: priority.value as CardPriority,
                              });
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

                {/* Due Date (Interactive Native Picker) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Due Date
                  </label>
                  <div className="relative w-full">
                    {/* Hidden native picker */}
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={dateInputValue}
                      onChange={(e) => {
                        if (e.target.value) {
                          updateCard({ dueDate: new Date(e.target.value) });
                        }
                      }}
                      // Added [color-scheme:dark] right here 👇
                      className="absolute bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none [color-scheme:dark]"
                    />

                    {/* Visible UI */}
                    <button
                      onClick={() => {
                        try {
                          // This forces the native OS calendar popup to open!
                          dateInputRef.current?.showPicker();
                        } catch (err) {
                          dateInputRef.current?.focus(); // Fallback for very old browsers
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors group border",
                        isOverdue
                          ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20"
                          : "bg-[#1C1C24] hover:bg-[#22222C] border-white/5",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          isOverdue
                            ? "text-rose-500"
                            : "text-white/70 group-hover:text-white/90",
                        )}
                      >
                        <Clock size={14} />
                        <span className="text-[13px] font-semibold">
                          {dueDateObj
                            ? formatDateShort(dueDateObj.toISOString())
                            : "Set due date"}
                        </span>
                      </div>

                      {/* Dynamic Status Badges */}
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500">
                          {Math.abs(diffDays)}d overdue
                        </span>
                      )}
                      {!isOverdue && dueDateObj && diffDays === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500">
                          Today
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Assignees */}
                <div className="space-y-3 relative" ref={assigneeRef}>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Assignees
                  </label>

                  <div className="space-y-2">
                    {/* Currently Assigned Members */}
                    {detailedCard?.assignees &&
                      detailedCard.assignees.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 group cursor-pointer"
                        >
                          {a.avatarUrl ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                              <Image
                                src={a.avatarUrl}
                                alt={a.firstName}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                                unoptimized
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/5"
                              style={{
                                backgroundColor: getConsistentColor(
                                  a.id || a.firstName,
                                ),
                              }}
                            >
                              {`${a.firstName.charAt(0).toUpperCase()}${a.lastName.charAt(0).toUpperCase()}`}
                            </div>
                          )}
                          <span className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">
                            {`${a.firstName} ${a.lastName}`}
                          </span>
                        </div>
                      ))}

                    {/* Trigger Button */}
                    <button
                      onClick={() => {
                        setIsAssigneeMenuOpen(!isAssigneeMenuOpen);
                        setIsStatusMenuOpen(false);
                        setIsPriorityMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-white/30 hover:text-white/70 transition-colors pt-1"
                    >
                      <div className="w-6 h-6 border border-dashed border-white/20 rounded-full flex items-center justify-center">
                        <Plus size={12} />
                      </div>
                      <span className="text-[13px] font-medium">
                        Assign member
                      </span>
                    </button>
                  </div>

                  {/* Assignees Dropdown Menu */}
                  {isAssigneeMenuOpen && (
                    <div className="absolute top-full mt-2 w-[280px] bg-[#18181B] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1.5 left-0">
                      <div className="max-h-[240px] overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
                        {membersLoading ? (
                          <div className="flex items-center justify-center py-5">
                            <div className="w-4 h-4 border-2 border-[#7C6EF5]/30 border-t-[#7C6EF5] rounded-full animate-spin" />
                          </div>
                        ) : workspaceMembers && workspaceMembers.length > 0 ? (
                          workspaceMembers.map((member) => {
                            // Check if this member is already assigned to the card
                            const isAssigned = detailedCard?.assignees?.some(
                              (a) => a.id === member.userId,
                            );

                            return (
                              <div
                                key={member.id}
                                onClick={() => {
                                  toggleAssignee({
                                    member: member,
                                    isAssigned: isAssigned,
                                  });
                                }}
                                className="flex items-center justify-between p-2 rounded-[10px] hover:bg-white/5 cursor-pointer group transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {member.avatarUrl ? (
                                    <Image
                                      src={member.avatarUrl}
                                      alt={`${member.firstName} ${member.lastName}`}
                                      width={28}
                                      height={28}
                                      className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
                                      unoptimized
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/5"
                                      style={{
                                        backgroundColor: getConsistentColor(
                                          member.userId || member.firstName,
                                        ),
                                      }}
                                    >
                                      {`${member.firstName.charAt(0).toUpperCase()}${member.lastName.charAt(0).toUpperCase()}`}
                                    </div>
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[13px] font-medium text-white/90 truncate">
                                      {member.firstName} {member.lastName}
                                    </span>
                                    <span className="text-[11px] text-white/30 truncate">
                                      {member.email}
                                    </span>
                                  </div>
                                </div>

                                {/* Checkbox indicator */}
                                <div
                                  className={cn(
                                    "w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ml-2",
                                    isAssigned
                                      ? "bg-[#7C6EF5] border-[#7C6EF5]"
                                      : "border-white/10 bg-transparent group-hover:border-white/20",
                                  )}
                                >
                                  {isAssigned && (
                                    <Check
                                      size={12}
                                      className="text-white"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-2 py-4 text-center text-[12px] text-white/30">
                            No workspace members found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Labels */}
                <div className="space-y-3 relative" ref={labelRef}>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Labels
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Attached Labels */}
                    {detailedCard?.labels &&
                      detailedCard.labels.map((l) => (
                        <div
                          key={l.id}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5"
                          style={{
                            color: l.colour || l.color, // Fallback depending on your DB schema spelling
                            backgroundColor: `${l.colour || l.color}1A`, // 10% opacity
                            borderColor: `${l.colour || l.color}33`, // 20% opacity
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: l.colour || l.color }}
                          />
                          {l.name}
                        </div>
                      ))}

                    {/* Trigger Button */}
                    <button
                      onClick={() => {
                        setIsLabelMenuOpen(!isLabelMenuOpen);
                        setIsAssigneeMenuOpen(false);
                        setIsStatusMenuOpen(false);
                        setIsPriorityMenuOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white/30 border border-white/10 border-dashed hover:bg-white/5 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Plus size={10} /> Label
                    </button>
                  </div>

                  {/* Labels Dropdown Menu */}
                  {isLabelMenuOpen && (
                    <div className="absolute top-full mt-2 w-[240px] bg-[#18181B] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-2 left-0 flex flex-col gap-2">
                      {/* Search Input */}
                      <input
                        type="text"
                        placeholder="Search labels..."
                        value={labelSearch}
                        onChange={(e) => setLabelSearch(e.target.value)}
                        autoFocus
                        className="w-full bg-[#13131A] border border-white/10 focus:border-[#7C6EF5]/50 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-white/30 outline-none transition-all"
                      />

                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-0.5">
                        {workspaceLabels &&
                          workspaceLabels
                            .filter((l) =>
                              l.name
                                .toLowerCase()
                                .includes(labelSearch.toLowerCase()),
                            )
                            .map((label) => {
                              const isAttached = detailedCard?.labels?.some(
                                (l) => l.id === label.id,
                              );

                              return (
                                <div
                                  key={label.id}
                                  onClick={() =>
                                    toggleLabel({
                                      label,
                                      isAttached: !!isAttached,
                                    })
                                  }
                                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                                      style={{
                                        backgroundColor:
                                          label.colour || label.color,
                                      }}
                                    />
                                    <span className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">
                                      {label.name}
                                    </span>
                                  </div>
                                  {isAttached && (
                                    <Check
                                      size={14}
                                      className="text-[#7C6EF5]"
                                    />
                                  )}
                                </div>
                              );
                            })}

                        {/* Conditional Create Button for Admins/Owners */}
                        {labelSearch.trim() !== "" &&
                          canCreateLabels &&
                          !workspaceLabels?.some(
                            (l) =>
                              l.name.toLowerCase() ===
                              labelSearch.toLowerCase(),
                          ) && (
                            <button
                              onClick={async () => {
                                // Generate a random vibrant hex color for the new label
                                const randomColor = `#${Math.floor(
                                  Math.random() * 16777215,
                                )
                                  .toString(16)
                                  .padStart(6, "0")}`;

                                createLabel(
                                  {
                                    name: labelSearch.trim(),
                                    colour: randomColor,
                                  },
                                  {
                                    onSuccess: (newLabel) => {
                                      toggleLabel({
                                        label: newLabel,
                                        isAttached: false,
                                      });
                                      setLabelSearch(""); // Reset search
                                    },
                                  },
                                );
                              }}
                              disabled={isCreatingLabel}
                              className="w-full flex items-center gap-2 p-2 mt-1 text-[12px] font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left"
                            >
                              {isCreatingLabel ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Plus size={12} />
                              )}
                              <span className="truncate">
                                Create "{labelSearch}"
                              </span>
                            </button>
                          )}
                      </div>
                    </div>
                  )}
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
                      {/* Fallback to localCard if detailedCard is still fetching */}
                      {detailedCard?.createdAt
                        ? formatDate(detailedCard.createdAt)
                        : ""}
                      <span className="opacity-50">by</span>{" "}
                      {/* Show a mini skeleton or fallback while fetching the name */}
                      {isCardLoading ? (
                        <span className="inline-block w-16 h-3 bg-white/10 rounded animate-pulse align-middle" />
                      ) : (
                        <span className="text-white/70">
                          {detailedCard?.createdBy?.firstName}{" "}
                          {detailedCard?.createdBy?.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Last Updated
                    </label>
                    <div className="text-[12px] text-white/40 font-medium">
                      {detailedCard?.updatedAt
                        ? formatDate(detailedCard.updatedAt)
                        : ""}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ">
                      Card ID
                    </label>
                    <div className="text-[12px] text-white/30 font-mono mt-2">
                      {/* We can use localCard for this since we already have the ID! */}
                      {detailedCard?.id.slice(0, 6).toUpperCase() ?? "-"}
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
        projectName={project?.name ?? ""}
      />
    </Portal>
  );
}
