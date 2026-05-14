import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardLabel } from "@/types/board.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CreateLabelType {
  name: string;
  colour: string;
  boardId: string;
}
export interface DeleteLabel {
  workspaceSlug: string;
  labelId: string;
  boardId: string;
}

export const useCreateLabel = (workspaceSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLabelType) => {
      return await api.post(`/workspaces/${workspaceSlug}/labels`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaceLabels", workspaceSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["cards"],
      });

      toast.success("Workspace label created");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err) || "Failed to create label"),
  });
};

export const useDeleteLabel = (workspaceSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      labelId,
      boardId,
    }: {
      labelId: string;
      boardId: string;
    }) => {
      return await api.delete(
        `/workspaces/${workspaceSlug}/labels/${labelId}?boardId=${boardId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaceLabels", workspaceSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["card"],
      });

      toast.success("Workspace label deleted");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err) || "Failed to delete label"),
  });
};

export const useToggleLabel = (card: BoardCard) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      labelId,
      isAttached,
    }: {
      labelId: string;
      isAttached: boolean;
    }) => {
      const cardId = card.id;
      if (isAttached) {
        return await api.delete(`/cards/${cardId}/labels/${labelId}`);
      } else {
        return await api.post(`/cards/${cardId}/labels`, { labelId });
      }
    },

    onMutate: async ({ labelId, isAttached }) => {
      await queryClient.cancelQueries({ queryKey: ["card", card.id] });

      const store = useBoardStore.getState();

      if (isAttached) {
        store.removeLabelFromCard(card.id, labelId);
      } else {
        const label = store.workspaceLabels.find((l) => l.id === labelId);
        if (label) store.addLabelToCard(card.id, label);
      }

      return { previousIsAttached: isAttached, labelId };
    },

    onError: (error, variables, context) => {
      const store = useBoardStore.getState();

      if (context) {
        if (context.previousIsAttached) {
          const label = store.workspaceLabels.find(
            (l) => l.id === context.labelId,
          );
          if (label) store.addLabelToCard(card.id, label);
        } else {
          store.removeLabelFromCard(card.id, context.labelId);
        }
      }

      toast.error("Failed to update label. Reverting...");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", card.id] });
      queryClient.invalidateQueries({ queryKey: ["activities", card.id] });
    },
  });
};

export function useGetLabels(workspaceSlug: string) {
  return useQuery({
    queryKey: ["labels"],
    queryFn: async (): Promise<BoardLabel[]> =>
      api.get(`/workspaces/${workspaceSlug}/labels`),
  });
}
