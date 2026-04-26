"use client";

import { useParams, useRouter } from "next/navigation";
import { useBoard } from "@/hooks/useBoard";
import { CardDetailModal } from "@/components/modals/CardDetailModal";
import { BoardCard, BoardColumn } from "@/types/board.types";

export default function InterceptedCardModal() {
  const router = useRouter();
  const { projectSlug, cardId } = useParams() as {
    projectSlug: string;
    cardId: string;
  };

  const { data: board, isLoading } = useBoard(projectSlug);

  if (isLoading || !board) return null;

  const columns = Array.isArray(board) ? board : board.columns || [];
  const card = columns
    .flatMap((c: BoardColumn) => c.cards)
    .find((c: BoardCard) => c.id === cardId);

  if (!card) return null;

  return (
    <CardDetailModal
      isOpen={true}
      onClose={() => router.back()}
      card={card}
      columns={columns}
    />
  );
}
