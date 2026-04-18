import { ApiError } from "@/lib/ApiError";
import { getBoard } from "@/lib/boardApi";
import { BoardState } from "@/types/board";
import { useQuery } from "@tanstack/react-query";

export const useBoard = (workspaceId: string, projectId: string) => {
  return useQuery<BoardState, ApiError>({
    queryKey: ["board", workspaceId, projectId],
    queryFn: () => getBoard(workspaceId, projectId),
    select: (data) => ({
      ...data,
      columns: [...(data.columns ?? [])].sort((a, b) => a.order - b.order),
    }),

    // Don't fetch if we are missing IDs
    enabled: !!workspaceId && !!projectId,
  });
};
