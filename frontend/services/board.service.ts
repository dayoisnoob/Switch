import { api } from "@/lib/api";
import { BoardState } from "@/types/board.types";

export const BoardService = {
  getBoard: async (projectSlug: string): Promise<BoardState> => {
    return api.get(`/projects/${projectSlug}/board`);
  },
};
