import { api } from "@/lib/api";
import { ApiError } from "@/lib/ApiError";
import { getErrorMessage } from "@/lib/utils";
import {
  ColumnService,
  ColUpdate,
  CreateCol,
} from "@/services/columns.service";
import { useBoardStore } from "@/store/board.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Column {
  id: string;
  name: string;
  order: number;
  cardCount: number;
}

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCol) => ColumnService.create(boardId, data),

    onSuccess: (response) => {
      useBoardStore.getState().addColumn(response);
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => api.delete(`/columns/${columnId}`),

    onSuccess: (_, columnId) => {
      useBoardStore.getState().deleteColumn(columnId);
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}

export function useMoveColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, order }: { columnId: string; order: number }) =>
      ColumnService.updateOrder(columnId, order),

    onSuccess: () => {
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

export function useMoveColumnCards() {
  return useMutation({
    mutationFn: ({
      columnId,
      targetColumnId,
    }: {
      columnId: string;
      targetColumnId: string;
    }) => api.patch(`/columns/${columnId}/move-cards`, { targetColumnId }),

    onSuccess: (_, { columnId, targetColumnId }) => {
      useBoardStore.getState().moveAllCards(columnId, targetColumnId);
    },

    onError: (err: any) => {
      console.log(err);
      toast.error(getErrorMessage(err) || "Failed to move cards");
    },
  });
}

export const useGetColumn = (columnId: string) => {
  return useQuery({
    queryKey: ["column", columnId],
    queryFn: (): Promise<Column> => api.get(`/columns/${columnId}`),
    enabled: !!columnId,
  });
};
