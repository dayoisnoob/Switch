import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CardService, CardUpdateType } from "@/services/card.service";
import { toast } from "sonner";
import { BoardCard } from "@/types/board.types"; // Adjust this import to match your types

export function useUpdateCard(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CardUpdateType) =>
      CardService.update(cardId, data),

    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["card", cardId] });

      const previousCard = queryClient.getQueryData<BoardCard>([
        "card",
        cardId,
      ]);

      if (previousCard) {
        const { dueDate, ...restOfData } = newData;

        let formattedDate = previousCard.dueDate;
        if (dueDate !== undefined) {
          formattedDate =
            dueDate instanceof Date ? dueDate.toISOString() : dueDate;
        }

        queryClient.setQueryData<BoardCard>(["card", cardId], {
          ...previousCard,
          ...restOfData,
          ...(dueDate !== undefined && { dueDate: formattedDate }),
        });
      }

      return { previousCard };
    },

    onError: (err, newData, context) => {
      if (context?.previousCard) {
        queryClient.setQueryData(["card", cardId], context.previousCard);
      }
      toast.error("Failed to update card details");
      console.error(err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });

      queryClient.invalidateQueries({ queryKey: ["activities", cardId] });
    },
  });
}
