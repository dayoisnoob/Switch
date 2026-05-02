import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CardService, CardUpdateType } from "@/services/card.service";
import { toast } from "sonner";
import { BoardCard } from "@/types/board.types"; // Adjust this import to match your types

export function useUpdateCard(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CardUpdateType) =>
      CardService.update(cardId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },

    onError: (err) => {
      toast.error("Failed to update card details");
      console.error(err);
    },
  });
}
