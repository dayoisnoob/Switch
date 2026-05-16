import { api } from "@/lib/api";
import { ApiError } from "@/lib/ApiError";
import { useBoardStore } from "@/store/board.store";
import { BoardState } from "@/types/board.types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useGetLabels } from "./useLabels";

export const useBoard = (projectSlug: string, workspaceSlug: string) => {
  const setBoard = useBoardStore((s) => s.setBoard);
  const setWorkspaceLabels = useBoardStore((s) => s.setWorkspaceLabels);
  const { data: labels } = useGetLabels(workspaceSlug);

  const query = useQuery<BoardState, ApiError>({
    queryKey: ["board", projectSlug],
    queryFn: () =>
      api.get(`/workspaces/${workspaceSlug}/projects/${projectSlug}/board`),
    enabled: !!projectSlug,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) setBoard(query.data);
  }, [query.data, setBoard]);

  useEffect(() => {
    if (labels?.length) setWorkspaceLabels(labels);
  }, [setWorkspaceLabels, labels, workspaceSlug]);

  return query;
};
