import { CreateLabelType, LabelService } from "@/services/labels.service";
import { BoardLabel } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useToggleLabel(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      label,
      isAttached,
    }: {
      label: BoardLabel;
      isAttached: boolean;
    }) => {
      if (isAttached) {
        return await LabelService.removeFromCard(cardId, label.id);
      } else {
        return await LabelService.attachToCard(cardId, label.id);
      }
    },
    onMutate: async ({ label, isAttached }) => {
      await queryClient.cancelQueries({ queryKey: ["card", cardId] });
      const previousCard = queryClient.getQueryData(["card", cardId]);

      // Optimistic update
      queryClient.setQueryData(["card", cardId], (old: any) => {
        if (!old) return old;
        const newLabels = isAttached
          ? old.labels.filter((l: any) => l.id !== label.id)
          : [...old.labels, label];
        return { ...old, labels: newLabels };
      });

      return { previousCard };
    },
    onError: (err, newTodo, context) => {
      toast.error("Failed to update label");
      if (context?.previousCard)
        queryClient.setQueryData(["card", cardId], context.previousCard);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}

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
      toast.success("Workspace label created");
    },
    onError: () => toast.error("Failed to create label"),
  });
};
