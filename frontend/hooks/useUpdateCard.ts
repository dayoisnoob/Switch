import { getErrorMessage } from "@/lib/utils";
import { CardService, CardUpdateType } from "@/services/card.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
      toast.error(getErrorMessage(err));
      console.error(err);
    },
  });
}
