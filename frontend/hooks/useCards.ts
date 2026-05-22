import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { BoardAssignee, BoardLabel } from "@/types/board.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceMembers } from "./useWorkspace";

export interface CardUpdateType {
  title?: string;
  description?: string;
  priority?: CardPriority;
  dueDate?: Date | null;
}
export interface CreateCard {
  title: string;
  description?: string;
  status: StatusType;
  priority?: CardPriority;
  dueDate?: Date;
  assignees?: string[];
}

export interface MoveCard {
  columnId: string;
  order: string;
  status: string;
}

export type StatusType =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELED";

export interface OpenCardsResponse {
  count: number;
}

export type CardPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface CardType {
  id: string;
  title: string;
  description: string;
  priority: "none" | "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  coverImageUrl: string | null;
  order: number;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  updatedAt: string;
  createdAt: string;
  assignees: BoardAssignee[];
  labels: BoardLabel[];
}

export function useCreateCard(columnId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCard) =>
      api.post(`/columns/${columnId}/cards`, data),
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
      api.patch(`/cards/${cardId}/move`, data),

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
    queryFn: async () => api.get(`/cards/${cardId}`),
  });
}

export function useUpdateCard(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CardUpdateType) =>
      api.patch(`/cards/${cardId}`, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
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
      const userId = member.userId;
      if (isAssigned) {
        return await api.delete(`/cards/${cardId}/assignees/${userId}`);
      } else {
        return await api.post(`/cards/${cardId}/assignees`, { userId });
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

export const useOpenCards = () => {
  return useQuery({
    queryKey: ["open-cards"],
    queryFn: (): Promise<OpenCardsResponse> => api.get(`/cards/open/count`),
    staleTime: 1000 * 60 * 5,
  });
};

export function useDeleteCard(cardId: string, columnId: string) {
  const queryClient = useQueryClient();
  const deleteCardFromStore = useBoardStore((s) => s.deleteCard);

  return useMutation({
    mutationFn: () => api.delete(`/cards/${cardId}`),
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
