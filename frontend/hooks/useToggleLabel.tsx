import { LabelService } from "@/services/labels.service";
import { useBoardStore } from "@/store/board.store";
import { BoardCard } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
