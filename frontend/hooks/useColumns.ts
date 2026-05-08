import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import {
  ColumnService,
  ColUpdate,
  CreateCol,
} from "@/services/columns.service";
import { useBoardStore } from "@/store/board.store";
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

export function useUpdateColumn() {
  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: ColUpdate }) =>
      ColumnService.update(columnId, data),
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

export function useClearColumncards() {
  const deleteCards = useBoardStore((s) => s.deleteCards);

  return useMutation({
    mutationFn: (columnId: string) => api.delete(`/columns/${columnId}/cards`),

    onSuccess: (_, columnId) => {
      deleteCards(columnId);
      toast.success("Column cards cleared");
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}
