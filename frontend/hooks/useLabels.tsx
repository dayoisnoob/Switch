import { getErrorMessage } from "@/lib/utils";
import { CreateLabelType, LabelService } from "@/services/labels.service";
import { useBoardStore } from "@/store/board.store";
import { BoardCard } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateLabel = (workspaceSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLabelType) => {
      return await LabelService.create(workspaceSlug, data);
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
      return await LabelService.deleteLabel(workspaceSlug, labelId, boardId);
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
      if (isAttached) {
        return await LabelService.removeFromCard(card.id, labelId);
      } else {
        return await LabelService.attachToCard(card.id, labelId);
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
