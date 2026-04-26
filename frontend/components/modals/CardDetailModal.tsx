"use client";

import { useState, useEffect, useRef } from "react";

import {
  X,
  AlignLeft,
  MessageSquare,
  Activity,
  User,
  Calendar,
  Tag,
  Flag,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Image as ImageIcon, // Imported the icon here
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BoardCard, BoardColumn } from "@/types/board.types";
import Image from "next/image";

// --- MOCK HOOKS (Replace with your actual React Query hooks) ---
// You will need a hook to fetch the FULL card details (comments, activity, etc.)
// const { data: cardDetails, isLoading } = useCardDetails(card.id);
// const { data: members } = useWorkspaceMembers();
// const { mutate: updateCard } = useUpdateCard();
// const { mutate: moveCard } = useMoveCard();

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: BoardCard;
  columns: BoardColumn[]; // Passed down so we can populate the "Move to Column" dropdown
}

export function CardDetailModal({
  isOpen,
  onClose,
  card,
  columns,
}: CardDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "activity">(
    "comments",
  );
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(
    "This is where the card description will go. Click to edit me!",
  );
  const [titleValue, setTitleValue] = useState(card.title);

  // --- NEW: Cover Image Ref and Handler ---
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Uploading cover image:", file.name);
    // TODO: 1. Upload file to your storage (S3, Cloudinary, etc.) to get a URL
    // TODO: 2. Call updateCard({ coverImageUrl: uploadedUrl })
  };

  const currentColumn = columns.find((c) =>
    c.cards.some((activeCard) => activeCard.id === card.id),
  );

  // Auto-resize textarea ref
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingDesc && descRef.current) {
      descRef.current.focus();
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [isEditingDesc]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Hidden file input triggered by the button */}
      <input
        type="file"
        accept="image/*"
        ref={coverInputRef}
        onChange={handleCoverUpload}
        className="hidden"
      />

      <div
        className="w-full max-w-[900px] max-h-[90vh] bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- NEW: COVER IMAGE HEADER --- */}
        {card.coverImageUrl && (
          <div className="w-full h-32 sm:h-40 bg-[#161b22] relative group border-b border-[#30363d] shrink-0">
            <Image
              src={card.coverImageUrl}
              alt="Card Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* --- HEADER --- */}
        <div className="px-6 py-4 border-b border-[#30363d] flex justify-between items-start gap-4 bg-[#11141a] shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8b949e] mb-2">
              <span>{currentColumn?.name || "Unknown Column"}</span>
              <span>•</span>
              <span>Card-{card.id.slice(0, 4)}</span>
            </div>
            {/* Editable Title */}
            <input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={() => {
                // TODO: Fire updateCard({ title: titleValue })
              }}
              className="w-full bg-transparent text-xl font-semibold text-[#f0f6fc] border border-transparent hover:border-[#30363d] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] rounded px-2 py-1 -ml-2 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* NEW: Image Upload Button */}
            <button
              onClick={() => coverInputRef.current?.click()}
              title="Add Cover Image"
              className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2128] rounded-md transition-colors"
            >
              <ImageIcon size={18} />
            </button>
            <button className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2128] rounded-md transition-colors">
              <MoreHorizontal size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2128] rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* --- BODY (Two Columns) --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
          {/* LEFT COLUMN: Main Content */}
          <div className="flex-1 p-6 border-r border-[#30363d]">
            {/* Description Section */}
            <div className="mb-10">
              <div className="flex items-center gap-2 text-[#c9d1d9] font-semibold mb-3">
                <AlignLeft size={18} /> Description
              </div>

              {isEditingDesc ? (
                <div className="space-y-3">
                  <textarea
                    ref={descRef}
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="w-full min-h-[100px] bg-[#161b22] border border-[#58a6ff] rounded-lg p-3 text-sm text-[#f0f6fc] placeholder:text-[#8b949e] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] resize-none overflow-hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingDesc(false)}
                      className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingDesc(false)}
                      className="px-4 py-1.5 text-[#c9d1d9] hover:bg-[#1c2128] text-xs font-semibold rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="w-full min-h-[60px] bg-[#161b22]/50 hover:bg-[#161b22] border border-transparent hover:border-[#30363d] rounded-lg p-3 text-sm text-[#c9d1d9] cursor-text transition-colors"
                >
                  {descValue || (
                    <span className="text-[#8b949e]">
                      Add a more detailed description...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tabs: Comments & Activity */}
            <div className="mb-6">
              <div className="flex items-center gap-6 border-b border-[#30363d]">
                <button
                  onClick={() => setActiveTab("comments")}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors relative flex items-center gap-2",
                    activeTab === "comments"
                      ? "text-[#f0f6fc]"
                      : "text-[#8b949e] hover:text-[#c9d1d9]",
                  )}
                >
                  <MessageSquare size={16} /> Comments
                  {activeTab === "comments" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#58a6ff]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors relative flex items-center gap-2",
                    activeTab === "activity"
                      ? "text-[#f0f6fc]"
                      : "text-[#8b949e] hover:text-[#c9d1d9]",
                  )}
                >
                  <Activity size={16} /> Activity
                  {activeTab === "activity" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#58a6ff]" />
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === "comments" ? (
                <>
                  {/* Comment Input */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#238636] shrink-0 flex items-center justify-center text-xs font-bold text-white">
                      ME
                    </div>
                    <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg p-1 focus-within:border-[#58a6ff] transition-colors">
                      <textarea
                        placeholder="Write a comment..."
                        className="w-full bg-transparent border-none p-2 text-sm text-[#f0f6fc] focus:outline-none resize-none min-h-[60px]"
                      />
                      <div className="flex justify-end p-2 border-t border-[#30363d]/50">
                        <button className="px-3 py-1 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md transition-colors">
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Mock Comment List */}
                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-[#8b949e] text-center">
                      No comments yet.
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Mock Activity List */}
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#1c2128] shrink-0 flex items-center justify-center mt-0.5">
                      <CheckCircle2 size={12} className="text-[#8b949e]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#c9d1d9]">
                        <span className="font-semibold text-[#f0f6fc]">
                          Dayo
                        </span>{" "}
                        created this card
                      </p>
                      <span className="text-xs text-[#8b949e]">
                        2 hours ago
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Metadata Sidebar */}
          <div className="w-full md:w-[280px] p-6 bg-[#0b0e14] space-y-6">
            <SidebarProperty
              icon={<Circle size={16} />}
              label="Status"
              value={currentColumn?.name || "None"}
              // TODO: Wire up a dropdown to move columns
            />

            <SidebarProperty
              icon={<User size={16} />}
              label="Assignees"
              value="Unassigned"
              // TODO: Map card.assignees or show dropdown
            />

            <SidebarProperty
              icon={<Flag size={16} />}
              label="Priority"
              value={card.priority !== "none" ? card.priority : "No Priority"}
              valueClass={card.priority === "urgent" ? "text-red-400" : ""}
            />

            <SidebarProperty
              icon={<Calendar size={16} />}
              label="Due Date"
              value={
                card.dueDate
                  ? new Date(card.dueDate).toLocaleDateString()
                  : "No Date"
              }
            />

            <SidebarProperty
              icon={<Tag size={16} />}
              label="Labels"
              value="None"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarProperty({
  icon,
  label,
  value,
  valueClass,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  onClick?: () => void;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-[#8b949e] mb-2 uppercase tracking-wider">
        {label}
      </h4>
      <div
        onClick={onClick}
        className="flex items-center gap-2 text-sm text-[#c9d1d9] bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] rounded-md px-3 py-2 cursor-pointer transition-colors"
      >
        <span className="text-[#8b949e]">{icon}</span>
        <span className={cn("font-medium", valueClass)}>{value}</span>
      </div>
    </div>
  );
}
