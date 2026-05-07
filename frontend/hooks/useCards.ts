import { getErrorMessage } from "@/lib/utils";
import {
  CardService,
  CardUpdateType,
  CreateCard,
  MoveCard,
} from "@/services/card.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceMembers } from "./useWorkspace";
import { useBoardStore } from "@/store/board.store";

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

export function useToggleAssignee(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      member,
      isAssigned,
    }: {
      member: WorkspaceMembers;
      isAssigned: boolean;
    }) => {
      if (isAssigned) {
        return await CardService.removeUser(cardId, member.userId);
      } else {
        return await CardService.assignUser(cardId, member.userId);
      }
    },

    // 1. Fire instantly on click
    onMutate: async ({ member, isAssigned }) => {
      await queryClient.cancelQueries({ queryKey: ["card", cardId] });

      const store = useBoardStore.getState();

      if (isAssigned) {
        store.removeUserFromCard(cardId, member.userId);
      } else {
        if (member) store.assignUserToCard(cardId, member);
      }

      return { previousIsAttached: isAssigned, member };
    },

    // 2. If the API fails, roll back to the previous snapshot
    onError: (err, variables, context) => {
      const store = useBoardStore.getState();
      if (context) {
        if (context.previousIsAttached) {
          store.assignUserToCard(cardId, context.member);
        } else {
          store.removeUserFromCard(cardId, context.member.userId);
        }
      }
      toast.error("Failed to update assignee");
    },

    // 3. Always refetch after error or success to ensure perfect server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}
