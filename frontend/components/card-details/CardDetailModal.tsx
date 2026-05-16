"use client";

import { CardDescription } from "@/components/card-details/CardDescription";
import { CardHeader } from "@/components/card-details/CardHeader";
import { CardSidebar } from "@/components/card-details/CardSidebar";
import { CardTitle } from "@/components/card-details/CardTitle";
import { DeleteCardModal } from "@/components/modals/DeleteCardModal";
import { Portal } from "@/components/ui/Portal";
import { useMe } from "@/hooks/useAuth";
import { useGetProjectBySlug } from "@/hooks/useProjects";
import { useDeleteCard, useUpdateCard } from "@/hooks/useCards";
import { useWorkspaceRole } from "@/hooks/useWorkspace";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import { useEffect, useState } from "react";
import { ActivityTab } from "./ActivityTab";
import { CardAttachments } from "./CardAttachments";
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

  const { data: currentUser } = useMe();
  const { data: project } = useGetProjectBySlug(workspaceSlug, projectSlug);
  const { canManageWorkspace } = useWorkspaceRole();

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        const activeNode = document.activeElement;
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

                <CardAttachments card={card} />

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
