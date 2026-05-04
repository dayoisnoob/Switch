import { api } from "@/lib/api";
import { BoardLabel } from "@/types/board.types";

export const LabelService = {
  create: async (
    workspaceSlug: string,
    data: CreateLabelType,
  ): Promise<BoardLabel> => {
    return api.post(`/workspaces/${workspaceSlug}/labels`, data);
  },

  list: async (workspaceSlug: string): Promise<BoardLabel[]> => {
    return api.get(`/workspaces/${workspaceSlug}/labels`);
  },

  attachToCard: async (cardId: string, labelId: string) => {
    return api.post(`/cards/${cardId}/labels`, { labelId });
  },

  removeFromCard: async (cardId: string, labelId: string) => {
    return api.delete(`/cards/${cardId}/labels/${labelId}`);
  },

  deleteLabel: async (
    workspaceSlug: string,
    labelId: string,
    boardId: string,
  ) => {
    return api.delete(
      `/workspaces/${workspaceSlug}/labels/${labelId}?boardId=${boardId}`,
    );
  },
};

export interface CreateLabelType {
  name: string;
  colour: string;
  boardId: string;
}
export interface DeleteLabel {
  workspaceSlug: string;
  labelId: string;
  boardId: string;
}
