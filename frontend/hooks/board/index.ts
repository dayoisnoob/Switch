import { ApiError } from "@/lib/ApiError";
import { BoardService } from "@/services/board.service";
import { LabelService } from "@/services/labels.service";
import { useBoardStore } from "@/store/board.store";
import { BoardState } from "@/types/board.types";
import { useQuery } from "@tanstack/react-query";
import { RefObject, useEffect } from "react";

export const useBoard = (projectSlug: string, workspaceSlug: string) => {
  const setBoard = useBoardStore((s) => s.setBoard);
  const setWorkspaceLabels = useBoardStore((s) => s.setWorkspaceLabels);

  const query = useQuery<BoardState, ApiError>({
    queryKey: ["board", projectSlug],
    queryFn: () => BoardService.getBoard(workspaceSlug, projectSlug),
    enabled: !!projectSlug,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) setBoard(query.data);
  }, [query.data, setBoard]);

  useEffect(() => {
    if (!workspaceSlug) return;
    LabelService.list(workspaceSlug).then(setWorkspaceLabels);
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
