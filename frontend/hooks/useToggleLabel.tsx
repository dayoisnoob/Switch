import { LabelService } from "@/services/labels.service";
import { useBoardStore } from "@/store/board.store";
import { BoardCard } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useToggleLabel = (card: BoardCard) => {
  const queryClient = useQueryClient();
  const workspaceLabels = useBoardStore((s) => s.workspaceLabels);
  const removeLabelFromCard = useBoardStore((s) => s.removeLabelFromCard);
  const addLabelToCard = useBoardStore((s) => s.addLabelToCard);

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

      if (isAttached) {
        removeLabelFromCard(card.id, labelId);
      } else {
        const label = workspaceLabels.find((l) => l.id === labelId);
        if (label) addLabelToCard(card.id, label);
      }

      return { previousIsAttached: isAttached, labelId };
    },

    onError: (error, variables, context) => {
      if (context) {
        if (context.previousIsAttached) {
          const label = workspaceLabels.find((l) => l.id === context.labelId);
          if (label) addLabelToCard(card.id, label);
        } else {
          removeLabelFromCard(card.id, context.labelId);
        }
      }

      toast.error("Failed to update label. Reverting...");
      console.error(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", card.id] });
    },
  });
};

export default useToggleLabel;
