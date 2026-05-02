import { api } from "@/lib/api";
import { BoardState } from "@/types/board.types";

export const BoardService = {
  getBoard: async (
    workspaceSlug: string,
    projectSlug: string,
  ): Promise<BoardState> => {
    return api.get(
      `/workspaces/${workspaceSlug}/projects/${projectSlug}/board`,
    );
  },
};
