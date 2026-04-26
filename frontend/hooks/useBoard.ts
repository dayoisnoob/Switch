import { ApiError } from "@/lib/ApiError";
import { BoardService } from "@/services/board.service";
import { CardService } from "@/services/card.service";
import { ColumnService } from "@/services/columns.service";
import { BoardState } from "@/types/board.types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useBoard = (projectSlug: string) => {
  return useQuery<BoardState, ApiError>({
    queryKey: ["board", projectSlug],
    queryFn: () => BoardService.getBoard(projectSlug),
    select: (data) => ({
      ...data,
      columns: [...(data.columns ?? [])].sort((a, b) => a.order - b.order),
    }),

    enabled: !!projectSlug,
  });
};

export function useReorderColumn() {
  return useMutation({
    mutationFn: ({ columnId, order }: { columnId: string; order: number }) =>
      ColumnService.updateOrder(columnId, order),
  });
}

export function useMoveCard() {
  return useMutation({
    mutationFn: ({
      cardId,
      columnId,
      order,
    }: {
      cardId: string;
      columnId: string;
      order: number;
    }) => CardService.moveCard(cardId, columnId, order),
  });
}

export function useCreateColumn() {
  return useMutation({
    mutationFn: ({ boardId, name }: { boardId: string; name: string }) =>
      ColumnService.create(boardId, name),
  });
}

export function useCreateCard() {
  return useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      CardService.create(columnId, title),
  });
}
