import { pickLabelColor } from "@/lib/utils";
import { LabelService } from "@/services/labels.service";
import { useBoardStore } from "@/store/board.store";
import { BoardCard } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateLabel = (card: BoardCard, workspaceSlug: string) => {
  const queryClient = useQueryClient();

  const workspaceLabels = useBoardStore((s) => s.workspaceLabels);
  const addWorkspaceLabel = useBoardStore((s) => s.addWorkspaceLabel);
  const removeLabelFromCard = useBoardStore((s) => s.removeLabelFromCard);
  const addLabelToCard = useBoardStore((s) => s.addLabelToCard);

  return useMutation({
    mutationFn: async (name: string) => {
      const existingColors = workspaceLabels.map((l) => l.colour);
      const colour = pickLabelColor(name, existingColors);
      const newLabel = await LabelService.create(workspaceSlug, {
        name,
        colour,
      });
      await LabelService.attachToCard(card.id, newLabel.id);
      return newLabel;
    },

    onMutate: async (name: string) => {
      await queryClient.cancelQueries({ queryKey: ["card", card.id] });

      const previousCard = queryClient.getQueryData(["card", card.id]);
      const existingColors = workspaceLabels.map((l) => l.colour);
      const colour = pickLabelColor(name, existingColors);

      const optimisticLabel = {
        id: `optimistic-${Date.now()}`,
        name,
        colour,
      };

      addLabelToCard(card.id, optimisticLabel);
      addWorkspaceLabel(optimisticLabel);

      return { previousCard, optimisticLabel };
    },

    onError: (err, _, context) => {
      if (context?.previousCard) {
        queryClient.setQueryData(["card", card.id], context.previousCard);
        removeLabelFromCard(card.id, context.optimisticLabel.id);
      }
      toast.error("Failed to create label");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaceLabels", workspaceSlug],
      });
      queryClient.invalidateQueries({ queryKey: ["card", card.id] });
      toast.success("Label created and attached");
    },
  });
};
