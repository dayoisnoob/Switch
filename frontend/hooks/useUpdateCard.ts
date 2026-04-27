import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CardService, CardUpdateType } from "@/services/card.service";
import { toast } from "sonner";

export function useUpdateCard(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CardUpdateType) => CardService.update(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      toast.success("Changes saved");
    },
    onError: (error) => {
      toast.error("Failed to update card");
      console.error(error);
    },
  });
}
