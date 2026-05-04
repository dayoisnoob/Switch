"use client";

import { CardDescription } from "@/components/card-details/CardDescription";
import { CardHeader } from "@/components/card-details/CardHeader";
import { CardSidebar } from "@/components/card-details/CardSidebar";
import { CardTitle } from "@/components/card-details/CardTitle";
import { DeleteCardModal } from "@/components/modals/DeleteCardModal";
import { Portal } from "@/components/ui/Portal";
import { useMe } from "@/hooks/useAuth";
import { useDeleteCard } from "@/hooks/useDeleteCard";
import { useGetProjectBySlug } from "@/hooks/useProjects";
import { useUpdateCard } from "@/hooks/useUpdateCard";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ActivityTab } from "./ActivityTab";
import { CardComments } from "./CardComments";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  columns: BoardColumn[];
  projectSlug: string;
  workspaceSlug: string;
}

export function CardDetailModal(props: CardDetailModalProps) {
  const card = useBoardStore((s) =>
    s.board?.columns.flatMap((c) => c.cards).find((c) => c.id === props.cardId),
  );

  if (!card) return null;

  return <CardDetailModalInner {...props} card={card} />;
}

export function CardDetailModalInner({
  isOpen,
  onClose,
  card,
  columns,
  projectSlug,
  workspaceSlug,
}: CardDetailModalProps & { card: BoardCard }) {
  const [activeTab, setActiveTab] = useState<"activity" | "comments">(
    "comments",
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 1. Core Data Hooks
  const { data: currentUser } = useMe();
  const { data: project } = useGetProjectBySlug(workspaceSlug, projectSlug);
  const { canManageWorkspace } = useWorkspaceRole(workspaceSlug);

  // 2. Mutations
  const { mutate: updateCard } = useUpdateCard(card.id);
  const currentColumn = columns.find((c) =>
    c.cards.some((c2) => c2.id === card.id),
  );
  const { mutate: deleteCard } = useDeleteCard(
    card.id,
    currentColumn?.id ?? "",
  );

  const canDeleteCard =
    currentUser?.id === card.creator?.id || canManageWorkspace;

  // Handle Escape key to close modal (Fixed to not close if typing in an input!)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        const activeNode = document.activeElement;
        // If the user is focused on a textarea or input, let the component handle the escape key!
        if (
          activeNode &&
          (activeNode.tagName === "INPUT" || activeNode.tagName === "TEXTAREA")
        ) {
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTitleSave = (newTitle: string) => {
    updateCard({ title: newTitle });
  };

  const handleDescSave = (newDescription: string) => {
    updateCard({ description: newDescription });
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-100 flex justify-end bg-black/60 backdrop-blur-sm transition-all"
        onClick={onClose}
      >
        <div
          className="w-full max-w-215 h-full bg-[#0E0E14] shadow-2xl flex flex-col border-l border-white/5 animate-in slide-in-from-right duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader
            projectName={project?.name ?? ""}
            columnName={currentColumn?.name ?? ""}
            cardTitle={card.title}
            canDelete={canDeleteCard}
            onDelete={() => setIsDeleteModalOpen(true)}
            onClose={onClose}
          />

          <div className="flex-1 overflow-hidden flex min-h-0">
            <main className="flex-1 overflow-y-auto custom-scrollbar p-8 min-h-0 bg-[#0E0E14]">
              <CardTitle
                title={card.title}
                priority={card.priority}
                onSave={handleTitleSave}
              />

              <div className="space-y-10">
                <CardDescription
                  description={card.description || ""}
                  onSave={handleDescSave}
                />

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

                <section className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-6 border-b border-white/5 mb-6">
                    {(["comments", "activity"] as const).map((tab) => (
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
                            {card.commentCount || 0}
                          </span>
                        )}
                        {activeTab === tab && (
                          <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#7C6EF5] rounded-t-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Render the active tab content */}
                  <div className="pb-10">
                    {activeTab === "comments" ? (
                      <CardComments cardId={card.id} />
                    ) : (
                      <ActivityTab cardId={card.id} />
                    )}
                  </div>
                </section>
              </div>
            </main>

            <CardSidebar
              card={card}
              columns={columns}
              workspaceSlug={workspaceSlug}
              projectSlug={projectSlug}
            />
          </div>
        </div>
      </div>

      <DeleteCardModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          deleteCard();
          onClose();
        }}
        card={card}
        columnName={currentColumn?.name || "Unknown"}
        projectName={project?.name ?? ""}
      />
    </Portal>
  );
}
