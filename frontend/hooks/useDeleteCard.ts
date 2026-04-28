import { CardService } from "@/services/card.service";
import { useBoardStore } from "@/store/board.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteCard(cardId: string, columnId: string) {
  const queryClient = useQueryClient();
  const deleteCardFromStore = useBoardStore((s) => s.deleteCard);

  return useMutation({
    mutationFn: () => CardService.deleteCard(cardId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["card", cardId] });
      deleteCardFromStore(cardId, columnId);
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });

      toast.error("Failed to delete card");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      toast.success("Card Deleted");
    },
  });
}
