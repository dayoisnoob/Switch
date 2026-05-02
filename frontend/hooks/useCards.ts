import { getErrorMessage } from "@/lib/utils";
import { CardService, CreateCard, MoveCard } from "@/services/card.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useOpenCards = () => {
  return useQuery({
    queryKey: ["open-cards"],
    queryFn: () => CardService.getOpenCardsCount(),
    staleTime: 1000 * 60 * 5,
  });
};

export function useCreateCard(columnId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCard) => CardService.create(columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["column"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: MoveCard }) =>
      CardService.moveCard(cardId, data),

    onSettled: (_, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["card", variables.cardId] });
      queryClient.invalidateQueries({
        queryKey: ["activities", variables.cardId],
      });

      if (error) {
        toast.error("Failed to move card");
      }
    },
  });
}

export function useGetCard(cardId: string) {
  return useQuery({
    queryKey: ["card", cardId],
    queryFn: async () => CardService.getCardById(cardId),
  });
}
