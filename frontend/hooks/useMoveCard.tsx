import { CardService } from "@/services/card.service";
import { useBoardStore } from "@/store/board.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useMoveCard() {
  const queryClient = useQueryClient();
  const moveCardInStore = useBoardStore((s) => s.moveCard);
  const columns = useBoardStore((s) => s.board?.columns ?? []);

  return useMutation({
    mutationFn: ({
      cardId,
      toColumnId,
      order,
    }: {
      cardId: string;
      toColumnId: string;
      order: number;
    }) => CardService.moveCard(cardId, toColumnId, order),

    onMutate: ({ cardId, toColumnId }) => {
      const fromColumn = columns.find((col) =>
        col.cards.some((c) => c.id === cardId),
      );
      const toColumn = columns.find((col) => col.id === toColumnId);

      if (!fromColumn || !toColumn) return;

      const previousIndex = fromColumn.cards.findIndex((c) => c.id === cardId);
      const newIndex = toColumn.cards.length;

      moveCardInStore(cardId, fromColumn.id, toColumnId, newIndex);

      return {
        cardId,
        previousColumnId: fromColumn.id,
        previousIndex,
      };
    },

    onError: (err, _, context) => {
      if (!context) return;
      const { cardId, previousColumnId, previousIndex } = context;

      const currentColumn = columns.find((col) =>
        col.cards.some((c) => c.id === cardId),
      );
      if (!currentColumn) return;

      moveCardInStore(
        cardId,
        currentColumn.id,
        previousColumnId,
        previousIndex,
      );
      toast.error("Failed to move card");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}
