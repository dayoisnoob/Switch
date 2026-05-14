"use client";

import { useParams, useRouter } from "next/navigation";
import { useBoard } from "@/hooks/useBoard";
import { BoardCard, BoardColumn } from "@/types/board.types";
import { CardDetailModal } from "@/components/card-details/CardDetailModal";
import { useBoardSocket } from "@/hooks/useBoardSocket";

export default function FullPageCard() {
  const router = useRouter();
  const { workspaceSlug, projectSlug, cardId } = useParams() as {
    workspaceSlug: string;
    projectSlug: string;
    cardId: string;
  };
  const { data: board, isLoading } = useBoard(projectSlug, workspaceSlug);
  const boardId = board?.id;
  useBoardSocket(boardId ?? "");

  if (isLoading || !board) return <div className="min-h-screen bg-[#0b0e14]" />;

  const columns = board?.columns ?? [];
  const card = columns
    .flatMap((c: BoardColumn) => c.cards)
    .find((c: BoardCard) => c.id === cardId);

  if (!card)
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white">
        Card not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0b0e14]">
      <CardDetailModal
        isOpen={true}
        onClose={() => router.push(`/${workspaceSlug}/${projectSlug}`)}
        cardId={cardId}
        columns={columns}
        projectSlug={projectSlug}
        workspaceSlug={workspaceSlug}
      />
    </div>
  );
}
