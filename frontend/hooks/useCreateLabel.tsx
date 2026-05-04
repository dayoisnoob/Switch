import { CreateLabelType, LabelService } from "@/services/labels.service";
import { BoardLabel } from "@/types/board.types";
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
      toast.success("Workspace label created");
    },
    onError: () => toast.error("Failed to create label"),
  });
};
