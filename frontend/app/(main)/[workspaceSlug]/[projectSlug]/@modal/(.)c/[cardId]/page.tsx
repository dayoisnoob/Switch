"use client";

import { CardDetailModal } from "@/components/card-details/CardDetailModal";
import { useBoardStore } from "@/store/board.store";
import { useParams, useRouter } from "next/navigation";

export default function InterceptedCardModal() {
  const router = useRouter();
  const { workspaceSlug, projectSlug, cardId } = useParams() as {
    workspaceSlug: string;
    projectSlug: string;
    cardId: string;
  };

  const board = useBoardStore((s) => s.board);
  const columns = board?.columns ?? [];
  const card = columns.flatMap((c) => c.cards).find((c) => c.id === cardId);

  if (!card) return null;

  return (
    <CardDetailModal
      isOpen={true}
      onClose={() => router.back()}
      cardId={cardId}
      columns={columns}
      projectSlug={projectSlug}
      workspaceSlug={workspaceSlug}
    />
  );
}
