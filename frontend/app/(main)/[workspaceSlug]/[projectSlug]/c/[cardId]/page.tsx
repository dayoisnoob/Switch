"use client";

import { useParams, useRouter } from "next/navigation";
import { useBoard } from "@/hooks/useBoard";
import { CardDetailModal } from "@/components/modals/CardDetailModal";
import { BoardCard, BoardColumn } from "@/types/board.types";

export default function FullPageCard() {
  const router = useRouter();
  const { workspaceSlug, projectSlug, cardId } = useParams() as {
    workspaceSlug: string;
    projectSlug: string;
    cardId: string;
  };
  const { data: board, isLoading } = useBoard(projectSlug);

  if (isLoading || !board) return <div className="min-h-screen bg-[#0b0e14]" />;

  const columns = Array.isArray(board) ? board : board.columns || [];
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
        card={card}
        columns={columns}
      />
    </div>
  );
}
