"use client";

import { useBoard } from "@/hooks/board/index";
import { useUpdateCard } from "@/hooks/useUpdateCard";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import {
  Activity,
  AlignLeft,
  Image as ImageIcon,
  MessageSquare,
  Paperclip,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CardSidebar } from "./CardSidebar";
import { CommentsTab } from "./CommentsTab";
import { ActivityTab } from "./ActivityTab";

const ACCENT = "#7C6EF5";

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

  const [activeTab, setActiveTab] = useState<"comments" | "activity">(
    "comments",
  );
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(card.description || "");
  const [titleValue, setTitleValue] = useState(card.title);

  const descRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const activeCard = useBoardStore(
    (state) =>
      state.board?.columns
        .flatMap((col) => col.cards)
        .find((c) => c.id === card.id) ?? card,
  );

  const workspaceLabels = useBoardStore((s) => s.workspaceLabels);

  const { mutate: updateCard } = useUpdateCard(card.id);
  const currentColumn = columns.find((c) =>
    c.cards.some((c2) => c2.id === card.id),
  );

  useEffect(() => {
    if (isEditingDesc && descRef.current) {
      descRef.current.focus();
      descRef.current.style.height = "auto";
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  }, [isEditingDesc]);

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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: upload and updateCard({ coverImageUrl: uploadedUrl })
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <input
        type="file"
        accept="image/*"
        ref={coverInputRef}
        onChange={handleCoverUpload}
        className="hidden"
      />

      <div
        className="w-full max-w-[860px] max-h-[90vh] bg-[#13131C] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── COLORED HEADER ── */}
        <div
          className="relative h-[88px] shrink-0 overflow-hidden"
          style={{ backgroundColor: ACCENT }}
        >
          {card.coverImageUrl && (
            <Image
              src={card.coverImageUrl}
              alt="Card cover"
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/35" />
          <div className="relative z-10 flex items-center justify-between h-full px-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">
              {currentColumn?.name ?? "Unknown"}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => coverInputRef.current?.click()}
                title="Change cover"
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ImageIcon size={15} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── TITLE + STATUS ── */}
        <div className="px-6 pt-5 pb-4 shrink-0 border-b border-white/5">
          <input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setTitleValue(card.title);
                e.currentTarget.blur();
              }
            }}
            className="w-full bg-transparent text-[20px] font-bold text-white border border-transparent hover:border-white/10 focus:border-[#7C6EF5]/50 focus:ring-1 focus:ring-[#7C6EF5]/20 rounded-lg px-2 py-1 -ml-2 outline-none transition-all mb-3 leading-snug"
          />
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: `${ACCENT}20`,
                borderColor: `${ACCENT}40`,
                color: ACCENT,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
              {currentColumn?.name ?? "Unknown"}
            </span>
            <span className="text-[10px] text-white/25 font-mono">
              #{card.id.slice(0, 6)}
            </span>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* LEFT: main content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-7 min-h-0 pr-4">
            {" "}
            {/* Description */}
            <section>
              <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">
                <AlignLeft size={13} /> Description
              </div>
              {isEditingDesc ? (
                <div className="space-y-2.5">
                  <textarea
                    ref={descRef}
                    value={descValue}
                    onChange={(e) => {
                      setDescValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder="Add a description..."
                    className="w-full min-h-[100px] bg-[#1A1A28] border border-[#7C6EF5]/40 rounded-xl p-3.5 text-sm text-white/90 placeholder:text-white/25 focus:outline-none resize-none overflow-hidden leading-relaxed"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDescSave}
                      className="px-4 py-1.5 bg-[#7C6EF5] hover:bg-[#6B5ED4] text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDesc(false);
                        setDescValue(card.description || "");
                      }}
                      className="px-4 py-1.5 text-white/40 hover:text-white hover:bg-white/5 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="w-full min-h-[80px] bg-[#1A1A28]/50 hover:bg-[#1A1A28] border border-transparent hover:border-white/5 rounded-xl p-3.5 text-sm text-white/60 cursor-text transition-all whitespace-pre-wrap leading-relaxed"
                >
                  {descValue || (
                    <span className="text-white/25">Add a description...</span>
                  )}
                </div>
              )}
            </section>
            {/* Attachments */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                  <Paperclip size={13} /> Attachments
                </div>
                <button className="text-xs font-semibold text-[#7C6EF5] hover:text-[#6B5ED4] transition-colors">
                  + Add
                </button>
              </div>
              <p className="text-xs text-white/25 pl-0.5">
                No attachments yet.
              </p>
            </section>
            {/* Comments / Activity tabs */}
            <section>
              <div className="flex items-center gap-5 border-b border-white/5 mb-5">
                {(["comments", "activity"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "pb-3 text-sm font-medium transition-colors relative flex items-center gap-1.5",
                      activeTab === tab
                        ? "text-white"
                        : "text-white/35 hover:text-white/60",
                    )}
                  >
                    {tab === "comments" ? (
                      <MessageSquare size={13} />
                    ) : (
                      <Activity size={13} />
                    )}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C6EF5] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === "comments" ? (
                <CommentsTab cardId={card.id} />
              ) : (
                <ActivityTab cardId={card.id} />
              )}
            </section>
          </div>

          {/* RIGHT: sidebar */}
          <CardSidebar
            card={activeCard}
            columns={columns}
            currentColumn={currentColumn}
            workspaceLabels={workspaceLabels}
            workspaceSlug={workspaceSlug}
            projectSlug={projectSlug}
          />
        </div>
      </div>
    </div>
  );
}
