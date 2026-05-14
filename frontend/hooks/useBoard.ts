import { api } from "@/lib/api";
import { ApiError } from "@/lib/ApiError";
import { useBoardStore } from "@/store/board.store";
import { BoardState } from "@/types/board.types";
import { useQuery } from "@tanstack/react-query";
import { RefObject, useEffect } from "react";
import { useGetLabels } from "./useLabels";

export const useBoard = (projectSlug: string, workspaceSlug: string) => {
  const setBoard = useBoardStore((s) => s.setBoard);
  const setWorkspaceLabels = useBoardStore((s) => s.setWorkspaceLabels);

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
    if (!workspaceSlug) return;
    const { data: labels } = useGetLabels(workspaceSlug);

    if (!labels) return;
    setWorkspaceLabels(labels);
  }, [setWorkspaceLabels, workspaceSlug]);

  return query;
};

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
