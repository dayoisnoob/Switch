import { getErrorMessage } from "@/lib/utils";
import { ColumnService, CreateCol } from "@/services/columns.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCol) => ColumnService.create(boardId, data),

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

export function useRenameColumn() {
  return useMutation({
    mutationFn: ({ columnId, name }: { columnId: string; name: string }) =>
      ColumnService.rename(columnId, name),
  });
}

export function useDeleteColumn() {
  return useMutation({
    mutationFn: ({ columnId }: { columnId: string }) =>
      ColumnService.delete(columnId),
  });
}

export function useMoveColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, order }: { columnId: string; order: number }) =>
      ColumnService.updateOrder(columnId, order),

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
